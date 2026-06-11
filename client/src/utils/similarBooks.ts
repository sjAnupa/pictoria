import type { Book } from '../types/book.types'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function bookGenres(book: Book): string[] {
  const listed = book.genres?.length ? [...book.genres] : []
  if (book.genre && !listed.some((g) => normalize(g) === normalize(book.genre))) {
    listed.unshift(book.genre)
  }
  return listed
}

export function scoreBookSimilarity(source: Book, candidate: Book): number {
  if (source.id === candidate.id) return 0

  const sourceGenres = new Set(bookGenres(source).map(normalize))
  const sourceTags = new Set(source.tags.map(normalize))

  let score = 0

  for (const genre of bookGenres(candidate)) {
    if (sourceGenres.has(normalize(genre))) score += 10
  }

  for (const tag of candidate.tags) {
    if (sourceTags.has(normalize(tag))) score += 5
  }

  return score
}

/** Rank catalog books by shared genres and tags; fall back gracefully when matches are sparse. */
export function findSimilarBooks(source: Book, catalog: Book[], limit = 4): Book[] {
  const ranked = catalog
    .filter((b) => b.id !== source.id)
    .map((book) => ({ book, score: scoreBookSimilarity(source, book) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.book.rating - a.book.rating)

  if (ranked.length > 0) {
    return ranked.slice(0, limit).map((entry) => entry.book)
  }

  const sourceGenres = new Set(bookGenres(source).map(normalize))
  const genreMatches = catalog.filter(
    (b) =>
      b.id !== source.id &&
      bookGenres(b).some((genre) => sourceGenres.has(normalize(genre))),
  )

  if (genreMatches.length > 0) {
    return genreMatches.slice(0, limit)
  }

  return catalog.filter((b) => b.id !== source.id).slice(0, limit)
}
