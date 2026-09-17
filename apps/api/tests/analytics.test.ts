import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { registerTestUser } from './helpers/auth.js'
import { createTestNote } from './helpers/notes.js'

describe('Analytics API (Phase 5)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns dashboard summary after an evaluation', async () => {
    const session = await registerTestUser(app, { email: 'dashboard-summary@test.com' })
    const note = await createTestNote(app, session)

    await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        noteId: note.id,
        explanationText:
          'Binary search trees keep smaller values on the left and larger values on the right.',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/summary',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.avgLectorScore).toBeGreaterThan(0)
    expect(body.retentionAverage).toBeGreaterThan(0)
    expect(body.totalSessionsToday).toBe(1)
    expect(body.dueTodayCount).toBeGreaterThanOrEqual(0)
    expect(body.recentExplanations).toHaveLength(1)
    expect(body.recentExplanations[0].noteId).toBe(note.id)
  })

  it('lists notes due for review today', async () => {
    const session = await registerTestUser(app, { email: 'dashboard-due@test.com' })
    const note = await createTestNote(app, session)

    const today = new Date().toISOString().slice(0, 10)

    await app.inject({
      method: 'PATCH',
      url: `/api/v1/notes/${note.id}`,
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        nextReviewDate: today,
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/due-today',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    const notes = response.json()
    expect(Array.isArray(notes)).toBe(true)
    expect(notes.some((item: { id: string }) => item.id === note.id)).toBe(true)
  })

  it('returns retention health per note', async () => {
    const session = await registerTestUser(app, { email: 'dashboard-retention@test.com' })
    const note = await createTestNote(app, session)

    await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        noteId: note.id,
        explanationText: 'In-order traversal visits left subtree, root, then right subtree.',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/dashboard/retention-health',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.average).toBeGreaterThan(0)
    expect(body.notes).toHaveLength(1)
    expect(body.notes[0].noteId).toBe(note.id)
    expect(body.notes[0].retentionHealth).toBeGreaterThan(0)
  })

  it('recalculates note schedule from latest evaluation', async () => {
    const session = await registerTestUser(app, { email: 'dashboard-recalc@test.com' })
    const note = await createTestNote(app, session)

    await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        noteId: note.id,
        explanationText: 'BST deletion handles leaf, single-child, and two-child cases.',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: `/api/v1/notes/${note.id}/recalculate`,
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.id).toBe(note.id)
    expect(body.nextReviewDate).toBeTruthy()
    expect(body.retentionHealth).toBeGreaterThan(0)
  })
})
