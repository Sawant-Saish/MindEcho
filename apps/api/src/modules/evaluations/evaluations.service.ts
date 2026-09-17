import { Evaluation, type EvaluationDocument } from '../../models/Evaluation.js'
import { Note, type NoteDocument } from '../../models/Note.js'
import { User } from '../../models/User.js'
import { createLLMProvider, createSTTProvider } from '../../shared/ports/index.js'
import { saveAudioFile } from '../../shared/storage/local-audio-storage.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { fromPublicEvalId, toPublicEvalId } from '../../shared/utils/eval-id.js'
import { fromPublicNoteId, toPublicNoteId } from '../../shared/utils/note-id.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import type { FeynmanEvaluationResponse } from './evaluations.schemas.js'
import { serializeEvaluationDetail } from './evaluations.serializer.js'

export interface SubmitFeynmanInput {
  noteId: string
  explanationText?: string
  audioBuffer?: Buffer
  audioMimeType?: string
  selfRating?: number
  mode: 'voice' | 'text'
}

function formatDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function computeRetentionHealth(correctness: number, clarity: number, completeness: number): number {
  return Math.min(100, Math.round(correctness * 0.5 + clarity * 0.3 + completeness * 0.2))
}

function computeNextReviewDays(
  studyMode: 'exam' | 'skill',
  examTargetDate?: Date | null,
): number {
  let daysAdd = 3

  if (studyMode === 'exam' && examTargetDate) {
    const todayMs = Date.now()
    const examMs = examTargetDate.getTime()
    const daysLeft = Math.max(1, Math.ceil((examMs - todayMs) / (1000 * 60 * 60 * 24)))
    daysAdd = Math.max(1, Math.min(2, Math.floor(daysLeft / 3)))
  }

  return daysAdd
}

async function findOwnedNote(publicUserId: string, noteId: string): Promise<NoteDocument> {
  const note = await Note.findOne({
    _id: fromPublicNoteId(noteId),
    userId: fromPublicUserId(publicUserId),
  })

  if (!note) {
    throw new ApiError(404, 'NOTE_NOT_FOUND', `Note with id ${noteId} not found`)
  }

  return note
}

async function findOwnedEvaluation(
  publicUserId: string,
  evaluationId: string,
): Promise<EvaluationDocument> {
  const item = await Evaluation.findOne({
    _id: fromPublicEvalId(evaluationId),
    userId: fromPublicUserId(publicUserId),
  })

  if (!item) {
    throw new ApiError(404, 'EVALUATION_NOT_FOUND', `Evaluation with id ${evaluationId} not found`)
  }

  return item
}

export async function submitFeynmanEvaluation(
  publicUserId: string,
  input: SubmitFeynmanInput,
): Promise<FeynmanEvaluationResponse> {
  const note = await findOwnedNote(publicUserId, input.noteId)
  const user = await User.findById(fromPublicUserId(publicUserId))

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  let transcript = input.explanationText?.trim()
  let audioUrl: string | undefined

  if (input.mode === 'voice') {
    if (!input.audioBuffer || input.audioBuffer.length === 0) {
      throw new ApiError(400, 'AUDIO_REQUIRED', 'Audio file is required for voice evaluations')
    }

    const stt = createSTTProvider()
    transcript = await stt.transcribe(input.audioBuffer, input.audioMimeType ?? 'audio/webm')
  }

  if (!transcript) {
    throw new ApiError(400, 'EXPLANATION_REQUIRED', 'An explanation transcript or text is required')
  }

  const llm = createLLMProvider()
  const result = await llm.evaluateFeynman({
    sourceContent: note.content,
    userExplanation: transcript,
    topic: note.title,
  })

  const evaluation = await Evaluation.create({
    userId: fromPublicUserId(publicUserId),
    noteId: note._id,
    mode: input.mode,
    transcript,
    selfRating: input.selfRating,
    lectorScore: result.lectorScore,
    correctness: result.correctness,
    clarity: result.clarity,
    completeness: result.completeness,
    feedback: result.feedback,
  })

  if (input.mode === 'voice' && input.audioBuffer) {
    const extension = input.audioMimeType?.includes('wav') ? 'wav' : 'webm'
    audioUrl = await saveAudioFile(publicUserId, toPublicEvalId(evaluation._id), input.audioBuffer, extension)
    await Evaluation.findByIdAndUpdate(evaluation._id, { $set: { audioUrl } })
  }

  const todayStr = formatDateOnly(new Date())
  const daysAdd = computeNextReviewDays(
    user.calendarSettings?.studyMode ?? 'exam',
    user.calendarSettings?.examTargetDate,
  )
  const nextReview = new Date()
  nextReview.setUTCDate(nextReview.getUTCDate() + daysAdd)

  const retentionHealth = computeRetentionHealth(
    result.correctness,
    result.clarity,
    result.completeness,
  )

  await Note.findByIdAndUpdate(note._id, {
    $set: {
      lectorScore: result.lectorScore,
      practiceCount: note.practiceCount + 1,
      lastPracticed: new Date(`${todayStr}T00:00:00.000Z`),
      retentionHealth,
      nextReviewDate: nextReview,
    },
  })

  return {
    evaluationId: toPublicEvalId(evaluation._id),
    noteId: toPublicNoteId(note._id),
    lectorScore: result.lectorScore,
    correctness: result.correctness,
    clarity: result.clarity,
    completeness: result.completeness,
    transcript,
    feedback: result.feedback,
    updatedNoteState: {
      practiceCount: note.practiceCount + 1,
      lastPracticed: todayStr,
      retentionHealth,
      nextReviewDate: formatDateOnly(nextReview),
    },
  }
}

export async function listEvaluations(publicUserId: string) {
  const evaluations = await Evaluation.find({ userId: fromPublicUserId(publicUserId) })
    .sort({ createdAt: -1 })
    .limit(50)

  return evaluations.map(serializeEvaluationDetail)
}

export async function getEvaluation(publicUserId: string, evaluationId: string) {
  const evaluation = await findOwnedEvaluation(publicUserId, evaluationId)
  return serializeEvaluationDetail(evaluation)
}
