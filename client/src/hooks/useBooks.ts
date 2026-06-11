import { useQuery } from '@tanstack/react-query'
import { fetchBookBySlug, fetchBooks, fetchChapterForReading } from '../services/bookService'
import { useAuthStore } from '../store/authStore'
import { canAccessAdminPortal } from '../utils/authPermissions'
import { mapApiBook, mapApiBooks } from '../utils/mapBook'
import { resolveMediaUrls } from '../utils/resolveMediaUrl'

function useCatalogAdminPreview(): boolean {
  const user = useAuthStore((s) => s.user)
  return canAccessAdminPortal(user)
}

export function usePublishedBooks(limit = 50) {
  const catalogAdminPreview = useCatalogAdminPreview()

  return useQuery({
    queryKey: ['books', 'published', limit, catalogAdminPreview],
    queryFn: async () => {
      const result = await fetchBooks({
        limit,
        status: catalogAdminPreview ? undefined : 'published',
        catalogAdminPreview,
      })
      return mapApiBooks(result.books)
    },
  })
}

export function useFeaturedBooks() {
  const catalogAdminPreview = useCatalogAdminPreview()

  return useQuery({
    queryKey: ['books', 'featured', catalogAdminPreview],
    queryFn: async () => {
      const result = await fetchBooks({
        featured: true,
        limit: 12,
        status: catalogAdminPreview ? undefined : 'published',
        catalogAdminPreview,
      })
      return mapApiBooks(result.books)
    },
  })
}

export function useNewBooks() {
  const catalogAdminPreview = useCatalogAdminPreview()

  return useQuery({
    queryKey: ['books', 'new', catalogAdminPreview],
    queryFn: async () => {
      const result = await fetchBooks({
        isNew: true,
        limit: 12,
        status: catalogAdminPreview ? undefined : 'published',
        catalogAdminPreview,
      })
      return mapApiBooks(result.books)
    },
  })
}

export function useBookBySlug(slug: string | undefined) {
  const catalogAdminPreview = useCatalogAdminPreview()

  return useQuery({
    queryKey: ['books', 'slug', slug, catalogAdminPreview],
    enabled: Boolean(slug),
    queryFn: async () => {
      const raw = await fetchBookBySlug(slug!)
      return mapApiBook(raw)
    },
  })
}

export function useAllPublishedBooksForSimilar() {
  const catalogAdminPreview = useCatalogAdminPreview()

  return useQuery({
    queryKey: ['books', 'published-all', catalogAdminPreview],
    queryFn: async () => {
      const result = await fetchBooks({
        limit: 100,
        status: catalogAdminPreview ? undefined : 'published',
        catalogAdminPreview,
      })
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
