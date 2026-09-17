import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { validateBody } from '../../shared/middleware/validate-body.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { feynmanJsonBodySchema, type FeynmanJsonBody } from './evaluations.schemas.js'
import { getEvaluation, listEvaluations, submitFeynmanEvaluation } from './evaluations.service.js'

interface MultipartFields {
  noteId?: string
  explanationText?: string
  selfRating?: number
  audioBuffer?: Buffer
  audioMimeType?: string
}

async function parseMultipart(request: FastifyRequest): Promise<MultipartFields> {
  const fields: MultipartFields = {}

  for await (const part of request.parts()) {
    if (part.type === 'file') {
      if (part.fieldname === 'audioFile') {
        fields.audioBuffer = await part.toBuffer()
        fields.audioMimeType = part.mimetype
      }
      continue
    }

    const value = String(part.value)

    if (part.fieldname === 'noteId') fields.noteId = value
    if (part.fieldname === 'explanationText') fields.explanationText = value
    if (part.fieldname === 'selfRating') fields.selfRating = Number.parseInt(value, 10)
  }

  return fields
}

async function handleFeynmanEvaluation(request: FastifyRequest, reply: FastifyReply) {
  if (request.isMultipart()) {
    const fields = await parseMultipart(request)

    if (!fields.noteId) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'noteId is required')
    }

    const mode = fields.audioBuffer ? 'voice' : 'text'

    const result = await submitFeynmanEvaluation(request.user!.id, {
      noteId: fields.noteId,
      explanationText: fields.explanationText,
      audioBuffer: fields.audioBuffer,
      audioMimeType: fields.audioMimeType,
      selfRating: fields.selfRating,
      mode,
    })

    return reply.send(result)
  }

  const body = request.body as FeynmanJsonBody
  const result = await submitFeynmanEvaluation(request.user!.id, {
    noteId: body.noteId,
    explanationText: body.explanationText,
    selfRating: body.selfRating,
    mode: 'text',
  })

  return reply.send(result)
}

export async function evaluationsRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/feynman',
    {
      preHandler: [
        authGuard,
        async (request, reply) => {
          if (!request.isMultipart()) {
            await validateBody(feynmanJsonBodySchema)(request, reply)
          }
        },
      ],
    },
    handleFeynmanEvaluation,
  )

  app.get('/', { preHandler: authGuard }, async (request, reply) => {
    const evaluations = await listEvaluations(request.user!.id)
    return reply.send(evaluations)
  })

  app.get('/:id', { preHandler: authGuard }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const evaluation = await getEvaluation(request.user!.id, id)
    return reply.send(evaluation)
  })
}
