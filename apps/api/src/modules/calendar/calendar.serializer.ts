import type { ImportantDateDocument } from '../../models/ImportantDate.js'
import { toPublicDateId } from '../../shared/utils/date-id.js'
import type { CalendarSettingsResponse, ImportantDateResponse } from './calendar.schemas.js'

interface CalendarSettingsSource {
  studyMode?: 'exam' | 'skill'
  examTargetDate?: Date | null
  examTitle?: string | null
}

function formatDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function serializeCalendarSettings(
  settings: CalendarSettingsSource | undefined | null,
): CalendarSettingsResponse {
  const studyMode = settings?.studyMode ?? 'exam'

  return {
    studyMode,
    ...(settings?.examTargetDate
      ? { examTargetDate: formatDateOnly(settings.examTargetDate) }
      : {}),
    ...(settings?.examTitle ? { examTitle: settings.examTitle } : {}),
  }
}

export function serializeImportantDate(date: ImportantDateDocument): ImportantDateResponse {
  return {
    id: toPublicDateId(date._id),
    title: date.title,
    date: formatDateOnly(date.date),
    subject: date.subject,
    priority: date.priority as ImportantDateResponse['priority'],
    ...(date.description ? { description: date.description } : {}),
  }
}
