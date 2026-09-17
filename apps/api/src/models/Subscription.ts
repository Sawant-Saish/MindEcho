import { Schema, model, type InferSchemaType, type Types } from 'mongoose'

const subscriptionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    planId: { type: String, enum: ['starter', 'pro', 'team'], required: true },
    status: {
      type: String,
      enum: ['active', 'canceled', 'past_due', 'trialing'],
      default: 'active',
    },
    billingCycle: { type: String, enum: ['monthly', 'annual'], required: true },
    externalId: { type: String },
    currentPeriodEnd: { type: Date },
  },
  { timestamps: true },
)

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema> & {
  _id: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export const Subscription = model('Subscription', subscriptionSchema)
