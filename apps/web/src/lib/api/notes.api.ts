import type { NoteItem } from '../../context/NotesContext'
import { api } from './client'

export type CreateNoteInput = Omit<
  NoteItem,
  'id' | 'createdAt' | 'updatedAt' | 'practiceCount' | 'retentionHealth'
>

export type UpdateNoteInput = Partial<
  Pick<
    NoteItem,
    | 'title'
    | 'subject'
    | 'icon'
    | 'content'
    | 'lectorScore'
    | 'practiceCount'
    | 'lastPracticed'
    | 'retentionHealth'
    | 'nextReviewDate'
  >
>

export async function fetchNotes(params?: {
  subject?: string
  search?: string
}): Promise<NoteItem[]> {
  const query = new URLSearchParams()
  if (params?.subject) query.set('subject', params.subject)
  if (params?.search) query.set('search', params.search)
  const suffix = query.toString() ? `?${query.toString()}` : ''
  return api<NoteItem[]>(`/notes${suffix}`)
}

export async function createNote(input: CreateNoteInput): Promise<NoteItem> {
  return api<NoteItem>('/notes', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateNote(id: string, input: UpdateNoteInput): Promise<NoteItem> {
  return api<NoteItem>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteNote(id: string): Promise<{ success: boolean; deletedId: string }> {
  return api<{ success: boolean; deletedId: string }>(`/notes/${id}`, {
    method: 'DELETE',
  })
}
