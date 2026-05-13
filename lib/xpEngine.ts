/**
 * XP calculation and leveling.
 * Used server-side by POST /api/lesson/complete.
 */

// XP required to reach each level (cumulative)
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2100, 3000, 4200, 5700, 7500]

export function calculateLevel(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) return i + 1
  }
  return 1
}

export function xpToNextLevel(totalXP: number): number {
  const level = calculateLevel(totalXP)
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  return Math.max(0, nextThreshold - totalXP)
}

export function calculateLessonXP(baseXP: number, score: number, streakMultiplier = 1): number {
  const scoreMultiplier = score >= 90 ? 1.2 : score >= 70 ? 1.0 : 0.7
  return Math.round(baseXP * scoreMultiplier * streakMultiplier)
}

export interface XPBreakdown {
  base: number
  scoreBonus: number
  streakBonus: number
  firstAttemptBonus: number
  total: number
}

/**
 * Unified XP calculation for lessons and reviews.
 * Returns a structured breakdown for display in toasts and profile.
 */
export function calculateXP(
  lessonXP: number,
  score: number,
  maxScore: number,
  isFirstAttempt: boolean,
  currentStreak: number,
  isReview: boolean
): { total: number; breakdown: XPBreakdown } {
  if (isReview) {
    // Reviews award flat XP — no multipliers
    return {
      total: lessonXP,
      breakdown: { base: lessonXP, scoreBonus: 0, streakBonus: 0, firstAttemptBonus: 0, total: lessonXP },
    }
  }

  const pct = maxScore > 0 ? score / maxScore : 0
  const scoreMultiplier = pct >= 0.9 ? 1.2 : pct >= 0.7 ? 1.0 : 0.7
  const streakMultiplier = currentStreak >= 7 ? 1.25 : currentStreak >= 3 ? 1.1 : 1.0
  const firstAttemptMultiplier = isFirstAttempt ? 1.1 : 1.0

  const base = lessonXP
  const afterScore = Math.round(base * scoreMultiplier)
  const afterStreak = Math.round(afterScore * streakMultiplier)
  const total = Math.round(afterStreak * firstAttemptMultiplier)

  return {
    total,
    breakdown: {
      base,
      scoreBonus: afterScore - base,
      streakBonus: afterStreak - afterScore,
      firstAttemptBonus: total - afterStreak,
      total,
    },
  }
}

// Flutter-friendly aliases with structured return types

export function getLevelForXP(totalXP: number): number {
  return calculateLevel(totalXP)
}

export function getXPToNextLevel(totalXP: number): {
  current: number    // XP earned within the current level
  needed: number     // XP span of the entire current level
  percentage: number
} {
  const level = calculateLevel(totalXP)
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]
  const current = totalXP - currentThreshold
  const needed = nextThreshold - currentThreshold
  const percentage = needed > 0 ? Math.min(100, Math.round((current / needed) * 100)) : 100
  return { current, needed, percentage }
}
