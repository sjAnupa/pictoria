import { Types } from 'mongoose'
import { Book, IBook, BookStatus } from '../models/Book.model'
import { Chapter, IChapter } from '../models/Chapter.model'
import { ReadingProgress } from '../models/ReadingProgress.model'
import { Bookmark } from '../models/Bookmark.model'
import { BookLike } from '../models/BookLike.model'
import { SavedBook } from '../models/SavedBook.model'
import { normalizeMediaUrl, normalizeMediaUrls } from '../config/storage'
import { generateSlug } from '../utils/generateSlug'
import { deleteStoredImage, uploadCoverImage } from './storage.service'
import { CreateBookInput, UpdateBookInput, parseStringArray } from '../validators/book.validator'
import {
  evaluateChapterAccess,
  type ChapterAccessViewer,
} from '../utils/chapterAccess'

export interface BookListQuery {
  genre?: string
  tag?: string
  status?: string
  search?: string
  featured?: boolean
  isNew?: boolean
  page?: number
  limit?: number
}

export async function findAllBooks(query: BookListQuery) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? 12))
  const skip = (page - 1) * limit

  const filter: Record<string, unknown> = {}

  if (query.status === 'all') {
    // no status filter — used for admin catalog preview and admin panel
  } else if (query.status) {
    filter.status = query.status as BookStatus
  } else {
    filter.status = 'published'
  }

  if (query.genre) filter.genres = query.genre
  if (query.tag) filter.tags = query.tag
  if (query.featured === true) filter.featured = true
  if (query.isNew === true) filter.newArrival = true
  if (query.search) filter.$text = { $search: query.search }

  const [books, totalCount] = await Promise.all([
    Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Book.countDocuments(filter),
  ])

  return {
    books: books.map((book) => ({
      ...book,
      coverImageUrl: normalizeMediaUrl(book.coverImageUrl),
    })),
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
  }
}

export async function findMostLikedBooks(limit = 12) {
  const books = await Book.find({ status: 'published', 'stats.totalLikes': { $gt: 0 } })
    .sort({ 'stats.totalLikes': -1 })
    .limit(Math.min(50, Math.max(1, limit)))
    .lean()

  return books.map((book) => ({
    ...book,
    coverImageUrl: normalizeMediaUrl(book.coverImageUrl),
  }))
}

export async function findBookBySlug(slug: string, catalogAdminPreview = false) {
  const filter: Record<string, unknown> = { slug }
  if (!catalogAdminPreview) {
    filter.status = 'published'
  }

  const book = await Book.findOne(filter).lean()
  if (!book) return null

  const chapters = await Chapter.find({ bookId: book._id })
    .sort({ chapterNumber: 1 })
    .select('chapterNumber title totalPages')
    .lean()

  return {
    ...book,
    coverImageUrl: normalizeMediaUrl(book.coverImageUrl),
    chapters,
  }
}

export async function findBookForAdminEdit(id: string) {
  if (!Types.ObjectId.isValid(id)) return null

  const book = await Book.findById(id).lean()
  if (!book) return null

  const chapters = await Chapter.find({ bookId: book._id })
    .sort({ chapterNumber: 1 })
    .lean()

  return {
    ...book,
    coverImageUrl: normalizeMediaUrl(book.coverImageUrl),
    chapters: chapters.map((chapter) => ({
      ...chapter,
      pageImagePreviewUrls: normalizeMediaUrls(chapter.pageImageUrls),
    })),
  }
}

export async function findChapterForReading(
  bookId: string,
  chapterNumber: number,
  viewer: ChapterAccessViewer & { catalogAdminPreview?: boolean },
) {
  if (!Types.ObjectId.isValid(bookId)) return null

  const bookFilter: Record<string, unknown> = { _id: bookId }
  if (!viewer.catalogAdminPreview) {
    bookFilter.status = 'published'
  }

  const book = await Book.findOne(bookFilter).lean()
  if (!book) return null

  const chapter = await Chapter.findOne({ bookId: book._id, chapterNumber }).lean()
  if (!chapter) return null

  const access = evaluateChapterAccess(
    { accessType: book.accessType, freeChapterLimit: book.freeChapterLimit },
    chapterNumber,
    viewer,
  )

  if (!access.allowed) {
    return {
      denied: true as const,
      reason: access.reason,
      message: access.message,
      book: {
        _id: book._id,
        slug: book.slug,
        title: book.title,
        accessType: book.accessType,
        freeChapterLimit: book.freeChapterLimit,
      },
    }
  }

  return {
    denied: false as const,
    book: {
      _id: book._id,
      slug: book.slug,
      title: book.title,
      accessType: book.accessType,
      freeChapterLimit: book.freeChapterLimit,
    },
    chapter: {
      ...chapter,
      pageImageUrls: normalizeMediaUrls(chapter.pageImageUrls),
    },
  }
}

