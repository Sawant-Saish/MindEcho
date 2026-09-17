import { api } from './client'
import type { NoteItem, PracticeExplanation } from '../../context/NotesContext'

export interface DashboardSummary {
  avgLectorScore: number
  retentionAverage: number
  totalSessionsToday: number
  dueTodayCount: number
  recentExplanations: PracticeExplanation[]
}

export interface RetentionHealthItem {
  noteId: string
  title: string
  subject: string
  retentionHealth: number
  nextReviewDate?: string
}

export interface RetentionHealthResponse {
  average: number
  notes: RetentionHealthItem[]
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return api<DashboardSummary>('/dashboard/summary')
}

export async function fetchDueTodayNotes(): Promise<NoteItem[]> {
  return api<NoteItem[]>('/dashboard/due-today')
}

export async function fetchRetentionHealth(): Promise<RetentionHealthResponse> {
  return api<RetentionHealthResponse>('/dashboard/retention-health')
}

export async function recalculateNoteSchedule(noteId: string): Promise<NoteItem> {
  return api<NoteItem>(`/notes/${noteId}/recalculate`, { method: 'POST' })
}
