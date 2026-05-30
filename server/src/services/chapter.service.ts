import { Types } from 'mongoose'
import { Chapter, IChapter } from '../models/Chapter.model'
import { Book, IBook } from '../models/Book.model'
import { deleteImageFromR2, uploadImageToR2 } from './r2.service'
import { CreateChapterInput, UpdateChapterInput } from '../validators/chapter.validator'

function padPageIndex(index: number): string {
  return String(index).padStart(3, '0')
}

export async function findChaptersByBookId(bookId: string) {
  if (!Types.ObjectId.isValid(bookId)) return []
  const chapters = await Chapter.find({ bookId }).sort({ chapterNumber: 1 }).lean()
  const now = new Date()

  return chapters.map(({ pageImageUrls, ...chapter }) => ({
    ...chapter,
    isNew: chapter.highlightUntil ? chapter.highlightUntil > now : false,
  }))
}

export async function findChapterById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null
  const chapter = await Chapter.findById(id).lean()
  if (!chapter) return null

  const now = new Date()
  return {
    ...chapter,
    isNew: chapter.highlightUntil ? chapter.highlightUntil > now : false,
  }
}

export async function uploadChapterPages(
  files: Express.Multer.File[],
  bookSlug: string,
  chapterNumber: number,
): Promise<string[]> {
  const folder = `books/${bookSlug}/ch${chapterNumber}`
  const urls: string[] = []

  for (let i = 0; i < files.length; i += 1) {
    const url = await uploadImageToR2(files[i], folder, `page-${padPageIndex(i + 1)}`)
    urls.push(url)
  }

  return urls
}

export async function createChapterRecord(
  input: CreateChapterInput,
  files: Express.Multer.File[],
) {
  const book = await Book.findById(input.bookId)
  if (!book) return null

  const pageImageUrls = files.length
    ? await uploadChapterPages(files, book.slug, input.chapterNumber)
    : []

  const highlightUntil = new Date()
  highlightUntil.setDate(highlightUntil.getDate() + 7)

  const chapter = await Chapter.create({
    bookId: book._id,
    chapterNumber: input.chapterNumber,
    title: input.title,
    pageImageUrls,
    totalPages: pageImageUrls.length,
    highlightUntil,
  })

  book.totalChapters += 1
  await book.save()

  return chapter
}

export async function updateChapterRecord(
  chapter: IChapter,
  input: UpdateChapterInput,
  files?: Express.Multer.File[],
) {
  const book = await Book.findById(chapter.bookId)
  if (!book) return null

  if (input.title !== undefined) chapter.title = input.title
  if (input.chapterNumber !== undefined) chapter.chapterNumber = input.chapterNumber
  if (input.highlightUntil !== undefined) chapter.highlightUntil = input.highlightUntil

  if (files && files.length > 0) {
    for (const url of chapter.pageImageUrls) {
      await deleteImageFromR2(url)
    }
    chapter.pageImageUrls = await uploadChapterPages(files, book.slug, chapter.chapterNumber)
    chapter.totalPages = chapter.pageImageUrls.length
  }

  await chapter.save()
  return chapter
}

export async function deleteChapterRecord(chapter: IChapter) {
  const book = await Book.findById(chapter.bookId)

  for (const url of chapter.pageImageUrls) {
    await deleteImageFromR2(url)
  }

  await chapter.deleteOne()

  if (book && book.totalChapters > 0) {
    book.totalChapters -= 1
    await book.save()
  }
}

export async function findChapterDocumentById(id: string) {
  if (!Types.ObjectId.isValid(id)) return null
  return Chapter.findById(id)
}
