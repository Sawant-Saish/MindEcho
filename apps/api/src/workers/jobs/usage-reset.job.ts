import { UsageRecord } from '../../models/UsageRecord.js'

const RETENTION_DAYS = 90

export interface UsageResetResult {
  recordsRemoved: number
}

export async function runUsageResetJob(referenceDate = new Date()): Promise<UsageResetResult> {
  const cutoff = new Date(referenceDate)
  cutoff.setUTCDate(cutoff.getUTCDate() - RETENTION_DAYS)

  const result = await UsageRecord.deleteMany({
    date: { $lt: cutoff },
  })

  return { recordsRemoved: result.deletedCount ?? 0 }
}
