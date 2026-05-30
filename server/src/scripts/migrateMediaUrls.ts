/**
 * One-time fix: normalize media URLs in Atlas (absolute → relative, legacy paths → new layout).
 * Safe to re-run. Does not touch R2 URLs.
 *
 *   npm run migrate:media
 *
 * New layout:
 *   /uploads/covers/books/{slug}/cover.webp
 *   /uploads/pages/books/{slug}/chapters/{n}/...
 *   /uploads/pages/shared/read-pages/chapter-{n}/...
 */
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Book } from '../models/Book.model'
import { Chapter } from '../models/Chapter.model'
import { normalizeMediaUrl } from '../config/storage'

dotenv.config()

async function migrate() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  await mongoose.connect(uri)

  let booksUpdated = 0
  for (const book of await Book.find()) {
    const next = normalizeMediaUrl(book.coverImageUrl)
    if (next !== book.coverImageUrl) {
      book.coverImageUrl = next
      await book.save()
      booksUpdated += 1
    }
  }

  let chaptersUpdated = 0
  for (const chapter of await Chapter.find()) {
    const nextUrls = chapter.pageImageUrls.map((u) => normalizeMediaUrl(u))
    const changed = nextUrls.some((u, i) => u !== chapter.pageImageUrls[i])
    if (changed) {
      chapter.pageImageUrls = nextUrls
      await chapter.save()
      chaptersUpdated += 1
    }
  }

  console.log(`Done. Updated ${booksUpdated} books, ${chaptersUpdated} chapters.`)
  await mongoose.disconnect()
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
