import { Types } from 'mongoose'

const PREFIX = 'note_'

export function toPublicNoteId(id: Types.ObjectId | string): string {
  const raw = typeof id === 'string' ? id : id.toString()
  return raw.startsWith(PREFIX) ? raw : `${PREFIX}${raw}`
}

export function fromPublicNoteId(id: string): Types.ObjectId {
  const raw = id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id
  if (!Types.ObjectId.isValid(raw)) {
    throw new Error(`Invalid note id: ${id}`)
  }
  return new Types.ObjectId(raw)
}
