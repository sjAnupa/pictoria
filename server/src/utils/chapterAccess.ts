export type BookAccessType = 'free' | 'registered' | 'premium'

export type ChapterAccessBook = {
  accessType: BookAccessType
  freeChapterLimit?: number
}

export type ChapterAccessViewer = {
  isAuthenticated: boolean
  isAdmin?: boolean
  isPremium?: boolean
}

export type ChapterAccessResult =
  | { allowed: true }
  | { allowed: false; reason: 'login' | 'premium'; message: string }

/** Server-side chapter gate — must match client UX rules in chapterAccess.ts. */
export function evaluateChapterAccess(
  book: ChapterAccessBook,
  chapterNumber: number,
  viewer: ChapterAccessViewer,
): ChapterAccessResult {
  if (viewer.isAdmin) {
    return { allowed: true }
  }

  if (book.accessType === 'free') {
    return { allowed: true }
  }

  const previewLimit = Math.max(1, book.freeChapterLimit ?? 3)
  if (chapterNumber <= previewLimit) {
    return { allowed: true }
  }

  if (!viewer.isAuthenticated) {
    return {
      allowed: false,
      reason: 'login',
      message: `Create a free account to continue reading from chapter ${chapterNumber}.`,
    }
  }

  if (book.accessType === 'premium' && !viewer.isPremium) {
    return {
      allowed: false,
      reason: 'premium',
      message: 'This book is part of our premium collection. Upgrade to unlock all chapters.',
    }
  }

  return { allowed: true }
}
