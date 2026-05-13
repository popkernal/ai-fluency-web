/**
 * Adaptive difficulty and onboarding skill assessment.
 * Used server-side during onboarding to set skill level and unlock lessons.
 */
import type { SkillLevel, TrackId } from '@/types'
import { createClient } from '@/lib/supabase-server'

export type DifficultyLevel = 'easy' | 'medium' | 'hard'

// ─── Onboarding quiz ──────────────────────────────────────────────────────────

/**
 * Onboarding quiz answers (0-indexed options).
 * q1: familiarity (0=never, 1=tried a few times, 2=use regularly)
 * q2: goal       (0=curious, 1=work efficiency, 2=build/code)
 * q3: experience (0=no tech bg, 1=some tech, 2=developer)
 */
export interface QuizAnswers {
  q1_familiarity: 0 | 1 | 2
  q2_goal: 0 | 1 | 2
  q3_experience: 0 | 1 | 2
}

/** Map quiz answers to a skill level. */
export function getSkillLevel(answers: QuizAnswers): SkillLevel {
  const score = answers.q1_familiarity + answers.q2_goal + answers.q3_experience
  if (score <= 1) return 'beginner'
  if (score <= 3) return 'intermediate'
  return 'advanced'
}

/** Return the recommended starting track for a given skill level. */
export function getRecommendedTrack(skillLevel: SkillLevel): TrackId {
  if (skillLevel === 'beginner') return 'foundations'
  return 'prompting'
}

// ─── Progress initialization ──────────────────────────────────────────────────

const INITIAL_AVAILABLE_LESSONS: Record<SkillLevel, { lessonId: string; trackId: TrackId; stream: string }[]> = {
  beginner: [
    { lessonId: 'foundations-001', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'foundations-002', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'prompting-001',   trackId: 'prompting',   stream: 'foundations' },
  ],
  intermediate: [
    { lessonId: 'foundations-001', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'foundations-002', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'foundations-003', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'prompting-001',   trackId: 'prompting',   stream: 'foundations' },
    { lessonId: 'prompting-002',   trackId: 'prompting',   stream: 'foundations' },
  ],
  advanced: [
    { lessonId: 'foundations-001', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'foundations-002', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'foundations-003', trackId: 'foundations', stream: 'foundations' },
    { lessonId: 'prompting-001',   trackId: 'prompting',   stream: 'foundations' },
    { lessonId: 'prompting-002',   trackId: 'prompting',   stream: 'foundations' },
    { lessonId: 'prompting-003',   trackId: 'prompting',   stream: 'foundations' },
  ],
}

/**
 * Create lesson_progress rows for the user based on their skill level.
 * Called once after onboarding quiz completes.
 */
export async function initializeProgress(userId: string, skillLevel: SkillLevel): Promise<void> {
  const supabase = await createClient()
  const availableLessons = INITIAL_AVAILABLE_LESSONS[skillLevel]

  const rows = availableLessons.map(l => ({
    user_id: userId,
    lesson_id: l.lessonId,
    track_id: l.trackId,
    stream: l.stream,
    status: 'available' as const,
    max_score: 100,
  }))

  if (rows.length > 0) {
    await supabase
      .from('lesson_progress')
      .upsert(rows, { onConflict: 'user_id,lesson_id', ignoreDuplicates: true })
  }
}

// ─── Adaptive difficulty ──────────────────────────────────────────────────────

export function calculateDifficulty(recentScores: number[]): DifficultyLevel {
  if (recentScores.length === 0) return 'medium'
  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
  if (avg >= 85) return 'hard'
  if (avg >= 60) return 'medium'
  return 'easy'
}
