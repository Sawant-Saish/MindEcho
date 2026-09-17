import { config as loadDotenv } from 'dotenv'
import { z } from 'zod'

loadDotenv()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3000),
  API_VERSION: z.string().default('0.1.0'),
  MONGODB_URI: z.string().min(1).default('mongodb://localhost:27017/lector'),
  CORS_ORIGINS: z.string().default('http://localhost:43123'),
  JWT_SECRET: z.string().min(8).default('dev-secret-change-in-production'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  S3_ENDPOINT: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().default('lector-audio'),
  S3_REGION: z.string().default('us-east-1'),
  LLM_PROVIDER: z.enum(['mock', 'openai', 'gemini', 'claude']).default('mock'),
  STT_PROVIDER: z.enum(['mock', 'whisper', 'deepgram']).default('mock'),
  PAYMENT_PROVIDER: z.enum(['mock', 'stripe', 'razorpay']).default('mock'),
  FEATURE_VOICE_EVAL: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  FEATURE_BILLING: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  ENABLE_WORKERS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  NOTIFICATION_PROVIDER: z.enum(['mock', 'email']).default('mock'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGINS.split(',').map((o) => o.trim()),
  isDev: parsed.data.NODE_ENV === 'development',
  isProd: parsed.data.NODE_ENV === 'production',
}
