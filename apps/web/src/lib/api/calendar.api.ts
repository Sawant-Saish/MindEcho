import type { ImportantDateItem, StudyModeType } from '../../context/NotesContext'
import { api } from './client'

export interface CalendarSettings {
  studyMode: StudyModeType
  examTargetDate?: string
  examTitle?: string
}

export async function fetchCalendarSettings(): Promise<CalendarSettings> {
  return api<CalendarSettings>('/calendar/settings')
}

export async function updateCalendarSettings(
  settings: CalendarSettings,
): Promise<CalendarSettings> {
  return api<CalendarSettings>('/calendar/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  })
}

export async function fetchImportantDates(params?: {
  from?: string
  to?: string
}): Promise<ImportantDateItem[]> {
  const query = new URLSearchParams()
  if (params?.from) query.set('from', params.from)
  if (params?.to) query.set('to', params.to)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return api<ImportantDateItem[]>(`/calendar/important-dates${suffix}`)
}

export type CreateImportantDateInput = Omit<ImportantDateItem, 'id'>

export async function createImportantDate(
  input: CreateImportantDateInput,
): Promise<ImportantDateItem> {
  return api<ImportantDateItem>('/calendar/important-dates', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function deleteImportantDate(
  id: string,
): Promise<{ success: boolean; deletedId: string }> {
  return api<{ success: boolean; deletedId: string }>(`/calendar/important-dates/${id}`, {
    method: 'DELETE',
  })
}
