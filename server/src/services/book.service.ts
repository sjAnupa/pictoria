import { Types } from 'mongoose'
import { Book, IBook, BookStatus } from '../models/Book.model'
import { Chapter, IChapter } from '../models/Chapter.model'
import { ReadingProgress } from '../models/ReadingProgress.model'
import { Bookmark } from '../models/Bookmark.model'
import { generateSlug } from '../utils/generateSlug'
import { deleteImageFromR2, uploadImageToR2 } from './r2.service'
import { CreateBookInput, UpdateBookInput, parseStringArray } from '../validators/book.validator'

export interface BookListQuery {
  genre?: string
  tag?: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export async function findAllBooks(query: BookListQuery) {
  const page = Math.max(1, query.page ?? 1)
  const limit = Math.min(100, Math.max(1, query.limit ?? 12))
  const skip = (page - 1) * limit

  const filter: Record<string, unknown> = {
    status: (query.status ?? 'published') as BookStatus,
  }

  if (query.genre) filter.genres = query.genre
  if (query.tag) filter.tags = query.tag
  if (query.search) filter.$text = { $search: query.search }

  const [books, totalCount] = await Promise.all([
    Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Book.countDocuments(filter),
  ])

  return {
    books,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
  }
}

export async function findBookBySlug(slug: string) {
  return Book.findOne({ slug, status: 'published' }).lean()
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
  const coverImageUrl = await uploadImageToR2(coverFile, `books/${slug}`, 'cover')

  const book = await Book.create({
    title: input.title,
    slug,
    author: input.author,
    description: input.description,
    coverImageUrl,
    genres: parseStringArray(input.genres),
    tags: parseStringArray(input.tags),
    language: input.language ?? 'English',
    publicationYear: input.publicationYear,
    freeChapterLimit: input.freeChapterLimit ?? 3,
    accessType: input.accessType ?? 'free',
    status: input.status ?? 'draft',
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
  if (input.description !== undefined) book.description = input.description
  if (input.language !== undefined) book.language = input.language
  if (input.publicationYear !== undefined) book.publicationYear = input.publicationYear
  if (input.freeChapterLimit !== undefined) book.freeChapterLimit = input.freeChapterLimit
  if (input.accessType !== undefined) book.accessType = input.accessType
  if (input.status !== undefined) book.status = input.status
  if (input.genres !== undefined) book.genres = parseStringArray(input.genres)
  if (input.tags !== undefined) book.tags = parseStringArray(input.tags)

  if (input.title) {
    book.slug = await ensureUniqueSlug(input.title, String(book._id))
  }

  if (coverFile) {
    await deleteImageFromR2(book.coverImageUrl)
    book.coverImageUrl = await uploadImageToR2(coverFile, `books/${book.slug}`, 'cover')
  }

  await book.save()
  return book
}

export async function deleteBookRecord(book: IBook) {
  const chapters = await Chapter.find({ bookId: book._id })

  await deleteImageFromR2(book.coverImageUrl)
  for (const chapter of chapters) {
    for (const url of chapter.pageImageUrls) {
      await deleteImageFromR2(url)
    }
  }

  await Promise.all([
    Chapter.deleteMany({ bookId: book._id }),
    ReadingProgress.deleteMany({ bookId: book._id }),
    Bookmark.deleteMany({ bookId: book._id }),
    book.deleteOne(),
  ])
}
