import { describe, it, expect } from 'vitest'
import { calculateLevel, xpToNextLevel, calculateLessonXP, getLevelForXP, getXPToNextLevel, calculateXP } from '@/lib/xpEngine'

describe('xpEngine', () => {
  it('returns level 1 at 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('returns level 2 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })

  it('returns level 3 at 250 XP', () => {
    expect(calculateLevel(250)).toBe(3)
  })

  it('calculates XP to next level', () => {
    expect(xpToNextLevel(0)).toBe(100)
    expect(xpToNextLevel(100)).toBe(150)
  })

  it('applies score multiplier to lesson XP', () => {
    const base = 100
    expect(calculateLessonXP(base, 95)).toBe(120) // 1.2x
    expect(calculateLessonXP(base, 75)).toBe(100) // 1.0x
    expect(calculateLessonXP(base, 50)).toBe(70)  // 0.7x
  })
})

describe('calculateXP', () => {
  it('returns flat XP for reviews with no bonuses', () => {
    const { total, breakdown } = calculateXP(50, 80, 100, false, 5, true)
    expect(total).toBe(50)
    expect(breakdown.scoreBonus).toBe(0)
    expect(breakdown.streakBonus).toBe(0)
    expect(breakdown.firstAttemptBonus).toBe(0)
  })

  it('applies 1.2x score multiplier for score >= 90%', () => {
    const { total } = calculateXP(100, 95, 100, false, 0, false)
    expect(total).toBe(120) // 100 * 1.2
  })

  it('applies 1.0x score multiplier for score 70–89%', () => {
    const { total } = calculateXP(100, 75, 100, false, 0, false)
    expect(total).toBe(100)
  })

  it('applies 0.7x score multiplier for score < 70%', () => {
    const { total } = calculateXP(100, 50, 100, false, 0, false)
    expect(total).toBe(70)
  })

  it('applies 1.25x streak multiplier for streak >= 7', () => {
    const { total } = calculateXP(100, 100, 100, false, 7, false)
    expect(total).toBe(Math.round(100 * 1.2 * 1.25)) // 150
  })

  it('applies 1.1x streak multiplier for streak 3–6', () => {
    const { total } = calculateXP(100, 100, 100, false, 4, false)
    expect(total).toBe(Math.round(100 * 1.2 * 1.1)) // 132
  })

  it('applies 1.1x first-attempt bonus', () => {
    const { total } = calculateXP(100, 75, 100, true, 0, false)
    expect(total).toBe(Math.round(100 * 1.0 * 1.0 * 1.1)) // 110
  })

  it('breakdown totals match total field', () => {
    const { total, breakdown } = calculateXP(100, 90, 100, true, 5, false)
    expect(breakdown.total).toBe(total)
  })
})

describe('getLevelForXP', () => {
  it('is an alias for calculateLevel', () => {
    expect(getLevelForXP(0)).toBe(calculateLevel(0))
    expect(getLevelForXP(100)).toBe(calculateLevel(100))
    expect(getLevelForXP(500)).toBe(calculateLevel(500))
  })
})

describe('getXPToNextLevel', () => {
  it('returns correct values at 0 XP (level 1)', () => {
    const result = getXPToNextLevel(0)
    expect(result.current).toBe(0)
    expect(result.needed).toBe(100)
    expect(result.percentage).toBe(0)
  })

  it('returns correct values at 150 XP (level 2, halfway to level 3)', () => {
    // Level 2 starts at 100, level 3 starts at 250 (span=150). 150-100=50 current.
    const result = getXPToNextLevel(150)
    expect(result.current).toBe(50)
    expect(result.needed).toBe(150)
    expect(result.percentage).toBe(33)
  })

  it('returns correct values at 550 XP (mid level 4)', () => {
    // Level 4 starts at 500, level 5 starts at 900 (span=400). 550-500=50 current.
    const level = getLevelForXP(550)
    const result = getXPToNextLevel(550)
    expect(level).toBe(4)
    expect(result.current).toBe(50)
    expect(result.needed).toBe(400)
    expect(result.percentage).toBe(13) // Math.round(50/400*100) = 13
  })
})
