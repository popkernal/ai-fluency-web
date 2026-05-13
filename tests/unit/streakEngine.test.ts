import { describe, it, expect } from 'vitest'
import { updateStreak, checkStreak } from '@/lib/streakEngine'
import type { StreakState } from '@/lib/streakEngine'

const baseState: StreakState = {
  currentStreak: 3,
  longestStreak: 5,
  lastActivityDate: '2025-01-10',
  freezesAvailable: 1,
}

describe('streakEngine', () => {
  it('no change if already active today', () => {
    const result = updateStreak(baseState, '2025-01-10')
    expect(result.currentStreak).toBe(3)
  })

  it('increments streak on consecutive day', () => {
    const result = updateStreak(baseState, '2025-01-11')
    expect(result.currentStreak).toBe(4)
    expect(result.lastActivityDate).toBe('2025-01-11')
  })

  it('uses freeze if one day missed', () => {
    const result = updateStreak(baseState, '2025-01-12')
    expect(result.currentStreak).toBe(4)
    expect(result.freezesAvailable).toBe(0)
  })

  it('resets streak if two days missed and no freeze', () => {
    const state = { ...baseState, freezesAvailable: 0 }
    const result = updateStreak(state, '2025-01-12')
    expect(result.currentStreak).toBe(1)
  })

  it('updates longest streak', () => {
    const state = { ...baseState, currentStreak: 5, longestStreak: 5 }
    const result = updateStreak(state, '2025-01-11')
    expect(result.longestStreak).toBe(6)
  })
})

describe('checkStreak', () => {
  it('returns not broken with null input', () => {
    const result = checkStreak(null)
    expect(result.broken).toBe(false)
    expect(result.currentStreak).toBe(0)
  })

  it('returns not broken if last lesson was today', () => {
    const today = new Date().toISOString().slice(0, 10)
    const result = checkStreak(today)
    expect(result.broken).toBe(false)
  })

  it('returns not broken if last lesson was yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const result = checkStreak(yesterday)
    expect(result.broken).toBe(false)
  })

  it('returns broken if last lesson was 2+ days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)
    const result = checkStreak(twoDaysAgo)
    expect(result.broken).toBe(true)
  })
})
