import mongoose, { Document, Schema, Types } from 'mongoose'

export interface IReadingProgress extends Document {
  userId: Types.ObjectId
  bookId: Types.ObjectId
  currentChapter: number
  currentPage: number
  chaptersRead: number[]
  startedAt: Date
  lastReadAt: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const ReadingProgressSchema = new Schema<IReadingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
    currentChapter: { type: Number, default: 1 },
    currentPage: { type: Number, default: 1 },
    chaptersRead: { type: [Number], default: [] },
    startedAt: { type: Date, default: Date.now },
    lastReadAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true })

export const ReadingProgress = mongoose.model<IReadingProgress>('ReadingProgress', ReadingProgressSchema)
