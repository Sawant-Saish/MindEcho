import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { submitFeynmanEvaluation } from '../src/modules/evaluations/evaluations.service.js'
import { registerTestUser } from './helpers/auth.js'
import { createTestNote } from './helpers/notes.js'

describe('Evaluations API (Phase 4)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('evaluates a text explanation and updates note state', async () => {
    const session = await registerTestUser(app, { email: 'eval-text@test.com' })
    const note = await createTestNote(app, session)

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        noteId: note.id,
        explanationText:
          'A binary search tree keeps smaller values on the left subtree and larger values on the right subtree for efficient lookup.',
        selfRating: 8,
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.evaluationId).toMatch(/^eval_/)
    expect(body.noteId).toBe(note.id)
    expect(body.lectorScore).toBeGreaterThan(0)
    expect(body.feedback.strengths.length).toBeGreaterThan(0)
    expect(body.updatedNoteState.practiceCount).toBe(1)
    expect(body.updatedNoteState.retentionHealth).toBeGreaterThan(0)
  })

  it('evaluates a voice explanation through STT pipeline', async () => {
    const session = await registerTestUser(app, { email: 'eval-voice@test.com' })
    const note = await createTestNote(app, session)

    await app.inject({
      method: 'POST',
      url: '/api/v1/subscriptions/checkout',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        planId: 'pro',
        billingCycle: 'monthly',
        paymentToken: 'tok_mock_card_1234',
      },
    })

    const result = await submitFeynmanEvaluation(session.user.id, {
      noteId: note.id,
      mode: 'voice',
      audioBuffer: Buffer.from('mock-audio-bytes-for-stt'),
      audioMimeType: 'audio/webm',
      selfRating: 7,
    })

    expect(result.transcript).toBeTruthy()
    expect(result.updatedNoteState.practiceCount).toBe(1)
  })

  it('lists and retrieves evaluation history', async () => {
    const session = await registerTestUser(app, { email: 'eval-list@test.com' })
    const note = await createTestNote(app, session)

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        noteId: note.id,
        explanationText: 'BST ordering rules with left smaller and right larger values.',
      },
    })

    const evaluationId = created.json().evaluationId

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/evaluations',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json().length).toBeGreaterThanOrEqual(1)

    const detailResponse = await app.inject({
      method: 'GET',
      url: `/api/v1/evaluations/${evaluationId}`,
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(detailResponse.statusCode).toBe(200)
    expect(detailResponse.json().id).toBe(evaluationId)
  })

  it('rejects evaluation for another users note', async () => {
    const owner = await registerTestUser(app, { email: 'eval-owner@test.com' })
    const intruder = await registerTestUser(app, { email: 'eval-intruder@test.com' })
    const note = await createTestNote(app, owner)

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${intruder.token}` },
      payload: {
        noteId: note.id,
        explanationText: 'Attempting to evaluate someone else note.',
      },
    })

    expect(response.statusCode).toBe(404)
    expect(response.json().error.code).toBe('NOTE_NOT_FOUND')
  })
})
