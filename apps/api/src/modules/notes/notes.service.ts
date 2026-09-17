import { Evaluation } from '../../models/Evaluation.js'
import { Note, type NoteDocument } from '../../models/Note.js'
import { User } from '../../models/User.js'
import { applyReviewAfterEvaluation } from '../analytics/spaced-repetition.service.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { fromPublicNoteId, toPublicNoteId } from '../../shared/utils/note-id.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import type { CreateNoteBody, ListNotesQuery, UpdateNoteBody } from './notes.schemas.js'
import { serializeNote } from './notes.serializer.js'

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

async function findOwnedNote(userId: string, noteId: string): Promise<NoteDocument> {
  const note = await Note.findOne({
    _id: fromPublicNoteId(noteId),
    userId: fromPublicUserId(userId),
  })

  if (!note) {
    throw new ApiError(404, 'NOTE_NOT_FOUND', `Note with id ${noteId} not found`)
  }

  return note
}

export async function listNotes(publicUserId: string, query: ListNotesQuery) {
  const filter: Record<string, unknown> = {
    userId: fromPublicUserId(publicUserId),
  }

  if (query.subject) {
    filter.subject = query.subject
  }

  if (query.search) {
    filter.$text = { $search: query.search }
  }

  const skip = (query.page - 1) * query.limit

  const notes = await Note.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(query.limit)

  return notes.map(serializeNote)
}

export async function getNote(publicUserId: string, noteId: string) {
  const note = await findOwnedNote(publicUserId, noteId)
  return serializeNote(note)
}

export async function createNote(publicUserId: string, input: CreateNoteBody) {
  const note = await Note.create({
    userId: fromPublicUserId(publicUserId),
    title: input.title,
    subject: input.subject,
    icon: input.icon,
    content: input.content,
  })

  return serializeNote(note)
}

export async function updateNote(publicUserId: string, noteId: string, input: UpdateNoteBody) {
  await findOwnedNote(publicUserId, noteId)

  const updates: Record<string, unknown> = {}

  if (input.title !== undefined) updates.title = input.title
  if (input.subject !== undefined) updates.subject = input.subject
  if (input.icon !== undefined) updates.icon = input.icon
  if (input.content !== undefined) updates.content = input.content
  if (input.lectorScore !== undefined) updates.lectorScore = input.lectorScore
  if (input.practiceCount !== undefined) updates.practiceCount = input.practiceCount
  if (input.lastPracticed !== undefined) updates.lastPracticed = parseDateOnly(input.lastPracticed)
  if (input.retentionHealth !== undefined) updates.retentionHealth = input.retentionHealth
  if (input.nextReviewDate !== undefined) updates.nextReviewDate = parseDateOnly(input.nextReviewDate)

  const note = await Note.findOneAndUpdate(
    {
      _id: fromPublicNoteId(noteId),
      userId: fromPublicUserId(publicUserId),
    },
    { $set: updates },
    { new: true },
  )

  if (!note) {
    throw new ApiError(404, 'NOTE_NOT_FOUND', `Note with id ${noteId} not found`)
  }

  return serializeNote(note)
}

export async function recalculateNoteSchedule(publicUserId: string, noteId: string) {
  const note = await findOwnedNote(publicUserId, noteId)
  const user = await User.findById(fromPublicUserId(publicUserId))

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  const latestEvaluation = await Evaluation.findOne({
    userId: fromPublicUserId(publicUserId),
    noteId: note._id,
  }).sort({ createdAt: -1 })

  if (!latestEvaluation) {
    throw new ApiError(
      400,
      'NO_EVALUATION',
      'At least one evaluation is required before recalculating review schedule',
    )
  }

  const reviewUpdate = applyReviewAfterEvaluation(
    {
      easinessFactor: note.easinessFactor,
      interval: note.interval,
      repetition: note.repetition,
    },
    {
      lectorScore: latestEvaluation.lectorScore,
      correctness: latestEvaluation.correctness,
      clarity: latestEvaluation.clarity,
      completeness: latestEvaluation.completeness,
    },
    {
      studyMode: user.calendarSettings?.studyMode ?? 'exam',
      examTargetDate: user.calendarSettings?.examTargetDate,
    },
  )

  const updated = await Note.findByIdAndUpdate(
    note._id,
    {
      $set: {
        retentionHealth: reviewUpdate.retentionHealth,
        nextReviewDate: reviewUpdate.nextReviewDate,
        easinessFactor: reviewUpdate.easinessFactor,
        interval: reviewUpdate.interval,
        repetition: reviewUpdate.repetition,
      },
    },
    { new: true },
  )

  if (!updated) {
    throw new ApiError(404, 'NOTE_NOT_FOUND', `Note with id ${noteId} not found`)
  }

  return serializeNote(updated)
}

export async function deleteNote(publicUserId: string, noteId: string) {
  const result = await Note.deleteOne({
    _id: fromPublicNoteId(noteId),
    userId: fromPublicUserId(publicUserId),
  })

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'NOTE_NOT_FOUND', `Note with id ${noteId} not found`)
  }

  return {
    success: true,
    deletedId: toPublicNoteId(fromPublicNoteId(noteId)),
  }
}
