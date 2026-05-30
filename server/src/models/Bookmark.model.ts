import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IBookmark extends Document {
  userId: Types.ObjectId
  bookId: Types.ObjectId
  chapterId: Types.ObjectId
  pageNumber: number
  savedAt: Date
}

const BookmarkSchema = new Schema<IBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true },
  pageNumber: { type: Number, required: true },
  savedAt: { type: Date, default: Date.now },
})

export const Bookmark = mongoose.model<IBookmark>('Bookmark', BookmarkSchema)
