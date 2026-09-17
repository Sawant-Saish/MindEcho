import { z } from 'zod'

export const feynmanJsonBodySchema = z.object({
  noteId: z.string().min(1),
  explanationText: z.string().min(1, 'Explanation text is required for text mode'),
  selfRating: z.number().min(1).max(10).optional(),
})

export type FeynmanJsonBody = z.infer<typeof feynmanJsonBodySchema>

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

export interface EvaluationDetailResponse {
  id: string
  noteId: string
  mode: 'voice' | 'text'
  transcript?: string
  selfRating?: number
  lectorScore: number
  correctness: number
  clarity: number
  completeness: number
  feedback: {
    strengths: string[]
    missingConcepts: string[]
    improvementTip: string
  }
  audioUrl?: string
  createdAt: string
}
