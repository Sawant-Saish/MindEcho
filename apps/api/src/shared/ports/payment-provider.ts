export interface CheckoutInput {
  planId: string
  billingCycle: 'monthly' | 'annual'
  paymentToken: string
  userId: string
}

export interface CheckoutResult {
  subscriptionId: string
  status: 'active' | 'trialing'
  currentPeriodEnd: string
}

export interface PaymentProvider {
  checkout(input: CheckoutInput): Promise<CheckoutResult>
}
