import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { registerNotImplemented } from '../../shared/utils/not-implemented-route.js'

export async function evaluationsRoutes(app: FastifyInstance): Promise<void> {
  const phase = 'Phase 4'
  const guard = { preHandler: authGuard }

  app.post('/feynman', guard, registerNotImplemented(phase, 'POST /evaluations/feynman'))
  app.get('/', guard, registerNotImplemented(phase, 'GET /evaluations'))
  app.get('/:id', guard, registerNotImplemented(phase, 'GET /evaluations/:id'))
}
