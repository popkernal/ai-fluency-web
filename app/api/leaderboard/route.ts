import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

function getCurrentWeek(): number {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const diff = now.getTime() - startOfYear.getTime()
  return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
}

// GET /api/leaderboard — Returns top 20 users by XP in the last 7 days (opt-in only).
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const since = sevenDaysAgo.toISOString().slice(0, 10)

    // Aggregate XP from daily_activity for the last 7 days
    const { data: activityRows } = await supabase
      .from('daily_activity')
      .select('user_id, xp_earned')
      .gte('date', since)

    if (!activityRows || activityRows.length === 0) {
      return NextResponse.json({ entries: [], week: getCurrentWeek() })
    }

    // Sum XP per user
    const xpByUser = new Map<string, number>()
    for (const row of activityRows) {
      const uid = row.user_id as string
      const xp = row.xp_earned as number ?? 0
      xpByUser.set(uid, (xpByUser.get(uid) ?? 0) + xp)
    }

    const userIds = Array.from(xpByUser.keys())

    // Fetch user profiles — only include opted-in users
    const { data: profiles } = await supabase
      .from('users')
      .select('id, display_name, level, preferences')
      .in('id', userIds)

    const optedInProfiles = (profiles ?? []).filter(p => {
      const prefs = (p.preferences as Record<string, unknown>) ?? {}
      return prefs.leaderboard === true
    })

    // Build ranked entries
    const entries = optedInProfiles
      .map(p => {
        const prefs = (p.preferences as Record<string, unknown>) ?? {}
        return {
          userId: p.id as string,
          displayName: (p.display_name as string | undefined) ?? 'Anonymous',
          level: p.level as number ?? 1,
          weeklyXP: xpByUser.get(p.id as string) ?? 0,
          isCurrentUser: p.id === user.id,
        }
      })
      .sort((a, b) => b.weeklyXP - a.weeklyXP)
      .slice(0, 20)
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }))

    return NextResponse.json({ entries, week: getCurrentWeek() })
  } catch (err) {
    console.error('GET /api/leaderboard error:', err)
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 })
  }
}
