import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getExerciseAnalytics } from '@/lib/adminEngine'
import { z } from 'zod'

const QuerySchema = z.object({
  lessonId: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Invalid lesson ID format'),
})

// GET /api/admin/content/exercises?lessonId=xxx
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'org_admin'].includes(profile.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = QuerySchema.safeParse({
    lessonId: req.nextUrl.searchParams.get('lessonId'),
  })
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid lessonId' }, { status: 400 })
  }

  const exercises = await getExerciseAnalytics(parsed.data.lessonId)
  return NextResponse.json({ exercises })
}
