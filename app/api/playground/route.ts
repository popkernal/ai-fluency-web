import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { PlaygroundRequestSchema } from '@/lib/validators'
import { getUserPlan, canUsePlayground, getPlaygroundUsage } from '@/lib/subscriptionEngine'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const QUALITY_SYSTEM = `You are a prompt quality coach. After responding to the user's prompt, add a short quality note.

Format your response as JSON:
{
  "response": "your actual response to the prompt",
  "quality": {
    "score": number (0-100),
    "note": "1 sentence on what makes this prompt strong or weak"
  }
}

Always return valid JSON only, no markdown.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = PlaygroundRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Rate limit check
  const plan = await getUserPlan(user.id)
  const usage = await getPlaygroundUsage(user.id)
  const gate = canUsePlayground(plan, usage)
  if (!gate.allowed) {
    return NextResponse.json({ error: gate.reason, rateLimited: true }, { status: 429 })
  }

  try {
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: parsed.data.prompt },
    ]

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: parsed.data.systemPrompt
        ? `${parsed.data.systemPrompt}\n\n${QUALITY_SYSTEM}`
        : QUALITY_SYSTEM,
      messages,
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'

    let parsed2: { response: string; quality: { score: number; note: string } }
    try {
      parsed2 = JSON.parse(text)
    } catch {
      // Graceful fallback if the model didn't return JSON
      parsed2 = { response: text, quality: { score: 50, note: 'Could not evaluate quality.' } }
    }

    // Record usage
    await supabase.from('playground_usage').insert({
      user_id: user.id,
      created_at: new Date().toISOString(),
    })

    // Compute remaining for free users
    const remaining = plan === 'free' ? Math.max(0, 3 - (usage.daily + 1)) : null

    return NextResponse.json({
      response: parsed2.response,
      quality: parsed2.quality,
      remaining,
      plan,
      promptTokens: message.usage.input_tokens,
      responseTokens: message.usage.output_tokens,
    })
  } catch (err) {
    console.error('Playground API error:', err)
    return NextResponse.json({ error: 'Request failed' }, { status: 500 })
  }
}
