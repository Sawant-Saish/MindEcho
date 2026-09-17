import { api } from './client'

export interface FeynmanEvaluationResponse {
  evaluationId: string
  noteId: string
  lectorScore: number
  correctness: number
  clarity: number
  completeness: number
  transcript?: string
  feedback: {
    strengths: string[]
    missingConcepts: string[]
    improvementTip: string
  }
  updatedNoteState: {
    practiceCount: number
    lastPracticed: string
    retentionHealth: number
    nextReviewDate: string
  }
}

export interface EvaluationDetail {
  id: string
  noteId: string
  mode: 'voice' | 'text'
  lectorScore: number
  correctness: number
  clarity: number
  completeness: number
  transcript?: string
  feedback: FeynmanEvaluationResponse['feedback']
  createdAt: string
}

export async function submitTextEvaluation(input: {
  noteId: string
  explanationText: string
  selfRating?: number
}): Promise<FeynmanEvaluationResponse> {
  return api<FeynmanEvaluationResponse>('/evaluations/feynman', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function submitVoiceEvaluation(input: {
  noteId: string
  audioBlob: Blob
  selfRating?: number
}): Promise<FeynmanEvaluationResponse> {
  const token = localStorage.getItem('memoroute_token')
  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

  const formData = new FormData()
  formData.append('noteId', input.noteId)
  formData.append('audioFile', input.audioBlob, 'explanation.webm')
  if (input.selfRating != null) {
    formData.append('selfRating', String(input.selfRating))
  }

  const response = await fetch(`${API_BASE}/evaluations/feynman`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data?.error?.message === 'string' ? data.error.message : 'Evaluation failed'
    throw new Error(message)
  }

  return data as FeynmanEvaluationResponse
}

export async function listEvaluations(): Promise<EvaluationDetail[]> {
  return api<EvaluationDetail[]>('/evaluations')
}
