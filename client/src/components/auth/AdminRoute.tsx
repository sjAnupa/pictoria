import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { canAccessAdminPortal } from '../../utils/authPermissions'

type AdminRouteProps = {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname, requiresAdmin: true }} />
  }

  if (!canAccessAdminPortal(user)) {
    return <Navigate to="/" replace state={{ adminDenied: true }} />
  }

  return <>{children}</>
}
