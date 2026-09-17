import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { registerNotImplemented } from '../../shared/utils/not-implemented-route.js'

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  const phase = 'Phase 5'
  const guard = { preHandler: authGuard }

  app.get('/summary', guard, registerNotImplemented(phase, 'GET /dashboard/summary'))
  app.get('/due-today', guard, registerNotImplemented(phase, 'GET /dashboard/due-today'))
  app.get('/retention-health', guard, registerNotImplemented(phase, 'GET /dashboard/retention-health'))
}
