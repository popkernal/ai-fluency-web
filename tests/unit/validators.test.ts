import { describe, it, expect } from 'vitest'
import {
  LessonCompleteRequestSchema,
  GradeRequestSchema,
  LessonSchema,
  TrackSchema,
} from '@/lib/validators'

describe('validators', () => {
  it('LessonCompleteRequestSchema validates a valid payload', () => {
    const result = LessonCompleteRequestSchema.safeParse({
      lessonId: 'prompting-001',
      score: 85,
      durationSeconds: 300,
    })
    expect(result.success).toBe(true)
  })

  it('LessonCompleteRequestSchema rejects out-of-range score', () => {
    const result = LessonCompleteRequestSchema.safeParse({
      lessonId: 'prompting-001',
      score: 150,
      durationSeconds: 300,
    })
    expect(result.success).toBe(false)
  })

  it('GradeRequestSchema validates a valid grade request', () => {
    const result = GradeRequestSchema.safeParse({
      lessonId: 'prompting-001',
      exerciseType: 'prompt_write',
      userResponse: 'Write a poem about space.',
      exerciseData: { rubric: ['be creative'] },
    })
    expect(result.success).toBe(true)
  })

  it('GradeRequestSchema validates a request with exerciseIndex', () => {
    const result = GradeRequestSchema.safeParse({
      lessonId: 'prompting-001',
      exerciseIndex: 2,
      exerciseType: 'rewrite',
      userResponse: 'Improved version of the prompt.',
      exerciseData: { original: 'bad prompt', rubric: ['be specific'] },
    })
    expect(result.success).toBe(true)
  })

  it('GradeRequestSchema rejects negative exerciseIndex', () => {
    const result = GradeRequestSchema.safeParse({
      lessonId: 'prompting-001',
      exerciseIndex: -1,
      exerciseType: 'prompt_write',
      userResponse: 'some response',
      exerciseData: {},
    })
    expect(result.success).toBe(false)
  })

  it('GradeRequestSchema rejects unknown exerciseType', () => {
    const result = GradeRequestSchema.safeParse({
      lessonId: 'prompting-001',
      exerciseType: 'unknown_type',
      userResponse: 'some response',
      exerciseData: {},
    })
    expect(result.success).toBe(false)
  })

  it('LessonSchema validates a minimal valid lesson', () => {
    const result = LessonSchema.safeParse({
      id: 'prompting-001',
      trackId: 'prompting',
      streamId: 'foundations',
      title: 'Test Lesson',
      estimatedMinutes: 5,
      xpReward: 40,
      sections: [{ type: 'explanation', content: 'Hello world' }],
    })
    expect(result.success).toBe(true)
  })

  it('TrackSchema rejects invalid hex color', () => {
    const result = TrackSchema.safeParse({
      id: 'prompting',
      streamId: 'foundations',
      title: 'Test Track',
      description: 'desc',
      color: 'blue', // not a hex color
      lessonIds: ['prompting-001'],
      requiredTrackIds: [],
    })
    expect(result.success).toBe(false)
  })
})
