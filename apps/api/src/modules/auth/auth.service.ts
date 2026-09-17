import { RefreshToken } from '../../models/RefreshToken.js'
import { User, type UserDocument } from '../../models/User.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { hashPassword, verifyPassword } from '../../shared/utils/password.js'
import {
  generateRefreshToken,
  getRefreshTokenExpiry,
  hashRefreshToken,
  signAccessToken,
} from '../../shared/utils/tokens.js'
import { fromPublicUserId, toPublicUserId } from '../../shared/utils/user-id.js'
import type { AuthResponse, LoginBody, RegisterBody } from './auth.schemas.js'

function serializeUser(user: UserDocument): AuthResponse['user'] {
  return {
    id: toPublicUserId(user._id),
    name: user.name,
    email: user.email,
  }
}

async function issueAuthResponse(user: UserDocument): Promise<AuthResponse> {
  const publicUser = serializeUser(user)
  const token = await signAccessToken({
    sub: publicUser.id,
    email: publicUser.email,
    name: publicUser.name,
  })

  const refreshToken = generateRefreshToken()
  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: getRefreshTokenExpiry(),
  })

  return {
    token,
    refreshToken,
    user: publicUser,
  }
}

export async function registerUser(input: RegisterBody): Promise<AuthResponse> {
  const email = input.email.toLowerCase()
  const existing = await User.findOne({ email })

  if (existing) {
    throw new ApiError(409, 'EMAIL_EXISTS', 'An account with this email already exists')
  }

  const user = await User.create({
    name: input.name.trim(),
    email,
    passwordHash: await hashPassword(input.password),
  })

  return issueAuthResponse(user)
}

export async function loginUser(input: LoginBody): Promise<AuthResponse> {
  const user = await User.findOne({ email: input.email.toLowerCase() })

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  }

  const valid = await verifyPassword(input.password, user.passwordHash)

  if (!valid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password')
  }

  return issueAuthResponse(user)
}

export async function refreshSession(refreshToken: string): Promise<AuthResponse> {
  const tokenHash = hashRefreshToken(refreshToken)
  const stored = await RefreshToken.findOne({
    tokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  })

  if (!stored) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token is invalid or expired')
  }

  const user = await User.findById(stored.userId)

  if (!user) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'User no longer exists')
  }

  stored.revokedAt = new Date()
  await stored.save()

  return issueAuthResponse(user)
}

export async function logoutUser(refreshToken: string): Promise<{ success: true }> {
  const tokenHash = hashRefreshToken(refreshToken)

  await RefreshToken.updateOne(
    { tokenHash, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } },
  )

  return { success: true }
}

export async function getUserByPublicId(publicUserId: string): Promise<AuthResponse['user']> {
  const user = await User.findById(fromPublicUserId(publicUserId))

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return serializeUser(user)
}
