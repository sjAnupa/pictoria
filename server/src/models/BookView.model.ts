import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IBookView extends Document {
  bookId: Types.ObjectId
  userId?: Types.ObjectId
  anonId?: string
  dateKey: string
  createdAt: Date
}

const BookViewSchema = new Schema<IBookView>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    anonId: { type: String },
    dateKey: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

BookViewSchema.index({ bookId: 1, userId: 1, dateKey: 1 }, { unique: true, sparse: true })
BookViewSchema.index({ bookId: 1, anonId: 1, dateKey: 1 }, { unique: true, sparse: true })

export const BookView = mongoose.model<IBookView>('BookView', BookViewSchema)
