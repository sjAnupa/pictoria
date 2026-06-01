import { useCallback } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthScreen from '../components/auth/AuthScreen'
import { useSocialAuthFlow } from '../hooks/useSocialAuthFlow'
import { useAuthStore } from '../store/authStore'
import { canAccessAdminPortal } from '../utils/authPermissions'
import type { User } from '../types/user.types'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const from = (location.state as { from?: string; requiresAdmin?: boolean } | null)?.from
  const requiresAdmin = (location.state as { requiresAdmin?: boolean } | null)?.requiresAdmin

  const finishAuth = useCallback(
    (nextUser: User, token: string) => {
      setAuth(nextUser, token)
      const wantsAdmin = requiresAdmin || from === '/admin'
      if (wantsAdmin) {
        navigate(canAccessAdminPortal(nextUser) ? '/admin' : '/', { replace: true })
        return
      }
      navigate(from ?? '/', { replace: true })
    },
    [from, navigate, requiresAdmin, setAuth],
  )

  const social = useSocialAuthFlow('login', finishAuth)

  if (isAuthenticated && user) {
    if (requiresAdmin || from === '/admin') {
      if (canAccessAdminPortal(user)) return <Navigate to="/admin" replace />
      return <Navigate to="/" replace state={{ adminDenied: true }} />
    }
    return <Navigate to={from ?? '/'} replace />
  }

  return (
    <AuthScreen
      mode="login"
      busy={social.loading}
      error={social.error}
      guidance={social.guidance}
      adminNotice={requiresAdmin}
      onGoogleCredential={social.handleGoogleCredential}
      onGoogleError={social.setErrorMessage}
      onFacebookToken={social.handleFacebookToken}
      onFacebookError={social.setErrorMessage}
    />
  )
}

export default Login
