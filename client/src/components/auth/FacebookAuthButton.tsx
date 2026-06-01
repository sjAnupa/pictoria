import { useEffect, useState } from 'react'
import { loadFacebookSdk } from '../../lib/facebookSdk'
import { FacebookIcon } from './authIcons'

type FacebookAuthButtonProps = {
  onAccessToken: (token: string) => void
  onError: (message: string) => void
  disabled?: boolean
}

const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID?.trim() ?? ''

export function isFacebookSignInEnabled(): boolean {
  return facebookAppId.length > 0
}

export default function FacebookAuthButton({
  onAccessToken,
  onError,
  disabled = false,
}: FacebookAuthButtonProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isFacebookSignInEnabled()) return
    loadFacebookSdk(facebookAppId)
      .then(() => setReady(true))
      .catch(() => onError('Could not load Facebook.'))
  }, [onError])

  if (!isFacebookSignInEnabled()) {
    return null
  }

  const handleClick = () => {
    if (!ready || !window.FB) return
    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          onAccessToken(response.authResponse.accessToken)
          return
        }
        if (response.status !== 'connected') {
          onError('Sign-in was cancelled.')
        }
      },
      { scope: 'email,public_profile', return_scopes: true },
    )
  }

  return (
    <button
      type="button"
      disabled={disabled || !ready}
      onClick={handleClick}
      className="flex h-[48px] w-full items-center justify-center gap-3 rounded-[10px] border border-[#dadce0] bg-white px-4 text-[15px] font-medium text-[#3c4043] shadow-[0_1px_2px_rgba(60,64,67,0.06)] transition hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-50"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <FacebookIcon />
      Continue with Facebook
    </button>
  )
}
