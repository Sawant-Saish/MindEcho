import cron from 'node-cron'
import { runDueReviewReminderJob } from './jobs/due-review-reminder.job.js'
import { runRetentionDecayJob } from './jobs/retention-decay.job.js'
import { runUsageResetJob } from './jobs/usage-reset.job.js'

export interface WorkerScheduler {
  stop: () => void
}

export function startWorkerScheduler(logger: Pick<Console, 'info' | 'error'> = console): WorkerScheduler {
  const tasks = [
    cron.schedule('0 0 * * *', () => {
      void runRetentionDecayJob()
        .then((result) => logger.info({ job: 'retention-decay', ...result }, 'Retention decay job completed'))
        .catch((error) => logger.error({ job: 'retention-decay', error }, 'Retention decay job failed'))

      void runUsageResetJob()
        .then((result) => logger.info({ job: 'usage-reset', ...result }, 'Usage reset job completed'))
        .catch((error) => logger.error({ job: 'usage-reset', error }, 'Usage reset job failed'))
    }),
    cron.schedule('0 8 * * *', () => {
      void runDueReviewReminderJob()
        .then((result) =>
          logger.info({ job: 'due-review-reminder', ...result }, 'Due review reminder job completed'),
        )
        .catch((error) =>
          logger.error({ job: 'due-review-reminder', error }, 'Due review reminder job failed'),
        )
    }),
  ]

  logger.info('Worker scheduler started (retention-decay + usage-reset at 00:00 UTC, reminders at 08:00 UTC)')

  return {
    stop: () => {
      for (const task of tasks) {
        task.stop()
      }
    },
  }
}
