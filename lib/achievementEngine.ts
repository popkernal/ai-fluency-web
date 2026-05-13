/**
 * Achievement checking logic.
 * Used server-side by POST /api/lesson/complete.
 * Full list of achievements in content/achievements.json.
 */
import { createClient } from '@/lib/supabase-server'
import { getAllStreams, isTrackCompleted } from '@/lib/lessonEngine'
import type { TrackId } from '@/types'

export interface AchievementContext {
  totalLessonsCompleted: number
  currentStreak: number
  totalXP: number
  level: number
  tracksCompleted: number
  playgroundUses: number
}

export interface AchievementResult {
  id: string
  title: string
  description: string
}

export const ACHIEVEMENT_RULES: Array<{
  id: string
  title: string
  description: string
  check: (ctx: AchievementContext) => boolean
}> = [
  {
    id: 'first-lesson',
    title: 'First Step',
    description: 'Completed your first lesson.',
    check: ctx => ctx.totalLessonsCompleted >= 1,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: '7-day learning streak.',
    check: ctx => ctx.currentStreak >= 7,
  },
  {
    id: 'streak-30',
    title: 'Monthly Habit',
    description: '30-day learning streak.',
    check: ctx => ctx.currentStreak >= 30,
  },
  {
    id: 'first-track',
    title: 'Track Complete',
    description: 'Finished your first full track.',
    check: ctx => ctx.tracksCompleted >= 1,
  },
  {
    id: 'level-5',
    title: 'Rising Expert',
    description: 'Reached Level 5.',
    check: ctx => ctx.level >= 5,
  },
  {
    id: 'playground-10',
    title: 'Prompt Tinkerer',
    description: 'Used the playground 10 times.',
    check: ctx => ctx.playgroundUses >= 10,
  },
  {
    id: 'all-tracks',
    title: 'AI Fluent',
    description: 'Completed all 12 tracks.',
    check: ctx => ctx.tracksCompleted >= 12,
  },
]

export function checkNewAchievements(
  context: AchievementContext,
  alreadyEarned: Set<string>
): AchievementResult[] {
  return ACHIEVEMENT_RULES
    .filter(rule => !alreadyEarned.has(rule.id) && rule.check(context))
    .map(({ id, title, description }) => ({ id, title, description }))
}

// ─── Event types ──────────────────────────────────────────────────────────────

export type AchievementEventType = 'lesson_complete' | 'streak_updated' | 'level_up' | 'review_complete'

export interface AchievementEvent {
  type: AchievementEventType
}

/**
 * DB-connected achievement check. Loads user context, checks for new achievements,
 * persists them, and returns the newly unlocked list.
 * Use for triggered checks outside lesson completion (e.g., after reviews).
 */
export async function checkAchievements(
  userId: string,
  _event: AchievementEvent,
): Promise<AchievementResult[]> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('users')
    .select('xp_total, level, current_streak')
    .eq('id', userId)
    .single()

  if (!profile) return []

  const { data: completedRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const completedLessonIds = new Set((completedRows ?? []).map(r => r.lesson_id as string))

  const { data: earnedRows } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const alreadyEarned = new Set((earnedRows ?? []).map(r => r.achievement_id as string))

  const allTrackIds = getAllStreams().flatMap(s => s.trackIds) as TrackId[]
  let tracksCompleted = 0
  for (const tid of allTrackIds) {
    if (await isTrackCompleted(tid, completedLessonIds)) tracksCompleted++
  }

  const { count: playgroundCount } = await supabase
    .from('playground_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const ctx: AchievementContext = {
    totalLessonsCompleted: completedLessonIds.size,
    currentStreak: profile.current_streak as number ?? 0,
    totalXP: profile.xp_total as number ?? 0,
    level: profile.level as number ?? 1,
    tracksCompleted,
    playgroundUses: playgroundCount ?? 0,
  }

  const newAchievements = checkNewAchievements(ctx, alreadyEarned)

  if (newAchievements.length > 0) {
    await supabase.from('user_achievements').insert(
      newAchievements.map(a => ({
        user_id: userId,
        achievement_id: a.id,
        earned_at: new Date().toISOString(),
      }))
    )
  }

  return newAchievements
}
