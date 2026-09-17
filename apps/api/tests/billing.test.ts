import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { registerTestUser } from './helpers/auth.js'
import { createTestNote } from './helpers/notes.js'

describe('Billing API (Phase 6)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('lists available subscription plans', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/subscriptions/plans',
    })

    expect(response.statusCode).toBe(200)
    const plans = response.json()
    expect(plans).toHaveLength(3)
    expect(plans.map((plan: { id: string }) => plan.id)).toEqual(['starter', 'pro', 'team'])
  })

  it('defaults new users to starter plan', async () => {
    const session = await registerTestUser(app, { email: 'billing-current@test.com' })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/subscriptions/current',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.planId).toBe('starter')
    expect(body.status).toBe('active')
    expect(body.usage.dailyLimit).toBe(10)
  })

  it('checks out with mock payment token', async () => {
    const session = await registerTestUser(app, { email: 'billing-checkout@test.com' })

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/subscriptions/checkout',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        planId: 'pro',
        billingCycle: 'monthly',
        paymentToken: 'tok_mock_card_1234',
      },
    })

    expect(response.statusCode).toBe(200)
    const body = response.json()
    expect(body.subscriptionId).toMatch(/^sub_/)
    expect(body.status).toBe('active')
    expect(body.currentPeriodEnd).toBeTruthy()
  })

  it('blocks starter users after daily evaluation limit', async () => {
    const session = await registerTestUser(app, { email: 'billing-limit@test.com' })
    const note = await createTestNote(app, session)

    for (let index = 0; index < 10; index += 1) {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/evaluations/feynman',
        headers: { authorization: `Bearer ${session.token}` },
        payload: {
          noteId: note.id,
          explanationText: `Evaluation attempt ${index + 1} explaining BST ordering rules.`,
        },
      })

      expect(response.statusCode).toBe(200)
    }

    const blocked = await app.inject({
      method: 'POST',
      url: '/api/v1/evaluations/feynman',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        noteId: note.id,
        explanationText: 'This evaluation should exceed the starter daily limit.',
      },
    })

    expect(blocked.statusCode).toBe(429)
    expect(blocked.json().error.code).toBe('USAGE_LIMIT_EXCEEDED')
  })

  it('cancels an active subscription', async () => {
    const session = await registerTestUser(app, { email: 'billing-cancel@test.com' })

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/subscriptions/cancel',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().success).toBe(true)

    const current = await app.inject({
      method: 'GET',
      url: '/api/v1/subscriptions/current',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(current.json().status).toBe('canceled')
  })
})
