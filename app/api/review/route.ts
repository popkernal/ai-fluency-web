import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getReviewsDue, updateReviewStrength } from '@/lib/reviewEngine'
import { ReviewSubmitRequestSchema } from '@/lib/validators'

// GET /api/review — Returns today's due review items.
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const items = await getReviewsDue(user.id)
    const serialized = items.map(item => ({
      scheduleId: item.scheduleId,
      lessonId: item.lessonId,
      lessonTitle: item.lesson.title,
      exerciseIndex: item.exerciseIndex,
      exerciseType: item.exercise.exerciseType,
      prompt: item.exercise.prompt,
      data: item.exercise.data,
      strength: item.strength,
      timesReviewed: item.timesReviewed,
    }))
    return NextResponse.json({ items: serialized, count: serialized.length })
  } catch (err) {
    console.error('GET /api/review error:', err)
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }
}

// POST /api/review — Submit a review result. Awards 5 XP.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = ReviewSubmitRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  try {
    const { lessonId, exerciseIndex, score } = parsed.data
    const { newStrength } = await updateReviewStrength(user.id, lessonId, exerciseIndex, score)

    // Award 5 XP — read-then-write (safe for MVP: reviews are not concurrent)
    const XP_REVIEW = 5
    const { data: profile } = await supabase
      .from('users')
      .select('xp_total')
      .eq('id', user.id)
      .single()
    const newXP = ((profile?.xp_total as number) ?? 0) + XP_REVIEW
    await supabase.from('users').update({ xp_total: newXP }).eq('id', user.id)

    return NextResponse.json({ xpEarned: XP_REVIEW, newStrength })
  } catch (err) {
    console.error('POST /api/review error:', err)
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }
}
