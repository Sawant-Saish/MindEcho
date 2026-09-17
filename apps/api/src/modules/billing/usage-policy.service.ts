import { Subscription, type SubscriptionDocument } from '../../models/Subscription.js'
import { UsageRecord } from '../../models/UsageRecord.js'
import { getPlanDefinition } from '../../config/plans.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'

function startOfTodayUtc(referenceDate = new Date()): Date {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()),
  )
}

export async function getOrCreateSubscription(userId: string): Promise<SubscriptionDocument> {
  const objectId = fromPublicUserId(userId)
  const existing = await Subscription.findOne({ userId: objectId })

  if (existing) {
    return existing
  }

  const periodEnd = new Date()
  periodEnd.setUTCMonth(periodEnd.getUTCMonth() + 1)

  return Subscription.create({
    userId: objectId,
    planId: 'starter',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodEnd: periodEnd,
  })
}

export async function getTodayEvaluationCount(publicUserId: string, referenceDate = new Date()): Promise<number> {
  const record = await UsageRecord.findOne({
    userId: fromPublicUserId(publicUserId),
    type: 'evaluation',
    date: startOfTodayUtc(referenceDate),
  })

  return record?.count ?? 0
}

export async function assertCanEvaluate(publicUserId: string, mode: 'voice' | 'text'): Promise<void> {
  const subscription = await getOrCreateSubscription(publicUserId)

  if (subscription.status === 'canceled' || subscription.status === 'past_due') {
    throw new ApiError(403, 'SUBSCRIPTION_INACTIVE', 'An active subscription is required to run evaluations')
  }

  const plan = getPlanDefinition(subscription.planId)

  if (!plan) {
    throw new ApiError(500, 'INVALID_PLAN', 'Subscription plan configuration is invalid')
  }

  if (mode === 'voice' && !plan.voiceEnabled) {
    throw new ApiError(
      403,
      'VOICE_NOT_INCLUDED',
      'Voice evaluations require a Pro or Team plan. Upgrade to continue.',
    )
  }

  if (plan.dailyEvaluationLimit == null) {
    return
  }

  const usedToday = await getTodayEvaluationCount(publicUserId)

  if (usedToday >= plan.dailyEvaluationLimit) {
    throw new ApiError(429, 'USAGE_LIMIT_EXCEEDED', 'Daily evaluation limit reached for your plan', {
      planId: plan.id,
      dailyLimit: plan.dailyEvaluationLimit,
      usedToday,
    })
  }
}

export async function recordEvaluationUsage(publicUserId: string, referenceDate = new Date()): Promise<void> {
  const date = startOfTodayUtc(referenceDate)

  await UsageRecord.findOneAndUpdate(
    {
      userId: fromPublicUserId(publicUserId),
      type: 'evaluation',
      date,
    },
    { $inc: { count: 1 } },
    { upsert: true, new: true },
  )
}
