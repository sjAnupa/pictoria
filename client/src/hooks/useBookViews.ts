import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { getOrCreateAnonId } from '../utils/anonId'
import { pingBookView } from '../services/viewService'

const pingedThisSession = new Set<string>()

/** Fire-and-forget view ping, once per book per browser tab session. */
export function useTrackBookView(bookId: string | undefined): void {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!bookId) return
    if (pingedThisSession.has(bookId)) return
    pingedThisSession.add(bookId)

    const anonId = isAuthenticated ? undefined : getOrCreateAnonId()
    void pingBookView(bookId, anonId)
  }, [bookId, isAuthenticated])
}
