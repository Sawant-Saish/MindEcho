import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { validateBody } from '../../shared/middleware/validate-body.js'
import { checkoutBodySchema, type CheckoutBody } from './billing.schemas.js'
import {
  cancelSubscription,
  checkout,
  getCurrentSubscription,
  listPlans,
} from './billing.service.js'

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  const guard = { preHandler: authGuard }

  app.get('/plans', async (_request, reply) => {
    const plans = await listPlans()
    return reply.send(plans)
  })

  app.get('/current', guard, async (request, reply) => {
    const subscription = await getCurrentSubscription(request.user!.id)
    return reply.send(subscription)
  })

  app.post(
    '/checkout',
    { preHandler: [authGuard, validateBody(checkoutBodySchema)] },
    async (request, reply) => {
      const body = request.body as CheckoutBody
      const result = await checkout(request.user!.id, body)
      return reply.send(result)
    },
  )

  app.post('/cancel', guard, async (request, reply) => {
    const result = await cancelSubscription(request.user!.id)
    return reply.send(result)
  })
}
