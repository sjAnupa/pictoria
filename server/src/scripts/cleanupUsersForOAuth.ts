/**
 * Removes users and/or reading activity for OAuth migration.
 *
 *   npm run seed:cleanup-users -- --all              # delete ALL users + all reading data
 *   npm run seed:cleanup-users -- --all --dry-run
 *   npm run seed:cleanup-users                       # keep pictoria.library@gmail.com only
 *   npm run seed:cleanup-users -- --email=foo@bar.com
 */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { User } from '../models/User.model'
import { ReadingProgress } from '../models/ReadingProgress.model'
import { ReadingEvent } from '../models/ReadingEvent.model'
import { Bookmark } from '../models/Bookmark.model'
import { BookLike } from '../models/BookLike.model'
import { SavedBook } from '../models/SavedBook.model'

dotenv.config()

const DEFAULT_KEEP_EMAIL = 'pictoria.library@gmail.com'

function parseArgs() {
  const dryRun = process.argv.includes('--dry-run')
  const deleteAll = process.argv.includes('--all')
  const emailArg = process.argv.find((a) => a.startsWith('--email='))
  const keepEmail = deleteAll
    ? null
    : (emailArg?.split('=')[1] ?? DEFAULT_KEEP_EMAIL).toLowerCase().trim()
  return { dryRun, deleteAll, keepEmail }
}

async function cleanupUsers() {
  const { dryRun, deleteAll, keepEmail } = parseArgs()
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  await mongoose.connect(uri)

  if (deleteAll) {
    const users = await User.find().select('_id email name')
    console.log(`Mode: DELETE ALL (${users.length} users)`)
    for (const u of users) {
      console.log(`  - ${u.email} (${u.name})`)
    }

    if (dryRun) {
      const [progressCount, eventCount, bookmarkCount, likeCount, savedCount] = await Promise.all([
        ReadingProgress.countDocuments(),
        ReadingEvent.countDocuments(),
        Bookmark.countDocuments(),
        BookLike.countDocuments(),
        SavedBook.countDocuments(),
      ])
      console.log(
        `\nWould also delete ${progressCount} progress, ${eventCount} events, ${bookmarkCount} bookmarks, ${likeCount} likes, ${savedCount} saved books.`,
      )
      console.log('Dry run — no changes written.')
      await mongoose.disconnect()
      return
    }

    const [progress, events, bookmarks, likes, saved, usersDeleted] = await Promise.all([
      ReadingProgress.deleteMany({}),
      ReadingEvent.deleteMany({}),
      Bookmark.deleteMany({}),
      BookLike.deleteMany({}),
      SavedBook.deleteMany({}),
      User.deleteMany({}),
    ])
    console.log(`\nDeleted ${usersDeleted.deletedCount} users`)
    console.log(`Deleted ${progress.deletedCount} progress records`)
    console.log(`Deleted ${events.deletedCount} reading events`)
    console.log(`Deleted ${bookmarks.deletedCount} bookmarks`)
    console.log(`Deleted ${likes.deletedCount} likes`)
    console.log(`Deleted ${saved.deletedCount} saved books`)
    console.log('\nDatabase is empty of users and reading activity. Sign in with Google to create a fresh account.')
    await mongoose.disconnect()
    return
  }

  const keepUser = keepEmail ? await User.findOne({ email: keepEmail }) : null
  const usersToRemove = await User.find(
    keepUser ? { _id: { $ne: keepUser._id } } : {},
  ).select('_id email name')

  const removeIds = usersToRemove.map((u) => u._id)

  console.log(`Keep account: ${keepEmail}${keepUser ? ` (${keepUser.name})` : ' — not found in DB yet'}`)
  console.log(`Users to remove: ${usersToRemove.length}`)
  for (const u of usersToRemove) {
    console.log(`  - ${u.email} (${u.name})`)
  }

  if (dryRun) {
    console.log('\nDry run — no changes written.')
    await mongoose.disconnect()
    return
  }

  if (removeIds.length > 0) {
    const [progress, events, bookmarks, likes, saved, users] = await Promise.all([
      ReadingProgress.deleteMany({ userId: { $in: removeIds } }),
      ReadingEvent.deleteMany({ userId: { $in: removeIds } }),
      Bookmark.deleteMany({ userId: { $in: removeIds } }),
      BookLike.deleteMany({ userId: { $in: removeIds } }),
      SavedBook.deleteMany({ userId: { $in: removeIds } }),
      User.deleteMany({ _id: { $in: removeIds } }),
    ])
    console.log(`\nDeleted ${users.deletedCount} users`)
    console.log(`Deleted ${progress.deletedCount} progress records`)
    console.log(`Deleted ${events.deletedCount} reading events`)
    console.log(`Deleted ${bookmarks.deletedCount} bookmarks`)
    console.log(`Deleted ${likes.deletedCount} likes`)
    console.log(`Deleted ${saved.deletedCount} saved books`)
  } else {
    console.log('\nNo users to delete.')
  }

  if (keepUser) {
    const keptProgress = await ReadingProgress.countDocuments({ userId: keepUser._id })
    console.log(
      `\nKept user: ${keepUser.email} (${keptProgress} progress rows still on this account).`,
    )
    console.log(
      `Run with --all to wipe reading data too, or: npm run seed:clear-reading`,
    )
  } else if (keepEmail) {
    console.log(
      `\nNo user with email ${keepEmail} exists yet. Sign in with Google to create it.`,
    )
  }

  await mongoose.disconnect()
}

cleanupUsers().catch((err) => {
  console.error(err)
  process.exit(1)
})
