import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mock fetch globally ───────────────────────────────────────────────────────

function makeResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── gradeExercise ────────────────────────────────────────────────────────────

describe('gradeExercise', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('returns GradeResult on a successful 200 response', async () => {
    const mockResult = { isCorrect: true, score: 85, feedback: 'Great work!', suggestions: [] }
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(mockResult, 200))

    const { gradeExercise } = await import('@/lib/grader')
    const result = await gradeExercise(
      'prompt_write',
      'Write a concise email asking for a status update.',
      { rubric: ['be polite', 'be specific'] },
      'prompting-001',
      0
    )

    expect(result.isCorrect).toBe(true)
    expect(result.score).toBe(85)
    expect(result.feedback).toBe('Great work!')
  })

  it('includes exerciseIndex in the request body when provided', async () => {
    const mockResult = { isCorrect: false, score: 55, feedback: 'Good attempt.' }
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(mockResult, 200))

    const { gradeExercise } = await import('@/lib/grader')
    await gradeExercise('prompt_write', 'some prompt', {}, 'prompting-001', 2)

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.exerciseIndex).toBe(2)
    expect(body.lessonId).toBe('prompting-001')
    expect(body.exerciseType).toBe('prompt_write')
  })

  it('omits exerciseIndex when not provided', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ isCorrect: true, score: 90, feedback: 'Excellent.' }, 200))

    const { gradeExercise } = await import('@/lib/grader')
    await gradeExercise('rewrite', 'improved prompt', { original: 'bad prompt' }, 'prompting-001')

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.exerciseIndex).toBeUndefined()
  })

  it('throws with the server error message on 429 rate limit', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ error: 'Daily grading limit reached' }, 429))

    const { gradeExercise } = await import('@/lib/grader')
    await expect(
      gradeExercise('prompt_write', 'test prompt', {}, 'prompting-001')
    ).rejects.toThrow('Daily grading limit reached')
  })

  it('throws with the server error message on 401 unauthorized', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ error: 'Unauthorized' }, 401))

    const { gradeExercise } = await import('@/lib/grader')
    await expect(
      gradeExercise('prompt_write', 'test prompt', {}, 'prompting-001')
    ).rejects.toThrow('Unauthorized')
  })

  it('throws with the server error message on 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ error: 'Grading failed' }, 500))

    const { gradeExercise } = await import('@/lib/grader')
    await expect(
      gradeExercise('rewrite', 'improved prompt', {}, 'prompting-002')
    ).rejects.toThrow('Grading failed')
  })

  it('throws a fallback message when server returns non-JSON error body', async () => {
    // Server returns a non-JSON body with error status
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response('Internal Server Error', { status: 500 })
    )

    const { gradeExercise } = await import('@/lib/grader')
    await expect(
      gradeExercise('prompt_write', 'test', {}, 'prompting-001')
    ).rejects.toThrow('Grading failed')
  })

  it('posts to /api/grade with correct Content-Type', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse({ isCorrect: true, score: 80, feedback: 'Good.' }, 200))

    const { gradeExercise } = await import('@/lib/grader')
    await gradeExercise('context_builder', 'my context prompt', { rubric: ['add context'] }, 'context-001')

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(url).toBe('/api/grade')
    expect((init as RequestInit).method).toBe('POST')
    expect((init as RequestInit).headers).toMatchObject({ 'Content-Type': 'application/json' })
  })
})
