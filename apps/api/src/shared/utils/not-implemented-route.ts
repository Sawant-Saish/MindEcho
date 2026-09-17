import type { FastifyReply, FastifyRequest } from 'fastify'
import { notImplemented } from './api-error.js'

export function registerNotImplemented(
  phase: string,
  feature: string,
): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
  return async () => {
    throw notImplemented(phase, feature)
  }
}
