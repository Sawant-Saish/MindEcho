import { createHash, randomBytes } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '../../config/env.js'
import { ApiError } from './api-error.js'

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET)

export interface AccessTokenPayload {
  sub: string
  email: string
  name: string
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ email: payload.email, name: payload.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(jwtSecret)
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, jwtSecret)
    const sub = payload.sub

    if (!sub || typeof sub !== 'string') {
      throw new ApiError(401, 'INVALID_TOKEN', 'Token subject is missing')
    }

    const email = payload.email
    const name = payload.name

    if (typeof email !== 'string' || typeof name !== 'string') {
      throw new ApiError(401, 'INVALID_TOKEN', 'Token payload is invalid')
    }

    return { sub, email, name }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(401, 'INVALID_TOKEN', 'Access token is invalid or expired')
  }
}

export function generateRefreshToken(): string {
  return randomBytes(48).toString('base64url')
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function getRefreshTokenExpiry(): Date {
  const raw = env.JWT_REFRESH_EXPIRES_IN
  const expiresAt = new Date()

  if (raw.endsWith('d')) {
    expiresAt.setDate(expiresAt.getDate() + Number.parseInt(raw, 10))
    return expiresAt
  }

  if (raw.endsWith('h')) {
    expiresAt.setHours(expiresAt.getHours() + Number.parseInt(raw, 10))
    return expiresAt
  }

  expiresAt.setDate(expiresAt.getDate() + 7)
  return expiresAt
}
