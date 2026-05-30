import type { ApiBookRecord, BookStatus } from '../types/book.types'
import { resolveMediaUrl } from './resolveMediaUrl'

const STATUS_LABEL: Record<string, BookStatus> = {
  published: 'Published',
  draft: 'Draft',
  hidden: 'Hidden',
  archived: 'Archived',
}

export type AdminBookRow = {
  id: string
  slug: string
  title: string
  author: string
  coverImageUrl: string
  genre: string
  chapters: number
  status: BookStatus
  accessType: string
  dateAdded: string
}

export function mapApiBookToAdminRow(raw: ApiBookRecord & { createdAt?: string; totalChapters?: number }): AdminBookRow {
  const created = raw.createdAt ? new Date(raw.createdAt) : new Date()
  return {
    id: String(raw._id),
    slug: raw.slug,
    title: raw.title,
    author: raw.author,
    coverImageUrl: resolveMediaUrl(raw.coverImageUrl),
    genre: raw.genres[0] ?? 'General',
    chapters: raw.totalChapters ?? raw.chapters?.length ?? 0,
    status: STATUS_LABEL[raw.status] ?? 'Published',
    accessType: raw.accessType,
    dateAdded: created.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

export function toggleAdminStatusApi(current: BookStatus): 'published' | 'hidden' {
  return current === 'Published' ? 'hidden' : 'published'
}
