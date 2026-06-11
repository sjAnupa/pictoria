export type BookStatus = 'Published' | 'Draft' | 'Hidden' | 'Archived'

export type BookAccessType = 'free' | 'registered' | 'premium'

export interface Book {
  id: string
  slug: string
  title: string
  author: string
  publisher?: string
  genre: string
  genres: string[]
  coverImage: string
  description: string
  longDescription: string
  rating: number
  pages: number
  year: number
  tags: string[]
  chapters: string[]
  status: BookStatus
  accessType: BookAccessType
  freeChapterLimit?: number
  featured?: boolean
  isNew?: boolean
}

export interface BookChapterMeta {
  chapterNumber: number
  title: string
  totalPages: number
}

export type ApiBookRecord = {
  _id: string
  slug: string
  title: string
  author: string
  publisher?: string
  description: string
  longDescription?: string
  coverImageUrl: string
  genres: string[]
  tags: string[]
  publicationYear?: number
  pageCount?: number
  accessType: BookAccessType
  freeChapterLimit?: number
  status: string
  featured?: boolean
  newArrival?: boolean
  totalChapters?: number
  createdAt?: string
  stats?: {
    averageRating?: number
  }
  chapters?: BookChapterMeta[]
}
