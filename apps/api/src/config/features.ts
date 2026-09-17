import { env } from './env.js'

export const features = {
  voiceEval: env.FEATURE_VOICE_EVAL,
  billing: env.FEATURE_BILLING,
} as const

export type FeatureFlags = typeof features
