import { Note } from '../../models/Note.js'

function startOfTodayUtc(referenceDate = new Date()): Date {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()),
  )
}

export interface RetentionDecayResult {
  notesUpdated: number
}

export async function runRetentionDecayJob(referenceDate = new Date()): Promise<RetentionDecayResult> {
  const todayStart = startOfTodayUtc(referenceDate)
  const overdueNotes = await Note.find({
    nextReviewDate: { $lt: todayStart },
    retentionHealth: { $gt: 0 },
  })

  let notesUpdated = 0

  for (const note of overdueNotes) {
    if (!note.nextReviewDate) continue

    const overdueMs = todayStart.getTime() - note.nextReviewDate.getTime()
    const daysOverdue = Math.max(1, Math.ceil(overdueMs / (1000 * 60 * 60 * 24)))
    const nextHealth = Math.max(0, note.retentionHealth - daysOverdue * 5)

    if (nextHealth !== note.retentionHealth) {
      note.retentionHealth = nextHealth
      await note.save()
      notesUpdated += 1
    }
  }

  return { notesUpdated }
}
