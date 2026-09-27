const STORAGE_KEY = 'pictoriya_anon_id'
const LEGACY_KEY = 'pictoria_anon_id'

export function getOrCreateAnonId(): string | undefined {
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) return existing

    const legacy = window.localStorage.getItem(LEGACY_KEY)
    if (legacy) {
      window.localStorage.setItem(STORAGE_KEY, legacy)
      window.localStorage.removeItem(LEGACY_KEY)
      return legacy
    }

    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`

    window.localStorage.setItem(STORAGE_KEY, id)
    return id
  } catch {
    return undefined
  }
}
