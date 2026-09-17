import { api } from './client'

export interface AuthUser {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthUser
}

export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function registerRequest(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  return api<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  })
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  })
}

export async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await api<{ user: AuthUser }>('/auth/me')
  return response.user
}
