import { useEffect, useRef, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { GoogleIcon } from './authIcons'

type GoogleAuthButtonProps = {
  onCredential: (credential: string) => void
  onError: (message: string) => void
  disabled?: boolean
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? ''

export function isGoogleSignInEnabled(): boolean {
  return googleClientId.length > 0
}

export default function GoogleAuthButton({
  onCredential,
  onError,
  disabled = false,
}: GoogleAuthButtonProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = hostRef.current
    if (!el) return
    const update = () => setWidth(el.offsetWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (!isGoogleSignInEnabled()) {
    return null
  }

  return (
    <div ref={hostRef} className="relative h-[48px] w-full">
      <div
        aria-hidden
        className="flex h-full w-full items-center justify-center gap-3 rounded-[10px] border border-[#dadce0] bg-white px-4 shadow-[0_1px_2px_rgba(60,64,67,0.06)]"
      >
        <GoogleIcon />
        <span className="text-[15px] font-medium tracking-[0.01em] text-[#3c4043]">
          Continue with Google
        </span>
      </div>

      <div
        className={`absolute inset-0 z-10 overflow-hidden rounded-[10px] ${
          disabled ? 'pointer-events-none' : 'cursor-pointer'
        }`}
        style={{ opacity: 0.01 }}
      >
        {width > 0 ? (
          <GoogleLogin
            onSuccess={(res) => {
              if (res.credential) onCredential(res.credential)
              else onError('Could not complete sign-in.')
            }}
            onError={() => onError('Sign-in was cancelled.')}
            theme="outline"
            size="large"
            text="continue_with"
            shape="rectangular"
            width={width}
            useOneTap={false}
          />
        ) : null}
      </div>
    </div>
  )
}
