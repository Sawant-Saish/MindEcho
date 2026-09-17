import { Types } from 'mongoose'

const PREFIX = 'ntf_'

export function toPublicNotifId(id: Types.ObjectId | string): string {
  const raw = typeof id === 'string' ? id : id.toString()
  return raw.startsWith(PREFIX) ? raw : `${PREFIX}${raw}`
}

export function fromPublicNotifId(id: string): Types.ObjectId {
  const raw = id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id
  if (!Types.ObjectId.isValid(raw)) {
    throw new Error(`Invalid notification id: ${id}`)
  }
  return new Types.ObjectId(raw)
}
