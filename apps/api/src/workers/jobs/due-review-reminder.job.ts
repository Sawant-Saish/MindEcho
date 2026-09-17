import { Note } from '../../models/Note.js'
import { User } from '../../models/User.js'
import { createNotificationProvider } from '../../shared/ports/index.js'
import { toPublicUserId } from '../../shared/utils/user-id.js'
import { createInAppNotification } from '../../modules/notifications/notifications.service.js'

function startOfTodayUtc(referenceDate = new Date()): Date {
  return new Date(
    Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()),
  )
}

function endOfTodayUtc(referenceDate = new Date()): Date {
  const start = startOfTodayUtc(referenceDate)
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1)
}

export interface DueReviewReminderResult {
  usersNotified: number
  notificationsCreated: number
}

export async function runDueReviewReminderJob(
  referenceDate = new Date(),
): Promise<DueReviewReminderResult> {
  const todayEnd = endOfTodayUtc(referenceDate)
  const dueNotes = await Note.find({
    nextReviewDate: { $lte: todayEnd },
  })

  const notesByUser = new Map<string, typeof dueNotes>()

  for (const note of dueNotes) {
    const userKey = note.userId.toString()
    const existing = notesByUser.get(userKey) ?? []
    existing.push(note)
    notesByUser.set(userKey, existing)
  }

  const notifier = createNotificationProvider()
  let usersNotified = 0
  let notificationsCreated = 0

  for (const [userObjectId, notes] of notesByUser.entries()) {
    if (notes.length === 0) continue

    const user = await User.findById(userObjectId)
    if (!user) continue

    const preferences = user.notificationSettings
    if (preferences && !preferences.inAppEnabled && !preferences.emailEnabled) {
      continue
    }

    const publicUserId = toPublicUserId(user._id)
    const title = 'Review due today'
    const firstNote = notes[0]
    const message =
      notes.length === 1 && firstNote
        ? `Your note "${firstNote.title}" is due for review today.`
        : `You have ${notes.length} notes due for review today.`

    if (preferences?.inAppEnabled ?? true) {
      await createInAppNotification({
        userId: user._id,
        type: 'due_review',
        title,
        message,
        metadata: { dueCount: notes.length },
      })
      notificationsCreated += 1
    }

    if (preferences?.emailEnabled ?? false) {
      await notifier.send({
        userId: publicUserId,
        email: user.email,
        title,
        message,
        type: 'due_review',
      })
    }

    usersNotified += 1
  }

  return { usersNotified, notificationsCreated }
}
