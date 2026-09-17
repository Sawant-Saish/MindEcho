import type { FastifyInstance } from 'fastify'
import { env } from '../../config/env.js'
import { features } from '../../config/features.js'
import { getDatabaseStatus } from '../../db/connection.js'

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  const handler = async () => ({
    status: 'ok',
    version: env.API_VERSION,
    environment: env.NODE_ENV,
    database: getDatabaseStatus(),
    features,
    timestamp: new Date().toISOString(),
  })

  app.get('/api/health', handler)
  app.get('/api/v1/health', handler)
}
