import mongoose from 'mongoose'
import { env } from '../config/env.js'

let isConnected = false

export async function connectDatabase(): Promise<void> {
  if (mongoose.connection.readyState === 1) {
    isConnected = true
    return
  }

  if (isConnected) return

  mongoose.set('strictQuery', true)

  const uri = process.env.MONGODB_URI ?? env.MONGODB_URI

  await mongoose.connect(uri, {
    maxPoolSize: 50,
    serverSelectionTimeoutMS: 5_000,
  })

  isConnected = true
}

export async function disconnectDatabase(): Promise<void> {
  if (!isConnected) return
  await mongoose.disconnect()
  isConnected = false
}

export function getDatabaseStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
}
