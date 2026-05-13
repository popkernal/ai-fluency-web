/**
 * Streak tracking and freeze logic.
 * Used server-side by POST /api/lesson/complete.
 */

export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string   // ISO date string (YYYY-MM-DD)
  freezesAvailable: number
}

export function updateStreak(state: StreakState, today: string): StreakState {
  const last = state.lastActivityDate
  const daysDiff = daysBetween(last, today)

  if (daysDiff === 0) {
    // Already active today — no change
    return state
  }

  if (daysDiff === 1) {
    // Consecutive day
    const newStreak = state.currentStreak + 1
    return {
      ...state,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, state.longestStreak),
      lastActivityDate: today,
    }
  }

  if (daysDiff === 2 && state.freezesAvailable > 0) {
    // Missed one day but freeze available
    const newStreak = state.currentStreak + 1
    return {
      ...state,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, state.longestStreak),
      lastActivityDate: today,
      freezesAvailable: state.freezesAvailable - 1,
    }
  }

  // Streak broken
  return {
    ...state,
    currentStreak: 1,
    lastActivityDate: today,
  }
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 86400000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

/**
 * Read-only streak status check — does not mutate state.
 * Used on app load to detect broken streaks given the last lesson date.
 * Pass todayReviewCount to account for the rule: 3+ reviews = streak maintained.
 * For full streak evaluation with freeze logic, use updateStreak() with a StreakState.
 */
export function checkStreak(
  lastLessonAt: string | null,
  todayReviewCount = 0
): {
  currentStreak: number
  broken: boolean
  freezeUsed: boolean
} {
  if (!lastLessonAt) return { currentStreak: 0, broken: false, freezeUsed: false }
  const today = new Date().toISOString().slice(0, 10)
  const diff = daysBetween(lastLessonAt, today)
  // Streak is active if: lesson was today/yesterday, OR 3+ reviews done today
  if (diff <= 1 || todayReviewCount >= 3) return { currentStreak: 0, broken: false, freezeUsed: false }
  return { currentStreak: 0, broken: true, freezeUsed: false }
}
