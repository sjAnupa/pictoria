import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getMe } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

/**
 * Validates an existing session in the background without blocking public pages.
 */
export default function OptionalAuthBootstrap() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const [ready, setReady] = useState(!token)

  useEffect(() => {
    let cancelled = false

    async function validateSession() {
      const currentToken = useAuthStore.getState().token
      if (!currentToken) {
        if (!cancelled) setReady(true)
        return
      }

      try {
        const freshUser = await getMe()
        if (cancelled) return
        const { user: storedUser, setAuth, setUser } = useAuthStore.getState()
        if (storedUser) setUser(freshUser)
        else setAuth(freshUser, currentToken)
      } catch {
        if (!cancelled) logout()
      } finally {
        if (!cancelled) setReady(true)
      }
    }

    validateSession()
    return () => {
      cancelled = true
    }
  }, [logout, token])

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDF0D5',
          fontFamily: "'Nunito', sans-serif",
          color: '#6B4226',
        }}
      >
        Loading…
      </div>
    )
  }

  return <Outlet />
}
