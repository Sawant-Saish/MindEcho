import type { FastifyInstance } from 'fastify'
import { notificationsRoutes } from './notifications.routes.js'

export async function notificationsModule(app: FastifyInstance): Promise<void> {
  await app.register(notificationsRoutes, { prefix: '/api/v1/notifications' })
}
