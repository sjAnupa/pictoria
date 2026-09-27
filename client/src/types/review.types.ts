export type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  updatedAt: string
  isHidden: boolean
  isOwn: boolean
  reviewer: {
    name: string
    initials: string
  }
}

export type ReviewListResponse = {
  reviewsEnabled: boolean
  averageRating: number
  totalReviews: number
  totalCount: number
  totalPages: number
  currentPage: number
  reviews: Review[]
  myReview: { rating: number; comment: string } | null
}
