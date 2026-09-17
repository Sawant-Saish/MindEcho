import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import sensible from '@fastify/sensible'
import Fastify, { type FastifyInstance } from 'fastify'
import { env } from './config/env.js'
import { analyticsModule } from './modules/analytics/index.js'
import { authModule } from './modules/auth/index.js'
import { billingModule } from './modules/billing/index.js'
import { calendarModule } from './modules/calendar/index.js'
import { evaluationsModule } from './modules/evaluations/index.js'
import { healthRoutes } from './modules/health/health.routes.js'
import { notesModule } from './modules/notes/index.js'
import { webhooksModule } from './modules/webhooks/index.js'
import { requestContextPlugin } from './plugins/request-context.js'
import { errorHandler } from './shared/middleware/error-handler.js'

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.isDev ? 'info' : 'warn',
      transport: env.isDev
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss' } }
        : undefined,
    },
    requestIdHeader: 'x-request-id',
    genReqId: (req) => {
      const header = req.headers['x-request-id']
      return typeof header === 'string' && header.length > 0 ? header : randomUUID()
    },
  })

  await app.register(sensible)
  await app.register(helmet, { contentSecurityPolicy: false })
  await app.register(cors, {
    origin: env.corsOrigins,
    credentials: true,
  })
  await app.register(requestContextPlugin)

  app.setErrorHandler(errorHandler)

  await app.register(healthRoutes)
  await app.register(authModule)
  await app.register(notesModule)
  await app.register(calendarModule)
  await app.register(evaluationsModule)
  await app.register(billingModule)
  await app.register(webhooksModule)
  await app.register(analyticsModule)

  app.get('/api/v1', async () => ({
    name: 'LECTOR API',
    version: env.API_VERSION,
    docs: '/api/v1/openapi',
    health: '/api/v1/health',
  }))

  app.get('/api/v1/openapi', async (_request, reply) => {
    const spec = await readFile(join(process.cwd(), 'openapi', 'spec.yaml'), 'utf-8')
    return reply.type('application/yaml').send(spec)
  })

  return app
}
