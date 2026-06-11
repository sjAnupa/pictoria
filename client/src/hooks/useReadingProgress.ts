import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invalidateReadingProgress, progressQueryKeys } from '../lib/queryClient'
import {
  fetchBookProgress,
  fetchMyLibrary,
  saveReadingProgress,
} from '../services/progressService'
import type { SaveProgressPayload } from '../types/progress.types'
import { resolveMediaUrl } from '../utils/resolveMediaUrl'
import { useAuthStore } from '../store/authStore'

export function useMyReadingLibrary() {
  return useQuery({
    queryKey: progressQueryKeys.me,
    queryFn: async () => {
      const library = await fetchMyLibrary()
      return {
        ...library,
        currentlyReading: library.currentlyReading.map((item) => ({
          ...item,
          coverImageUrl: resolveMediaUrl(item.coverImageUrl),
        })),
        finished: library.finished.map((item) => ({
          ...item,
          coverImageUrl: resolveMediaUrl(item.coverImageUrl),
        })),
      }
    },
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useBookReadingProgress(bookId: string | undefined) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  return useQuery({
    queryKey: bookId ? progressQueryKeys.book(bookId) : ['progress', 'book', 'none'],
    enabled: Boolean(bookId) && isAuthenticated,
    queryFn: () => fetchBookProgress(bookId!),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  })
}

export function useTrackReading() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SaveProgressPayload) => saveReadingProgress(payload),
    onSuccess: (_data, variables) => {
      invalidateReadingProgress(variables.bookId)
      void queryClient.refetchQueries({ queryKey: progressQueryKeys.me })
      void queryClient.refetchQueries({ queryKey: progressQueryKeys.book(variables.bookId) })
    },
  })
}

let pendingProgress: Promise<void> = Promise.resolve()

/** Fire-and-forget progress save — only when signed in. */
export function trackReading(payload: SaveProgressPayload): void {
  if (!useAuthStore.getState().isAuthenticated) return

  pendingProgress = pendingProgress
    .then(() =>
      saveReadingProgress(payload).then(() => {
        invalidateReadingProgress(payload.bookId)
      }),
    )
    .catch(() => {
      /* silent */
    })
}

/** Wait for in-flight progress saves (e.g. before leaving the reader). */
export function flushReadingProgress(): Promise<void> {
  return pendingProgress
}
