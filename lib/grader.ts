/**
 * Exercise grading via Claude Haiku.
 * Client-side wrapper that POSTs to /api/grade.
 */

export interface GradeResult {
  isCorrect: boolean
  score: number          // 0–100
  feedback: string       // encouraging but specific
  suggestions?: string[]
  gradingLatencyMs?: number
}

export async function gradeExercise(
  exerciseType: string,
  userResponse: string,
  exerciseData: Record<string, unknown>,
  lessonId: string,
  exerciseIndex?: number
): Promise<GradeResult> {
  const res = await fetch('/api/grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lessonId, exerciseIndex, exerciseType, userResponse, exerciseData }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error ?? 'Grading failed')
  }
  return res.json() as Promise<GradeResult>
}
