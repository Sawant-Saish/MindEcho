import { env } from '../../config/env.js'
import { MockLLMProvider } from './mock-llm-provider.js'
import { MockPaymentProvider } from './mock-payment-provider.js'
import { MockSTTProvider } from './mock-stt-provider.js'
import type { LLMProvider } from './llm-provider.js'
import type { PaymentProvider } from './payment-provider.js'
import type { STTProvider } from './stt-provider.js'

export function createLLMProvider(): LLMProvider {
  switch (env.LLM_PROVIDER) {
    case 'mock':
      return new MockLLMProvider()
    default:
      throw new Error(`LLM provider "${env.LLM_PROVIDER}" not configured yet (Phase 4)`)
  }
}

export function createSTTProvider(): STTProvider {
  switch (env.STT_PROVIDER) {
    case 'mock':
      return new MockSTTProvider()
    default:
      throw new Error(`STT provider "${env.STT_PROVIDER}" not configured yet (Phase 4)`)
  }
}

export function createPaymentProvider(): PaymentProvider {
  switch (env.PAYMENT_PROVIDER) {
    case 'mock':
      return new MockPaymentProvider()
    default:
      throw new Error(`Payment provider "${env.PAYMENT_PROVIDER}" not configured yet (Phase 6)`)
  }
}

export type { LLMProvider, FeynmanEvaluationResult } from './llm-provider.js'
export type { STTProvider } from './stt-provider.js'
export type { PaymentProvider, CheckoutResult } from './payment-provider.js'
