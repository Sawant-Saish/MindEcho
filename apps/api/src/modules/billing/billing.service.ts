import { Subscription } from '../../models/Subscription.js'
import { PLAN_DEFINITIONS, getPlanDefinition } from '../../config/plans.js'
import { createPaymentProvider } from '../../shared/ports/index.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { toPublicSubId } from '../../shared/utils/sub-id.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import type {
  CheckoutBody,
  CheckoutResponse,
  CurrentSubscriptionResponse,
  PlanResponse,
} from './billing.schemas.js'
import {
  getOrCreateSubscription,
  getTodayEvaluationCount,
} from './usage-policy.service.js'

export async function listPlans(): Promise<PlanResponse[]> {
  return Object.values(PLAN_DEFINITIONS)
}

export async function getCurrentSubscription(
  publicUserId: string,
): Promise<CurrentSubscriptionResponse> {
  const subscription = await getOrCreateSubscription(publicUserId)
  const plan = getPlanDefinition(subscription.planId)
  const evaluationsToday = await getTodayEvaluationCount(publicUserId)

  return {
    subscriptionId: toPublicSubId(subscription._id),
    planId: subscription.planId,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    ...(subscription.currentPeriodEnd
      ? { currentPeriodEnd: subscription.currentPeriodEnd.toISOString() }
      : {}),
    usage: {
      evaluationsToday,
      dailyLimit: plan?.dailyEvaluationLimit ?? null,
    },
  }
}

export async function checkout(
  publicUserId: string,
  input: CheckoutBody,
): Promise<CheckoutResponse> {
  const plan = getPlanDefinition(input.planId)

  if (!plan) {
    throw new ApiError(400, 'INVALID_PLAN', `Unknown plan id: ${input.planId}`)
  }

  const payment = createPaymentProvider()
  const result = await payment.checkout({
    planId: input.planId,
    billingCycle: input.billingCycle,
    paymentToken: input.paymentToken,
    userId: publicUserId,
  })

  const subscription = await Subscription.findOneAndUpdate(
    { userId: fromPublicUserId(publicUserId) },
    {
      $set: {
        planId: input.planId,
        status: result.status,
        billingCycle: input.billingCycle,
        externalId: result.subscriptionId,
        currentPeriodEnd: new Date(result.currentPeriodEnd),
      },
    },
    { upsert: true, new: true },
  )

  if (!subscription) {
    throw new ApiError(500, 'SUBSCRIPTION_UPDATE_FAILED', 'Failed to update subscription')
  }

  return {
    subscriptionId: toPublicSubId(subscription._id),
    status: result.status,
    currentPeriodEnd: result.currentPeriodEnd,
  }
}

export async function cancelSubscription(publicUserId: string): Promise<{ success: true }> {
  const subscription = await Subscription.findOneAndUpdate(
    { userId: fromPublicUserId(publicUserId) },
    { $set: { status: 'canceled' } },
    { new: true },
  )

  if (!subscription) {
    throw new ApiError(404, 'SUBSCRIPTION_NOT_FOUND', 'No subscription found for this user')
  }

  return { success: true }
}

export async function createStarterSubscription(publicUserId: string): Promise<void> {
  await getOrCreateSubscription(publicUserId)
}

export async function handleStripeWebhook(event: {
  type: string
  data?: {
    subscriptionId?: string
    status?: 'active' | 'canceled' | 'past_due' | 'trialing'
    currentPeriodEnd?: string
  }
}): Promise<void> {
  if (!event.data?.subscriptionId) {
    return
  }

  const updates: Record<string, unknown> = {}

  if (event.data.status) {
    updates.status = event.data.status
  }

  if (event.data.currentPeriodEnd) {
    updates.currentPeriodEnd = new Date(event.data.currentPeriodEnd)
  }

  if (Object.keys(updates).length === 0) {
    return
  }

  await Subscription.findOneAndUpdate({ externalId: event.data.subscriptionId }, { $set: updates })
}
