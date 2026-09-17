import type { FastifyInstance } from 'fastify'
import type { TestAuthSession } from './auth.js'

export async function createTestNote(
  app: FastifyInstance,
  session: TestAuthSession,
  overrides?: Partial<{
    title: string
    subject: string
    content: string
    icon: string
  }>,
) {
  const response = await app.inject({
    method: 'POST',
    url: '/api/v1/notes',
    headers: { authorization: `Bearer ${session.token}` },
    payload: {
      title: overrides?.title ?? 'Binary Search Trees',
      subject: overrides?.subject ?? 'Computer Science',
      icon: overrides?.icon ?? 'code',
      content:
        overrides?.content ??
        '# Binary Search Trees\n\nBST keeps smaller values on the left and larger values on the right.',
    },
  })

  if (response.statusCode !== 201) {
    throw new Error(`Failed to create test note: ${response.body}`)
  }

  return response.json() as { id: string; title: string }
}
