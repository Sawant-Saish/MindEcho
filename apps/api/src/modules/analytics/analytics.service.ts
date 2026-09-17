import { Evaluation } from '../../models/Evaluation.js'
import { Note } from '../../models/Note.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import { toPublicNoteId } from '../../shared/utils/note-id.js'
import { toPublicEvalId } from '../../shared/utils/eval-id.js'
import { serializeNote } from '../notes/notes.serializer.js'
import type {
  DashboardSummaryResponse,
  RecentExplanationResponse,
  RetentionHealthResponse,
} from './analytics.schemas.js'

function startOfTodayUtc(referenceDate = new Date()): Date {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()),
  )
}

function endOfTodayUtc(referenceDate = new Date()): Date {
  const start = startOfTodayUtc(referenceDate)
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
}

function formatTimestamp(value: Date): string {
  return value.toISOString().replace('T', ' ').slice(0, 16)
}

async function buildRecentExplanations(
  publicUserId: string,
  limit = 10,
): Promise<RecentExplanationResponse[]> {
  const userId = fromPublicUserId(publicUserId)
  const evaluations = await Evaluation.find({ userId }).sort({ createdAt: -1 }).limit(limit)
  const noteIds = evaluations.map((item) => item.noteId)
  const notes = await Note.find({ _id: { $in: noteIds } })
  const noteMap = new Map(notes.map((note) => [note._id.toString(), note]))

  return evaluations.map((evaluation) => {
    const note = noteMap.get(evaluation.noteId.toString())
    return {
      id: toPublicEvalId(evaluation._id),
      noteId: toPublicNoteId(evaluation.noteId),
      topic: note?.title ?? 'Practice Session',
      subject: note?.subject ?? 'General',
      score: evaluation.lectorScore,
      correctness: evaluation.correctness,
      clarity: evaluation.clarity,
      completeness: evaluation.completeness,
      mode: evaluation.mode as 'voice' | 'text',
      timestamp: formatTimestamp(evaluation.createdAt),
    }
  })
}

export async function getDashboardSummary(
  publicUserId: string,
  referenceDate = new Date(),
): Promise<DashboardSummaryResponse> {
  const userId = fromPublicUserId(publicUserId)
  const todayStart = startOfTodayUtc(referenceDate)
  const todayEnd = endOfTodayUtc(referenceDate)

  const [notes, evaluationsToday, recentExplanations] = await Promise.all([
    Note.find({ userId }),
    Evaluation.countDocuments({
      userId,
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),
    buildRecentExplanations(publicUserId),
  ])

  const retentionValues = notes.map((note) => note.retentionHealth)
  const retentionAverage =
    retentionValues.length > 0
      ? Math.round(retentionValues.reduce((sum, value) => sum + value, 0) / retentionValues.length)
      : 85

  const scoredEvaluations = recentExplanations.length
  const avgLectorScore =
    scoredEvaluations > 0
      ? Number(
          (
            recentExplanations.reduce((sum, item) => sum + item.score, 0) / scoredEvaluations
          ).toFixed(2),
        )
      : 9.0

  const dueTodayCount = notes.filter((note) => {
    if (!note.nextReviewDate) return false
    return note.nextReviewDate <= todayEnd
  }).length

  return {
    avgLectorScore,
    retentionAverage,
    totalSessionsToday: evaluationsToday,
    dueTodayCount,
    recentExplanations,
  }
}

export async function getDueTodayNotes(publicUserId: string, referenceDate = new Date()) {
  const userId = fromPublicUserId(publicUserId)
  const todayEnd = endOfTodayUtc(referenceDate)

  const notes = await Note.find({
    userId,
    nextReviewDate: { $lte: todayEnd },
  }).sort({ nextReviewDate: 1 })

  return notes.map(serializeNote)
}

export async function getRetentionHealth(publicUserId: string): Promise<RetentionHealthResponse> {
  const userId = fromPublicUserId(publicUserId)
  const notes = await Note.find({ userId }).sort({ retentionHealth: 1 })

  const noteItems = notes.map((note) => ({
    noteId: toPublicNoteId(note._id),
    title: note.title,
    subject: note.subject,
    retentionHealth: note.retentionHealth,
    ...(note.nextReviewDate
      ? { nextReviewDate: note.nextReviewDate.toISOString().slice(0, 10) }
      : {}),
  }))

  const average =
    noteItems.length > 0
      ? Math.round(noteItems.reduce((sum, note) => sum + note.retentionHealth, 0) / noteItems.length)
      : 85

  return {
    average,
    notes: noteItems,
  }
}
