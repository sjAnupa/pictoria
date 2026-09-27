import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { paramString } from '../utils/paramString'
import { isCatalogAdmin } from '../middleware/optionalAuth.middleware'
import { upsertReviewSchema } from '../validators/review.validator'
import {
  deleteReview,
  listReviewsForBook,
  setReviewHidden,
  upsertReview,
} from '../services/review.service'

function parseId(res: Response, raw: string, label = 'id'): string | null {
  if (!Types.ObjectId.isValid(raw)) {
    void errorResponse(res, `Invalid ${label}`, 400)
    return null
  }
  return raw
}

export const getBookReviews = async (req: Request, res: Response): Promise<Response> => {
  const bookId = parseId(res, paramString(req.params.bookId), 'book id')
  if (!bookId) return res

  try {
    const result = await listReviewsForBook(bookId, {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      viewerId: req.user ? String(req.user._id) : undefined,
      isAdmin: isCatalogAdmin(req),
    })
    return successResponse(res, result)
  } catch (err) {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
      return errorResponse(res, 'Book not found', 404)
    }
    throw err
  }
}

export const submitReview = async (req: Request, res: Response): Promise<Response> => {
  const bookId = parseId(res, paramString(req.params.bookId), 'book id')
  if (!bookId) return res

  const parsed = upsertReviewSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  try {
    await upsertReview(String(req.user!._id), bookId, parsed.data.rating, parsed.data.comment)
    return successResponse(res, { message: 'Review saved' }, 200, 'Review saved')
  } catch (err) {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
      return errorResponse(res, 'Book not found', 404)
    }
    if (err instanceof Error && err.message === 'REVIEWS_DISABLED') {
      return errorResponse(res, 'Reviews are disabled for this book', 403)
    }
    throw err
  }
}

export const removeReview = async (req: Request, res: Response): Promise<Response> => {
  const reviewId = parseId(res, paramString(req.params.id), 'review id')
  if (!reviewId) return res

  try {
    await deleteReview(reviewId, String(req.user!._id), isCatalogAdmin(req))
    return successResponse(res, { message: 'Review deleted' })
  } catch (err) {
    if (err instanceof Error && err.message === 'REVIEW_NOT_FOUND') {
      return errorResponse(res, 'Review not found', 404)
    }
    if (err instanceof Error && err.message === 'FORBIDDEN') {
      return errorResponse(res, 'You cannot delete this review', 403)
    }
    throw err
  }
}

export const toggleReviewHidden = async (req: Request, res: Response): Promise<Response> => {
  const reviewId = parseId(res, paramString(req.params.id), 'review id')
  if (!reviewId) return res

  const hidden = Boolean(req.body?.hidden)

  try {
    await setReviewHidden(reviewId, hidden, String(req.user!._id))
    return successResponse(res, { message: hidden ? 'Review hidden' : 'Review restored' })
  } catch (err) {
    if (err instanceof Error && err.message === 'REVIEW_NOT_FOUND') {
      return errorResponse(res, 'Review not found', 404)
    }
    throw err
  }
}
