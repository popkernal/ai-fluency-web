import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getAllStreams, getStreamById } from '@/lib/lessonEngine'
import type { Track, Lesson } from '@/types'

// ─── Mock content modules ─────────────────────────────────────────────────────

const mockPromptingTrack: Track = {
  id: 'prompting',
  streamId: 'foundations',
  title: 'Prompt Engineering',
  description: 'Learn to write better prompts.',
  color: '#0EA5E9',
  lessonIds: ['prompting-001', 'prompting-002', 'prompting-003'],
  requiredTrackIds: [],
}

const mockFoundationsTrack: Track = {
  id: 'foundations',
  streamId: 'foundations',
  title: 'AI Fundamentals',
  description: 'Core AI concepts.',
  color: '#6366F1',
  lessonIds: ['foundations-001', 'foundations-002'],
  requiredTrackIds: [],
}

const mockPromptingLesson001: Lesson = {
  id: 'prompting-001',
  trackId: 'prompting',
  streamId: 'foundations',
  title: 'Writing Precise Instructions',
  estimatedMinutes: 5,
  xpReward: 40,
  sections: [
    { type: 'explanation', content: 'Test content' },
  ],
}

const mockPromptingLesson002: Lesson = {
  id: 'prompting-002',
  trackId: 'prompting',
  streamId: 'foundations',
  title: 'Context Windows Explained',
  estimatedMinutes: 5,
  xpReward: 40,
  sections: [
    { type: 'explanation', content: 'Test content' },
  ],
}

vi.mock('@/content/tracks/prompting.json', () => ({ default: mockPromptingTrack }))
vi.mock('@/content/tracks/foundations.json', () => ({ default: mockFoundationsTrack }))
vi.mock('@/content/lessons/prompting-001.json', () => ({ default: mockPromptingLesson001 }))
vi.mock('@/content/lessons/prompting-002.json', () => ({ default: mockPromptingLesson002 }))

// ─── getAllStreams ─────────────────────────────────────────────────────────────

describe('getAllStreams', () => {
  it('returns all 8 streams', () => {
    const streams = getAllStreams()
    expect(streams).toHaveLength(8)
  })

  it('returns streams with correct IDs', () => {
    const ids = getAllStreams().map(s => s.id)
    expect(ids).toContain('foundations')
    expect(ids).toContain('application')
    expect(ids).toContain('advanced')
  })

  it('each stream has a non-empty trackIds array', () => {
    for (const stream of getAllStreams()) {
      expect(stream.trackIds.length).toBeGreaterThan(0)
    }
  })
})

// ─── getStreamById ────────────────────────────────────────────────────────────

describe('getStreamById', () => {
  it('returns the correct stream by ID', () => {
    const stream = getStreamById('foundations')
    expect(stream).not.toBeNull()
    expect(stream!.id).toBe('foundations')
  })

  it('returns null for unknown stream ID', () => {
    // @ts-expect-error intentional invalid id
    const stream = getStreamById('nonexistent')
    expect(stream).toBeNull()
  })
})

// ─── getTrack ─────────────────────────────────────────────────────────────────

describe('getTrack', () => {
  beforeEach(() => {
    // Clear module-level cache between tests by reimporting
    vi.resetModules()
  })

  it('loads and returns a track by ID', async () => {
    const { getTrack } = await import('@/lib/lessonEngine')
    const track = await getTrack('prompting')
    expect(track).not.toBeNull()
    expect(track!.id).toBe('prompting')
    expect(track!.lessonIds).toContain('prompting-001')
  })

  it('returns null for a track that does not exist', async () => {
    const { getTrack } = await import('@/lib/lessonEngine')
    // @ts-expect-error intentional invalid id
    const track = await getTrack('nonexistent-track')
    expect(track).toBeNull()
  })

  it('caches track on second call', async () => {
    const { getTrack } = await import('@/lib/lessonEngine')
    const first = await getTrack('foundations')
    const second = await getTrack('foundations')
    expect(first).toBe(second) // same object reference due to cache
  })
})

// ─── getLesson ────────────────────────────────────────────────────────────────

