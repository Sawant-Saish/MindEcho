import { z } from 'zod'

export const registerBodySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginBodySchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

export type RegisterBody = z.infer<typeof registerBodySchema>
export type LoginBody = z.infer<typeof loginBodySchema>
export type RefreshBody = z.infer<typeof refreshBodySchema>
export type LogoutBody = z.infer<typeof logoutBodySchema>

export interface AuthResponseUser {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: AuthResponseUser
}
