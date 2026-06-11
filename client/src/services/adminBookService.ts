import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'
import type { ApiBookRecord } from '../types/book.types'

export type CatalogStats = {
  bookCount: number
  authorCount: number
  readerCount: number
}

export type AdminDashboardStats = {
  totals: {
    books: number
    users: number
    totalReads: number
    activeToday: number
  }
  dailyReads: Array<{ date: string; reads: number }>
  genreDistribution: Array<{ name: string; value: number; color: string }>
  mostReadBooks: Array<{ title: string; reads: number }>
  topReaders: Array<{
    name: string
    initials: string
    books: number
    status: 'Active' | 'Inactive'
  }>
}

export type PageManifestEntry =
  | { type: 'existing'; url: string; displayName?: string }
  | { type: 'new'; fileIndex: number; displayName?: string }

export type AdminChapterRecord = {
  _id: string
  chapterNumber: number
  title: string
  pageImageUrls: string[]
  pageImageNames?: string[]
  pageImagePreviewUrls?: string[]
  totalPages: number
}

export function buildPageManifest(pages: Array<{ kind: 'remote' | 'local'; remoteUrl?: string; file?: File; name: string }>): {
  manifest: PageManifestEntry[]
  files: File[]
} {
  const files: File[] = []
  const manifest: PageManifestEntry[] = pages.map((page) => {
    if (page.kind === 'remote' && page.remoteUrl) {
      return {
        type: 'existing',
        url: page.remoteUrl,
        displayName: page.name,
      }
    }
    if (page.file) {
      const fileIndex = files.length
      files.push(page.file)
      return {
        type: 'new',
        fileIndex,
        displayName: page.name,
      }
    }
    throw new Error('Invalid chapter page entry')
  })
  return { manifest, files }
}

export type AdminBookEditRecord = ApiBookRecord & {
  publisher?: string
  chapters?: AdminChapterRecord[]
}

export type SaveBookInput = {
  title: string
  author: string
  publisher: string
  description: string
  longDescription?: string
  genres: string[]
  tags: string[]
  publicationYear?: number
  pageCount?: number
  accessType: 'free' | 'registered' | 'premium'
  status: 'draft' | 'published' | 'hidden' | 'archived'
  coverFile?: File | null
}

function appendBookFields(fd: FormData, input: SaveBookInput): void {
  fd.append('title', input.title.trim())
  fd.append('author', input.author.trim())
  fd.append('publisher', input.publisher.trim())
  fd.append('description', input.description.trim())
  if (input.longDescription?.trim()) {
    fd.append('longDescription', input.longDescription.trim())
  }
  fd.append('genres', JSON.stringify(input.genres))
  fd.append('tags', JSON.stringify(input.tags))
  fd.append('accessType', input.accessType)
  fd.append('status', input.status)
  if (input.publicationYear) {
    fd.append('publicationYear', String(input.publicationYear))
  }
  if (input.pageCount) {
    fd.append('pageCount', String(input.pageCount))
  }
  if (input.coverFile) {
    fd.append('image', input.coverFile)
  }
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  const { data } = await api.get<ApiSuccess<CatalogStats>>('/books/catalog-stats')
  return data.data
}

export async function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  const { data } = await api.get<ApiSuccess<AdminDashboardStats>>('/admin/dashboard')
  return data.data
}

export async function fetchAdminBooks(): Promise<ApiBookRecord[]> {
  const { data } = await api.get<ApiSuccess<{ books: ApiBookRecord[] }>>('/books', {
    params: { status: 'all', limit: 200, page: 1 },
  })
  return data.data.books
}

export async function fetchBookForEdit(bookId: string): Promise<AdminBookEditRecord> {
  const { data } = await api.get<ApiSuccess<AdminBookEditRecord>>(`/books/manage/${bookId}`)
  return data.data
}

export async function createAdminBook(input: SaveBookInput): Promise<ApiBookRecord> {
  const fd = new FormData()
  appendBookFields(fd, input)
  const { data } = await api.post<ApiSuccess<ApiBookRecord>>('/books', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function updateAdminBook(bookId: string, input: SaveBookInput): Promise<ApiBookRecord> {
  const fd = new FormData()
  appendBookFields(fd, input)
  const { data } = await api.put<ApiSuccess<ApiBookRecord>>(`/books/${bookId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}

export async function createAdminChapter(
  bookId: string,
  chapterNumber: number,
  title: string,
  manifest: PageManifestEntry[],
  pageFiles: File[],
): Promise<void> {
  const fd = new FormData()
  fd.append('bookId', bookId)
  fd.append('chapterNumber', String(chapterNumber))
  fd.append('title', title.trim())
  fd.append('pageManifest', JSON.stringify(manifest))
  pageFiles.forEach((file) => fd.append('pages', file))
  await api.post('/chapters', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function updateAdminChapter(
  chapterId: string,
  input: {
    title?: string
    chapterNumber?: number
    pageManifest?: PageManifestEntry[]
  },
  pageFiles?: File[],
): Promise<void> {
  const fd = new FormData()
  if (input.title !== undefined) fd.append('title', input.title.trim())
  if (input.chapterNumber !== undefined) {
    fd.append('chapterNumber', String(input.chapterNumber))
  }
  if (input.pageManifest) {
    fd.append('pageManifest', JSON.stringify(input.pageManifest))
  }
  pageFiles?.forEach((file) => fd.append('pages', file))
  await api.put(`/chapters/${chapterId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteAdminChapter(chapterId: string): Promise<void> {
  await api.delete(`/chapters/${chapterId}`)
}

export async function updateAdminBookStatus(
  bookId: string,
  status: 'published' | 'draft' | 'hidden' | 'archived',
): Promise<void> {
  await api.put(`/books/${bookId}`, { status })
}

export async function deleteAdminBook(bookId: string): Promise<void> {
  await api.delete(`/books/${bookId}`)
}

export function adminBookErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string; errors?: string[] } | undefined
    if (body?.errors?.length) return body.errors.join('. ')
    if (body?.message) return body.message
  }
  return fallback
}
