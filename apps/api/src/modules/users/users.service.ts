import { User } from '../../models/User.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import type {
  NotificationSettingsResponse,
  UpdateNotificationSettingsBody,
} from './users.schemas.js'

const DEFAULT_SETTINGS: NotificationSettingsResponse = {
  emailEnabled: false,
  pushEnabled: false,
  inAppEnabled: true,
}

export async function getNotificationSettings(
  publicUserId: string,
): Promise<NotificationSettingsResponse> {
  const user = await User.findById(fromPublicUserId(publicUserId))

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return {
    emailEnabled: user.notificationSettings?.emailEnabled ?? DEFAULT_SETTINGS.emailEnabled,
    pushEnabled: user.notificationSettings?.pushEnabled ?? DEFAULT_SETTINGS.pushEnabled,
    inAppEnabled: user.notificationSettings?.inAppEnabled ?? DEFAULT_SETTINGS.inAppEnabled,
  }
}

export async function updateNotificationSettings(
  publicUserId: string,
  input: UpdateNotificationSettingsBody,
): Promise<NotificationSettingsResponse> {
  const current = await getNotificationSettings(publicUserId)

  const next = {
    emailEnabled: input.emailEnabled ?? current.emailEnabled,
    pushEnabled: input.pushEnabled ?? current.pushEnabled,
    inAppEnabled: input.inAppEnabled ?? current.inAppEnabled,
  }

  const user = await User.findByIdAndUpdate(
    fromPublicUserId(publicUserId),
    { $set: { notificationSettings: next } },
    { new: true },
  )

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return next
}
