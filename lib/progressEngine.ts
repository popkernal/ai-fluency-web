/**
 * Progress tracking, track unlock logic, and lesson completion orchestration.
 * Used server-side by:
 *   POST /api/lesson/complete
 *   GET  /api/progress
 */
import type { TrackId, TrackProgressData, ProgressMap, LessonStatus, StreamId } from '@/types'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import {
  getAllStreams,
  getTrack,
  getLesson,
  getLessonsForTrack,
  isTrackUnlocked,
  isTrackCompleted,
} from '@/lib/lessonEngine'
import { calculateLessonXP, calculateLevel } from '@/lib/xpEngine'
import { updateStreak } from '@/lib/streakEngine'
import { checkNewAchievements } from '@/lib/achievementEngine'
import { addToReviewPool } from '@/lib/reviewEngine'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CompleteLessonResult {
  xpEarned: number
  newLevel: number | null       // set if user leveled up, otherwise null
  newAchievements: Array<{ id: string; title: string; description: string }>
  streakUpdated: boolean
  nextLessonId: string | null   // next lesson in the track, or null if last
}

// ─── Lesson completion ────────────────────────────────────────────────────────

/**
 * Mark a lesson as completed for a user.
 * Orchestrates: XP award, streak update, achievement check.
 * Returns the result for the API route to return to the client.
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  score: number,
  durationSeconds: number
): Promise<CompleteLessonResult> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  // 1. Load the lesson to get its base XP
  const lesson = await getLesson(lessonId)
  if (!lesson) throw new Error(`Lesson not found: ${lessonId}`)

  // 2. Fetch current user profile (streak, XP, level)
  // Upsert to handle new users who don't have a row yet (admin client bypasses RLS)
  const { data: { user: authUser } } = await supabase.auth.getUser()
  const admin = createAdminClient()
  const { error: upsertErr } = await admin.from('users').upsert(
    {
      id: userId,
      email: authUser?.email ?? '',
      display_name: (authUser?.user_metadata?.display_name as string | undefined) ?? authUser?.email?.split('@')[0] ?? '',
      xp_total: 0, level: 1, current_streak: 0, longest_streak: 0, streak_freezes: 0,
    },
    { onConflict: 'id', ignoreDuplicates: true }
  )
  if (upsertErr) {
    console.error('User upsert error:', upsertErr)
  }

  const { data: profile, error: profileErr } = await supabase
    .from('users')
    .select('xp_total, level, current_streak, longest_streak, last_activity_date, streak_freezes')
    .eq('id', userId)
    .single()

  if (profileErr || !profile) {
    console.error('Profile fetch error:', profileErr)
    // Fall back to default profile values so lesson completion doesn't fail
    const defaultProfile = { xp_total: 0, level: 1, current_streak: 0, longest_streak: 0, last_activity_date: today, streak_freezes: 0 }
    const streakState = {
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: today,
      freezesAvailable: 0,
    }
    const newStreakState = updateStreak(streakState, today)
    const xpEarned = calculateLessonXP(lesson.xpReward, score, 1.0)
    const newLevel = calculateLevel(xpEarned)

    // Best-effort DB writes
    await supabase.from('lesson_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      track_id: lesson.trackId,
      stream: lesson.streamId,
      status: 'completed',
      score,
      time_spent_seconds: durationSeconds,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,lesson_id' })

    const track = await getTrack(lesson.trackId as TrackId)
    let nextLessonId: string | null = null
    if (track) {
      const currentIdx = track.lessonIds.indexOf(lessonId)
      if (currentIdx !== -1 && currentIdx < track.lessonIds.length - 1) {
        nextLessonId = track.lessonIds[currentIdx + 1]
      }
    }

    return { xpEarned, newLevel: null, newAchievements: [], streakUpdated: false, nextLessonId }
  }

  // 3. Update streak
  const streakState = {
    currentStreak: profile.current_streak ?? 0,
    longestStreak: profile.longest_streak ?? 0,
    lastActivityDate: profile.last_activity_date ?? today,
    freezesAvailable: profile.streak_freezes ?? 0,
  }
  const newStreakState = updateStreak(streakState, today)
  const streakUpdated = newStreakState.currentStreak !== streakState.currentStreak

  // 4. Calculate XP earned
  const streakMultiplier = newStreakState.currentStreak >= 7 ? 1.1 : 1.0
  const xpEarned = calculateLessonXP(lesson.xpReward, score, streakMultiplier)
  const newTotalXP = (profile.xp_total ?? 0) + xpEarned
  const oldLevel = calculateLevel(profile.xp_total ?? 0)
  const newLevel = calculateLevel(newTotalXP)
  const leveledUp = newLevel > oldLevel

  // 5. Upsert lesson progress row
  await supabase.from('lesson_progress').upsert({
    user_id: userId,
    lesson_id: lessonId,
    track_id: lesson.trackId,
    stream: lesson.streamId,
    status: 'completed',
    score,
    time_spent_seconds: durationSeconds,
    completed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,lesson_id' })

  // 6. Update user profile (XP, level, streak)
  await supabase.from('users').update({
    xp_total: newTotalXP,
    level: newLevel,
    current_streak: newStreakState.currentStreak,
    longest_streak: newStreakState.longestStreak,
    last_activity_date: newStreakState.lastActivityDate,
    streak_freezes: newStreakState.freezesAvailable,
  }).eq('id', userId)

  // 7. Check for newly earned achievements
  const { data: completedRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const { data: earnedRows } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  // Count completed tracks
  const completedLessonIds = new Set((completedRows ?? []).map(r => r.lesson_id as string))
  const alreadyEarned = new Set((earnedRows ?? []).map(r => r.achievement_id as string))

  const allStreams = getAllStreams()
  const allTrackIds = allStreams.flatMap(s => s.trackIds) as TrackId[]
  let tracksCompleted = 0
  for (const trackId of allTrackIds) {
    if (await isTrackCompleted(trackId, completedLessonIds)) tracksCompleted++
  }

  const { count: playgroundCount } = await supabase
    .from('playground_usage')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const achContext = {
    totalLessonsCompleted: completedLessonIds.size,
    currentStreak: newStreakState.currentStreak,
    totalXP: newTotalXP,
    level: newLevel,
    tracksCompleted,
    playgroundUses: playgroundCount ?? 0,
  }

  const newAchievements = checkNewAchievements(achContext, alreadyEarned)

  if (newAchievements.length > 0) {
    await supabase.from('user_achievements').insert(
      newAchievements.map(a => ({
        user_id: userId,
        achievement_id: a.id,
        earned_at: new Date().toISOString(),
      }))
    )
  }

  // 8. Add completed lesson exercises to review pool (best-effort)
  try {
    await addToReviewPool(userId, lessonId)
  } catch {
    // Non-fatal — review pool seeding failure should not block lesson completion
  }

  // 9. Determine the next lesson in the track
  const track = await getTrack(lesson.trackId as TrackId)
  let nextLessonId: string | null = null
  if (track) {
    const currentIdx = track.lessonIds.indexOf(lessonId)
    if (currentIdx !== -1 && currentIdx < track.lessonIds.length - 1) {
      nextLessonId = track.lessonIds[currentIdx + 1]
    }
  }

  return {
    xpEarned,
    newLevel: leveledUp ? newLevel : null,
    newAchievements,
    streakUpdated,
    nextLessonId,
  }
}

// ─── Progress map ──────────────────────────────────────────────────────────────

/**
 * Build the full progress map for a user — all streams, tracks, and lesson statuses.
 * Used by GET /api/progress and the /learn page (server component).
 */
