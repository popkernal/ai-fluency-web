import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Track, Lesson } from '@/types'

// ─── Mock Supabase + lesson engine ────────────────────────────────────────────
//
// progressEngine calls supabase-server and lessonEngine.
// We mock both so we can test the business logic in isolation.

const mockPromptingTrack: Track = {
  id: 'prompting',
  streamId: 'foundations',
  title: 'Prompt Engineering',
  description: 'Learn to write better prompts.',
  color: '#0EA5E9',
  lessonIds: ['prompting-001', 'prompting-002', 'prompting-003'],
  requiredTrackIds: [],
}

const makeMockLesson = (id: string): Lesson => ({
  id,
  trackId: 'prompting',
  streamId: 'foundations',
  title: `Lesson ${id}`,
  estimatedMinutes: 5,
  xpReward: 40,
  sections: [{ type: 'explanation', content: 'content' }],
})

vi.mock('@/lib/supabase-server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/lessonEngine', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/lessonEngine')>()
  return {
    ...actual,
    getTrack: vi.fn(async (id: string) => id === 'prompting' ? mockPromptingTrack : null),
    getLessonsForTrack: vi.fn(async () => mockPromptingTrack.lessonIds.map(makeMockLesson)),
    isTrackUnlocked: vi.fn(async () => true),
    isTrackCompleted: vi.fn(async () => false),
    getAllStreams: actual.getAllStreams,
  }
})

// ─── XP + level logic ─────────────────────────────────────────────────────────
// Test the engines that progressEngine depends on to make sure the
// XP-level pipeline is exercised.

describe('progressEngine — XP and level pipeline', () => {
  it('calculateLevel returns correct level for known thresholds', async () => {
    const { calculateLevel } = await import('@/lib/xpEngine')
    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(99)).toBe(1)
    expect(calculateLevel(100)).toBe(2)
    expect(calculateLevel(249)).toBe(2)
    expect(calculateLevel(250)).toBe(3)
  })

  it('calculateLessonXP applies streak multiplier correctly', async () => {
    const { calculateLessonXP } = await import('@/lib/xpEngine')
    // No streak multiplier
    expect(calculateLessonXP(40, 100, 1)).toBe(48) // 40 * 1.2 * 1
    expect(calculateLessonXP(40, 70, 1)).toBe(40)  // 40 * 1.0 * 1
    expect(calculateLessonXP(40, 50, 1)).toBe(28)  // 40 * 0.7 * 1
    // With streak multiplier 1.1
    expect(calculateLessonXP(40, 100, 1.1)).toBe(53) // 40 * 1.2 * 1.1 = 52.8 → 53
  })
})

// ─── Streak logic ─────────────────────────────────────────────────────────────

describe('progressEngine — streak logic', () => {
  it('increments streak on consecutive day', async () => {
    const { updateStreak } = await import('@/lib/streakEngine')
    const state = { currentStreak: 3, longestStreak: 5, lastActivityDate: '2024-01-01', freezesAvailable: 1 }
    const updated = updateStreak(state, '2024-01-02')
    expect(updated.currentStreak).toBe(4)
    expect(updated.lastActivityDate).toBe('2024-01-02')
  })

  it('does not change streak when already active today', async () => {
    const { updateStreak } = await import('@/lib/streakEngine')
    const state = { currentStreak: 3, longestStreak: 5, lastActivityDate: '2024-01-01', freezesAvailable: 1 }
    const updated = updateStreak(state, '2024-01-01')
    expect(updated.currentStreak).toBe(3)
  })

  it('resets streak to 1 after gap with no freeze available', async () => {
    const { updateStreak } = await import('@/lib/streakEngine')
    const state = { currentStreak: 10, longestStreak: 10, lastActivityDate: '2024-01-01', freezesAvailable: 0 }
    const updated = updateStreak(state, '2024-01-05')
    expect(updated.currentStreak).toBe(1)
  })

  it('uses a freeze for a 1-day gap', async () => {
    const { updateStreak } = await import('@/lib/streakEngine')
    const state = { currentStreak: 5, longestStreak: 5, lastActivityDate: '2024-01-01', freezesAvailable: 1 }
    const updated = updateStreak(state, '2024-01-03') // 2 days later
    expect(updated.currentStreak).toBe(6)
    expect(updated.freezesAvailable).toBe(0)
  })

  it('updates longest streak when current exceeds it', async () => {
    const { updateStreak } = await import('@/lib/streakEngine')
    const state = { currentStreak: 5, longestStreak: 5, lastActivityDate: '2024-01-01', freezesAvailable: 0 }
    const updated = updateStreak(state, '2024-01-02')
    expect(updated.longestStreak).toBe(6)
  })
})

// ─── Achievement logic ────────────────────────────────────────────────────────

describe('progressEngine — achievement logic', () => {
  it('awards first-lesson achievement on first completion', async () => {
    const { checkNewAchievements } = await import('@/lib/achievementEngine')
    const ctx = { totalLessonsCompleted: 1, currentStreak: 1, totalXP: 40, level: 1, tracksCompleted: 0, playgroundUses: 0 }
    const result = checkNewAchievements(ctx, new Set())
    expect(result.map(a => a.id)).toContain('first-lesson')
  })

  it('does not re-award an already-earned achievement', async () => {
    const { checkNewAchievements } = await import('@/lib/achievementEngine')
    const ctx = { totalLessonsCompleted: 1, currentStreak: 1, totalXP: 40, level: 1, tracksCompleted: 0, playgroundUses: 0 }
    const result = checkNewAchievements(ctx, new Set(['first-lesson']))
    expect(result.map(a => a.id)).not.toContain('first-lesson')
  })

  it('awards streak-7 achievement at 7-day streak', async () => {
    const { checkNewAchievements } = await import('@/lib/achievementEngine')
    const ctx = { totalLessonsCompleted: 10, currentStreak: 7, totalXP: 400, level: 3, tracksCompleted: 0, playgroundUses: 0 }
    const result = checkNewAchievements(ctx, new Set())
    expect(result.map(a => a.id)).toContain('streak-7')
  })

  it('awards first-track achievement when 1 track completed', async () => {
    const { checkNewAchievements } = await import('@/lib/achievementEngine')
    const ctx = { totalLessonsCompleted: 8, currentStreak: 3, totalXP: 320, level: 2, tracksCompleted: 1, playgroundUses: 0 }
    const result = checkNewAchievements(ctx, new Set())
    expect(result.map(a => a.id)).toContain('first-track')
  })

  it('does not award level-5 before reaching level 5', async () => {
    const { checkNewAchievements } = await import('@/lib/achievementEngine')
    const ctx = { totalLessonsCompleted: 5, currentStreak: 2, totalXP: 200, level: 2, tracksCompleted: 0, playgroundUses: 0 }
    const result = checkNewAchievements(ctx, new Set())
    expect(result.map(a => a.id)).not.toContain('level-5')
  })
})

// Validators tests moved to tests/unit/validators.test.ts
