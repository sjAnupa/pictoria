import mongoose, { Document, Schema, Types } from 'mongoose'

/** User's "Save" shelf — distinct from chapter/page Bookmark model. */
export interface ISavedBook extends Document {
  userId: Types.ObjectId
  bookId: Types.ObjectId
  savedAt: Date
}

const SavedBookSchema = new Schema<ISavedBook>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    bookId: { type: Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

SavedBookSchema.index({ userId: 1, bookId: 1 }, { unique: true })

export const SavedBook = mongoose.model<ISavedBook>('SavedBook', SavedBookSchema)
