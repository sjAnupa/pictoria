/**
 * Uploads chapter-page files to R2, rewrites chapter URLs, and deletes those
 * local page files. Book covers stay on disk under uploads/covers/.
 *
 * Run: npm run migrate:r2
 */
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { Book } from '../models/Book.model'
import { Chapter } from '../models/Chapter.model'
import { isR2Configured } from '../config/env'
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from '../config/r2'
import { UPLOADS_ROOT } from '../config/storage'

dotenv.config()

const CONTENT_TYPE: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
}

function publicBase(): string {
  return R2_PUBLIC_URL.replace(/\/$/, '')
}

function toKey(absolutePath: string): string {
  return path.relative(UPLOADS_ROOT, absolutePath).split(path.sep).join('/')
}

/** Reader pages only. Covers under uploads/covers and uploads/books stay local. */
function isPageKey(key: string): boolean {
  return key.startsWith('pages/') || key.startsWith('shared/read-pages/')
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  const files: string[] = []
  for (const entry of entries) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(abs)))
    } else if (entry.isFile()) {
      files.push(abs)
    }
  }
  return files
}

function remapStoredUrl(stored: string, uploadedKeys: Set<string>): string {
  const marker = '/uploads/'
  const index = stored.indexOf(marker)
  if (index === -1) return stored
  const key = stored.slice(index + marker.length).replace(/\\/g, '/').replace(/^\/+/, '')
  if (!uploadedKeys.has(key)) return stored
  return `${publicBase()}/${key}`
}

async function assertCanWrite(): Promise<void> {
  const key = 'healthcheck/pictoriya-r2-write.txt'
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: 'ok',
      ContentType: 'text/plain',
    }),
  )
  await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }))
}

async function uploadFile(absolutePath: string): Promise<string> {
  const key = toKey(absolutePath)
  const body = await fs.readFile(absolutePath)
  const extension = path.extname(absolutePath).toLowerCase()
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: CONTENT_TYPE[extension] ?? 'application/octet-stream',
    }),
  )
  const url = `${publicBase()}/${key}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Public URL failed (${response.status}) for ${url}`)
  }
  return key
}

async function main(): Promise<void> {
  if (!isR2Configured()) {
    throw new Error('R2 is not configured. Set the CLOUDFLARE_* and R2_* values in server/.env.')
  }
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set')
  }

  await assertCanWrite()
  console.log(`R2 write ok (${R2_BUCKET_NAME})`)

  const files = (await listFiles(UPLOADS_ROOT)).filter((file) => isPageKey(toKey(file)))
  if (files.length === 0) {
    console.log('No chapter page files under server/uploads.')
  }

  const uploadedKeys = new Set<string>()
  for (const file of files) {
    const key = await uploadFile(file)
    uploadedKeys.add(key)
    console.log(`uploaded ${key}`)
  }

  for (const prefix of ['covers/', 'books/']) {
    const listed = await r2Client.send(
      new ListObjectsV2Command({ Bucket: R2_BUCKET_NAME, Prefix: prefix }),
    )
    for (const object of listed.Contents ?? []) {
      if (!object.Key) continue
      await r2Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: object.Key }))
      console.log(`removed cover from R2 ${object.Key}`)
    }
  }

  await mongoose.connect(process.env.MONGODB_URI)
  const books = await Book.find().select('slug coverImageUrl')
  let bookUpdates = 0
  for (const book of books) {
    if (!book.coverImageUrl.includes(publicBase())) continue
    const localCover = `/uploads/covers/books/${book.slug}/cover.webp`
    await Book.updateOne({ _id: book._id }, { $set: { coverImageUrl: localCover } })
    bookUpdates += 1
  }

  const chapters = await Chapter.find().select('pageImageUrls')
  let chapterUpdates = 0
  for (const chapter of chapters) {
    const nextUrls = chapter.pageImageUrls.map((url) => remapStoredUrl(url, uploadedKeys))
    const changed = nextUrls.some((url, index) => url !== chapter.pageImageUrls[index])
    if (changed) {
      await Chapter.updateOne({ _id: chapter._id }, { $set: { pageImageUrls: nextUrls } })
      chapterUpdates += 1
    }
  }

  for (const file of files) {
    await fs.unlink(file)
  }

  console.log(
    `Done. ${uploadedKeys.size} page files on R2, ${bookUpdates} covers pointed back to local disk, ${chapterUpdates} chapters updated. Local page copies removed. Covers remain in uploads/covers/.`,
  )
  await mongoose.disconnect()
}

main().catch((error: unknown) => {
  const err = error as { name?: string; Code?: string; message?: string }
  if (err.Code === 'AccessDenied' || err.name === 'AccessDenied') {
    console.error(
      'R2 rejected the upload (Access Denied). Create a new R2 API token with Object Read & Write on this bucket, replace R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY, then run npm run migrate:r2 again.',
    )
  } else {
    console.error(err.message ?? error)
  }
  process.exit(1)
})
