import { z } from 'zod'

export const updateNotificationSettingsBodySchema = z
  .object({
    emailEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    inAppEnabled: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  })

export type UpdateNotificationSettingsBody = z.infer<typeof updateNotificationSettingsBodySchema>

export interface NotificationSettingsResponse {
  emailEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
}
