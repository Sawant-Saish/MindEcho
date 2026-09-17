import type { FastifyInstance } from 'fastify'
import { handleStripeWebhook } from '../billing/billing.service.js'

export async function webhooksRoutes(app: FastifyInstance): Promise<void> {
  app.post('/stripe', async (request, reply) => {
    const event = request.body as {
      type: string
      data?: {
        subscriptionId?: string
        status?: 'active' | 'canceled' | 'past_due' | 'trialing'
        currentPeriodEnd?: string
      }
    }

    await handleStripeWebhook(event)
    return reply.send({ received: true })
  })
}
