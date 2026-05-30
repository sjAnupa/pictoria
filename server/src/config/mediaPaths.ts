/**
 * Media file layout under `server/uploads/` (served at `/uploads/...`).
 *
 * COVERS — always stored on the app server (high reuse on every list/detail view).
 * PAGES  — stored locally during development; new uploads can go to R2 when configured.
 */

/** Book cover images — never uploaded to R2. */
export const COVERS_ROOT = 'covers/books'

/** Illustrated chapter pages — local now, R2-ready paths for later. */
export const PAGES_ROOT = 'pages'

export function bookCoverRelativeDir(slug: string): string {
  return `${COVERS_ROOT}/${slug}`
}

/** Per-book chapter pages (admin uploads & future R2 keys mirror this path). */
export function bookChapterPagesRelativeDir(slug: string, chapterNumber: number): string {
  return `${PAGES_ROOT}/books/${slug}/chapters/${chapterNumber}`
}

/** Shared seed/demo reader pages (local only). */
export function sharedChapterPagesRelativeDir(chapterNumber: number): string {
  return `${PAGES_ROOT}/shared/read-pages/chapter-${chapterNumber}`
}

/** R2 object key prefix — same shape as local `pages/` for easy migration. */
export function r2ChapterPagesKey(slug: string, chapterNumber: number, filename: string): string {
  return `${PAGES_ROOT}/books/${slug}/chapters/${chapterNumber}/${filename}`
}

export const LEGACY_PATH_REWRITES: Array<{ from: RegExp; to: (match: RegExpMatchArray) => string }> = [
  {
    from: /^\/uploads\/books\/([^/]+)\/cover\.webp$/,
    to: (m) => `/uploads/${bookCoverRelativeDir(m[1])}/cover.webp`,
  },
  {
    from: /^\/uploads\/shared\/read-pages\/(.+)$/,
    to: (m) => `/uploads/${PAGES_ROOT}/shared/read-pages/${m[1]}`,
  },
  {
    from: /^\/uploads\/books\/([^/]+)\/ch(\d+)\/(.+)$/,
    to: (m) => `/uploads/${bookChapterPagesRelativeDir(m[1], Number(m[2]))}/${m[3]}`,
  },
]

export function rewriteLegacyMediaPath(stored: string): string {
  for (const rule of LEGACY_PATH_REWRITES) {
    const match = stored.match(rule.from)
    if (match) return rule.to(match)
  }
  return stored
}
