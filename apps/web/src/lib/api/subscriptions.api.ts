import { api } from './client'

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  dailyEvaluationLimit: number | null
  voiceEnabled: boolean
  examMode: 'basic' | 'full'
}

export interface CheckoutResponse {
  subscriptionId: string
  status: 'active' | 'trialing'
  currentPeriodEnd: string
}

export interface CurrentSubscription {
  subscriptionId: string
  planId: string
  status: string
  billingCycle: 'monthly' | 'annual'
  currentPeriodEnd?: string
  usage: {
    evaluationsToday: number
    dailyLimit: number | null
  }
}

export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  return api<SubscriptionPlan[]>('/subscriptions/plans')
}

export async function fetchCurrentSubscription(): Promise<CurrentSubscription> {
  return api<CurrentSubscription>('/subscriptions/current')
}

export async function checkoutSubscription(input: {
  planId: string
  billingCycle: 'monthly' | 'annual'
  paymentToken: string
}): Promise<CheckoutResponse> {
  return api<CheckoutResponse>('/subscriptions/checkout', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function cancelSubscription(): Promise<{ success: true }> {
  return api<{ success: true }>('/subscriptions/cancel', { method: 'POST' })
}
