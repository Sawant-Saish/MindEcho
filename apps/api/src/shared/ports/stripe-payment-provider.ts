import { ApiError } from '../utils/api-error.js'
import type { CheckoutInput, CheckoutResult, PaymentProvider } from './payment-provider.js'

export class StripePaymentProvider implements PaymentProvider {
  async checkout(_input: CheckoutInput): Promise<CheckoutResult> {
    throw new ApiError(
      501,
      'STRIPE_NOT_CONFIGURED',
      'Stripe payment provider is not configured. Set PAYMENT_PROVIDER=mock for development.',
    )
  }
}
