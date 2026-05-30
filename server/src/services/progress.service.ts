import { Types } from 'mongoose'
import { Book } from '../models/Book.model'
import { Chapter } from '../models/Chapter.model'
import { ReadingEvent, ReadingAction } from '../models/ReadingEvent.model'
import { ReadingProgress, IReadingProgress } from '../models/ReadingProgress.model'
import { normalizeMediaUrl } from '../config/storage'

export type SaveProgressInput = {
  bookId: string
  currentChapter: number
  currentPage: number
  totalPagesInChapter?: number
  action?: ReadingAction
}

export type LibraryBookItem = {
  progressId: string
  bookId: string
  slug: string
  title: string
  author: string
  coverImageUrl: string
  genre: string
  pages: number
  rating: number
  totalChapters: number
  currentChapter: number
  currentPage: number
  currentChapterTitle: string
  chaptersRead: number[]
  startedAt: string
  lastReadAt: string
  completed: boolean
  completedAt?: string
}

export type UserLibraryPayload = {
  currentlyReading: LibraryBookItem[]
  finished: LibraryBookItem[]
  stats: {
    currentlyReadingCount: number
    finishedCount: number
    pagesExplored: number
    totalChaptersRead: number
    topGenre: string | null
    averageRatingRead: number
  }
}

/** Meaningful actions only — page scroll updates progress doc, not the event log. */
const EVENT_LOGGED_ACTIONS = new Set<ReadingAction>([
  'start_reading',
  'continue_reading',
  'chapter_opened',
  'book_completed',
])

function isBookCompleted(
  totalChapters: number,
  currentChapter: number,
): boolean {
  return totalChapters > 0 && currentChapter >= totalChapters
}

async function resolveChapterTitle(bookId: Types.ObjectId, chapterNumber: number): Promise<string> {
  const chapter = await Chapter.findOne({ bookId, chapterNumber }).select('title').lean()
  return chapter?.title ?? `Chapter ${chapterNumber}`
}

async function logReadingEvent(
  userId: Types.ObjectId,
  bookId: Types.ObjectId,
  chapterNumber: number,
  action: ReadingAction,
  pageNumber?: number,
): Promise<void> {
  if (!EVENT_LOGGED_ACTIONS.has(action)) return

  await ReadingEvent.create({
    userId,
    bookId,
    chapterNumber,
    pageNumber,
    action,
  })
}

export async function saveReadingProgress(
  userId: string,
  input: SaveProgressInput,
): Promise<IReadingProgress> {
  const book = await Book.findById(input.bookId).select('totalChapters').lean()
  if (!book) throw new Error('BOOK_NOT_FOUND')

  const existing = await ReadingProgress.findOne({ userId, bookId: input.bookId })
    .select('chaptersRead currentChapter currentChapterTitle completed')
    .lean()

  const action: ReadingAction =
    input.action ??
    (existing
      ? 'page_progress'
      : input.currentChapter === 1 && input.currentPage === 1
        ? 'start_reading'
        : 'chapter_opened')

  const completed = isBookCompleted(book.totalChapters, input.currentChapter)

  const chapterChanged = !existing || existing.currentChapter !== input.currentChapter
  let currentChapterTitle = existing?.currentChapterTitle
  if (chapterChanged) {
    currentChapterTitle = await resolveChapterTitle(
      new Types.ObjectId(input.bookId),
      input.currentChapter,
    )
  }

  const progress = await ReadingProgress.findOneAndUpdate(
    { userId, bookId: input.bookId },
    {
      $set: {
        currentChapter: input.currentChapter,
        currentPage: input.currentPage,
        currentChapterTitle,
        lastReadAt: new Date(),
        completed,
        ...(completed ? { completedAt: new Date() } : { completedAt: null }),
      },
      $addToSet: { chaptersRead: input.currentChapter },
      $setOnInsert: { startedAt: new Date(), userId, bookId: input.bookId },
    },
    { upsert: true, new: true },
  )

  const eventAction: ReadingAction = completed ? 'book_completed' : action
  await logReadingEvent(
    new Types.ObjectId(userId),
    new Types.ObjectId(input.bookId),
    input.currentChapter,
    eventAction,
    input.currentPage,
  )

  if (action === 'start_reading') {
    await Book.updateOne({ _id: input.bookId }, { $inc: { 'stats.totalReads': 1 } })
  }

  return progress!
}

