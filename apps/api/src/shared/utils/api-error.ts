export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly details?: Record<string, unknown>

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export function notImplemented(phase: string, feature: string): ApiError {
  return new ApiError(
    501,
    'NOT_IMPLEMENTED',
    `${feature} is planned for ${phase}. See docs/phases.md.`,
  )
}
