import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { registerTestUser } from './helpers/auth.js'

describe('Notes API (Phase 2)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates, lists, updates, and deletes a note', async () => {
    const session = await registerTestUser(app)

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        title: 'Binary Search Trees',
        subject: 'Computer Science',
        icon: 'code',
        content: '# BST\nBinary search tree basics.',
      },
    })

    expect(createResponse.statusCode).toBe(201)
    const created = createResponse.json()
    expect(created.id).toMatch(/^note_/)
    expect(created.practiceCount).toBe(0)
    expect(created.retentionHealth).toBe(70)

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/notes',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json()).toHaveLength(1)

    const getResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/notes/${created.id}`,
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json().title).toBe('Binary Search Trees')

    const patchResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/notes/${created.id}`,
      headers: { authorization: `Bearer ${session.token}` },
      payload: { title: 'BST & Traversal' },
    })

    expect(patchResponse.statusCode).toBe(200)
    expect(patchResponse.json().title).toBe('BST & Traversal')

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/notes/${created.id}`,
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(deleteResponse.statusCode).toBe(200)
    expect(deleteResponse.json()).toEqual({ success: true, deletedId: created.id })
  })

  it('prevents cross-user note access', async () => {
    const owner = await registerTestUser(app, { email: 'owner-notes@test.com' })
    const intruder = await registerTestUser(app, { email: 'intruder-notes@test.com' })

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: { authorization: `Bearer ${owner.token}` },
      payload: {
        title: 'Private Note',
        subject: 'Biology',
        icon: 'leaf',
        content: '# Secret content',
      },
    })

    const noteId = created.json().id

    const forbidden = await app.inject({
      method: 'GET',
      url: `/api/v1/notes/${noteId}`,
      headers: { authorization: `Bearer ${intruder.token}` },
    })

    expect(forbidden.statusCode).toBe(404)
    expect(forbidden.json().error.code).toBe('NOTE_NOT_FOUND')
  })

  it('requires authentication', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notes',
    })

    expect(response.statusCode).toBe(401)
  })

  it('filters notes by subject', async () => {
    const session = await registerTestUser(app, { email: 'filter-notes@test.com' })

    await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        title: 'Physics Note',
        subject: 'Physics & Engineering',
        content: '# Thermodynamics',
      },
    })

    await app.inject({
      method: 'POST',
      url: '/api/v1/notes',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        title: 'CS Note',
        subject: 'Computer Science',
        content: '# Algorithms',
      },
    })

    const filtered = await app.inject({
      method: 'GET',
      url: '/api/v1/notes?subject=Computer%20Science',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(filtered.statusCode).toBe(200)
    const notes = filtered.json()
    expect(notes).toHaveLength(1)
    expect(notes[0].subject).toBe('Computer Science')
  })
})
