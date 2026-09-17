import type { CheckoutInput, CheckoutResult, PaymentProvider } from './payment-provider.js'

export class MockPaymentProvider implements PaymentProvider {
  async checkout(input: CheckoutInput): Promise<CheckoutResult> {
    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + (input.billingCycle === 'annual' ? 12 : 1))

    return {
      subscriptionId: `sub_mock_${input.userId}`,
      status: 'active',
      currentPeriodEnd: periodEnd.toISOString(),
    }
  }
}
