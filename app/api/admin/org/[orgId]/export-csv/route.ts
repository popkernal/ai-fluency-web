import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getOrgDashboard } from '@/lib/adminEngine'

// GET /api/admin/org/[orgId]/export-csv — download member progress as CSV
export async function GET(
  _req: NextRequest,
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

  const data = await getOrgDashboard(orgId)
  if (!data) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  // Build CSV
  const header = ['Name', 'Email', 'Role', 'Level', 'Lessons Completed', 'Current Streak', 'Last Active', 'Joined']
  const rows = data.members.map(m => [
    `"${m.displayName.replace(/"/g, '""')}"`,
    `"${m.email.replace(/"/g, '""')}"`,
    m.role,
    m.level,
    m.lessonsCompleted,
    m.currentStreak,
    m.lastActive ? new Date(m.lastActive).toISOString().slice(0, 10) : '',
    m.joinedAt ? new Date(m.joinedAt).toISOString().slice(0, 10) : '',
  ])

  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n')
  const filename = `${data.org.slug}-members-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
