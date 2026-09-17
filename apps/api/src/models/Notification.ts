import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['due_review', 'retention_decay', 'system'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
)

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, read: 1 })

export type NotificationDocument = InferSchemaType<typeof notificationSchema> & {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const Notification = model('Notification', notificationSchema)