export async function findBookById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null
  return Book.findById(id)
}

export async function ensureUniqueSlug(baseTitle: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(baseTitle)
  let counter = 1

  while (true) {
    const filter: Record<string, unknown> = { slug }
    if (excludeId) filter._id = { $ne: excludeId }
    const existing = await Book.findOne(filter)
    if (!existing) return slug
    slug = `${generateSlug(baseTitle)}-${counter}`
    counter += 1
  }
}

export async function createBookRecord(
  input: CreateBookInput,
  coverFile: Express.Multer.File,
  uploadedBy: string,
) {
  const slug = await ensureUniqueSlug(input.title)
  const coverImageUrl = await uploadCoverImage(coverFile, slug)

  const book = await Book.create({
    title: input.title,
    slug,
    author: input.author,
    publisher: input.publisher?.trim() ?? '',
    description: input.description,
    longDescription: input.longDescription,
    coverImageUrl,
    genres: parseStringArray(input.genres),
    tags: parseStringArray(input.tags),
    language: input.language ?? 'English',
    publicationYear: input.publicationYear,
    pageCount: input.pageCount ?? 0,
    freeChapterLimit: input.freeChapterLimit ?? 3,
    accessType: input.accessType ?? 'free',
    status: input.status ?? 'draft',
    featured: input.featured ?? false,
    newArrival: input.newArrival ?? false,
    reviewsEnabled: input.reviewsEnabled ?? true,
    uploadedBy,
  })

  return book
}

export async function updateBookRecord(
  book: IBook,
  input: UpdateBookInput,
  coverFile?: Express.Multer.File,
) {
  if (input.title !== undefined) book.title = input.title
  if (input.author !== undefined) book.author = input.author
  if (input.publisher !== undefined) book.publisher = input.publisher.trim()
  if (input.description !== undefined) book.description = input.description
  if (input.longDescription !== undefined) book.longDescription = input.longDescription
  if (input.language !== undefined) book.language = input.language
  if (input.publicationYear !== undefined) book.publicationYear = input.publicationYear
  if (input.pageCount !== undefined) book.pageCount = input.pageCount
  if (input.freeChapterLimit !== undefined) book.freeChapterLimit = input.freeChapterLimit
  if (input.accessType !== undefined) book.accessType = input.accessType
  if (input.status !== undefined) book.status = input.status
  if (input.genres !== undefined) book.genres = parseStringArray(input.genres)
  if (input.tags !== undefined) book.tags = parseStringArray(input.tags)
  if (input.featured !== undefined) book.featured = input.featured
  if (input.newArrival !== undefined) book.newArrival = input.newArrival
  if (input.reviewsEnabled !== undefined) book.reviewsEnabled = input.reviewsEnabled

  if (input.title) {
    book.slug = await ensureUniqueSlug(input.title, String(book._id))
  }

  if (coverFile) {
    await deleteStoredImage(book.coverImageUrl)
    book.coverImageUrl = await uploadCoverImage(coverFile, book.slug)
  }

  await book.save()
  return book
}

export async function deleteBookRecord(book: IBook) {
  const chapters = await Chapter.find({ bookId: book._id })

  await deleteStoredImage(book.coverImageUrl)
  for (const chapter of chapters) {
    for (const url of chapter.pageImageUrls) {
      await deleteStoredImage(url)
    }
  }

  await Promise.all([
    Chapter.deleteMany({ bookId: book._id }),
    ReadingProgress.deleteMany({ bookId: book._id }),
    Bookmark.deleteMany({ bookId: book._id }),
    BookLike.deleteMany({ bookId: book._id }),
    SavedBook.deleteMany({ bookId: book._id }),
    book.deleteOne(),
  ])
}
