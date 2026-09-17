module.exports = {
  async up(db) {
    await db.collection('refreshtokens').createIndex({ tokenHash: 1 }, { unique: true })
    await db.collection('refreshtokens').createIndex({ userId: 1 })
    await db.collection('refreshtokens').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
  },

  async down(db) {
    await db.collection('refreshtokens').dropIndex('tokenHash_1')
    await db.collection('refreshtokens').dropIndex('userId_1')
    await db.collection('refreshtokens').dropIndex('expiresAt_1')
  },
}
