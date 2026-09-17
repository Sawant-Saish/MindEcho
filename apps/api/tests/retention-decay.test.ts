import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../src/app.js'
import { Note } from '../src/models/Note.js'
import { fromPublicNoteId } from '../src/shared/utils/note-id.js'
import { runRetentionDecayJob } from '../src/workers/jobs/retention-decay.job.js'
import { registerTestUser } from './helpers/auth.js'
import { createTestNote } from './helpers/notes.js'

describe('Retention decay worker (Phase 8)', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  it('decreases retention health for overdue notes', async () => {
    const session = await registerTestUser(app, { email: 'retention-decay@test.com' })
    const note = await createTestNote(app, session)

    const overdueDate = new Date('2026-09-10T00:00:00.000Z')
    await Note.findByIdAndUpdate(fromPublicNoteId(note.id), {
      $set: {
        retentionHealth: 80,
        nextReviewDate: overdueDate,
      },
    })

    const result = await runRetentionDecayJob(new Date('2026-09-18T00:00:00.000Z'))
    expect(result.notesUpdated).toBeGreaterThanOrEqual(1)

    const updated = await Note.findById(fromPublicNoteId(note.id))
    expect(updated?.retentionHealth).toBeLessThan(80)
    expect(updated?.retentionHealth).toBeGreaterThanOrEqual(0)
  })
})
