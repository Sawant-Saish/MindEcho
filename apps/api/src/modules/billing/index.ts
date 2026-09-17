import type { FastifyInstance } from 'fastify'
import { billingRoutes } from './billing.routes.js'

export async function billingModule(app: FastifyInstance): Promise<void> {
  await app.register(billingRoutes, { prefix: '/api/v1/subscriptions' })
}
