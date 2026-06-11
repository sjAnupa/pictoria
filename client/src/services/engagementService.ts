import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'
import type { BookEngagementState, ShelfBookItem } from '../types/engagement.types'

export class EngagementServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EngagementServiceError'
  }
}

function messageFromError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return fallback
}

export async function fetchBookEngagement(bookId: string): Promise<BookEngagementState> {
  try {
    const { data } = await api.get<ApiSuccess<BookEngagementState>>(`/engagement/book/${bookId}`)
    return data.data
  } catch (err) {
    throw new EngagementServiceError(messageFromError(err, 'Failed to load book status.'))
  }
}

export async function toggleBookLike(bookId: string): Promise<BookEngagementState> {
  try {
    const { data } = await api.put<ApiSuccess<BookEngagementState>>(`/engagement/book/${bookId}/like`)
    return data.data
  } catch (err) {
    throw new EngagementServiceError(messageFromError(err, 'Failed to update like.'))
  }
}

export async function toggleSavedBook(bookId: string): Promise<BookEngagementState> {
  try {
    const { data } = await api.put<ApiSuccess<BookEngagementState>>(`/engagement/book/${bookId}/save`)
    return data.data
  } catch (err) {
    throw new EngagementServiceError(messageFromError(err, 'Failed to update save.'))
  }
}

export async function fetchSavedBooks(): Promise<ShelfBookItem[]> {
  try {
    const { data } = await api.get<ApiSuccess<ShelfBookItem[]>>('/engagement/me/saved')
    return data.data
  } catch (err) {
    throw new EngagementServiceError(messageFromError(err, 'Failed to load saved books.'))
  }
}
