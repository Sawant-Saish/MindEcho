import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const calendarSettingsSchema = new Schema(
  {
    studyMode: { type: String, enum: ['exam', 'skill'], default: 'exam' },
    examTargetDate: { type: Date },
    examTitle: { type: String },
  },
  { _id: false },
)

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    calendarSettings: {
      type: calendarSettingsSchema,
      default: () => ({ studyMode: 'exam' }),
    },
  },
  { timestamps: true },
)

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const User = model('User', userSchema)
