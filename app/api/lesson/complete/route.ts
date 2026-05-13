import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { completeLesson } from '@/lib/progressEngine'
import { LessonCompleteRequestSchema } from '@/lib/validators'

// POST /api/lesson/complete
// Records lesson completion, awards XP, updates streak, checks achievements.
// Flutter-accessible: all business logic runs server-side.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const parsed = LessonCompleteRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  try {
    const result = await completeLesson(
      user.id,
      parsed.data.lessonId,
      parsed.data.score,
      parsed.data.durationSeconds
    )
    return NextResponse.json(result)
  } catch (err) {
    console.error('Lesson complete error:', err)
    return NextResponse.json({ error: 'Failed to record completion' }, { status: 500 })
  }
}
