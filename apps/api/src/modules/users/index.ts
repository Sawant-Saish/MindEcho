import type { FastifyInstance } from 'fastify'
import { usersRoutes } from './users.routes.js'

export async function usersModule(app: FastifyInstance): Promise<void> {
  await app.register(usersRoutes, { prefix: '/api/v1/users' })
}
