import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

type GuestRouteProps = {
  children: ReactNode
}

/** Redirect signed-in users away from login/register. */
export default function GuestRoute({ children }: GuestRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  if (isAuthenticated && user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
