import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
})

export const progressQueryKeys = {
  me: ['progress', 'me'] as const,
  book: (bookId: string) => ['progress', 'book', bookId] as const,
}

export const engagementQueryKeys = {
  saved: ['engagement', 'saved'] as const,
  book: (bookId: string) => ['engagement', 'book', bookId] as const,
}

export function invalidateReadingProgress(bookId?: string): void {
  void queryClient.invalidateQueries({ queryKey: progressQueryKeys.me })
  void queryClient.refetchQueries({ queryKey: progressQueryKeys.me, type: 'active' })
  if (bookId) {
    void queryClient.invalidateQueries({ queryKey: progressQueryKeys.book(bookId) })
    void queryClient.refetchQueries({ queryKey: progressQueryKeys.book(bookId), type: 'active' })
  }
}
