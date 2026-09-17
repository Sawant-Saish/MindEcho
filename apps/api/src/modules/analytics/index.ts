import type { FastifyInstance } from 'fastify'
import { analyticsRoutes } from './analytics.routes.js'

export async function analyticsModule(app: FastifyInstance): Promise<void> {
  await app.register(analyticsRoutes, { prefix: '/api/v1/dashboard' })
}
