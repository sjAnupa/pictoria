import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthScreen from '../components/auth/AuthScreen'
import { useSocialAuthFlow } from '../hooks/useSocialAuthFlow'
import { useAuthStore } from '../store/authStore'
import type { User } from '../types/user.types'

const Register = () => {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const finishAuth = useCallback(
    (user: User, token: string) => {
      setAuth(user, token)
      navigate('/', { replace: true })
    },
    [navigate, setAuth],
  )

  const social = useSocialAuthFlow('register', finishAuth)

  return (
    <AuthScreen
      mode="register"
      busy={social.loading}
      error={social.error}
      guidance={social.guidance}
      onGoogleCredential={social.handleGoogleCredential}
      onGoogleError={social.setErrorMessage}
      onFacebookToken={social.handleFacebookToken}
      onFacebookError={social.setErrorMessage}
    />
  )
}

export default Register
