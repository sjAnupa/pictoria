import { useQuery } from '@tanstack/react-query'
import { fetchBookBySlug, fetchBooks, fetchChapterForReading } from '../services/bookService'
import { mapApiBook, mapApiBooks } from '../utils/mapBook'
import { resolveMediaUrls } from '../utils/resolveMediaUrl'

export function usePublishedBooks(limit = 50) {
  return useQuery({
    queryKey: ['books', 'published', limit],
    queryFn: async () => {
      const result = await fetchBooks({ limit, status: 'published' })
      return mapApiBooks(result.books)
    },
  })
}

export function useFeaturedBooks() {
  return useQuery({
    queryKey: ['books', 'featured'],
    queryFn: async () => {
      const result = await fetchBooks({ featured: true, limit: 12, status: 'published' })
      return mapApiBooks(result.books)
    },
  })
}

export function useNewBooks() {
  return useQuery({
    queryKey: ['books', 'new'],
    queryFn: async () => {
      const result = await fetchBooks({ isNew: true, limit: 12, status: 'published' })
      return mapApiBooks(result.books)
    },
  })
}

export function useBookBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['books', 'slug', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const raw = await fetchBookBySlug(slug!)
      return mapApiBook(raw)
    },
  })
}

export function useAllPublishedBooksForSimilar() {
  return useQuery({
    queryKey: ['books', 'published-all'],
    queryFn: async () => {
      const result = await fetchBooks({ limit: 100, status: 'published' })
      return mapApiBooks(result.books)
    },
  })
}

export function useChapterReader(bookId: string | undefined, chapterNumber: number) {
  return useQuery({
    queryKey: ['chapters', 'read', bookId, chapterNumber],
    enabled: Boolean(bookId) && chapterNumber > 0,
    queryFn: async () => {
      const payload = await fetchChapterForReading(bookId!, chapterNumber)
      return {
        ...payload,
        chapter: {
          ...payload.chapter,
          pageImageUrls: resolveMediaUrls(payload.chapter.pageImageUrls),
        },
      }
    },
  })
}
