import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { engagementQueryKeys } from '../lib/queryClient'
import {
  fetchBookEngagement,
  fetchSavedBooks,
  toggleBookLike,
  toggleSavedBook,
} from '../services/engagementService'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'
import { useAuthStore } from '../store/authStore'

export function useBookEngagement(bookId: string | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: bookId ? engagementQueryKeys.book(bookId) : ['engagement', 'book', 'none'],
    enabled: Boolean(bookId) && isAuthenticated,
    queryFn: () => fetchBookEngagement(bookId!),
    staleTime: 30_000,
  })
}

export function useToggleBookLike(bookId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleBookLike(bookId),
    onSuccess: (state) => {
      queryClient.setQueryData(engagementQueryKeys.book(bookId), state)
      void queryClient.invalidateQueries({ queryKey: engagementQueryKeys.saved })
    },
  })
}

export function useToggleSavedBook(bookId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => toggleSavedBook(bookId),
    onSuccess: (state) => {
      queryClient.setQueryData(engagementQueryKeys.book(bookId), state)
      void queryClient.invalidateQueries({ queryKey: engagementQueryKeys.saved })
    },
  })
}

export function useSavedBooks() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: engagementQueryKeys.saved,
    enabled: isAuthenticated,
    queryFn: async () => {
      const items = await fetchSavedBooks()
      return items.map((item) => ({
        ...item,
        coverImageUrl: resolveMediaUrl(item.coverImageUrl),
      }))
    },
    staleTime: 0,
    refetchOnMount: 'always',
  })
}
