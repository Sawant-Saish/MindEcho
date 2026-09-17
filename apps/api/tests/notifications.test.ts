import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { Note } from '../src/models/Note.js'
import { fromPublicNoteId } from '../src/shared/utils/note-id.js'
import { runDueReviewReminderJob } from '../src/workers/jobs/due-review-reminder.job.js'
import { registerTestUser } from './helpers/auth.js'
import { createTestNote } from './helpers/notes.js'

describe('Notifications API (Phase 8)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('creates due-review notifications from the worker job', async () => {
    const session = await registerTestUser(app, { email: 'notifications-due@test.com' })
    const note = await createTestNote(app, session)
    const today = new Date().toISOString().slice(0, 10)

    await Note.findByIdAndUpdate(fromPublicNoteId(note.id), {
      $set: { nextReviewDate: new Date(`${today}T00:00:00.000Z`) },
    })

    const jobResult = await runDueReviewReminderJob(new Date(`${today}T12:00:00.000Z`))
    expect(jobResult.notificationsCreated).toBeGreaterThanOrEqual(1)

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(response.statusCode).toBe(200)
    const notifications = response.json()
    expect(notifications.length).toBeGreaterThanOrEqual(1)
    expect(notifications[0].type).toBe('due_review')
  })

  it('marks a notification as read', async () => {
    const session = await registerTestUser(app, { email: 'notifications-read@test.com' })
    const note = await createTestNote(app, session)
    const today = new Date().toISOString().slice(0, 10)

    await Note.findByIdAndUpdate(fromPublicNoteId(note.id), {
      $set: { nextReviewDate: new Date(`${today}T00:00:00.000Z`) },
    })

    await runDueReviewReminderJob(new Date(`${today}T12:00:00.000Z`))

    const listResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/notifications',
      headers: { authorization: `Bearer ${session.token}` },
    })

    const notificationId = listResponse.json()[0].id

    const readResponse = await app.inject({
      method: 'PATCH',
      url: `/api/v1/notifications/${notificationId}/read`,
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(readResponse.statusCode).toBe(200)
    expect(readResponse.json().read).toBe(true)
  })

  it('reads and updates notification settings', async () => {
    const session = await registerTestUser(app, { email: 'notifications-settings@test.com' })

    const getResponse = await app.inject({
      method: 'GET',
      url: '/api/v1/users/settings/notifications',
      headers: { authorization: `Bearer ${session.token}` },
    })

    expect(getResponse.statusCode).toBe(200)
    expect(getResponse.json().inAppEnabled).toBe(true)

    const patchResponse = await app.inject({
      method: 'PATCH',
      url: '/api/v1/users/settings/notifications',
      headers: { authorization: `Bearer ${session.token}` },
      payload: { emailEnabled: true },
    })

    expect(patchResponse.statusCode).toBe(200)
    expect(patchResponse.json().emailEnabled).toBe(true)
  })
})
