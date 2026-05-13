import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { ACHIEVEMENT_RULES } from '@/lib/achievementEngine'

// Static track metadata — lesson counts sourced from track JSON files.
// Avoids loading every lesson file just to count them.
const TRACK_META: Record<string, { title: string; color: string; totalCount: number }> = {
  foundations:  { title: 'AI Fundamentals',           color: '#6366F1', totalCount: 6 },
  prompting:    { title: 'Prompt Engineering',         color: '#0EA5E9', totalCount: 8 },
  cs:           { title: 'Critical AI Skills',         color: '#8B5CF6', totalCount: 5 },
  dw:           { title: 'Data Writing',               color: '#10B981', totalCount: 6 },
  tw:           { title: 'Technical Writing',          color: '#F59E0B', totalCount: 5 },
  qw:           { title: 'Quick Wins',                 color: '#EF4444', totalCount: 5 },
  pw:           { title: 'Power Workflows',            color: '#F97316', totalCount: 6 },
  sl:           { title: 'AI for Sales',               color: '#06B6D4', totalCount: 6 },
  op:           { title: 'AI for Operations',          color: '#84CC16', totalCount: 6 },
  pd:           { title: 'AI for Product',             color: '#EC4899', totalCount: 6 },
  mk:           { title: 'AI for Marketing',           color: '#A855F7', totalCount: 5 },
  fn:           { title: 'AI for Finance',             color: '#14B8A6', totalCount: 5 },
  cx:           { title: 'AI for Customer Experience', color: '#84CC16', totalCount: 5 },
  hr:           { title: 'AI for HR & People',         color: '#F43F5E', totalCount: 5 },
  mc:           { title: 'Multi-step Chains',          color: '#6366F1', totalCount: 8 },
  aa:           { title: 'AI Agents',                  color: '#8B5CF6', totalCount: 8 },
  models:       { title: 'AI Models Explained',        color: '#7C3AED', totalCount: 6 },
  interfaces:   { title: 'Navigating AI Interfaces',   color: '#0891B2', totalCount: 4 },
  glossary:     { title: 'AI Glossary',                color: '#059669', totalCount: 4 },
}

// GET /api/profile — Returns user stats, earned achievements, and track progress summaries.
export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const admin = createAdminClient()
    // Run all independent DB queries in parallel
    const [profileResult, achievementsResult, progressResult, todayResult] = await Promise.all([
      admin
        .from('users')
        .select('id, display_name, xp_total, level, current_streak, longest_streak, preferences, created_at')
        .eq('id', user.id)
        .single(),

      supabase
        .from('user_achievements')
        .select('achievement_id, earned_at')
        .eq('user_id', user.id),

      // Count completed lessons grouped by track_id — one fast query replaces loading all lesson files
      supabase
        .from('lesson_progress')
        .select('track_id')
        .eq('user_id', user.id)
        .eq('status', 'completed'),

      supabase
        .from('daily_activity')
        .select('lessons_completed, xp_earned')
        .eq('user_id', user.id)
        .eq('date', new Date().toISOString().slice(0, 10))
        .maybeSingle(),
    ])

    let profile = profileResult.data
    if (!profile) {
      // First visit — create the users row using admin client to bypass RLS
      const { error: insertErr } = await admin.from('users').upsert(
        {
          id: user.id,
          email: user.email ?? '',
          display_name: (user.user_metadata?.display_name as string | undefined) ?? user.email?.split('@')[0] ?? '',
          xp_total: 0, level: 1, current_streak: 0, longest_streak: 0, streak_freezes: 0,
        },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      if (insertErr) console.error('users upsert error:', insertErr)
      const { data: retried, error: retryErr } = await admin
        .from('users')
        .select('id, display_name, xp_total, level, current_streak, longest_streak, preferences, created_at')
        .eq('id', user.id)
        .single()
      if (retryErr) console.error('users retry fetch error:', retryErr)
      if (!retried) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
      profile = retried
    }

    // Count completions per track from the flat rows
    const completionsByTrack = new Map<string, number>()
    for (const row of progressResult.data ?? []) {
      const tid = row.track_id as string
      completionsByTrack.set(tid, (completionsByTrack.get(tid) ?? 0) + 1)
    }

    // Build track progress list using static metadata
    const tracksProgress = Object.entries(TRACK_META).map(([trackId, meta]) => ({
      trackId,
      title: meta.title,
      color: meta.color,
      completedCount: completionsByTrack.get(trackId) ?? 0,
      totalCount: meta.totalCount,
    }))

    // Build achievements list
    const earnedMap = new Map(
      (achievementsResult.data ?? []).map(r => [r.achievement_id as string, r.earned_at as string])
    )
    const achievements = ACHIEVEMENT_RULES.map(rule => ({
      id: rule.id,
      title: rule.title,
      description: rule.description,
      earnedAt: earnedMap.get(rule.id) ?? null,
    }))

    const prefs = (profile.preferences as Record<string, unknown>) ?? {}

    return NextResponse.json({
      user: {
        id: profile.id,
        email: user.email,
        displayName: (profile.display_name as string | undefined) || (prefs.displayName as string | undefined) || user.email?.split('@')[0] || 'Learner',
        xpTotal: profile.xp_total as number ?? 0,
        level: profile.level as number ?? 1,
        currentStreak: profile.current_streak as number ?? 0,
        longestStreak: profile.longest_streak as number ?? 0,
        preferences: prefs,
        createdAt: profile.created_at,
      },
      achievements,
      tracksProgress,
      todayStats: {
        lessonsCompleted: todayResult.data?.lessons_completed as number ?? 0,
        xpEarned: todayResult.data?.xp_earned as number ?? 0,
      },
    })
  } catch (err) {
    console.error('GET /api/profile error:', err)
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 })
  }
}
