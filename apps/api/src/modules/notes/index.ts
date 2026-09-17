import type { FastifyInstance } from 'fastify'
import { notesRoutes } from './notes.routes.js'

export async function notesModule(app: FastifyInstance): Promise<void> {
  await app.register(notesRoutes, { prefix: '/api/v1/notes' })
}
