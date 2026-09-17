import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { validateBody } from '../../shared/middleware/validate-body.js'
import {
  updateNotificationSettingsBodySchema,
  type UpdateNotificationSettingsBody,
} from './users.schemas.js'
import { getNotificationSettings, updateNotificationSettings } from './users.service.js'

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  const guard = { preHandler: authGuard }

  app.get('/settings/notifications', guard, async (request, reply) => {
    const settings = await getNotificationSettings(request.user!.id)
    return reply.send(settings)
  })

  app.patch(
    '/settings/notifications',
    { preHandler: [authGuard, validateBody(updateNotificationSettingsBodySchema)] },
    async (request, reply) => {
      const body = request.body as UpdateNotificationSettingsBody
      const settings = await updateNotificationSettings(request.user!.id, body)
      return reply.send(settings)
    },
  )
}
