import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { registerNotImplemented } from '../../shared/utils/not-implemented-route.js'

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  const phase = 'Phase 6'
  const guard = { preHandler: authGuard }

  app.post('/checkout', guard, registerNotImplemented(phase, 'POST /subscriptions/checkout'))
  app.get('/current', guard, registerNotImplemented(phase, 'GET /subscriptions/current'))
  app.post('/cancel', guard, registerNotImplemented(phase, 'POST /subscriptions/cancel'))
  app.get('/plans', registerNotImplemented(phase, 'GET /subscriptions/plans'))
}
