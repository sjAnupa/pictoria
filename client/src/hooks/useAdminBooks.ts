import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteAdminBook,
  fetchAdminBooks,
  fetchAdminDashboard,
  fetchCatalogStats,
  updateAdminBookStatus,
} from '../services/adminBookService'
import { mapApiBookToAdminRow, toggleAdminStatusApi } from '../utils/mapAdminBook'
import type { BookStatus } from '../types/book.types'

export function useCatalogStats() {
  return useQuery({
    queryKey: ['catalog', 'stats'],
    queryFn: fetchCatalogStats,
  })
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchAdminDashboard,
  })
}

export function useAdminBooks() {
  return useQuery({
    queryKey: ['admin', 'books'],
    queryFn: async () => {
      const books = await fetchAdminBooks()
      return books.map(mapApiBookToAdminRow)
    },
  })
}

export function useAdminBookMutations() {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    queryClient.invalidateQueries({ queryKey: ['books'] })
  }

  const toggleStatus = useMutation({
    mutationFn: ({ bookId, currentStatus }: { bookId: string; currentStatus: BookStatus }) =>
      updateAdminBookStatus(bookId, toggleAdminStatusApi(currentStatus)),
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: (bookId: string) => deleteAdminBook(bookId),
    onSuccess: invalidate,
  })

  return { toggleStatus, remove }
}

export function useAdminBookCount() {
  const { data } = useAdminBooks()
  return data?.length ?? 0
}
