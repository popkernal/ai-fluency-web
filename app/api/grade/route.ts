import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import { GradeRequestSchema } from '@/lib/validators'
import type { GradeResult } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DAILY_GRADING_LIMIT = 50
const TIMEOUT_MS = 30_000

const GRADING_SYSTEM_PROMPT = `You are a concise, encouraging AI writing tutor grading a prompt-writing exercise.

Evaluate the user's response against the rubric criteria. Be specific and constructive.
Never be condescending. Celebrate genuine effort even when the answer is imperfect.

Return ONLY valid JSON (no markdown fences) in this exact shape:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "1-2 sentences of specific, encouraging feedback",
  "suggestions": ["one actionable improvement", "another if needed"]
}
The suggestions field is optional. Only include it when there is a clear, actionable improvement.`

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function callWithRetry(
  params: Anthropic.MessageCreateParamsNonStreaming,
  retries = 1
): Promise<Anthropic.Message> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await anthropic.messages.create(params, { signal: controller.signal })
  } catch (err) {
    if (retries > 0) {
      return callWithRetry(params, retries - 1)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

function buildGradingPrompt(
  exerciseType: string,
  userResponse: string,
  exerciseData: Record<string, unknown>
): string {
  const rubric = (exerciseData.rubric as string[] | undefined) ?? []

  if (exerciseType === 'prompt_write') {
    return `Exercise type: prompt_write

Rubric criteria (each must be addressed):
${rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}

User's prompt:
"""
${userResponse}
"""

Grade this prompt against the rubric. Score 0-100 (≥70 = correct).`
  }

  if (exerciseType === 'rewrite') {
    const original = (exerciseData.original as string) ?? ''
    return `Exercise type: rewrite

Original (weak) prompt:
"""
${original}
"""

Rubric criteria for the rewrite:
${rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}

User's rewritten prompt:
"""
${userResponse}
"""

Grade how well the rewrite improves on the original. Score 0-100 (≥70 = correct).`
  }

  if (exerciseType === 'context_builder') {
    return `Exercise type: context_builder

Rubric criteria:
${rubric.map((r, i) => `${i + 1}. ${r}`).join('\n')}

User's context-enriched prompt:
"""
${userResponse}
"""

Grade this prompt. Score 0-100 (≥70 = correct).`
  }

  return `Exercise type: ${exerciseType}

Exercise data:
${JSON.stringify(exerciseData, null, 2)}

User's response:
"""
${userResponse}
"""

Grade this response. Score 0-100 (≥70 = correct).`
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = GradeRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  // Rate limit: max 50 grading calls per day
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const { count } = await supabase
    .from('exercise_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', todayStart.toISOString())
  if ((count ?? 0) >= DAILY_GRADING_LIMIT) {
    return NextResponse.json({ error: 'Daily grading limit reached' }, { status: 429 })
  }

  const { exerciseType, userResponse, exerciseData } = parsed.data
  const gradingPrompt = buildGradingPrompt(exerciseType, userResponse, exerciseData)

  const start = Date.now()

  try {
    const message = await callWithRetry({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: GRADING_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: gradingPrompt }],
    })

    const gradingLatencyMs = Date.now() - start
    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const result = JSON.parse(text) as GradeResult

    // Save submission (best-effort — grading succeeds even if insert fails)
    Promise.resolve(
      supabase.from('exercise_submissions').insert({
        user_id: user.id,
        lesson_id: parsed.data.lessonId,
        exercise_index: parsed.data.exerciseIndex ?? 0,
        exercise_type: exerciseType,
        user_response: userResponse,
        score: result.score,
        is_correct: result.isCorrect,
        feedback: result.feedback,
        grading_latency_ms: gradingLatencyMs,
      })
    ).catch((insertErr: unknown) => {
      console.error('Failed to save exercise_submission:', insertErr)
    })

    return NextResponse.json({ ...result, gradingLatencyMs })
  } catch (err) {
    console.error('Grade API error:', err)
    return NextResponse.json({ error: 'Grading failed' }, { status: 500 })
  }
}
