import type { FastifyInstance } from 'fastify'

export interface TestAuthSession {
  token: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
  }
}

export async function registerTestUser(
  app: FastifyInstance,
  overrides?: Partial<{ name: string; email: string; password: string }>,
): Promise<TestAuthSession> {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/register',
    payload: {
      name: overrides?.name ?? 'Test User',
      email: overrides?.email ?? `user-${Date.now()}@test.com`,
      password: overrides?.password ?? 'SecurePassword123!',
    },
  })

  if (response.statusCode !== 201) {
    throw new Error(`Failed to register test user: ${response.body}`)
  }

  return response.json() as TestAuthSession
}
