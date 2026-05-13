/**
 * Admin data queries — server-side only.
 * Uses the Supabase server client (anon key + RLS for admins).
 * All functions require the caller to have already verified admin role.
 */
import { createClient } from '@/lib/supabase-server'

// ─── KPI overview ─────────────────────────────────────────────────────────────

export interface AdminKPIs {
  totalUsers: number
  dau: number                  // distinct users with daily_activity today
  lessonsCompletedToday: number
  avgCompletionRate: number    // % of started lessons that are completed, 0–100
  reviewEngagement: number     // % of eligible users who submitted a review today
  mrr: number                  // USD cents
  activeSubscribers: number
  freeToPaidRate: number       // 0–100
}

export async function getAdminKPIs(): Promise<AdminKPIs> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const [
    { count: totalUsers },
    { data: todayActivity },
    { data: progressStats },
    { data: subStats },
  ] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }),
    supabase
      .from('daily_activity')
      .select('user_id, lessons_completed, reviews_completed')
      .eq('date', today),
    supabase
      .from('lesson_progress')
      .select('status'),
    supabase
      .from('subscriptions')
      .select('plan, status'),
  ])

  const dau = new Set((todayActivity ?? []).map(r => r.user_id as string)).size
  const lessonsCompletedToday = (todayActivity ?? []).reduce(
    (sum, r) => sum + ((r.lessons_completed as number) ?? 0), 0
  )

  // Completion rate: completed / (in_progress + completed)
  const started = (progressStats ?? []).filter(
    r => r.status === 'in_progress' || r.status === 'completed'
  ).length
  const completed = (progressStats ?? []).filter(r => r.status === 'completed').length
  const avgCompletionRate = started > 0 ? Math.round((completed / started) * 100) : 0

  // Review engagement: users who did ≥1 review today / DAU
  const reviewers = (todayActivity ?? []).filter(
    r => ((r.reviews_completed as number) ?? 0) > 0
  ).length
  const reviewEngagement = dau > 0 ? Math.round((reviewers / dau) * 100) : 0

  // Subscription stats
  const activeSubs = (subStats ?? []).filter(
    r => r.plan !== 'free' && r.status === 'active'
  )
  const activeSubscribers = activeSubs.length
  // Approx MRR: pro=$20, team=$40, enterprise=$80
  const MRR_MAP: Record<string, number> = { pro: 2000, team: 4000, enterprise: 8000 }
  const mrr = activeSubs.reduce((sum, r) => sum + (MRR_MAP[r.plan as string] ?? 0), 0)

  const totalNonFree = (subStats ?? []).filter(r => r.plan !== 'free').length
  const freeToPaidRate =
    (totalUsers ?? 0) > 0
      ? Math.round((totalNonFree / (totalUsers ?? 1)) * 100)
      : 0

  return {
    totalUsers: totalUsers ?? 0,
    dau,
    lessonsCompletedToday,
    avgCompletionRate,
    reviewEngagement,
    mrr,
    activeSubscribers,
    freeToPaidRate,
  }
}

// ─── Engagement chart data (30-day DAU + lessons) ─────────────────────────────

export interface DailyEngagementPoint {
  date: string
  dau: number
  lessonsCompleted: number
}

export async function getEngagementChart(): Promise<DailyEngagementPoint[]> {
  const supabase = await createClient()
  const since = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  const { data } = await supabase
    .from('daily_activity')
    .select('date, user_id, lessons_completed')
    .gte('date', since)
    .order('date', { ascending: true })

  if (!data) return []

  // Aggregate by date
  const map = new Map<string, { users: Set<string>; lessons: number }>()
  for (const row of data) {
    const d = row.date as string
    if (!map.has(d)) map.set(d, { users: new Set(), lessons: 0 })
    const entry = map.get(d)!
    entry.users.add(row.user_id as string)
    entry.lessons += (row.lessons_completed as number) ?? 0
  }

  return Array.from(map.entries()).map(([date, { users, lessons }]) => ({
    date,
    dau: users.size,
    lessonsCompleted: lessons,
  }))
}

// ─── Content analytics ────────────────────────────────────────────────────────

export interface LessonAnalyticsRow {
  lessonId: string
  trackId: string
  started: number
  completed: number
  completionRate: number   // 0–100
  avgScore: number | null  // 0–100
  avgAttempts: number
  avgTimeSeconds: number
  flagged: boolean         // completion < 60% or avgScore < 50
}

