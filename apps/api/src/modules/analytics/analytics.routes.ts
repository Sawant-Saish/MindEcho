import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import {
  getDashboardSummary,
  getDueTodayNotes,
  getRetentionHealth,
} from './analytics.service.js'

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  app.get('/summary', { preHandler: authGuard }, async (request, reply) => {
    const summary = await getDashboardSummary(request.user!.id)
    return reply.send(summary)
  })

  app.get('/due-today', { preHandler: authGuard }, async (request, reply) => {
    const notes = await getDueTodayNotes(request.user!.id)
    return reply.send(notes)
  })

  app.get('/retention-health', { preHandler: authGuard }, async (request, reply) => {
    const retention = await getRetentionHealth(request.user!.id)
    return reply.send(retention)
  })
}
