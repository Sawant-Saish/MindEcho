import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const importantDateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    subject: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    description: { type: String, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

importantDateSchema.index({ userId: 1, date: 1 })

export type ImportantDateDocument = InferSchemaType<typeof importantDateSchema> & {
  _id: Types.ObjectId
  createdAt: Date
}

export const ImportantDate = model('ImportantDate', importantDateSchema)
