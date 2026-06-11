import type { ApiBookRecord, Book, BookStatus } from '../types/book.types'
import { resolveMediaUrl } from './resolveMediaUrl'

const STATUS_LABEL: Record<string, BookStatus> = {
  published: 'Published',
  draft: 'Draft',
  hidden: 'Hidden',
  archived: 'Archived',
}

export function mapApiBook(raw: ApiBookRecord): Book {
  const chaptersFromApi = raw.chapters?.map((c) => c.title) ?? []

  return {
    id: String(raw._id),
    slug: raw.slug,
    title: raw.title,
    author: raw.author,
    publisher: raw.publisher,
    genre: raw.genres[0] ?? 'General',
    genres: raw.genres ?? [],
    coverImage: resolveMediaUrl(raw.coverImageUrl),
    description: raw.description,
    longDescription: raw.longDescription ?? raw.description,
    rating: raw.stats?.averageRating ?? 0,
    pages: raw.pageCount ?? 0,
    year: raw.publicationYear ?? new Date().getFullYear(),
    tags: raw.tags ?? [],
    chapters: chaptersFromApi,
    status: STATUS_LABEL[raw.status] ?? 'Published',
    accessType: raw.accessType,
    freeChapterLimit: raw.freeChapterLimit ?? 3,
    featured: Boolean(raw.featured),
    isNew: Boolean(raw.newArrival),
  }
}

export function mapApiBooks(records: ApiBookRecord[]): Book[] {
  return records.map(mapApiBook)
}
