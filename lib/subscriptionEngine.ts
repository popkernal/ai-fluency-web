/**
 * Plan checks, content gating, and playground rate limiting.
 * Used server-side by API routes — never import from client components.
 */
import type { Plan, TrackId } from '@/types'
import { createClient } from '@/lib/supabase-server'

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_TRACKS: TrackId[] = ['foundations', 'prompting']
const FREE_PLAYGROUND_DAILY_LIMIT = 3
const PRO_PLAYGROUND_HOURLY_LIMIT = 10

// ─── Track access ─────────────────────────────────────────────────────────────

export function canAccessTrack(plan: Plan, trackId: TrackId): boolean {
  if (plan !== 'free') return true
  return FREE_TRACKS.includes(trackId)
}

// ─── Playground access ────────────────────────────────────────────────────────

export function canUsePlayground(
  plan: Plan,
  usageCount: { daily: number; hourly: number }
): { allowed: boolean; reason?: string } {
  if (plan === 'free') {
    if (usageCount.daily >= FREE_PLAYGROUND_DAILY_LIMIT) {
      return { allowed: false, reason: `Free plan: ${FREE_PLAYGROUND_DAILY_LIMIT} playground uses per day` }
    }
    return { allowed: true }
  }

  // Pro / Team / Enterprise: hourly rate limit only
  if (usageCount.hourly >= PRO_PLAYGROUND_HOURLY_LIMIT) {
    return { allowed: false, reason: `Rate limit: ${PRO_PLAYGROUND_HOURLY_LIMIT} uses per hour` }
  }

  return { allowed: true }
}

// ─── Reviews access ───────────────────────────────────────────────────────────

export function canAccessReviews(plan: Plan): boolean {
  return plan !== 'free'
}

// ─── Org features ─────────────────────────────────────────────────────────────

export function canAccessOrgFeatures(plan: Plan): boolean {
  return plan === 'team' || plan === 'enterprise'
}

// ─── Database helpers (server-side) ───────────────────────────────────────────

/**
 * Fetch the user's current plan from the subscriptions table.
 */
export async function getUserPlan(userId: string): Promise<Plan> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .single()

  if (error || !data) return 'free'

  // Past-due or canceled → treat as free
  if (data.status === 'canceled' || data.status === 'past_due') return 'free'

  return (data.plan as Plan) ?? 'free'
}

/**
 * Count how many playground prompts the user has sent today (and this hour).
 */
export async function getPlaygroundUsage(userId: string): Promise<{ daily: number; hourly: number }> {
  const supabase = await createClient()
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('playground_usage')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', startOfDay.toISOString())

  if (error || !data) return { daily: 0, hourly: 0 }

  const daily = data.length
  const hourly = data.filter(row => new Date(row.created_at) >= oneHourAgo).length

  return { daily, hourly }
}

/**
 * Remaining playground uses today for free users. Returns null for paid plans.
 */
export async function getPlaygroundRemaining(userId: string, plan: Plan): Promise<number | null> {
  if (plan !== 'free') return null
  const usage = await getPlaygroundUsage(userId)
  return Math.max(0, FREE_PLAYGROUND_DAILY_LIMIT - usage.daily)
}
