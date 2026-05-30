import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { isR2Configured } from '../config/env'
import { R2_PUBLIC_URL } from '../config/r2'
import {
  bookCoverRelativeDir,
  bookChapterPagesRelativeDir,
} from '../config/mediaPaths'
import { UPLOADS_ROOT, localMediaPath } from '../config/storage'
import {
  deleteImageFromR2,
  isR2MediaUrl,
  uploadImageToR2,
} from './r2.service'

export type PageStorageBackend = 'local' | 'r2'

export function getPageStorageBackend(): PageStorageBackend {
  return isR2Configured() ? 'r2' : 'local'
}

/** Covers are always served from this server's disk. */
export function getCoverStorageBackend(): 'local' {
  return 'local'
}

/** @deprecated use getPageStorageBackend / getCoverStorageBackend */
export function getActiveStorageBackend(): PageStorageBackend {
  return getPageStorageBackend()
}

function localAbsolutePath(relativePath: string): string {
  return path.join(UPLOADS_ROOT, relativePath)
}

export async function ensureUploadDir(relativeDir: string): Promise<string> {
  const abs = localAbsolutePath(relativeDir)
  await fs.mkdir(abs, { recursive: true })
  return abs
}

export async function saveLocalImageBuffer(
  buffer: Buffer,
  relativeDir: string,
  filename: string,
  extension = 'webp',
): Promise<string> {
  const dir = await ensureUploadDir(relativeDir)
  const fileName = extension === 'webp' ? `${filename}.webp` : `${filename}.${extension}`
  const abs = path.join(dir, fileName)

  const body =
    extension === 'webp' ? await sharp(buffer).webp({ quality: 85 }).toBuffer() : buffer

  await fs.writeFile(abs, body)
  return localMediaPath(`${relativeDir}/${fileName}`)
}

export async function saveLocalFileCopy(
  sourcePath: string,
  relativeDir: string,
  filename: string,
): Promise<string> {
  const dir = await ensureUploadDir(relativeDir)
  const abs = path.join(dir, filename)
  await fs.copyFile(sourcePath, abs)
  return localMediaPath(`${relativeDir}/${filename}`)
}

export async function deleteLocalByStoredUrl(storedUrl: string): Promise<void> {
  const marker = '/uploads/'
  const idx = storedUrl.indexOf(marker)
  if (idx === -1) return

  const relative = storedUrl.slice(idx + marker.length)
  const abs = localAbsolutePath(relative)
  try {
    await fs.unlink(abs)
  } catch {
    /* ignore */
  }
}

/**
 * Book cover — always on the app server at `uploads/covers/books/{slug}/cover.webp`.
 * Never uploaded to R2 (high reuse across home, library, cards, account).
 */
export async function uploadCoverImage(
  file: Express.Multer.File,
  bookSlug: string,
): Promise<string> {
  return saveLocalImageBuffer(file.buffer, bookCoverRelativeDir(bookSlug), 'cover')
}

/** Download a remote URL into the local covers directory (seed / import). */
export async function saveRemoteCoverUrl(imageUrl: string, bookSlug: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Failed to download cover: ${imageUrl}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  return saveLocalImageBuffer(buffer, bookCoverRelativeDir(bookSlug), 'cover')
}

/**
 * Single illustrated chapter page.
 * Local: `uploads/pages/books/{slug}/chapters/{n}/page-001.webp`
 * R2 (when configured): same key shape under the bucket public URL.
 */
export async function uploadChapterPage(
  file: Express.Multer.File,
  bookSlug: string,
  chapterNumber: number,
  pageFilename: string,
): Promise<string> {
  const relativeDir = bookChapterPagesRelativeDir(bookSlug, chapterNumber)

  if (isR2Configured()) {
    try {
      return await uploadImageToR2(file, relativeDir, pageFilename)
    } catch (error) {
      console.warn('[storage] R2 chapter page upload failed, using local:', error)
    }
  }

  return saveLocalImageBuffer(file.buffer, relativeDir, pageFilename)
}

export async function deleteStoredImage(imageUrl: string): Promise<void> {
  if (!imageUrl) return

  if (isR2MediaUrl(imageUrl)) {
    await deleteImageFromR2(imageUrl)
    return
  }

  if (imageUrl.includes('/uploads/')) {
    await deleteLocalByStoredUrl(imageUrl)
  }
}

/** Placeholder reader pages for seed/demo — local only. */
export async function generateReaderPagePng(
  relativeDir: string,
  pageNumber: number,
  options?: { chapterNumber?: number; fill?: string; stroke?: string },
): Promise<string> {
  const dir = await ensureUploadDir(relativeDir)
  const fileName = `${pageNumber}.png`
  const abs = path.join(dir, fileName)

  const chapterNum = options?.chapterNumber ?? 1
  const fill = options?.fill ?? '#E8D4A8'
  const stroke = options?.stroke ?? '#C9A86A'
  const panelFill = chapterNum === 1 ? '#FEF8EE' : '#F0F5FE'

  const svg = `
    <svg width="720" height="960" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${fill}"/>
      <rect x="40" y="40" width="640" height="880" fill="${panelFill}" stroke="${stroke}" stroke-width="2"/>
      <text x="360" y="420" font-family="Georgia, serif" font-size="36" fill="#6B4226" text-anchor="middle">Chapter ${chapterNum}</text>
      <text x="360" y="500" font-family="Georgia, serif" font-size="48" fill="#3D2314" text-anchor="middle">Page ${pageNumber}</text>
    </svg>`

  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer()
  await fs.writeFile(abs, pngBuffer)

  return localMediaPath(`${relativeDir}/${fileName}`)
}

export { R2_PUBLIC_URL }
