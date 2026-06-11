import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getMe } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute() {
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const logout = useAuthStore((s) => s.logout)

  const [ready, setReady] = useState(false)

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
  }, [logout])

  if (!ready) {
    return (
      <div
        className="font-sans"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDF0D5',
          color: '#6B4226',
        }}
      >
        Loading…
      </div>
    )
  }

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
