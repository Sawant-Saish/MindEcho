import type { FastifyInstance } from 'fastify'
import { authGuard } from '../../shared/middleware/auth-guard.js'
import { validateBody } from '../../shared/middleware/validate-body.js'
import {
  getUserByPublicId,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
} from './auth.service.js'
import {
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  type LoginBody,
  type LogoutBody,
  type RefreshBody,
  type RegisterBody,
} from './auth.schemas.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    '/register',
    { preHandler: validateBody(registerBodySchema) },
    async (request, reply) => {
      const body = request.body as RegisterBody
      const result = await registerUser(body)
      return reply.status(201).send(result)
    },
  )

  app.post(
    '/login',
    { preHandler: validateBody(loginBodySchema) },
    async (request, reply) => {
      const body = request.body as LoginBody
      const result = await loginUser(body)
      return reply.send(result)
    },
  )

  app.post(
    '/refresh',
    { preHandler: validateBody(refreshBodySchema) },
    async (request, reply) => {
      const body = request.body as RefreshBody
      const result = await refreshSession(body.refreshToken)
      return reply.send(result)
    },
  )

  app.post(
    '/logout',
    { preHandler: validateBody(logoutBodySchema) },
    async (request, reply) => {
      const body = request.body as LogoutBody
      const result = await logoutUser(body.refreshToken)
      return reply.send(result)
    },
  )

  app.get('/me', { preHandler: authGuard }, async (request, reply) => {
    const user = await getUserByPublicId(request.user!.id)
    return reply.send({ user })
  })
}
