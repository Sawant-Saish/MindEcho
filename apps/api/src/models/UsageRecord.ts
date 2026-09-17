import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const usageRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['evaluation', 'stt_minutes'], required: true },
    count: { type: Number, default: 1 },
    date: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

usageRecordSchema.index({ userId: 1, type: 1, date: 1 }, { unique: true })

export type UsageRecordDocument = InferSchemaType<typeof usageRecordSchema> & {
  _id: Types.ObjectId
  createdAt: Date
}

export const UsageRecord = model('UsageRecord', usageRecordSchema)
