import { Book } from '../models/Book.model'
import { BookView } from '../models/BookView.model'

function isDuplicateKeyError(err: unknown): boolean {
  return Boolean(err && typeof err === 'object' && (err as { code?: number }).code === 11000)
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function recordBookView(
  bookId: string,
  opts: { userId?: string; anonId?: string },
): Promise<{ recorded: boolean }> {
  const exists = await Book.exists({ _id: bookId })
  if (!exists) throw new Error('BOOK_NOT_FOUND')

  if (!opts.userId && !opts.anonId) {
    return { recorded: false }
  }

  const doc: Record<string, unknown> = { bookId, dateKey: todayKey() }
  if (opts.userId) {
    doc.userId = opts.userId
  } else {
    doc.anonId = opts.anonId
  }

  try {
    await BookView.create(doc)
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { recorded: false }
    }
    throw err
  }

  await Book.updateOne({ _id: bookId }, { $inc: { 'stats.totalViews': 1 } })
  return { recorded: true }
}
