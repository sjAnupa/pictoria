import { Types } from 'mongoose'
import { Chapter, IChapter } from '../models/Chapter.model'
import { Book, IBook } from '../models/Book.model'
import { rewriteLegacyMediaPath } from '../config/mediaPaths'
import { deleteStoredImage, uploadChapterPage } from './storage.service'
import {
  CreateChapterInput,
  PageManifestEntry,
  UpdateChapterInput,
  parsePageManifest,
} from '../validators/chapter.validator'

function padPageIndex(index: number): string {
  return String(index).padStart(3, '0')
}

function basenameFromUrl(url: string): string {
  const segment = url.split('/').pop()?.split('?')[0]
  return segment && segment.length > 0 ? segment : 'page'
}

function resolveDisplayName(
  requested: string | undefined,
  fallback: string,
): string {
  const trimmed = requested?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

function previousDisplayName(
  chapter: IChapter,
  previousUrls: string[],
  matchedUrl: string,
): string {
  const index = previousUrls.indexOf(matchedUrl)
  if (index >= 0 && chapter.pageImageNames?.[index]) {
    return chapter.pageImageNames[index]
  }
  return basenameFromUrl(matchedUrl)
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
  const urls: string[] = []

  for (let i = 0; i < files.length; i += 1) {
    const url = await uploadChapterPage(
      files[i],
      bookSlug,
      chapterNumber,
      `page-${padPageIndex(i + 1)}`,
    )
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

  let pageImageUrls: string[] = []
  let pageImageNames: string[] = []

  const manifest = parsePageManifest(input.pageManifest)
  if (manifest && manifest.length > 0) {
    for (let i = 0; i < manifest.length; i += 1) {
      const entry = manifest[i]
      if (entry.type !== 'new') {
        throw new Error('Invalid page manifest: new chapters only accept new uploads')
      }

      const file = files[entry.fileIndex]
      if (!file) {
        throw new Error('Invalid page manifest: missing upload file')
      }

      const url = await uploadChapterPage(
        file,
        book.slug,
        input.chapterNumber,
        `page-${padPageIndex(i + 1)}`,
      )
      pageImageUrls.push(url)
      pageImageNames.push(
        resolveDisplayName(entry.displayName, file.originalname || basenameFromUrl(url)),
      )
    }
  } else if (files.length) {
    pageImageUrls = await uploadChapterPages(files, book.slug, input.chapterNumber)
    pageImageNames = files.map(
      (file, index) => file.originalname || basenameFromUrl(pageImageUrls[index] ?? ''),
    )
  }

  const highlightUntil = new Date()
  highlightUntil.setDate(highlightUntil.getDate() + 7)

  const chapter = await Chapter.create({
    bookId: book._id,
    chapterNumber: input.chapterNumber,
    title: input.title,
    pageImageUrls,
    pageImageNames,
    totalPages: pageImageUrls.length,
    highlightUntil,
  })

  book.totalChapters += 1
  await book.save()

  return chapter
}

function canonicalStoredUrl(url: string): string {
  return rewriteLegacyMediaPath(url.trim())
}

function resolveExistingPageUrl(previousUrls: string[], requested: string): string | undefined {
  const canon = canonicalStoredUrl(requested)
  return previousUrls.find((url) => canonicalStoredUrl(url) === canon)
}

async function applyPageManifest(
  chapter: IChapter,
  bookSlug: string,
  manifest: PageManifestEntry[],
  files: Express.Multer.File[],
): Promise<void> {
  const previousUrls = [...chapter.pageImageUrls]
  const nextUrls: string[] = []
  const nextNames: string[] = []

  for (let i = 0; i < manifest.length; i += 1) {
    const entry = manifest[i]
    if (entry.type === 'existing') {
      const matched = resolveExistingPageUrl(previousUrls, entry.url)
      if (!matched) {
        throw new Error('Invalid page manifest: unknown existing page')
      }
      nextUrls.push(matched)
      nextNames.push(
        resolveDisplayName(
          entry.displayName,
          previousDisplayName(chapter, previousUrls, matched),
        ),
      )
      continue
    }

    const file = files[entry.fileIndex]
    if (!file) {
      throw new Error('Invalid page manifest: missing upload file')
    }

    const url = await uploadChapterPage(
      file,
      bookSlug,
      chapter.chapterNumber,
      `page-${padPageIndex(i + 1)}`,
    )
    nextUrls.push(url)
    nextNames.push(
      resolveDisplayName(entry.displayName, file.originalname || basenameFromUrl(url)),
    )
  }

  for (const url of previousUrls) {
    if (!nextUrls.includes(url)) {
      await deleteStoredImage(url)
    }
  }

  chapter.pageImageUrls = nextUrls
  chapter.pageImageNames = nextNames
  chapter.totalPages = nextUrls.length
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

  const manifest = parsePageManifest(input.pageManifest)
  if (manifest) {
    await applyPageManifest(chapter, book.slug, manifest, files ?? [])
  } else if (files && files.length > 0) {
    for (const url of chapter.pageImageUrls) {
      await deleteStoredImage(url)
    }
    chapter.pageImageUrls = await uploadChapterPages(files, book.slug, chapter.chapterNumber)
    chapter.pageImageNames = files.map(
      (file, index) => file.originalname || basenameFromUrl(chapter.pageImageUrls[index] ?? ''),
    )
    chapter.totalPages = chapter.pageImageUrls.length
  }

  await chapter.save()
  return chapter
}

export async function deleteChapterRecord(chapter: IChapter) {
  const book = await Book.findById(chapter.bookId)

  for (const url of chapter.pageImageUrls) {
    await deleteStoredImage(url)
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
