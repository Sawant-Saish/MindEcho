import { afterAll, afterEach, beforeAll } from 'vitest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer

beforeAll(async () => {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = 'test-secret-min-8-chars-long'

  mongod = await MongoMemoryServer.create()
  process.env.MONGODB_URI = mongod.getUri()

  await mongoose.connect(process.env.MONGODB_URI)
}, 60_000)

afterEach(async () => {
  for (const collection of Object.values(mongoose.connection.collections)) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongod) {
    await mongod.stop()
  }
})
