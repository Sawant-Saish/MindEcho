import { describe, expect, it } from 'vitest'
import {
  applyExamModeCompression,
  applyReviewAfterEvaluation,
  calculateNextReview,
  mapLectorScoreToQuality,
} from '../src/modules/analytics/spaced-repetition.service.js'

describe('SpacedRepetitionService (Phase 5)', () => {
  it('maps lector score to SM-2 quality scale', () => {
    expect(mapLectorScoreToQuality(10)).toBe(5)
    expect(mapLectorScoreToQuality(7.2)).toBe(4)
    expect(mapLectorScoreToQuality(2)).toBe(1)
  })

  it('resets repetition when quality is below 3', () => {
    const result = calculateNextReview(
      { easinessFactor: 2.5, interval: 10, repetition: 4 },
      2,
      { studyMode: 'skill' },
      new Date('2026-09-18T00:00:00.000Z'),
    )

    expect(result.repetition).toBe(0)
    expect(result.interval).toBe(1)
    expect(result.nextReviewDate.toISOString().slice(0, 10)).toBe('2026-09-19')
  })

  it('enforces easiness factor floor at 1.3', () => {
    const result = calculateNextReview(
      { easinessFactor: 1.3, interval: 6, repetition: 2 },
      0,
      { studyMode: 'skill' },
      new Date('2026-09-18T00:00:00.000Z'),
    )

    expect(result.easinessFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('compresses intervals in exam mode', () => {
    const compressed = applyExamModeCompression(
      8,
      {
        studyMode: 'exam',
        examTargetDate: new Date('2026-09-25T00:00:00.000Z'),
      },
      new Date('2026-09-18T00:00:00.000Z'),
    )

    expect(compressed).toBeLessThanOrEqual(2)
  })

  it('computes retention health from evaluation scores', () => {
    const result = applyReviewAfterEvaluation(
      { easinessFactor: 2.5, interval: 0, repetition: 0 },
      {
        lectorScore: 8.8,
        correctness: 92,
        clarity: 90,
        completeness: 88,
      },
      { studyMode: 'skill' },
      new Date('2026-09-18T00:00:00.000Z'),
    )

    expect(result.retentionHealth).toBe(91)
    expect(result.repetition).toBe(1)
  })
})
