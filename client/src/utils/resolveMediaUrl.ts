/**
 * Resolve media URLs returned by the API for use in <img src>.
 *
 * - R2 / CDN: full `https://…` URLs — used as-is (preferred for covers + pages in prod).
 * - Local: `/uploads/...` — Vite-proxied in DEV; prefixed with API origin in PROD builds.
 *
 * See docs/MEDIA_STORAGE.md.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return ''

  const trimmed = url.trim()
  if (!trimmed) return ''

  // Absolute URL that embeds a legacy /uploads/ path → normalize to relative then re-resolve
  const uploadsMarker = '/uploads/'
  const markerIndex = trimmed.indexOf(uploadsMarker)
  if (markerIndex >= 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
    // Already on R2/CDN public host — keep full URL (covers + pages).
    try {
      const host = new URL(trimmed).hostname
      if (host !== 'localhost' && host !== '127.0.0.1' && !host.endsWith('.localhost')) {
        return trimmed
      }
    } catch {
      /* fall through */
    }
    return resolveMediaUrl(trimmed.slice(markerIndex))
  }

  // R2 / external CDN
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  // Local relative path
  if (trimmed.startsWith('/uploads/')) {
    if (import.meta.env.DEV) return trimmed

    const apiOrigin = (import.meta.env.VITE_API_URL ?? '').replace(/\/api\/?$/, '')
    return apiOrigin ? `${apiOrigin}${trimmed}` : trimmed
  }

  return trimmed
}

export function resolveMediaUrls(urls: string[] | undefined): string[] {
  if (!urls?.length) return []
  return urls.map((url) => resolveMediaUrl(url))
}
