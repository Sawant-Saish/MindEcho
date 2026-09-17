import type { FastifyReply, FastifyRequest } from 'fastify'
import { ApiError } from '../utils/api-error.js'

const WINDOW_MS = 60_000
const MAX_REQUESTS = 60
const buckets = new Map<string, { count: number; resetAt: number }>()

export async function userRateLimitGuard(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  if (!request.user) return

  const now = Date.now()
  const bucket = buckets.get(request.user.id)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(request.user.id, { count: 1, resetAt: now + WINDOW_MS })
    return
  }

  if (bucket.count >= MAX_REQUESTS) {
    throw new ApiError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests. Please slow down and try again.', {
      windowMs: WINDOW_MS,
      maxRequests: MAX_REQUESTS,
    })
  }

  bucket.count += 1
}

export function resetUserRateLimitBuckets(): void {
  buckets.clear()
}
