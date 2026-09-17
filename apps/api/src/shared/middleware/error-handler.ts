import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ApiError } from '../utils/api-error.js'

export function errorHandler(
  error: FastifyError | ApiError | Error,
  _request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (error instanceof ApiError) {
    reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    })
    return
  }

  const fastifyError = error as FastifyError

  if (fastifyError.validation) {
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: fastifyError.validation,
      },
    })
    return
  }

  const statusCode = fastifyError.statusCode ?? 500
  reply.status(statusCode).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: statusCode >= 500 ? 'Internal server error' : error.message,
    },
  })
}
