import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

// POST /api/admin/org/[orgId]/invite — generate a new open invite link
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const { orgId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (!profile || !['admin', 'org_admin'].includes(profile.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Verify org exists
  const { data: org } = await supabase
    .from('organizations').select('slug').eq('id', orgId).single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  // Generate invite
  const inviteCode = (org.slug as string) + '-' + Math.random().toString(36).slice(2, 9)
  const { error } = await supabase.from('org_invites').insert({
    org_id: orgId,
    invite_code: inviteCode,
    role: 'member',
    expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const origin = req.headers.get('origin') ?? new URL(req.url).origin
  return NextResponse.json({ inviteLink: `${origin}/join/${inviteCode}` })
}
