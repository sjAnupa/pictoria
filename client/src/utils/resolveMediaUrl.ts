/**
 * Resolve media URLs returned by the API for use in <img src>.
 *
 * Local (temporary): `/uploads/...` paths — proxied to the API server in dev.
 * R2 (production): full https URLs — used as-is.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return ''

  const trimmed = url.trim()
  if (!trimmed) return ''

  // Legacy absolute local URLs → relative path
  const uploadsMarker = '/uploads/'
  const markerIndex = trimmed.indexOf(uploadsMarker)
  if (markerIndex >= 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://'))) {
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
