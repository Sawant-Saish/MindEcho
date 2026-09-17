import multipart from '@fastify/multipart'
import type { FastifyInstance } from 'fastify'
import { evaluationsRoutes } from './evaluations.routes.js'

export async function evaluationsModule(app: FastifyInstance): Promise<void> {
  await app.register(
    async (scopedApp) => {
      await scopedApp.register(multipart, {
        limits: { fileSize: 10 * 1024 * 1024 },
      })
      await scopedApp.register(evaluationsRoutes)
    },
    { prefix: '/api/v1/evaluations' },
  )
}
