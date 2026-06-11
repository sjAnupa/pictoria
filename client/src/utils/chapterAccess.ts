import type { BookAccessType } from '../types/book.types'

export type ChapterAccessBook = {
  accessType: BookAccessType
  freeChapterLimit?: number
}

export type ChapterAccessResult =
  | { allowed: true }
  | { allowed: false; reason: 'login' | 'premium'; message: string }

export function getChapterAccess(
  book: ChapterAccessBook,
  chapterNumber: number,
  isAuthenticated: boolean,
): ChapterAccessResult {
  if (book.accessType === 'free') {
    return { allowed: true }
  }

  const previewLimit = Math.max(1, book.freeChapterLimit ?? 3)
  if (chapterNumber <= previewLimit) {
    return { allowed: true }
  }

  if (!isAuthenticated) {
    return {
      allowed: false,
      reason: 'login',
      message: `Create a free account to continue reading from chapter ${chapterNumber}.`,
    }
  }

  if (book.accessType === 'premium') {
    return {
      allowed: false,
      reason: 'premium',
      message: 'This book is part of our premium collection. Upgrade to unlock all chapters.',
    }
  }

  return { allowed: true }
}
