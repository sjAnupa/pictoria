import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IBookLike extends Document {
  userId: Types.ObjectId
  bookId: Types.ObjectId
  likedAt: Date
}

const BookLikeSchema = new Schema<IBookLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    likedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

BookLikeSchema.index({ userId: 1, bookId: 1 }, { unique: true })

export const BookLike = mongoose.model<IBookLike>('BookLike', BookLikeSchema)
