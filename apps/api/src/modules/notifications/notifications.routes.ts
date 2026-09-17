import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { listNotifications, markNotificationRead } from './notifications.service.js'

export async function notificationsRoutes(app: FastifyInstance): Promise<void> {
  const guard = { preHandler: authGuard }

  app.get('/', guard, async (request, reply) => {
    const notifications = await listNotifications(request.user!.id)
    return reply.send(notifications)
  })

  app.patch('/:id/read', guard, async (request, reply) => {
    const { id } = request.params as { id: string }
    const notification = await markNotificationRead(request.user!.id, id)
    return reply.send(notification)
  })
}
