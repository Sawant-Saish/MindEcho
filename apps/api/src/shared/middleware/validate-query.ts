import type { FastifyReply, FastifyRequest } from 'fastify'
import type { ZodSchema } from 'zod'
import { ApiError } from '../utils/api-error.js'

export function validateQuery<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const result = schema.safeParse(request.query)

    if (!result.success) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Query validation failed', {
        issues: result.error.flatten(),
      })
    }

    request.query = result.data as typeof request.query
  }
}
