import type { SubmitFeynmanInput } from '../modules/evaluations/evaluations.service.js'
import { submitFeynmanEvaluation } from '../modules/evaluations/evaluations.service.js'

export interface QueuedEvaluationJob {
  id: string
  userId: string
  input: SubmitFeynmanInput
}

const queue: QueuedEvaluationJob[] = []
let processing = false

export function enqueueEvaluation(userId: string, input: SubmitFeynmanInput): string {
  const id = `evaljob_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  queue.push({ id, userId, input })
  void processQueue()
  return id
}

export function getQueueDepth(): number {
  return queue.length
}

async function processQueue(): Promise<void> {
  if (processing) return
  processing = true

  while (queue.length > 0) {
    const job = queue.shift()
    if (!job) break

    try {
      await submitFeynmanEvaluation(job.userId, job.input)
    } catch {
      // Failed jobs are dropped; production would retry via BullMQ dead-letter queue.
    }
  }

  processing = false
}
