/**
 * Phase 0 — baseline indexes for LECTOR collections.
 * Additional indexes are added per-phase as models ship.
 */
module.exports = {
  async up(db) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true })
    await db.collection('notes').createIndex({ userId: 1, nextReviewDate: 1 })
    await db.collection('notes').createIndex({ userId: 1, subject: 1 })
    await db.collection('evaluations').createIndex({ userId: 1, createdAt: -1 })
    await db.collection('important_dates').createIndex({ userId: 1, date: 1 })
    await db.collection('usage_records').createIndex(
      { userId: 1, type: 1, date: 1 },
      { unique: true },
    )
  },

  async down(db) {
    await db.collection('users').dropIndex('email_1')
    await db.collection('notes').dropIndex('userId_1_nextReviewDate_1')
    await db.collection('notes').dropIndex('userId_1_subject_1')
    await db.collection('evaluations').dropIndex('userId_1_createdAt_-1')
    await db.collection('important_dates').dropIndex('userId_1_date_1')
    await db.collection('usage_records').dropIndex('userId_1_type_1_date_1')
  },
}
