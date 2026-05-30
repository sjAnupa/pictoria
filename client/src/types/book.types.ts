export interface Book {
  _id: string
  title: string
  slug: string
  author: string
  description: string
  coverImageUrl: string
  genres: string[]
  tags: string[]
  language: string
  totalChapters: number
  freeChapterLimit: number
  accessType: 'free' | 'registered' | 'premium'
  status: 'draft' | 'published' | 'hidden' | 'archived'
  stats: {
    totalReads: number
    averageRating: number
    totalReviews: number
  }
  createdAt: string
  updatedAt: string
}
