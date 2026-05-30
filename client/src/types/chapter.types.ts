export interface Chapter {
  _id: string
  bookId: string
  chapterNumber: number
  title: string
  pageImageUrls: string[]
  totalPages: number
  highlightUntil: string
  isNew: boolean
  createdAt: string
  updatedAt: string
}
