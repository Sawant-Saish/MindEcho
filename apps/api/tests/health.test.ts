import { describe, expect, it } from 'vitest'
import { env } from '../src/config/env.js'

describe('Phase 0 config', () => {
  it('loads API version from env schema', () => {
    expect(env.API_VERSION).toBeTruthy()
    expect(env.PORT).toBeGreaterThan(0)
  })
})
