import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Category } from '../models/Category.model'
import { generateSlug } from '../utils/generateSlug'

dotenv.config()

const GENRES = [
  { name: 'Fantasy', icon: '✨', colorPresetId: 'violet' },
  { name: 'Mystery', icon: '🔍', colorPresetId: 'amber' },
  { name: 'Adventure', icon: '⚓', colorPresetId: 'emerald' },
  { name: 'Romance', icon: '🌸', colorPresetId: 'rose' },
  { name: 'Sci-Fi', icon: '🚀', colorPresetId: 'cyan' },
  { name: 'Horror', icon: '👻', colorPresetId: 'slate' },
  { name: 'Thriller', icon: '🎭', colorPresetId: 'indigo' },
  { name: "Children's", icon: '🌟', colorPresetId: 'cyan' },
  { name: 'Humor', icon: '😄', colorPresetId: 'slate' },
  { name: 'Historical', icon: '🏛️', colorPresetId: 'amber' },
] as const

const TAGS = [
  { name: 'Magic', icon: '🏷️', colorPresetId: 'violet' },
  { name: 'Cozy', icon: '🏷️', colorPresetId: 'amber' },
  { name: 'Illustrated', icon: '🏷️', colorPresetId: 'indigo' },
  { name: 'Coming of age', icon: '🏷️', colorPresetId: 'emerald' },
] as const

async function upsertCategory(entry: {
  name: string
  type: 'genre' | 'tag'
  icon?: string
  colorPresetId: string
}) {
  const slug = generateSlug(entry.name)
  await Category.findOneAndUpdate(
    { slug, type: entry.type },
    {
      name: entry.name,
      slug,
      type: entry.type,
      icon: entry.icon,
      colorPresetId: entry.colorPresetId,
      isActive: true,
    },
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
  )
}

async function seedCategories() {
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI is not set')
  }

  await mongoose.connect(uri)
  const dbName = mongoose.connection.db?.databaseName ?? '(unknown)'
  const collectionName = Category.collection.name

  console.log('Connected to MongoDB')
  console.log(`Target: database "${dbName}" → collection "${collectionName}"`)
  console.log('(In Atlas: Browse Collections → open this database → open this collection)')

  for (const genre of GENRES) {
    await upsertCategory({ ...genre, type: 'genre' })
    console.log(`Genre upserted: ${genre.name}`)
  }

  for (const tag of TAGS) {
    await upsertCategory({ ...tag, type: 'tag' })
    console.log(`Tag upserted: ${tag.name}`)
  }

  const counts = await Category.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
  ])
  const total = await Category.countDocuments()
  console.log('Category counts by type:', counts)
  console.log(`Total documents in "${collectionName}": ${total}`)
  console.log('Seed complete')

  await mongoose.disconnect()
}

seedCategories().catch((err) => {
  console.error(err)
  process.exit(1)
})
