import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getProgressMap } from '@/lib/progressEngine'

// GET /api/progress — Returns the full progress map for the authenticated user.
// Flutter-accessible endpoint.
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const progressMap = await getProgressMap(user.id)
    return NextResponse.json(progressMap)
  } catch (err) {
    console.error('GET /api/progress error:', err)
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 })
  }
}
