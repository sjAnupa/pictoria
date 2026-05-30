import mongoose, { Document, Schema, Types } from 'mongoose'

export type ReadingAction =
  | 'start_reading'
  | 'continue_reading'
  | 'chapter_opened'
  | 'page_progress'
  | 'book_completed'

export interface IReadingEvent extends Document {
  userId: Types.ObjectId
  bookId: Types.ObjectId
  chapterNumber: number
  pageNumber?: number
  action: ReadingAction
  createdAt: Date
}

const ReadingEventSchema = new Schema<IReadingEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    chapterNumber: { type: Number, required: true },
    pageNumber: { type: Number },
    action: {
      type: String,
      enum: ['start_reading', 'continue_reading', 'chapter_opened', 'page_progress', 'book_completed'],
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

ReadingEventSchema.index({ userId: 1, createdAt: -1 })
ReadingEventSchema.index({ userId: 1, bookId: 1, createdAt: -1 })
ReadingEventSchema.index({ bookId: 1, action: 1, createdAt: -1 })

export const ReadingEvent = mongoose.model<IReadingEvent>('ReadingEvent', ReadingEventSchema)
