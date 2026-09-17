import { env } from './config/env.js'
import { connectDatabase } from './db/connection.js'
import { startWorkerScheduler } from './workers/scheduler.js'

async function start(): Promise<void> {
  await connectDatabase()

  const scheduler = startWorkerScheduler(console)
  console.info(`LECTOR worker listening (ENABLE_WORKERS=${env.ENABLE_WORKERS})`)

  const shutdown = (signal: string) => {
    console.info(`Received ${signal}, stopping worker scheduler...`)
    scheduler.stop()
    process.exit(0)
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Failed to start worker:', error)
  process.exit(1)
})
