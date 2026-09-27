import { Types } from 'mongoose'
import { Book } from '../models/Book.model'
import { BookLike } from '../models/BookLike.model'
import { SavedBook } from '../models/SavedBook.model'
import { normalizeMediaUrl } from '../config/storage'

export type BookEngagementState = {
  liked: boolean
  saved: boolean
}

export type ShelfBookItem = {
  bookId: string
  slug: string
  title: string
  author: string
  coverImageUrl: string
  genre: string
  pages: number
  rating: number
  savedAt?: string
  likedAt?: string
}

async function assertBookExists(bookId: string): Promise<void> {
  const exists = await Book.exists({ _id: bookId })
  if (!exists) throw new Error('BOOK_NOT_FOUND')
}

export async function getBookEngagement(
  userId: string,
  bookId: string,
): Promise<BookEngagementState> {
  const uid = new Types.ObjectId(userId)
  const bid = new Types.ObjectId(bookId)

  const [liked, saved] = await Promise.all([
    BookLike.exists({ userId: uid, bookId: bid }),
    SavedBook.exists({ userId: uid, bookId: bid }),
  ])

  return { liked: Boolean(liked), saved: Boolean(saved) }
}

export async function toggleBookLike(userId: string, bookId: string): Promise<BookEngagementState> {
  await assertBookExists(bookId)
  const uid = new Types.ObjectId(userId)
  const bid = new Types.ObjectId(bookId)

  const existing = await BookLike.findOne({ userId: uid, bookId: bid })
  if (existing) {
    await existing.deleteOne()
    await Book.updateOne({ _id: bid, 'stats.totalLikes': { $gt: 0 } }, { $inc: { 'stats.totalLikes': -1 } })
  } else {
    await BookLike.create({ userId: uid, bookId: bid })
    await Book.updateOne({ _id: bid }, { $inc: { 'stats.totalLikes': 1 } })
  }

  return getBookEngagement(userId, bookId)
}

export async function toggleSavedBook(userId: string, bookId: string): Promise<BookEngagementState> {
  await assertBookExists(bookId)
  const uid = new Types.ObjectId(userId)
  const bid = new Types.ObjectId(bookId)

  const existing = await SavedBook.findOne({ userId: uid, bookId: bid })
  if (existing) {
    await existing.deleteOne()
  } else {
    await SavedBook.create({ userId: uid, bookId: bid })
  }

  return getBookEngagement(userId, bookId)
}

async function buildShelfItems(
  rows: Array<{ bookId: Types.ObjectId; savedAt?: Date; likedAt?: Date }>,
  dateField: 'savedAt' | 'likedAt',
): Promise<ShelfBookItem[]> {
  if (!rows.length) return []

  const bookIds = rows.map((r) => r.bookId)
  const books = await Book.find({ _id: { $in: bookIds } }).lean()
  const bookMap = new Map(books.map((b) => [String(b._id), b]))

  const items: ShelfBookItem[] = []
  for (const row of rows) {
    const book = bookMap.get(String(row.bookId))
    if (!book) continue
    const date = row[dateField]
    items.push({
      bookId: String(book._id),
      slug: book.slug,
      title: book.title,
      author: book.author,
      coverImageUrl: normalizeMediaUrl(book.coverImageUrl) ?? '',
      genre: book.genres?.[0] ?? 'General',
      pages: book.pageCount ?? 0,
      rating: book.stats?.averageRating ?? 0,
      ...(dateField === 'savedAt'
        ? { savedAt: date?.toISOString() }
        : { likedAt: date?.toISOString() }),
    })
  }
  return items
}

export async function getSavedBooks(userId: string): Promise<ShelfBookItem[]> {
  const uid = new Types.ObjectId(userId)
  const rows = await SavedBook.find({ userId: uid }).sort({ savedAt: -1 }).lean()
  return buildShelfItems(rows, 'savedAt')
}

export async function getLikedBooks(userId: string): Promise<ShelfBookItem[]> {
  const uid = new Types.ObjectId(userId)
  const rows = await BookLike.find({ userId: uid }).sort({ likedAt: -1 }).lean()
  return buildShelfItems(rows, 'likedAt')
}
