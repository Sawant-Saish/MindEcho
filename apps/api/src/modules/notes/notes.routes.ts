import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { validateBody } from '../../shared/middleware/validate-body.js'
import { validateQuery } from '../../shared/middleware/validate-query.js'
import {
  createNoteBodySchema,
  listNotesQuerySchema,
  updateNoteBodySchema,
  type CreateNoteBody,
  type ListNotesQuery,
  type UpdateNoteBody,
} from './notes.schemas.js'
import {
  createNote,
  deleteNote,
  getNote,
  listNotes,
  recalculateNoteSchedule,
  updateNote,
} from './notes.service.js'

export async function notesRoutes(app: FastifyInstance): Promise<void> {
  const guard = { preHandler: authGuard }

  app.get(
    '/',
    {
      preHandler: [authGuard, validateQuery(listNotesQuerySchema)],
    },
    async (request, reply) => {
      const query = request.query as ListNotesQuery
      const notes = await listNotes(request.user!.id, query)
      return reply.send(notes)
    },
  )

  app.get('/:id', guard, async (request, reply) => {
    const { id } = request.params as { id: string }
    const note = await getNote(request.user!.id, id)
    return reply.send(note)
  })

  app.post(
    '/',
    { preHandler: [authGuard, validateBody(createNoteBodySchema)] },
    async (request, reply) => {
      const body = request.body as CreateNoteBody
      const note = await createNote(request.user!.id, body)
      return reply.status(201).send(note)
    },
  )

  app.patch(
    '/:id',
    { preHandler: [authGuard, validateBody(updateNoteBodySchema)] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = request.body as UpdateNoteBody
      const note = await updateNote(request.user!.id, id, body)
      return reply.send(note)
    },
  )

  app.post('/:id/recalculate', guard, async (request, reply) => {
    const { id } = request.params as { id: string }
    const note = await recalculateNoteSchedule(request.user!.id, id)
    return reply.send(note)
  })

  app.delete('/:id', guard, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = await deleteNote(request.user!.id, id)
    return reply.send(result)
  })
}
