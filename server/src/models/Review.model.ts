import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IReview extends Document {
  bookId: Types.ObjectId
  userId: Types.ObjectId
  rating: number
  comment?: string
  isHidden: boolean
  hiddenBy?: Types.ObjectId
  hiddenAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
    isHidden: { type: Boolean, default: false },
    hiddenBy: { type: Schema.Types.ObjectId, ref: 'User' },
    hiddenAt: { type: Date },
  },
  { timestamps: true },
)

ReviewSchema.index({ bookId: 1, userId: 1 }, { unique: true })
ReviewSchema.index({ bookId: 1, isHidden: 1, createdAt: -1 })

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
