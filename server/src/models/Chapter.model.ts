import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IChapter extends Document {
  bookId: Types.ObjectId
  chapterNumber: number
  title: string
  pageImageUrls: string[]
  /** User-facing labels (original upload names), parallel to pageImageUrls */
  pageImageNames: string[]
  totalPages: number
  highlightUntil?: Date
  createdAt: Date
  updatedAt: Date
}

const ChapterSchema = new Schema<IChapter>(
  {
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    pageImageUrls: { type: [String], default: [] },
    pageImageNames: { type: [String], default: [] },
    totalPages: { type: Number, default: 0 },
    highlightUntil: { type: Date },
  },
  { timestamps: true },
)

ChapterSchema.index({ bookId: 1, chapterNumber: 1 }, { unique: true })

export const Chapter = mongoose.model<IChapter>('Chapter', ChapterSchema)
