import { ImportantDate, type ImportantDateDocument } from '../../models/ImportantDate.js'
import { User } from '../../models/User.js'
import { ApiError } from '../../shared/utils/api-error.js'
import { fromPublicDateId, toPublicDateId } from '../../shared/utils/date-id.js'
import { fromPublicUserId } from '../../shared/utils/user-id.js'
import type {
  CreateImportantDateBody,
  ListImportantDatesQuery,
  UpdateImportantDateBody,
  UpdateSettingsBody,
} from './calendar.schemas.js'
import { serializeCalendarSettings, serializeImportantDate } from './calendar.serializer.js'

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`)
}

function startOfTodayUtc(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

async function findOwnedImportantDate(
  publicUserId: string,
  dateId: string,
): Promise<ImportantDateDocument> {
  const item = await ImportantDate.findOne({
    _id: fromPublicDateId(dateId),
    userId: fromPublicUserId(publicUserId),
  })

  if (!item) {
    throw new ApiError(404, 'IMPORTANT_DATE_NOT_FOUND', `Important date with id ${dateId} not found`)
  }

  return item
}

export async function getCalendarSettings(publicUserId: string) {
  const user = await User.findById(fromPublicUserId(publicUserId))

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return serializeCalendarSettings(user.calendarSettings)
}

export async function updateCalendarSettings(publicUserId: string, input: UpdateSettingsBody) {
  if (input.studyMode === 'exam' && input.examTargetDate) {
    const examDate = parseDateOnly(input.examTargetDate)
    if (examDate < startOfTodayUtc()) {
      throw new ApiError(400, 'EXAM_DATE_INVALID', 'Exam target date must be today or in the future')
    }
  }

  const updates: Record<string, unknown> = {
    'calendarSettings.studyMode': input.studyMode,
  }

  if (input.examTargetDate !== undefined) {
    updates['calendarSettings.examTargetDate'] = input.examTargetDate
      ? parseDateOnly(input.examTargetDate)
      : null
  }

  if (input.examTitle !== undefined) {
    updates['calendarSettings.examTitle'] = input.examTitle || null
  }

  const user = await User.findByIdAndUpdate(
    fromPublicUserId(publicUserId),
    { $set: updates },
    { new: true },
  )

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found')
  }

  return serializeCalendarSettings(user.calendarSettings)
}

export async function listImportantDates(
  publicUserId: string,
  query: ListImportantDatesQuery,
) {
  const filter: Record<string, unknown> = {
    userId: fromPublicUserId(publicUserId),
  }

  if (query.from || query.to) {
    const dateFilter: Record<string, Date> = {}
    if (query.from) dateFilter.$gte = parseDateOnly(query.from)
    if (query.to) dateFilter.$lte = parseDateOnly(query.to)
    filter.date = dateFilter
  }

  const dates = await ImportantDate.find(filter).sort({ date: 1 })
  return dates.map(serializeImportantDate)
}

export async function createImportantDate(
  publicUserId: string,
  input: CreateImportantDateBody,
) {
  const item = await ImportantDate.create({
    userId: fromPublicUserId(publicUserId),
    title: input.title,
    date: parseDateOnly(input.date),
    subject: input.subject,
    priority: input.priority,
    description: input.description,
  })

  return serializeImportantDate(item)
}

export async function updateImportantDate(
  publicUserId: string,
  dateId: string,
  input: UpdateImportantDateBody,
) {
  await findOwnedImportantDate(publicUserId, dateId)

  const updates: Record<string, unknown> = {}
  if (input.title !== undefined) updates.title = input.title
  if (input.date !== undefined) updates.date = parseDateOnly(input.date)
  if (input.subject !== undefined) updates.subject = input.subject
  if (input.priority !== undefined) updates.priority = input.priority
  if (input.description !== undefined) updates.description = input.description

  const item = await ImportantDate.findOneAndUpdate(
    {
      _id: fromPublicDateId(dateId),
      userId: fromPublicUserId(publicUserId),
    },
    { $set: updates },
    { new: true },
  )

  if (!item) {
    throw new ApiError(404, 'IMPORTANT_DATE_NOT_FOUND', `Important date with id ${dateId} not found`)
  }

  return serializeImportantDate(item)
}

export async function deleteImportantDate(publicUserId: string, dateId: string) {
  const result = await ImportantDate.deleteOne({
    _id: fromPublicDateId(dateId),
    userId: fromPublicUserId(publicUserId),
  })

  if (result.deletedCount === 0) {
    throw new ApiError(404, 'IMPORTANT_DATE_NOT_FOUND', `Important date with id ${dateId} not found`)
  }

  return {
    success: true,
    deletedId: toPublicDateId(fromPublicDateId(dateId)),
  }
}
