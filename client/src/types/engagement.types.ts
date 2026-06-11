export type BookEngagementState = {
  liked: boolean
  saved: boolean
}

export type ShelfBookItem = {
  bookId: string
  slug: string
  title: string
  author: string
  coverImageUrl: string
  genre: string
  pages: number
  rating: number
  savedAt?: string
  likedAt?: string
}
