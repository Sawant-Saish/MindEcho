import { z } from 'zod'

const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')

export const updateSettingsBodySchema = z.object({
  studyMode: z.enum(['exam', 'skill']),
  examTargetDate: dateStringSchema.optional(),
  examTitle: z.string().trim().max(200).optional(),
})

export const createImportantDateBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  date: dateStringSchema,
  subject: z.string().trim().min(1).max(120),
  priority: z.enum(['high', 'medium', 'low']).default('medium'),
  description: z.string().trim().max(500).optional(),
})

export const updateImportantDateBodySchema = createImportantDateBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided' },
)

export const listImportantDatesQuerySchema = z.object({
  from: dateStringSchema.optional(),
  to: dateStringSchema.optional(),
})

export type UpdateSettingsBody = z.infer<typeof updateSettingsBodySchema>
export type CreateImportantDateBody = z.infer<typeof createImportantDateBodySchema>
export type UpdateImportantDateBody = z.infer<typeof updateImportantDateBodySchema>
export type ListImportantDatesQuery = z.infer<typeof listImportantDatesQuerySchema>

export interface CalendarSettingsResponse {
  studyMode: 'exam' | 'skill'
  examTargetDate?: string
  examTitle?: string
}

export interface ImportantDateResponse {
  id: string
  title: string
  date: string
  subject: string
  priority: 'high' | 'medium' | 'low'
  description?: string
}
