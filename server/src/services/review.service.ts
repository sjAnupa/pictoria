import { Types } from 'mongoose'
import { Book } from '../models/Book.model'
import { Review } from '../models/Review.model'
import { User } from '../models/User.model'

export type PublicReview = {
  id: string
  rating: number
  comment: string
  createdAt: Date
  updatedAt: Date
  isHidden: boolean
  isOwn: boolean
  reviewer: {
    name: string
    initials: string
  }
}

export type ReviewListResult = {
  reviewsEnabled: boolean
  averageRating: number
  totalReviews: number
  totalCount: number
  totalPages: number
  currentPage: number
  reviews: PublicReview[]
  myReview: { rating: number; comment: string } | null
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  return name.slice(0, 2).toUpperCase() || '?'
}

async function assertBookExists(bookId: string): Promise<void> {
  const exists = await Book.exists({ _id: bookId })
  if (!exists) throw new Error('BOOK_NOT_FOUND')
}

export async function recomputeBookRatingStats(bookId: string): Promise<void> {
  const agg = await Review.aggregate<{ _id: null; avg: number; count: number }>([
    { $match: { bookId: new Types.ObjectId(bookId), isHidden: false } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ])
  const avg = agg[0]?.avg ?? 0
  const count = agg[0]?.count ?? 0

  await Book.updateOne(
    { _id: bookId },
    { $set: { 'stats.averageRating': Math.round(avg * 10) / 10, 'stats.totalReviews': count } },
  )
}

export async function listReviewsForBook(
  bookId: string,
  opts: { page?: number; limit?: number; viewerId?: string; isAdmin?: boolean },
): Promise<ReviewListResult> {
  const book = await Book.findById(bookId).select('reviewsEnabled stats').lean()
  if (!book) throw new Error('BOOK_NOT_FOUND')

  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(50, Math.max(1, opts.limit ?? 10))
  const skip = (page - 1) * limit

  const filter: Record<string, unknown> = { bookId: new Types.ObjectId(bookId) }
  if (!opts.isAdmin) filter.isHidden = false

  const [rows, totalCount, myReviewDoc] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Review.countDocuments(filter),
    opts.viewerId
      ? Review.findOne({ bookId: new Types.ObjectId(bookId), userId: opts.viewerId }).lean()
      : Promise.resolve(null),
  ])

  const userIds = [...new Set(rows.map((r) => String(r.userId)))]
  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select('name').lean()
    : []
  const userMap = new Map(users.map((u) => [String(u._id), u.name]))

  const reviews: PublicReview[] = rows.map((r) => {
    const name = userMap.get(String(r.userId)) ?? 'Reader'
    return {
      id: String(r._id),
      rating: r.rating,
      comment: r.comment ?? '',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      isHidden: r.isHidden,
      isOwn: opts.viewerId ? String(r.userId) === opts.viewerId : false,
      reviewer: { name, initials: initialsFromName(name) },
    }
  })

  return {
    reviewsEnabled: book.reviewsEnabled !== false,
    averageRating: book.stats?.averageRating ?? 0,
    totalReviews: book.stats?.totalReviews ?? 0,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
    reviews,
    myReview: myReviewDoc ? { rating: myReviewDoc.rating, comment: myReviewDoc.comment ?? '' } : null,
  }
}

export async function upsertReview(
  userId: string,
  bookId: string,
  rating: number,
  comment?: string,
): Promise<void> {
  await assertBookExists(bookId)

  const book = await Book.findById(bookId).select('reviewsEnabled')
  if (book?.reviewsEnabled === false) throw new Error('REVIEWS_DISABLED')

  const trimmedComment = comment?.trim()
  const update: Record<string, unknown> = {
    $set: { rating },
    $setOnInsert: { isHidden: false },
  }
  if (trimmedComment) {
    ;(update.$set as Record<string, unknown>).comment = trimmedComment
  } else {
    update.$unset = { comment: '' }
  }

  await Review.findOneAndUpdate({ bookId, userId }, update, {
    upsert: true,
    setDefaultsOnInsert: true,
  })

  await recomputeBookRatingStats(bookId)
}

export async function deleteReview(
  reviewId: string,
  requesterId: string,
  isAdmin: boolean,
): Promise<void> {
  const review = await Review.findById(reviewId)
  if (!review) throw new Error('REVIEW_NOT_FOUND')
  if (!isAdmin && String(review.userId) !== requesterId) throw new Error('FORBIDDEN')

  const bookId = String(review.bookId)
  await review.deleteOne()
  await recomputeBookRatingStats(bookId)
}

export async function setReviewHidden(
  reviewId: string,
  hidden: boolean,
  adminId: string,
): Promise<void> {
  const review = await Review.findById(reviewId)
  if (!review) throw new Error('REVIEW_NOT_FOUND')

  review.isHidden = hidden
  review.hiddenBy = hidden ? new Types.ObjectId(adminId) : undefined
  review.hiddenAt = hidden ? new Date() : undefined
  await review.save()

  await recomputeBookRatingStats(String(review.bookId))
}
