const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('memoroute_token')

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      typeof data?.error?.message === 'string'
        ? data.error.message
        : 'Request failed'
    const code = typeof data?.error?.code === 'string' ? data.error.code : 'API_ERROR'
    throw new ApiError(response.status, code, message)
  }

  return data as T
}

export const useApi = import.meta.env.VITE_USE_API === 'true'
