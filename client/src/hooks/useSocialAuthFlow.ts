import { useCallback, useState } from 'react'
import {
  AuthError,
  signInWithFacebook,
  signInWithGoogle,
  type AuthIntent,
} from '../services/authService'
import type { User } from '../types/user.types'
import type { AuthGuidanceKind } from '../components/auth/authGuidance'

export function useSocialAuthFlow(
  intent: AuthIntent,
  onSuccess: (user: User, token: string) => void,
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guidance, setGuidance] = useState<AuthGuidanceKind | null>(null)

  const handleError = useCallback((err: unknown, fallback: string) => {
    setGuidance(null)
    if (err instanceof AuthError) {
      if (err.code === 'ACCOUNT_EXISTS') {
        setError(null)
        setGuidance('account_exists')
        return
      }
      if (err.code === 'ACCOUNT_NOT_FOUND') {
        setError(null)
        setGuidance('account_not_found')
        return
      }
      setError(err.message)
    } else {
      setError(fallback)
    }
  }, [])

  const handleGoogleCredential = useCallback(
    async (credential: string) => {
      setLoading(true)
      setError(null)
      setGuidance(null)
      try {
        const { user, token } = await signInWithGoogle(credential, intent)
        onSuccess(user, token)
      } catch (err) {
        handleError(err, 'Google sign-in failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [intent, onSuccess, handleError],
  )

  const handleFacebookToken = useCallback(
    async (accessToken: string) => {
      setLoading(true)
      setError(null)
      setGuidance(null)
      try {
        const { user, token } = await signInWithFacebook(accessToken, intent)
        onSuccess(user, token)
      } catch (err) {
        handleError(err, 'Facebook sign-in failed. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [intent, onSuccess, handleError],
  )

  return {
    loading,
    error,
    guidance,
    clearError: () => {
      setError(null)
      setGuidance(null)
    },
    setErrorMessage: (message: string) => {
      setError(message)
      setGuidance(null)
    },
    handleGoogleCredential,
    handleFacebookToken,
  }
}
