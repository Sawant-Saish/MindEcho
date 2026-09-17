import { Types } from 'mongoose'
import { Notification, type NotificationDocument } from '../../models/Notification.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { fromPublicNotifId, toPublicNotifId } from '../../shared/utils/notif-id.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import type { NotificationResponse } from './notifications.schemas.js'

function serializeNotification(notification: NotificationDocument): NotificationResponse {
  return {
    id: toPublicNotifId(notification._id),
    type: notification.type as NotificationResponse['type'],
    title: notification.title,
    message: notification.message,
    read: notification.read,
    createdAt: notification.createdAt.toISOString(),
    ...(notification.metadata ? { metadata: notification.metadata as Record<string, unknown> } : {}),
  }
}

export async function createInAppNotification(input: {
  userId: Types.ObjectId
  type: 'due_review' | 'retention_decay' | 'system'
  title: string
  message: string
  metadata?: Record<string, unknown>
}): Promise<NotificationResponse> {
  const notification = await Notification.create({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    metadata: input.metadata,
  })

  return serializeNotification(notification)
}

export async function listNotifications(publicUserId: string): Promise<NotificationResponse[]> {
  const notifications = await Notification.find({ userId: fromPublicUserId(publicUserId) })
    .sort({ createdAt: -1 })
    .limit(50)

  return notifications.map(serializeNotification)
}

export async function markNotificationRead(
  publicUserId: string,
  notificationId: string,
): Promise<NotificationResponse> {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: fromPublicNotifId(notificationId),
      userId: fromPublicUserId(publicUserId),
    },
    { $set: { read: true } },
    { new: true },
  )

  if (!notification) {
    throw new ApiError(404, 'NOTIFICATION_NOT_FOUND', `Notification with id ${notificationId} not found`)
  }

  return serializeNotification(notification)
}
