import { z } from 'zod'

export const checkoutBodySchema = z.object({
  planId: z.enum(['starter', 'pro', 'team']),
  billingCycle: z.enum(['monthly', 'annual']),
  paymentToken: z.string().trim().min(1),
})

export type CheckoutBody = z.infer<typeof checkoutBodySchema>

export interface CheckoutResponse {
  subscriptionId: string
  status: 'active' | 'trialing'
  currentPeriodEnd: string
}

export interface PlanResponse {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  dailyEvaluationLimit: number | null
  voiceEnabled: boolean
  examMode: 'basic' | 'full'
}

export interface CurrentSubscriptionResponse {
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
