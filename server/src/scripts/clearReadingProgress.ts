/**
 * Clears reading progress + events for a clean read/finished test run.
 *   npm run seed:clear-reading
 */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { ReadingProgress } from '../models/ReadingProgress.model'
import { ReadingEvent } from '../models/ReadingEvent.model'

dotenv.config()

async function clearReading() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  await mongoose.connect(uri)

  const [progress, events] = await Promise.all([
    ReadingProgress.deleteMany({}),
    ReadingEvent.deleteMany({}),
  ])

  console.log(`Cleared ${progress.deletedCount} progress records and ${events.deletedCount} events.`)
  await mongoose.disconnect()
}

clearReading().catch((err) => {
  console.error(err)
  process.exit(1)
})
