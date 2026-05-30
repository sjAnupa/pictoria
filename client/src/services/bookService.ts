import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'
import type { ApiBookRecord } from '../types/book.types'

export class BookServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BookServiceError'
  }
}

function messageFromError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return fallback
}

export type BookListParams = {
  page?: number
  limit?: number
  genre?: string
  tag?: string
  featured?: boolean
  isNew?: boolean
  status?: string
}

export type BookListResponse = {
  books: ApiBookRecord[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type ChapterReadPayload = {
  book: { _id: string; slug: string; title: string }
  chapter: {
    _id: string
    chapterNumber: number
    title: string
    pageImageUrls: string[]
    totalPages: number
  }
}

export async function fetchBooks(params: BookListParams = {}): Promise<BookListResponse> {
  try {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 50,
      status: params.status ?? 'published',
    }
    if (params.genre) query.genre = params.genre
    if (params.tag) query.tag = params.tag
    if (params.featured) query.featured = 'true'
    if (params.isNew) query.isNew = 'true'

    const { data } = await api.get<ApiSuccess<BookListResponse>>('/books', { params: query })
    return data.data
  } catch (err) {
    throw new BookServiceError(messageFromError(err, 'Failed to load books.'))
  }
}

export async function fetchBookBySlug(slug: string): Promise<ApiBookRecord> {
  try {
    const { data } = await api.get<ApiSuccess<ApiBookRecord>>(`/books/${slug}`)
    return data.data
  } catch (err) {
    throw new BookServiceError(messageFromError(err, 'Book not found.'))
  }
}

export async function fetchChapterForReading(
  bookId: string,
  chapterNumber: number,
): Promise<ChapterReadPayload> {
  try {
    const { data } = await api.get<ApiSuccess<ChapterReadPayload>>(
      `/chapters/book/${bookId}/chapter/${chapterNumber}`,
    )
    return data.data
  } catch (err) {
    throw new BookServiceError(messageFromError(err, 'Chapter not found.'))
  }
}