export async function getProgressMap(userId: string): Promise<ProgressMap> {
  const supabase = await createClient()

  // Fetch all completed lesson IDs for this user
  const { data: completedRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id, score')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const completedLessonMap = new Map<string, number>(
    (completedRows ?? []).map(r => [r.lesson_id as string, r.score as number])
  )
  const completedLessonIds = new Set(completedLessonMap.keys())

  // Pre-compute which tracks are completed (all lessons done)
  const streams = getAllStreams()
  const allTrackIds = streams.flatMap(s => s.trackIds) as TrackId[]
  const completedTrackIds = new Set<TrackId>()
  for (const trackId of allTrackIds) {
    if (await isTrackCompleted(trackId, completedLessonIds)) {
      completedTrackIds.add(trackId)
    }
  }

  // Build stream → tracks → lessons structure
  const streamData = await Promise.all(
    streams.map(async stream => {
      const trackDataList = await Promise.all(
        (stream.trackIds as TrackId[]).map(async trackId => {
          return buildTrackProgressData(
            trackId,
            completedLessonIds,
            completedLessonMap,
            completedTrackIds
          )
        })
      )

      return {
        streamId: stream.id as StreamId,
        tracks: trackDataList.filter((t): t is TrackProgressData => t !== null),
      }
    })
  )

  return { streams: streamData }
}

/**
 * Build progress data for a single track.
 */
export async function getTrackProgress(
  userId: string,
  trackId: TrackId
): Promise<TrackProgressData | null> {
  const supabase = await createClient()

  const { data: completedRows } = await supabase
    .from('lesson_progress')
    .select('lesson_id, score')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const completedLessonMap = new Map<string, number>(
    (completedRows ?? []).map(r => [r.lesson_id as string, r.score as number])
  )
  const completedLessonIds = new Set(completedLessonMap.keys())

  // Figure out which tracks are completed to evaluate unlock state
  const streams = getAllStreams()
  const allTrackIds = streams.flatMap(s => s.trackIds) as TrackId[]
  const completedTrackIds = new Set<TrackId>()
  for (const tid of allTrackIds) {
    if (await isTrackCompleted(tid, completedLessonIds)) {
      completedTrackIds.add(tid)
    }
  }

  return buildTrackProgressData(trackId, completedLessonIds, completedLessonMap, completedTrackIds)
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

async function buildTrackProgressData(
  trackId: TrackId,
  completedLessonIds: Set<string>,
  completedLessonMap: Map<string, number>,
  completedTrackIds: Set<TrackId>
): Promise<TrackProgressData | null> {
  const track = await getTrack(trackId)
  if (!track) return null

  const lessons = await getLessonsForTrack(trackId)
  const unlocked = await isTrackUnlocked(trackId, completedTrackIds)

  const lessonEntries = lessons.map(lesson => {
    let status: LessonStatus

    if (completedLessonIds.has(lesson.id)) {
      status = 'completed'
    } else if (!unlocked) {
      status = 'locked'
    } else {
      // Check sequential unlock within the track
      const idx = track.lessonIds.indexOf(lesson.id)
      if (idx === 0) {
        status = 'available'
      } else {
        const prevId = track.lessonIds[idx - 1]
        status = completedLessonIds.has(prevId) ? 'available' : 'locked'
      }
    }

    return {
      lesson,
      status,
      score: completedLessonMap.get(lesson.id),
    }
  })

  const completedCount = lessonEntries.filter(e => e.status === 'completed').length

  return {
    track,
    lessons: lessonEntries,
    completedCount,
    totalCount: lessons.length,
    isUnlocked: unlocked,
  }
}
