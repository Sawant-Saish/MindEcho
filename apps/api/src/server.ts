import { buildApp } from './app.js'
import { env } from './config/env.js'
import { connectDatabase } from './db/connection.js'

async function start(): Promise<void> {
  await connectDatabase()

  const app = await buildApp()

  try {
    await app.listen({ port: env.PORT, host: env.HOST })
    app.log.info(`LECTOR API listening on http://${env.HOST}:${env.PORT}`)
    app.log.info(`Health check: http://localhost:${env.PORT}/api/v1/health`)
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }

  const shutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down...`)
    await app.close()
    process.exit(0)
  }

  process.on('SIGINT', () => void shutdown('SIGINT'))
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
    console.error(
      '\nMongoDB is not reachable. Start infrastructure first:\n  npm run docker:up\n',
    )
  }
  process.exit(1)
})