export async function getLessonAnalytics(): Promise<LessonAnalyticsRow[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('lesson_progress')
    .select('lesson_id, track_id, status, score, max_score, attempts, time_spent_seconds')

  if (!data) return []

  // Group by lesson_id
  const map = new Map<string, {
    trackId: string
    rows: typeof data
  }>()

  for (const row of data) {
    const lid = row.lesson_id as string
    if (!map.has(lid)) map.set(lid, { trackId: row.track_id as string, rows: [] })
    map.get(lid)!.rows.push(row)
  }

  return Array.from(map.entries()).map(([lessonId, { trackId, rows }]) => {
    const started = rows.filter(
      r => r.status === 'in_progress' || r.status === 'completed'
    ).length
    const completedRows = rows.filter(r => r.status === 'completed')
    const completed = completedRows.length
    const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0

    const scoredRows = completedRows.filter(r => r.score !== null)
    const avgScore =
      scoredRows.length > 0
        ? Math.round(
            scoredRows.reduce((sum, r) => {
              const max = (r.max_score as number) || 100
              return sum + (((r.score as number) / max) * 100)
            }, 0) / scoredRows.length
          )
        : null

    const avgAttempts =
      rows.length > 0
        ? Math.round(
            (rows.reduce((sum, r) => sum + ((r.attempts as number) ?? 0), 0) / rows.length) * 10
          ) / 10
        : 0

    const avgTimeSeconds =
      completedRows.length > 0
        ? Math.round(
            completedRows.reduce((sum, r) => sum + ((r.time_spent_seconds as number) ?? 0), 0) /
              completedRows.length
          )
        : 0

    const flagged = completionRate < 60 || (avgScore !== null && avgScore < 50)

    return { lessonId, trackId, started, completed, completionRate, avgScore, avgAttempts, avgTimeSeconds, flagged }
  })
}

// ─── Exercise-level drill-down ─────────────────────────────────────────────────

export interface ExerciseAnalyticsRow {
  lessonId: string
  exerciseIndex: number
  exerciseType: string
  submissions: number
  avgScore: number | null
  avgAttempts: number
  avgLatencyMs: number | null
}

export async function getExerciseAnalytics(lessonId: string): Promise<ExerciseAnalyticsRow[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('exercise_submissions')
    .select('exercise_index, exercise_type, score, max_score, attempt_number, grading_latency_ms')
    .eq('lesson_id', lessonId)

  if (!data) return []

  const map = new Map<number, typeof data>()
  for (const row of data) {
    const idx = row.exercise_index as number
    if (!map.has(idx)) map.set(idx, [])
    map.get(idx)!.push(row)
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([exerciseIndex, rows]) => {
      const exerciseType = (rows[0]?.exercise_type as string) ?? 'unknown'
      const scoredRows = rows.filter(r => r.score !== null)
      const avgScore =
        scoredRows.length > 0
          ? Math.round(
              scoredRows.reduce((sum, r) => {
                const max = (r.max_score as number) || 100
                return sum + (((r.score as number) / max) * 100)
              }, 0) / scoredRows.length
            )
          : null

      const avgAttempts =
        rows.length > 0
          ? Math.round((rows.reduce((sum, r) => sum + ((r.attempt_number as number) ?? 1), 0) / rows.length) * 10) / 10
          : 0

      const latencyRows = rows.filter(r => r.grading_latency_ms !== null)
      const avgLatencyMs =
        latencyRows.length > 0
          ? Math.round(latencyRows.reduce((sum, r) => sum + ((r.grading_latency_ms as number) ?? 0), 0) / latencyRows.length)
          : null

      return { lessonId, exerciseIndex, exerciseType, submissions: rows.length, avgScore, avgAttempts, avgLatencyMs }
    })
}

// ─── User management ──────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string
  email: string
  displayName: string
  orgName: string | null
  level: number
  lessonsCompleted: number
  lastActive: string | null
  plan: string
  currentStreak: number
}

