import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import { Book } from '../models/Book.model'
import { Chapter } from '../models/Chapter.model'
import { User } from '../models/User.model'
import {
  READER_PAGES_PER_CHAPTER,
  SEED_READER_CHAPTER_COUNT,
  SEED_BOOKS,
} from '../seed/books.data'
import { sharedChapterPagesRelativeDir } from '../config/mediaPaths'
import {
  ensureUploadDir,
  generateReaderPagePng,
  saveLocalFileCopy,
  saveRemoteCoverUrl,
} from '../services/storage.service'
import { UPLOADS_ROOT, localMediaPath } from '../config/storage'

dotenv.config()

const SHARED_PAGES_ROOT = 'pages/shared/read-pages'

const CHAPTER_PALETTE: Record<number, { fill: string; stroke: string }> = {
  1: { fill: '#E8D4A8', stroke: '#C9A86A' },
  2: { fill: '#C8D8E8', stroke: '#6B8FA8' },
}

function chapterPagesDir(chapterNumber: number): string {
  return sharedChapterPagesRelativeDir(chapterNumber)
}

/** Resolve one chapter's page URLs from seed assets or generated placeholders. */
async function resolveChapterReaderPages(chapterNumber: number): Promise<string[]> {
  const relativeDir = chapterPagesDir(chapterNumber)
  const clientChapterDir = path.join(
    process.cwd(),
    '..',
    'client',
    'public',
    'read-pages',
    `chapter-${chapterNumber}`,
  )
  const seedChapterDir = path.join(
    process.cwd(),
    'seed-assets',
    'read-pages',
    `chapter-${chapterNumber}`,
  )
  const legacyFlatDir = path.join(process.cwd(), '..', 'client', 'public', 'read-pages')
  const legacySeedFlatDir = path.join(process.cwd(), 'seed-assets', 'read-pages')

  const urls: string[] = []
  const palette = CHAPTER_PALETTE[chapterNumber] ?? CHAPTER_PALETTE[1]

  for (let page = 1; page <= READER_PAGES_PER_CHAPTER; page += 1) {
    const fileName = `${page}.png`
    const relative = `${relativeDir}/${fileName}`
    const absDest = path.join(UPLOADS_ROOT, relative)

    const chapterCandidates = [
      path.join(clientChapterDir, fileName),
      path.join(seedChapterDir, fileName),
    ]

    const legacyPageIndex = (chapterNumber - 1) * READER_PAGES_PER_CHAPTER + page
    const legacyCandidates = [
      path.join(legacyFlatDir, `${legacyPageIndex}.png`),
      path.join(legacySeedFlatDir, `${legacyPageIndex}.png`),
    ]

    let copied = false
    for (const candidate of [...chapterCandidates, ...legacyCandidates]) {
      try {
        await fs.access(candidate)
        await saveLocalFileCopy(candidate, relativeDir, fileName)
        copied = true
        break
      } catch {
        /* try next */
      }
    }

    if (!copied) {
      try {
        await fs.access(absDest)
      } catch {
        await generateReaderPagePng(relativeDir, page, {
          chapterNumber,
          fill: palette.fill,
          stroke: palette.stroke,
        })
      }
    }

    urls.push(localMediaPath(relative))
  }

  return urls
}

async function seedBooks() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  await mongoose.connect(uri)
  const dbName = mongoose.connection.db?.databaseName
  console.log(`Connected to MongoDB (${dbName})`)

  const uploader = await User.findOne().sort({ createdAt: 1 })
  if (!uploader) {
    throw new Error('No users found. Register an account first, then run seed:books.')
  }

  console.log(`Using uploader: ${uploader.email}`)

  const chapterPageSets = new Map<number, string[]>()
  for (let ch = 1; ch <= SEED_READER_CHAPTER_COUNT; ch += 1) {
    await ensureUploadDir(chapterPagesDir(ch))
    const urls = await resolveChapterReaderPages(ch)
    chapterPageSets.set(ch, urls)
    console.log(`Chapter ${ch} pages ready (${urls.length} assets → ${chapterPagesDir(ch)}/)`)
  }

  const fallbackCover = chapterPageSets.get(1)?.[0] ?? ''

  for (const entry of SEED_BOOKS) {
    const seedChapters = entry.chapters.slice(0, SEED_READER_CHAPTER_COUNT)

    let coverImageUrl = ''
    try {
      coverImageUrl = await saveRemoteCoverUrl(entry.coverImageUrl, entry.slug)
    } catch (err) {
      console.warn(`Cover download failed for ${entry.title}, using placeholder:`, err)
      coverImageUrl = fallbackCover
    }

    const book = await Book.findOneAndUpdate(
      { slug: entry.slug },
      {
        title: entry.title,
        slug: entry.slug,
        author: entry.author,
        description: entry.description,
        longDescription: entry.longDescription,
        coverImageUrl,
        genres: [entry.genre],
        tags: entry.tags,
        language: 'English',
        publicationYear: entry.year,
        pageCount: entry.pages,
        totalChapters: seedChapters.length,
        freeChapterLimit: seedChapters.length,
        accessType: entry.accessType,
        status: entry.status,
        featured: Boolean(entry.featured),
        newArrival: Boolean(entry.isNew),
        uploadedBy: uploader._id,
        stats: {
          totalReads: 0,
          averageRating: entry.rating,
          totalReviews: 0,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    )

    await Chapter.deleteMany({ bookId: book!._id })

    for (let i = 0; i < seedChapters.length; i += 1) {
      const chapterNumber = i + 1
      const pageImageUrls = chapterPageSets.get(chapterNumber) ?? []

      await Chapter.create({
        bookId: book!._id,
        chapterNumber,
        title: seedChapters[i],
        pageImageUrls: [...pageImageUrls],
        totalPages: pageImageUrls.length,
      })
    }

    console.log(
      `Book seeded: ${entry.title} (${entry.status}, ${seedChapters.length} test chapters)`,
    )
  }

  const published = await Book.countDocuments({ status: 'published' })
  console.log(`Done. ${published} published books in pictoria.books`)
  console.log(
    `Reader layout: ${SEED_READER_CHAPTER_COUNT} chapters × ${READER_PAGES_PER_CHAPTER} pages under uploads/${SHARED_PAGES_ROOT}/chapter-N/`,
  )
  await mongoose.disconnect()
}

seedBooks().catch((err) => {
  console.error(err)
  process.exit(1)
})
