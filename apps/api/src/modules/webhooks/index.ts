import type { FastifyInstance } from 'fastify'
import { webhooksRoutes } from './webhooks.routes.js'

export async function webhooksModule(app: FastifyInstance): Promise<void> {
  await app.register(webhooksRoutes, { prefix: '/api/v1/webhooks' })
}
