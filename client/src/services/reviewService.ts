import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'
import type { ReviewListResponse } from '../types/review.types'

export class ReviewServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ReviewServiceError'
  }
}

function messageFromError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return fallback
}

export async function fetchBookReviews(
  bookId: string,
  page = 1,
  limit = 10,
): Promise<ReviewListResponse> {
  try {
    const { data } = await api.get<ApiSuccess<ReviewListResponse>>(`/reviews/book/${bookId}`, {
      params: { page, limit },
    })
    return data.data
  } catch (err) {
    throw new ReviewServiceError(messageFromError(err, 'Failed to load reviews.'))
  }
}

export async function submitReview(
  bookId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  try {
    await api.post(`/reviews/book/${bookId}`, { rating, comment })
  } catch (err) {
    throw new ReviewServiceError(messageFromError(err, 'Failed to submit review.'))
  }
}

export async function deleteReview(reviewId: string): Promise<void> {
  try {
    await api.delete(`/reviews/${reviewId}`)
  } catch (err) {
    throw new ReviewServiceError(messageFromError(err, 'Failed to delete review.'))
  }
}

export async function setReviewHidden(reviewId: string, hidden: boolean): Promise<void> {
  try {
    await api.patch(`/reviews/${reviewId}/hide`, { hidden })
  } catch (err) {
    throw new ReviewServiceError(messageFromError(err, 'Failed to update review visibility.'))
  }
}