export async function getAdminUsers(search?: string): Promise<AdminUserRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('users')
    .select('id, email, display_name, level, last_lesson_at, plan, current_streak, org_id')
    .order('last_lesson_at', { ascending: false, nullsFirst: false })
    .limit(200)

  if (search) {
    query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`)
  }

  const { data: users } = await query
  if (!users) return []

  // Count completed lessons per user
  const userIds = users.map(u => u.id as string)
  const { data: progressRows } = await supabase
    .from('lesson_progress')
    .select('user_id')
    .in('user_id', userIds)
    .eq('status', 'completed')

  const lessonCounts = new Map<string, number>()
  for (const row of progressRows ?? []) {
    const uid = row.user_id as string
    lessonCounts.set(uid, (lessonCounts.get(uid) ?? 0) + 1)
  }

  // Fetch org names for users with org_id
  const orgIds = Array.from(new Set(users.map(u => u.org_id as string).filter(Boolean)))
  const orgNames = new Map<string, string>()
  if (orgIds.length > 0) {
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id, name')
      .in('id', orgIds)
    for (const org of orgs ?? []) {
      orgNames.set(org.id as string, org.name as string)
    }
  }

  return users.map(u => ({
    id: u.id as string,
    email: u.email as string,
    displayName: (u.display_name as string) || (u.email as string).split('@')[0],
    orgName: u.org_id ? (orgNames.get(u.org_id as string) ?? null) : null,
    level: (u.level as number) ?? 1,
    lessonsCompleted: lessonCounts.get(u.id as string) ?? 0,
    lastActive: u.last_lesson_at as string | null,
    plan: (u.plan as string) ?? 'free',
    currentStreak: (u.current_streak as number) ?? 0,
  }))
}

export interface AdminUserDetail {
  id: string
  email: string
  displayName: string
  level: number
  xpTotal: number
  currentStreak: number
  longestStreak: number
  plan: string
  orgName: string | null
  createdAt: string
  lessonsCompleted: number
  totalAttempts: number
  avgScore: number | null
  recentActivity: Array<{ date: string; lessonsCompleted: number; xpEarned: number }>
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await createClient()

  const [
    { data: user },
    { data: progress },
    { data: submissions },
    { data: activity },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, email, display_name, level, xp_total, current_streak, longest_streak, plan, org_id, created_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('lesson_progress')
      .select('status, score, max_score')
      .eq('user_id', userId),
    supabase
      .from('exercise_submissions')
      .select('score, max_score')
      .eq('user_id', userId),
    supabase
      .from('daily_activity')
      .select('date, lessons_completed, xp_earned')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(14),
  ])

  if (!user) return null

  // Org name
  let orgName: string | null = null
  if (user.org_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', user.org_id)
      .single()
    orgName = org?.name ?? null
  }

  const completedProgress = (progress ?? []).filter(r => r.status === 'completed')
  const scoredSubs = (submissions ?? []).filter(r => r.score !== null)
  const avgScore =
    scoredSubs.length > 0
      ? Math.round(
          scoredSubs.reduce((sum, r) => {
            const max = (r.max_score as number) || 100
            return sum + (((r.score as number) / max) * 100)
          }, 0) / scoredSubs.length
        )
      : null

  return {
    id: user.id as string,
    email: user.email as string,
    displayName: (user.display_name as string) || (user.email as string).split('@')[0],
    level: (user.level as number) ?? 1,
    xpTotal: (user.xp_total as number) ?? 0,
    currentStreak: (user.current_streak as number) ?? 0,
    longestStreak: (user.longest_streak as number) ?? 0,
    plan: (user.plan as string) ?? 'free',
    orgName,
    createdAt: user.created_at as string,
    lessonsCompleted: completedProgress.length,
    totalAttempts: (submissions ?? []).length,
    avgScore,
    recentActivity: (activity ?? []).map(r => ({
      date: r.date as string,
      lessonsCompleted: (r.lessons_completed as number) ?? 0,
      xpEarned: (r.xp_earned as number) ?? 0,
    })),
  }
}

// ─── Org dashboard ────────────────────────────────────────────────────────────

export interface OrgDashboardData {
  org: { id: string; name: string; slug: string; plan: string; maxSeats: number; createdAt: string }
  memberCount: number
  members: Array<{
    userId: string
    displayName: string
    email: string
    role: string
    level: number
    lessonsCompleted: number
    currentStreak: number
    lastActive: string | null
    joinedAt: string | null
  }>
  pendingInvites: Array<{ id: string; email: string | null; inviteCode: string; role: string; expiresAt: string; createdAt: string }>
  teamStats: {
    avgLessonsPerWeek: number
    avgLevel: number
    totalLessonsCompleted: number
  }
}

export async function getOrgDashboard(orgId: string): Promise<OrgDashboardData | null> {
  const supabase = await createClient()

  const [
    { data: org },
    { data: members },
    { data: invites },
  ] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, slug, plan, max_seats, created_at')
      .eq('id', orgId)
      .single(),
    supabase
      .from('org_members')
      .select('user_id, role, joined_at, status')
      .eq('org_id', orgId)
      .eq('status', 'active'),
    supabase
      .from('org_invites')
      .select('id, email, invite_code, role, expires_at, created_at')
      .eq('org_id', orgId)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString()),
  ])

  if (!org) return null

  const memberUserIds = (members ?? []).map(m => m.user_id as string)

  // Fetch user details for members
  const { data: userDetails } = memberUserIds.length
    ? await supabase
        .from('users')
        .select('id, email, display_name, level, current_streak, last_lesson_at, plan')
        .in('id', memberUserIds)
    : { data: [] }

  // Count lessons completed per user
  const { data: progressRows } = memberUserIds.length
    ? await supabase
        .from('lesson_progress')
        .select('user_id')
        .in('user_id', memberUserIds)
        .eq('status', 'completed')
    : { data: [] }

  const lessonCounts = new Map<string, number>()
  for (const row of progressRows ?? []) {
    const uid = row.user_id as string
    lessonCounts.set(uid, (lessonCounts.get(uid) ?? 0) + 1)
  }

  // Lessons completed in last 7 days
  const since7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
  const { data: weekActivity } = memberUserIds.length
    ? await supabase
        .from('daily_activity')
        .select('user_id, lessons_completed')
        .in('user_id', memberUserIds)
        .gte('date', since7)
    : { data: [] }

  const weekLessonsByUser = new Map<string, number>()
  for (const row of weekActivity ?? []) {
    const uid = row.user_id as string
    weekLessonsByUser.set(uid, (weekLessonsByUser.get(uid) ?? 0) + ((row.lessons_completed as number) ?? 0))
  }

  const userMap = new Map((userDetails ?? []).map(u => [u.id as string, u]))
  const memberRoleMap = new Map((members ?? []).map(m => [m.user_id as string, m]))

  const enrichedMembers = memberUserIds.map(uid => {
    const u = userMap.get(uid)
    const m = memberRoleMap.get(uid)
    return {
      userId: uid,
      displayName: u ? ((u.display_name as string) || (u.email as string).split('@')[0]) : uid,
      email: (u?.email as string) ?? '',
      role: (m?.role as string) ?? 'member',
      level: (u?.level as number) ?? 1,
      lessonsCompleted: lessonCounts.get(uid) ?? 0,
      currentStreak: (u?.current_streak as number) ?? 0,
      lastActive: (u?.last_lesson_at as string | null) ?? null,
      joinedAt: (m?.joined_at as string | null) ?? null,
    }
  })

  const avgLevel =
    enrichedMembers.length > 0
      ? Math.round(enrichedMembers.reduce((sum, m) => sum + m.level, 0) / enrichedMembers.length * 10) / 10
      : 0

  const totalLessonsCompleted = enrichedMembers.reduce((sum, m) => sum + m.lessonsCompleted, 0)

  const avgLessonsPerWeek =
    enrichedMembers.length > 0
      ? Math.round(
          (Array.from(weekLessonsByUser.values()).reduce((s, v) => s + v, 0) / enrichedMembers.length) * 10
        ) / 10
      : 0

  return {
    org: {
      id: org.id as string,
      name: org.name as string,
      slug: org.slug as string,
      plan: (org.plan as string) ?? 'free',
      maxSeats: (org.max_seats as number) ?? 10,
      createdAt: org.created_at as string,
    },
    memberCount: enrichedMembers.length,
    members: enrichedMembers,
    pendingInvites: (invites ?? []).map(i => ({
      id: i.id as string,
      email: (i.email as string | null) ?? null,
      inviteCode: i.invite_code as string,
      role: i.role as string,
      expiresAt: i.expires_at as string,
      createdAt: i.created_at as string,
    })),
    teamStats: { avgLessonsPerWeek, avgLevel, totalLessonsCompleted },
  }
}
