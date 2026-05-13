import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-04-22.dahlia',
  })
}

// Service role client to bypass RLS — only used in webhook handler
function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function planFromProductName(name: string | null): 'free' | 'pro' | 'team' | 'enterprise' {
  if (!name) return 'free'
  const lower = name.toLowerCase()
  if (lower.includes('enterprise')) return 'enterprise'
  if (lower.includes('team')) return 'team'
  if (lower.includes('pro')) return 'pro'
  return 'free'
}

async function syncSubscription(
  sub: Stripe.Subscription,
  supabase: ReturnType<typeof getServiceClient>,
  stripe: ReturnType<typeof getStripe>
) {
  const userId = sub.metadata?.supabase_user_id
  if (!userId) {
    console.warn('[webhook] Subscription missing supabase_user_id metadata')
    return
  }

  // Resolve plan from price/product
  const priceId = (sub.items.data[0]?.price.id) ?? null
  let plan: 'free' | 'pro' | 'team' | 'enterprise' = 'free'

  if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'
  else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) plan = 'team'
  else if (sub.items.data[0]?.price.product) {
    try {
      const product = await stripe.products.retrieve(sub.items.data[0].price.product as string)
      plan = planFromProductName(product.name)
    } catch { /* ignore */ }
  }

  const status = sub.status as 'active' | 'canceled' | 'past_due' | 'trialing'
  const currentPeriodEnd = new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: sub.id,
      plan,
      status,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: sub.cancel_at_period_end,
    })
    .eq('user_id', userId)

  // Mirror plan onto users table for quick access
  if (status === 'active' || status === 'trialing') {
    await supabase.from('users').update({ plan }).eq('id', userId)
  } else if (status === 'canceled' || status === 'past_due') {
    await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
  }
}

// POST /api/webhooks/stripe
// Receives and verifies Stripe webhook events, syncs subscription status to Supabase.
export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = getStripe()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = getServiceClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          // Attach user ID from session metadata if not on subscription
          if (!sub.metadata?.supabase_user_id && session.metadata?.supabase_user_id) {
            await stripe.subscriptions.update(session.subscription as string, {
              metadata: { supabase_user_id: session.metadata.supabase_user_id },
            })
            // Re-retrieve with updated metadata
            const updatedSub = await stripe.subscriptions.retrieve(session.subscription as string)
            await syncSubscription(updatedSub, supabase, stripe)
          } else {
            await syncSubscription(sub, supabase, stripe)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await syncSubscription(sub, supabase, stripe)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id
        if (userId) {
          await supabase
            .from('subscriptions')
            .update({ plan: 'free', status: 'canceled', cancel_at_period_end: false })
            .eq('user_id', userId)
          await supabase.from('users').update({ plan: 'free' }).eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = (invoice as unknown as { subscription: string | null }).subscription
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          const userId = sub.metadata?.supabase_user_id
          if (userId) {
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('user_id', userId)
          }
        }
        break
      }

      default:
        // Unhandled event type — no action needed
        break
    }
  } catch (err) {
    console.error('[webhook] Error processing event:', event.type, err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
