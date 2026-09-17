import type { FastifyReply, FastifyRequest } from 'fastify'
import { assertCanEvaluate } from '../../modules/billing/usage-policy.service.js'

export async function usageLimitGuard(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!request.user) {
    return
  }

  if (request.isMultipart()) {
    return
  }

  await assertCanEvaluate(request.user.id, 'text')
}
