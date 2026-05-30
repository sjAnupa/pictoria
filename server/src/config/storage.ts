import path from 'path'
import { rewriteLegacyMediaPath } from './mediaPaths'

export const UPLOADS_ROOT = path.join(process.cwd(), 'uploads')

/** Relative public path for locally stored files (served by Express at /uploads). */
export function localMediaPath(relativePath: string): string {
  const normalized = relativePath.replace(/^\/+/, '').replace(/\\/g, '/')
  return `/uploads/${normalized}`
}

/**
 * Normalize stored URLs for API responses.
 * - Local dev may have legacy absolute URLs → relative /uploads/... paths
 * - R2 URLs are returned unchanged
 */
export function normalizeMediaUrl(stored: string | undefined | null): string {
  if (!stored) return ''
  const trimmed = stored.trim()
  if (!trimmed) return ''

  const uploadsMarker = '/uploads/'
  const markerIndex = trimmed.indexOf(uploadsMarker)
  if (markerIndex >= 0) {
    const pathOnly = trimmed.slice(markerIndex)
    return rewriteLegacyMediaPath(pathOnly)
  }

  return rewriteLegacyMediaPath(trimmed)
}

export function normalizeMediaUrls(urls: string[] | undefined): string[] {
  if (!urls?.length) return []
  return urls.map((url) => normalizeMediaUrl(url))
}
