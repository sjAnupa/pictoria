import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteReview,
  fetchBookReviews,
  setReviewHidden,
  submitReview,
} from '../services/reviewService'

export const reviewQueryKeys = {
  book: (bookId: string, page: number) => ['reviews', 'book', bookId, page] as const,
  bookAll: (bookId: string) => ['reviews', 'book', bookId] as const,
}

export function useBookReviews(bookId: string | undefined, page = 1, limit = 10) {
  return useQuery({
    queryKey: bookId ? reviewQueryKeys.book(bookId, page) : ['reviews', 'book', 'none', page],
    enabled: Boolean(bookId),
    queryFn: () => fetchBookReviews(bookId!, page, limit),
    staleTime: 15_000,
  })
}

export function useSubmitReview(bookId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      submitReview(bookId, rating, comment),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueryKeys.bookAll(bookId) })
      void queryClient.invalidateQueries({ queryKey: ['books', 'slug'] })
      void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
  })
}

export function useDeleteReview(bookId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (reviewId: string) => deleteReview(reviewId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueryKeys.bookAll(bookId) })
      void queryClient.invalidateQueries({ queryKey: ['books', 'slug'] })
    },
  })
}

export function useToggleReviewHidden(bookId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ reviewId, hidden }: { reviewId: string; hidden: boolean }) =>
      setReviewHidden(reviewId, hidden),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: reviewQueryKeys.bookAll(bookId) })
      void queryClient.invalidateQueries({ queryKey: ['books', 'slug'] })
    },
  })
}