describe('getLesson', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('loads and returns a lesson by ID', async () => {
    const { getLesson } = await import('@/lib/lessonEngine')
    const lesson = await getLesson('prompting-001')
    expect(lesson).not.toBeNull()
    expect(lesson!.id).toBe('prompting-001')
    expect(lesson!.trackId).toBe('prompting')
  })

  it('returns null for a lesson that does not exist', async () => {
    const { getLesson } = await import('@/lib/lessonEngine')
    const lesson = await getLesson('nonexistent-lesson')
    expect(lesson).toBeNull()
  })
})

// ─── isTrackUnlocked ──────────────────────────────────────────────────────────

describe('isTrackUnlocked', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('unlocks a track with no requirements', async () => {
    const { isTrackUnlocked } = await import('@/lib/lessonEngine')
    const result = await isTrackUnlocked('prompting', new Set())
    expect(result).toBe(true)
  })

  it('unlocks a track when all required tracks are completed', async () => {
    // foundations track has requiredTrackIds: [] so it's always unlocked
    const { isTrackUnlocked } = await import('@/lib/lessonEngine')
    const result = await isTrackUnlocked('foundations', new Set())
    expect(result).toBe(true)
  })
})

// ─── getNextLesson ────────────────────────────────────────────────────────────

describe('getNextLesson', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns the first lesson when none are completed', async () => {
    const { getNextLesson } = await import('@/lib/lessonEngine')
    const next = await getNextLesson('prompting', new Set())
    expect(next).not.toBeNull()
    expect(next!.id).toBe('prompting-001')
  })

  it('returns the second lesson when the first is completed', async () => {
    const { getNextLesson } = await import('@/lib/lessonEngine')
    const next = await getNextLesson('prompting', new Set(['prompting-001']))
    expect(next).not.toBeNull()
    expect(next!.id).toBe('prompting-002')
  })

  it('returns null when all lessons are completed', async () => {
    const { getNextLesson } = await import('@/lib/lessonEngine')
    const completed = new Set(['prompting-001', 'prompting-002', 'prompting-003'])
    const next = await getNextLesson('prompting', completed)
    expect(next).toBeNull()
  })
})

// ─── isTrackCompleted ─────────────────────────────────────────────────────────

describe('isTrackCompleted', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns false when no lessons are completed', async () => {
    const { isTrackCompleted } = await import('@/lib/lessonEngine')
    const result = await isTrackCompleted('prompting', new Set())
    expect(result).toBe(false)
  })

  it('returns false when only some lessons are completed', async () => {
    const { isTrackCompleted } = await import('@/lib/lessonEngine')
    const result = await isTrackCompleted('prompting', new Set(['prompting-001']))
    expect(result).toBe(false)
  })

  it('returns true when all lessons in the track are completed', async () => {
    const { isTrackCompleted } = await import('@/lib/lessonEngine')
    const all = new Set(['prompting-001', 'prompting-002', 'prompting-003'])
    const result = await isTrackCompleted('prompting', all)
    expect(result).toBe(true)
  })
})

// ─── getLessonStatus ──────────────────────────────────────────────────────────

describe('getLessonStatus', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('returns completed for a completed lesson', async () => {
    const { getLessonStatus } = await import('@/lib/lessonEngine')
    const status = await getLessonStatus(
      'prompting-001',
      new Set(['prompting-001']),
      new Set()
    )
    expect(status).toBe('completed')
  })

  it('returns available for the first lesson in an unlocked track', async () => {
    const { getLessonStatus } = await import('@/lib/lessonEngine')
    const status = await getLessonStatus(
      'prompting-001',
      new Set(),
      new Set()
    )
    expect(status).toBe('available')
  })

  it('returns locked for the second lesson when first is not completed', async () => {
    const { getLessonStatus } = await import('@/lib/lessonEngine')
    const status = await getLessonStatus(
      'prompting-002',
      new Set(),
      new Set()
    )
    expect(status).toBe('locked')
  })

  it('returns available for the second lesson when first is completed', async () => {
    const { getLessonStatus } = await import('@/lib/lessonEngine')
    const status = await getLessonStatus(
      'prompting-002',
      new Set(['prompting-001']),
      new Set()
    )
    expect(status).toBe('available')
  })
})
