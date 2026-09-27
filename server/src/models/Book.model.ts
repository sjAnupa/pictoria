import mongoose, { Document, Schema, Types } from 'mongoose'

export type BookAccessType = 'free' | 'registered' | 'premium'
export type BookStatus = 'draft' | 'published' | 'hidden' | 'archived'

export interface IBook extends Document {
  title: string
  slug: string
  author: string
  publisher: string
  description: string
  longDescription?: string
  coverImageUrl: string
  genres: string[]
  tags: string[]
  language: string
  publicationYear?: number
  pageCount: number
  totalChapters: number
  freeChapterLimit: number
  accessType: BookAccessType
  status: BookStatus
  featured: boolean
  newArrival: boolean
  reviewsEnabled: boolean
  stats: {
    totalReads: number
    averageRating: number
    totalReviews: number
    totalLikes: number
    totalViews: number
  }
  uploadedBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    author: { type: String, required: true, trim: true },
    publisher: { type: String, required: true, trim: true, default: '' },
    description: { type: String, required: true },
    coverImageUrl: { type: String, required: true },
    genres: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    language: { type: String, default: 'English' },
    publicationYear: { type: Number },
    totalChapters: { type: Number, default: 0 },
    freeChapterLimit: { type: Number, default: 3 },
    accessType: {
      type: String,
      enum: ['free', 'registered', 'premium'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'hidden', 'archived'],
      default: 'draft',
    },
    stats: {
      totalReads: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      totalLikes: { type: Number, default: 0 },
      totalViews: { type: Number, default: 0 },
    },
    longDescription: { type: String },
    pageCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    reviewsEnabled: { type: Boolean, default: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

BookSchema.index({ title: 'text', author: 'text', description: 'text' })

export const Book = mongoose.model<IBook>('Book', BookSchema)
