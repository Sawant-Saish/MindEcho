import type { FastifyInstance } from 'fastify'
import { calendarRoutes } from './calendar.routes.js'

export async function calendarModule(app: FastifyInstance): Promise<void> {
  await app.register(calendarRoutes, { prefix: '/api/v1/calendar' })
}
