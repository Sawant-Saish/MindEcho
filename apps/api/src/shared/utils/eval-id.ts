import { Types } from 'mongoose'

const PREFIX = 'eval_'

export function toPublicEvalId(id: Types.ObjectId | string): string {
  const raw = typeof id === 'string' ? id : id.toString()
  return raw.startsWith(PREFIX) ? raw : `${PREFIX}${raw}`
}

export function fromPublicEvalId(id: string): Types.ObjectId {
  const raw = id.startsWith(PREFIX) ? id.slice(PREFIX.length) : id
  if (!Types.ObjectId.isValid(raw)) {
    throw new Error(`Invalid evaluation id: ${id}`)
  }
  return new Types.ObjectId(raw)
}
