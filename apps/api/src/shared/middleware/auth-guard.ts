import type { FastifyReply, FastifyRequest } from 'fastify'
import { ApiError } from '../utils/api-error.js'
import { verifyAccessToken } from '../utils/tokens.js'

export interface AuthUser {
  id: string
  email: string
  name: string
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

export async function authGuard(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  const header = request.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
  }

  const token = header.slice('Bearer '.length).trim()

  if (!token) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Authentication required')
  }

  const payload = await verifyAccessToken(token)

  request.user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
  }
}
