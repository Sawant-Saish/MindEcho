import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { validateBody } from '../../shared/middleware/validate-body.js'
import { validateQuery } from '../../shared/middleware/validate-query.js'
import {
  createImportantDateBodySchema,
  listImportantDatesQuerySchema,
  updateImportantDateBodySchema,
  updateSettingsBodySchema,
  type CreateImportantDateBody,
  type ListImportantDatesQuery,
  type UpdateImportantDateBody,
  type UpdateSettingsBody,
} from './calendar.schemas.js'
import {
  createImportantDate,
  deleteImportantDate,
  getCalendarSettings,
  listImportantDates,
  updateCalendarSettings,
  updateImportantDate,
} from './calendar.service.js'

export async function calendarRoutes(app: FastifyInstance): Promise<void> {
  app.get('/settings', { preHandler: authGuard }, async (request, reply) => {
    const settings = await getCalendarSettings(request.user!.id)
    return reply.send(settings)
  })

  app.post(
    '/settings',
    { preHandler: [authGuard, validateBody(updateSettingsBodySchema)] },
    async (request, reply) => {
      const body = request.body as UpdateSettingsBody
      const settings = await updateCalendarSettings(request.user!.id, body)
      return reply.send(settings)
    },
  )

  app.get(
    '/important-dates',
    { preHandler: [authGuard, validateQuery(listImportantDatesQuerySchema)] },
    async (request, reply) => {
      const query = request.query as ListImportantDatesQuery
      const dates = await listImportantDates(request.user!.id, query)
      return reply.send(dates)
    },
  )

  app.post(
    '/important-dates',
    { preHandler: [authGuard, validateBody(createImportantDateBodySchema)] },
    async (request, reply) => {
      const body = request.body as CreateImportantDateBody
      const date = await createImportantDate(request.user!.id, body)
      return reply.status(201).send(date)
    },
  )

  app.patch(
    '/important-dates/:id',
    { preHandler: [authGuard, validateBody(updateImportantDateBodySchema)] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as UpdateImportantDateBody
      const date = await updateImportantDate(request.user!.id, id, body)
      return reply.send(date)
    },
  )

  app.delete('/important-dates/:id', { preHandler: authGuard }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await deleteImportantDate(request.user!.id, id)
    return reply.send(result)
  })
}
