import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'

describe('Auth API (Phase 1)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('registers a new user', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Jane Doe',
        email: 'jane@university.edu',
        password: 'SecurePassword123!',
      },
    })

    expect(response.statusCode).toBe(201)
    const body = response.json()
    expect(body.token).toBeTruthy()
    expect(body.refreshToken).toBeTruthy()
    expect(body.user).toMatchObject({
      name: 'Jane Doe',
      email: 'jane@university.edu',
    })
    expect(body.user.id).toMatch(/^usr_/)
  })

  it('rejects duplicate email on register', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Jane Doe',
        email: 'duplicate@university.edu',
        password: 'SecurePassword123!',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Another Jane',
        email: 'duplicate@university.edu',
        password: 'SecurePassword123!',
      },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json().error.code).toBe('EMAIL_EXISTS')
  })

  it('logs in with valid credentials', async () => {
    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Login User',
        email: 'login@university.edu',
        password: 'SecurePassword123!',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'login@university.edu',
        password: 'SecurePassword123!',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().user.email).toBe('login@university.edu')
  })

  it('rejects invalid login credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'missing@university.edu',
        password: 'wrong-password',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json().error.code).toBe('INVALID_CREDENTIALS')
  })

  it('returns current user from /me with valid token', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Me User',
        email: 'me@university.edu',
        password: 'SecurePassword123!',
      },
    })

    const { token } = register.json()

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().user.email).toBe('me@university.edu')
  })

  it('refreshes access token with refresh token', async () => {
    const register = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Refresh User',
        email: 'refresh@university.edu',
        password: 'SecurePassword123!',
      },
    })

    const { refreshToken } = register.json()

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      payload: { refreshToken },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().token).toBeTruthy()
    expect(response.json().refreshToken).not.toBe(refreshToken)
  })

  it('validates register payload', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Short',
        email: 'not-an-email',
        password: 'short',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe('VALIDATION_ERROR')
  })
})
