import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'
import type {
  BookProgressRecord,
  SaveProgressPayload,
  UserLibraryPayload,
} from '../types/progress.types'

export class ProgressServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProgressServiceError'
  }
}

function messageFromError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return fallback
}

export async function saveReadingProgress(payload: SaveProgressPayload): Promise<BookProgressRecord> {
  try {
    const { data } = await api.post<ApiSuccess<BookProgressRecord>>('/progress', payload)
    return data.data
  } catch (err) {
    throw new ProgressServiceError(messageFromError(err, 'Failed to save reading progress.'))
  }
}

export async function fetchBookProgress(bookId: string): Promise<BookProgressRecord | null> {
  try {
    const { data } = await api.get<ApiSuccess<BookProgressRecord | Record<string, never>>>(
      `/progress/book/${bookId}`,
    )
    const record = data.data
    if (!record || !('_id' in record)) return null
    return record as BookProgressRecord
  } catch (err) {
    throw new ProgressServiceError(messageFromError(err, 'Failed to load reading progress.'))
  }
}

export async function fetchMyLibrary(): Promise<UserLibraryPayload> {
  try {
    const { data } = await api.get<ApiSuccess<UserLibraryPayload>>('/progress/me')
    return data.data
  } catch (err) {
    throw new ProgressServiceError(messageFromError(err, 'Failed to load your library.'))
  }
}
