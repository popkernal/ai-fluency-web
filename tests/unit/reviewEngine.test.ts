import { describe, it, expect } from 'vitest'
import { sm2Update } from '@/lib/reviewEngine'
import type { SM2Card } from '@/lib/reviewEngine'

const baseCard: SM2Card = {
  id: 'test-card',
  easeFactor: 2.5,
  interval: 1,
  repetitions: 0,
  dueAt: '2025-01-10',
}

describe('sm2Update', () => {
  it('resets interval to 1 and repetitions to 0 on fail (quality < 3)', () => {
    const updated = sm2Update({ ...baseCard, repetitions: 3, interval: 10 }, 1, '2025-01-10')
    expect(updated.repetitions).toBe(0)
    expect(updated.interval).toBe(1)
  })

  it('sets interval to 1 on first pass (repetitions === 0)', () => {
    const updated = sm2Update({ ...baseCard, repetitions: 0 }, 3, '2025-01-10')
    expect(updated.interval).toBe(1)
    expect(updated.repetitions).toBe(1)
  })

  it('sets interval to 6 on second pass (repetitions === 1)', () => {
    const updated = sm2Update({ ...baseCard, repetitions: 1, interval: 1 }, 4, '2025-01-10')
    expect(updated.interval).toBe(6)
    expect(updated.repetitions).toBe(2)
  })

  it('uses interval * easeFactor on third pass (repetitions >= 2)', () => {
    const card: SM2Card = { ...baseCard, repetitions: 2, interval: 6 }
    const updated = sm2Update(card, 5, '2025-01-10')
    expect(updated.interval).toBe(Math.round(6 * 2.5))
    expect(updated.repetitions).toBe(3)
  })

  it('decreases easeFactor on low quality recall', () => {
    const updated = sm2Update(baseCard, 3, '2025-01-10')
    expect(updated.easeFactor).toBeLessThan(2.5)
  })

  it('clamps easeFactor to minimum of 1.3', () => {
    const card: SM2Card = { ...baseCard, easeFactor: 1.3 }
    const updated = sm2Update(card, 0, '2025-01-10')
    expect(updated.easeFactor).toBeGreaterThanOrEqual(1.3)
  })
})
