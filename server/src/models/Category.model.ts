import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
  name: string
  slug: string
  type: 'genre' | 'tag'
  description?: string
  icon?: string
  colorPresetId?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ['genre', 'tag'], required: true },
    description: { type: String },
    icon: { type: String, trim: true },
    colorPresetId: { type: String, trim: true, default: 'indigo' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Category = mongoose.model<ICategory>('Category', CategorySchema)
