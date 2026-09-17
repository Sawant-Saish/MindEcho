import rateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import { authRoutes } from './auth.routes.js'

export async function authModule(app: FastifyInstance): Promise<void> {
  await app.register(
    async (scopedApp) => {
      if (process.env.NODE_ENV !== 'test') {
        await scopedApp.register(rateLimit, {
          max: 5,
          timeWindow: '1 minute',
          errorResponseBuilder: () => ({
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many authentication attempts. Please try again later.',
            },
          }),
        })
      }

      await scopedApp.register(authRoutes)
    },
    { prefix: '/api/v1/auth' },
  )
}