export async function getBookProgress(userId: string, bookId: string) {
  return ReadingProgress.findOne({ userId, bookId }).lean()
}

type ProgressLean = {
  _id: Types.ObjectId
  bookId: Types.ObjectId
  currentChapter: number
  currentPage: number
  currentChapterTitle?: string
  chaptersRead: number[]
  startedAt: Date
  lastReadAt: Date
  completed: boolean
  completedAt?: Date
}

type BookLean = {
  _id: Types.ObjectId
  slug: string
  title: string
  author: string
  coverImageUrl: string
  genres: string[]
  pageCount: number
  totalChapters: number
  stats?: { averageRating?: number }
}

function mapToLibraryItem(progress: ProgressLean, book: BookLean): LibraryBookItem {
  return {
    progressId: String(progress._id),
    bookId: String(book._id),
    slug: book.slug,
    title: book.title,
    author: book.author,
    coverImageUrl: normalizeMediaUrl(book.coverImageUrl),
    genre: book.genres[0] ?? 'General',
    pages: book.pageCount ?? 0,
    rating: book.stats?.averageRating ?? 0,
    totalChapters: book.totalChapters ?? 0,
    currentChapter: progress.currentChapter,
    currentPage: progress.currentPage,
    currentChapterTitle: progress.currentChapterTitle ?? `Chapter ${progress.currentChapter}`,
    chaptersRead: progress.chaptersRead ?? [],
    startedAt: progress.startedAt.toISOString(),
    lastReadAt: progress.lastReadAt.toISOString(),
    completed: Boolean(progress.completed),
    completedAt: progress.completedAt?.toISOString(),
  }
}

function buildLibraryStats(items: LibraryBookItem[], finished: LibraryBookItem[]) {
  const pagesExplored = items.reduce((sum, item) => {
    return sum + item.chaptersRead.length * 4 + item.currentPage
  }, 0)

  const totalChaptersRead = items.reduce((sum, item) => sum + item.chaptersRead.length, 0)

  const genreCounts = finished.reduce<Record<string, number>>((acc, item) => {
    acc[item.genre] = (acc[item.genre] ?? 0) + 1
    return acc
  }, {})
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  const averageRatingRead =
    finished.length > 0 ? finished.reduce((sum, item) => sum + item.rating, 0) / finished.length : 0

  return {
    pagesExplored,
    totalChaptersRead,
    topGenre,
    averageRatingRead,
  }
}

const EMPTY_LIBRARY: UserLibraryPayload = {
  currentlyReading: [],
  finished: [],
  stats: {
    currentlyReadingCount: 0,
    finishedCount: 0,
    pagesExplored: 0,
    totalChaptersRead: 0,
    topGenre: null,
    averageRatingRead: 0,
  },
}

/**
 * Loads the user's library in 2 DB round-trips (progress + books batch).
 * Progress is the source of truth; events are analytics-only.
 */
export async function getUserLibrary(userId: string): Promise<UserLibraryPayload> {
  const records = await ReadingProgress.find({ userId })
    .sort({ lastReadAt: -1 })
    .lean<ProgressLean[]>()

  if (records.length === 0) return EMPTY_LIBRARY

  const bookIds = records.map((r) => r.bookId)
  const books = await Book.find({ _id: { $in: bookIds } })
    .select('slug title author coverImageUrl genres pageCount totalChapters stats')
    .lean<BookLean[]>()

  const bookMap = new Map(books.map((b) => [String(b._id), b]))

  const items: LibraryBookItem[] = []
  for (const progress of records) {
    const book = bookMap.get(String(progress.bookId))
    if (!book) continue
    items.push(mapToLibraryItem(progress, book))
  }

  const finished = items.filter((i) => i.completed)
  const currentlyReading = items.filter((i) => !i.completed)
  const statValues = buildLibraryStats(items, finished)

  return {
    currentlyReading,
    finished,
    stats: {
      currentlyReadingCount: currentlyReading.length,
      finishedCount: finished.length,
      ...statValues,
    },
  }
}
