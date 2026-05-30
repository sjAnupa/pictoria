export type ReadingAction =
  | 'start_reading'
  | 'continue_reading'
  | 'chapter_opened'
  | 'page_progress'
  | 'book_completed'

export type SaveProgressPayload = {
  bookId: string
  currentChapter: number
  currentPage: number
  totalPagesInChapter?: number
  action?: Exclude<ReadingAction, 'book_completed'>
}

export type BookProgressRecord = {
  _id: string
  userId: string
  bookId: string
  currentChapter: number
  currentPage: number
  chaptersRead: number[]
  startedAt: string
  lastReadAt: string
  completed: boolean
  completedAt?: string
}

export type LibraryBookItem = {
  progressId: string
  bookId: string
  slug: string
  title: string
  author: string
  coverImageUrl: string
  genre: string
  pages: number
  rating: number
  totalChapters: number
  currentChapter: number
  currentPage: number
  currentChapterTitle: string
  chaptersRead: number[]
  startedAt: string
  lastReadAt: string
  completed: boolean
  completedAt?: string
}

export type UserLibraryPayload = {
  currentlyReading: LibraryBookItem[]
  finished: LibraryBookItem[]
  stats: {
    currentlyReadingCount: number
    finishedCount: number
    pagesExplored: number
    totalChaptersRead: number
    topGenre: string | null
    averageRatingRead: number
  }
}
