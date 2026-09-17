export interface NoteSpacedRepetitionState {
  easinessFactor: number
  interval: number
  repetition: number
}

export interface CalendarContext {
  studyMode: 'exam' | 'skill'
  examTargetDate?: Date | null
}

export interface EvaluationScores {
  lectorScore: number
  correctness: number
  clarity: number
  completeness: number
}

export interface ReviewUpdateResult extends NoteSpacedRepetitionState {
  retentionHealth: number
  nextReviewDate: Date
}

const MIN_EASINESS_FACTOR = 1.3

export function mapLectorScoreToQuality(lectorScore: number): number {
  return Math.min(5, Math.max(0, Math.round(lectorScore / 2)))
}

export function computeRetentionHealth(
  correctness: number,
  clarity: number,
  completeness: number,
): number {
  return Math.min(100, Math.round(correctness * 0.5 + clarity * 0.3 + completeness * 0.2))
}

export function applyExamModeCompression(
  intervalDays: number,
  calendar: CalendarContext,
  referenceDate = new Date(),
): number {
  if (calendar.studyMode !== 'exam' || !calendar.examTargetDate) {
    return intervalDays
  }

  const todayMs = Date.UTC(
    referenceDate.getUTCFullYear(),
    referenceDate.getUTCMonth(),
    referenceDate.getUTCDate(),
  )
  const examMs = calendar.examTargetDate.getTime()
  const daysLeft = Math.max(1, Math.ceil((examMs - todayMs) / (1000 * 60 * 60 * 24)))
  const compressed = Math.max(1, Math.min(2, Math.floor(daysLeft / 3)))

  return Math.min(intervalDays, compressed)
}

export function calculateNextReview(
  state: NoteSpacedRepetitionState,
  quality: number,
  calendar: CalendarContext,
  referenceDate = new Date(),
): ReviewUpdateResult {
  let easinessFactor = state.easinessFactor
  let interval = state.interval
  let repetition = state.repetition

  easinessFactor += 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  easinessFactor = Math.max(MIN_EASINESS_FACTOR, easinessFactor)

  if (quality < 3) {
    repetition = 0
    interval = 1
  } else {
    if (repetition === 0) {
      interval = 1
    } else if (repetition === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easinessFactor)
    }
    repetition += 1
  }

  interval = applyExamModeCompression(interval, calendar, referenceDate)

  const nextReviewDate = new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth(),
      referenceDate.getUTCDate() + interval,
    ),
  )

  return {
    easinessFactor,
    interval,
    repetition,
    nextReviewDate,
    retentionHealth: 0,
  }
}

export function applyReviewAfterEvaluation(
  state: NoteSpacedRepetitionState,
  scores: EvaluationScores,
  calendar: CalendarContext,
  referenceDate = new Date(),
): ReviewUpdateResult {
  const quality = mapLectorScoreToQuality(scores.lectorScore)
  const review = calculateNextReview(state, quality, calendar, referenceDate)

  return {
    ...review,
    retentionHealth: computeRetentionHealth(
      scores.correctness,
      scores.clarity,
      scores.completeness,
    ),
  }
}
