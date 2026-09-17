import type { FastifyInstance } from 'fastify'
import { evaluationsRoutes } from './evaluations.routes.js'

export async function evaluationsModule(app: FastifyInstance): Promise<void> {
  await app.register(evaluationsRoutes, { prefix: '/api/v1/evaluations' })
}
