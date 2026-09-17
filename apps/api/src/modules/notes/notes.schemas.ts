import { z } from 'zod'

export const createNoteBodySchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  subject: z.string().trim().min(1, 'Subject is required').max(120),
  icon: z.string().trim().min(1).max(40).default('file-text'),
  content: z.string().min(1, 'Content is required'),
})

export const updateNoteBodySchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    subject: z.string().trim().min(1).max(120),
    icon: z.string().trim().min(1).max(40),
    content: z.string().min(1),
    lectorScore: z.number().min(0).max(10),
    practiceCount: z.number().int().min(0),
    lastPracticed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    retentionHealth: z.number().int().min(0).max(100),
    nextReviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export const listNotesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  subject: z.string().trim().optional(),
  search: z.string().trim().optional(),
})

export type CreateNoteBody = z.infer<typeof createNoteBodySchema>
export type UpdateNoteBody = z.infer<typeof updateNoteBodySchema>
export type ListNotesQuery = z.infer<typeof listNotesQuerySchema>

export interface NoteResponse {
  id: string
  title: string
  subject: string
  icon: string
  content: string
  createdAt: string
  updatedAt: string
  lectorScore?: number
  practiceCount: number
  lastPracticed?: string
  retentionHealth: number
  nextReviewDate?: string
}
