import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { z } from 'zod'

const PreferencesPatchSchema = z.object({
  leaderboard: z.boolean().optional(),
  emailDigest: z.boolean().optional(),
  displayName: z.string().min(1).max(50).optional(),
})

// PATCH /api/profile/preferences — Merge-update user preferences jsonb field.
export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = PreferencesPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.issues }, { status: 400 })
  }

  try {
    const { data: profile } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', user.id)
      .single()

    const existing = (profile?.preferences as Record<string, unknown>) ?? {}
    const merged = { ...existing, ...parsed.data }

    await supabase
      .from('users')
      .update({ preferences: merged })
      .eq('id', user.id)

    return NextResponse.json({ preferences: merged })
  } catch (err) {
    console.error('PATCH /api/profile/preferences error:', err)
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 })
  }
}
