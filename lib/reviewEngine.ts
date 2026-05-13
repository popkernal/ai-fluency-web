/**
 * Spaced repetition scheduling using the SM-2 algorithm.
 * Used server-side by GET/POST /api/review.
 */
import type { Lesson, LessonSection } from '@/types'
import { createClient } from '@/lib/supabase-server'
import { getLesson } from '@/lib/lessonEngine'

export interface SM2Card {
  id: string
  easeFactor: number    // default 2.5
  interval: number      // days until next review
  repetitions: number
  dueAt: string         // ISO date string
}

/**
 * Update a card's SM-2 parameters based on quality of recall.
 * @param quality 0–5 (0-2 = fail, 3-5 = pass)
 */
export function sm2Update(card: SM2Card, quality: number, today: string): SM2Card {
  let { easeFactor, interval, repetitions } = card

  if (quality < 3) {
    // Failed — reset to start
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)

    repetitions += 1
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  const dueAt = addDays(today, interval)

  return { ...card, easeFactor, interval, repetitions, dueAt }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

// ─── DB-connected review functions ───────────────────────────────────────────

export interface ReviewItemFull {
  scheduleId: string
  lessonId: string
  exerciseIndex: number
  lesson: Lesson
  exercise: Extract<LessonSection, { type: 'exercise' }>
  strength: number      // 0–100 from DB
  timesReviewed: number
}

/**
 * Returns up to 5 exercises due for review today.
 */
export async function getReviewsDue(userId: string): Promise<ReviewItemFull[]> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: rows, error } = await supabase
    .from('review_schedule')
    .select('id, lesson_id, exercise_index, strength, times_reviewed')
    .eq('user_id', userId)
    .lte('next_review_at', today)
    .order('next_review_at', { ascending: true })
    .limit(5)

  if (error || !rows) return []

  const items: ReviewItemFull[] = []
  for (const row of rows) {
    const lesson = await getLesson(row.lesson_id as string)
    if (!lesson) continue
    const section = lesson.sections[row.exercise_index as number]
    if (!section || section.type !== 'exercise') continue
    items.push({
      scheduleId: row.id as string,
      lessonId: row.lesson_id as string,
      exerciseIndex: row.exercise_index as number,
      lesson,
      exercise: section as Extract<LessonSection, { type: 'exercise' }>,
      strength: row.strength as number,
      timesReviewed: row.times_reviewed as number,
    })
  }
  return items
}

/**
 * Updates SM-2 schedule and strength after a review submission.
 * score: 0–100 (maps to SM-2 quality 0–5)
 */
export async function updateReviewStrength(
  userId: string,
  lessonId: string,
  exerciseIndex: number,
  score: number,
): Promise<{ newStrength: number }> {
  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data: existing } = await supabase
    .from('review_schedule')
    .select('id, strength, interval_days, times_reviewed')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .eq('exercise_index', exerciseIndex)
    .single()

  const quality = Math.round((score / 100) * 5)

  // Build SM2Card — use timesReviewed as proxy for repetitions, fixed easeFactor
  const card: SM2Card = {
    id: existing?.id as string ?? `${userId}-${lessonId}-${exerciseIndex}`,
    easeFactor: 2.5,
    interval: (existing?.interval_days as number) ?? 1,
    repetitions: (existing?.times_reviewed as number) ?? 0,
    dueAt: today,
  }

  const updated = sm2Update(card, quality, today)

  // Strength delta: quality ≥ 4 → +20, quality 3 → +10, quality < 3 → -20
  const currentStrength = (existing?.strength as number) ?? 0
  const delta = quality >= 4 ? 20 : quality >= 3 ? 10 : -20
  const newStrength = Math.min(100, Math.max(0, currentStrength + delta))

  await supabase.from('review_schedule').upsert({
    user_id: userId,
    lesson_id: lessonId,
    exercise_index: exerciseIndex,
    strength: newStrength,
    next_review_at: updated.dueAt,
    last_reviewed_at: today,
    interval_days: updated.interval,
    times_reviewed: ((existing?.times_reviewed as number) ?? 0) + 1,
  }, { onConflict: 'user_id,lesson_id,exercise_index' })

  return { newStrength }
}

/**
 * Adds all exercises from a lesson to the review pool.
 * Called after lesson completion. Safe to call multiple times (upsert with ignoreDuplicates).
 */
export async function addToReviewPool(userId: string, lessonId: string): Promise<void> {
  const supabase = await createClient()
  const lesson = await getLesson(lessonId)
  if (!lesson) return

  const today = new Date().toISOString().slice(0, 10)

  const exerciseIndices = lesson.sections
    .map((section, idx) => ({ section, idx }))
    .filter(({ section }) => section.type === 'exercise')
    .map(({ idx }) => idx)

  if (exerciseIndices.length === 0) return

  const rows = exerciseIndices.map(exerciseIndex => ({
    user_id: userId,
    lesson_id: lessonId,
    exercise_index: exerciseIndex,
    strength: 0,
    next_review_at: today,
    interval_days: 1,
    times_reviewed: 0,
  }))

  await supabase
    .from('review_schedule')
    .upsert(rows, { onConflict: 'user_id,lesson_id,exercise_index', ignoreDuplicates: true })
}
