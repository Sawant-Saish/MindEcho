import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { registerTestUser } from './helpers/auth.js'

describe('Calendar API (Phase 3)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('returns default calendar settings for a new user', async () => {
    const session = await registerTestUser(app, { email: 'calendar-default@test.com' })

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/calendar/settings',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ studyMode: 'exam' })
  })

  it('updates calendar settings', async () => {
    const session = await registerTestUser(app, { email: 'calendar-settings@test.com' })

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/calendar/settings',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        studyMode: 'exam',
        examTargetDate: '2026-12-25',
        examTitle: 'Final CS Midterm Exam',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      studyMode: 'exam',
      examTargetDate: '2026-12-25',
      examTitle: 'Final CS Midterm Exam',
    })
  })

  it('rejects past exam dates in exam mode', async () => {
    const session = await registerTestUser(app, { email: 'calendar-past@test.com' })

    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/calendar/settings',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        studyMode: 'exam',
        examTargetDate: '2020-01-01',
        examTitle: 'Old Exam',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json().error.code).toBe('EXAM_DATE_INVALID')
  })

  it('creates, lists, updates, and deletes important dates', async () => {
    const session = await registerTestUser(app, { email: 'calendar-dates@test.com' })

    const createResponse = await app.inject({
      method: 'POST',
      url: '/api/v1/calendar/important-dates',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        title: 'Physics Thermodynamics Quiz',
        date: '2026-10-02',
        subject: 'Physics & Engineering',
        priority: 'medium',
        description: 'Carnot engine efficiency',
      },
    })

    expect(createResponse.statusCode).toBe(201)
    const created = createResponse.json()
    expect(created.id).toMatch(/^date_/)

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/calendar/important-dates',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(listResponse.statusCode).toBe(200)
    expect(listResponse.json()).toHaveLength(1)

    const patchResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/calendar/important-dates/${created.id}`,
      headers: { authorization: `Bearer ${session.token}` },
      payload: { priority: 'high' },
    })

    expect(patchResponse.statusCode).toBe(200)
    expect(patchResponse.json().priority).toBe('high')

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/api/v1/calendar/important-dates/${created.id}`,
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(deleteResponse.statusCode).toBe(200)
    expect(deleteResponse.json().deletedId).toBe(created.id)
  })

  it('filters important dates by range', async () => {
    const session = await registerTestUser(app, { email: 'calendar-filter@test.com' })

    await app.inject({
      method: 'POST',
      url: '/api/v1/calendar/important-dates',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        title: 'Early Event',
        date: '2026-09-01',
        subject: 'Biology',
        priority: 'low',
      },
    })

    await app.inject({
      method: 'POST',
      url: '/api/v1/calendar/important-dates',
      headers: { authorization: `Bearer ${session.token}` },
      payload: {
        title: 'Late Event',
        date: '2026-11-01',
        subject: 'Biology',
        priority: 'low',
      },
    })

    const filtered = await app.inject({
      method: 'GET',
      url: '/api/v1/calendar/important-dates?from=2026-10-01&to=2026-10-31',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(filtered.statusCode).toBe(200)
    expect(filtered.json()).toHaveLength(0)
  })

  it('prevents cross-user important date access', async () => {
    const owner = await registerTestUser(app, { email: 'calendar-owner@test.com' })
    const intruder = await registerTestUser(app, { email: 'calendar-intruder@test.com' })

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/calendar/important-dates',
      headers: { authorization: `Bearer ${owner.token}` },
      payload: {
        title: 'Private Exam',
        date: '2026-10-15',
        subject: 'Computer Science',
        priority: 'high',
      },
    })

    const dateId = created.json().id

    const forbidden = await app.inject({
      method: 'DELETE',
      url: `/api/v1/calendar/important-dates/${dateId}`,
      headers: { authorization: `Bearer ${intruder.token}` },
    })

    expect(forbidden.statusCode).toBe(404)
  })
})
