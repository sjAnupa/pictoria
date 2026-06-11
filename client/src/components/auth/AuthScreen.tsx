import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { BooksIllustration } from '../illustrations/BooksIllustration'
import AuthAlert from './AuthAlert'
import { authGuidanceCopy, type AuthGuidanceKind } from './authGuidance'
import FacebookAuthButton, { isFacebookSignInEnabled } from './FacebookAuthButton'
import GoogleAuthButton, { isGoogleSignInEnabled } from './GoogleAuthButton'

export type AuthScreenMode = 'login' | 'register'

type AuthScreenProps = {
  mode: AuthScreenMode
  busy: boolean
  error: string | null
  guidance?: AuthGuidanceKind | null
  adminNotice?: boolean
  onGoogleCredential: (credential: string) => void
  onGoogleError: (message: string) => void
  onFacebookToken: (token: string) => void
  onFacebookError: (message: string) => void
}

const copy = {
  login: {
    title: 'Sign in',
    switchPrompt: "Don't have an account?",
    switchLink: 'Sign up',
    switchTo: '/register',
  },
  register: {
    title: 'Create account',
    switchPrompt: 'Already have an account?',
    switchLink: 'Sign in',
    switchTo: '/login',
  },
} as const

function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 no-underline ${className}`}
      title="Pictoria home"
    >
      <img src="/logo-mark.png" alt="" className="h-11 w-11 object-contain" decoding="async" />
      <span
        className="font-pictoria text-[1.75rem] font-semibold leading-none tracking-[-0.02em] text-[#3D2314]"
        style={{ fontFeatureSettings: '"opsz" 72' }}
      >
        Pictoria
      </span>
    </Link>
  )
}

function BrandPanel() {
  return (
    <div
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between"
      style={{
        background: `
          radial-gradient(ellipse at 20% 15%, rgba(232,184,75,0.45) 0%, transparent 50%),
          radial-gradient(ellipse at 85% 80%, rgba(196,119,106,0.28) 0%, transparent 45%),
          radial-gradient(ellipse at 60% 50%, rgba(240,200,130,0.2) 0%, transparent 55%),
          #F5D9A0
        `,
      }}
    >
      <div className="relative z-[1] px-10 pt-10">
        <BrandMark />
      </div>

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-10 py-8">
        <BooksIllustration size={260} />
        <p
          className="font-pictoria mt-10 max-w-[280px] text-center text-[1.65rem] font-semibold leading-snug text-[#3D2314]"
          style={{ fontFeatureSettings: '"opsz" 72' }}
        >
          Illustrated stories for every reader
        </p>
      </div>

      <p className="relative z-[1] px-10 pb-8 text-center text-xs text-[#9B6B4A]/90">
        © {new Date().getFullYear()} Pictoria
      </p>
    </div>
  )
}

export default function AuthScreen({
  mode,
  busy,
  error,
  guidance = null,
  adminNotice,
  onGoogleCredential,
  onGoogleError,
  onFacebookToken,
  onFacebookError,
}: AuthScreenProps) {
  const c = copy[mode]
  const hasProvider = isGoogleSignInEnabled() || isFacebookSignInEnabled()

  return (
    <div className="grid min-h-screen lg:grid-cols-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <BrandPanel />

      <div className="flex min-h-screen flex-col bg-[#FEF8EE]">
        <main className="page-gutter flex flex-1 flex-col justify-center py-6 sm:py-8 lg:py-12">
          <div className="mx-auto w-full max-w-[380px]">
            <div className="mb-6 lg:mb-10">
              <div className="mb-4 lg:hidden">
                <BrandMark className="justify-center" />
              </div>
              <h1
                className="font-pictoria text-center text-[1.75rem] font-bold leading-tight text-[#3D2314] sm:text-left sm:text-[2.35rem] lg:text-left"
                style={{ fontFeatureSettings: '"opsz" 72' }}
              >
                {c.title}
              </h1>
            </div>

            {adminNotice ? (
              <div className="mb-6">
                <AuthAlert message="This area requires an admin account." variant="info" />
              </div>
            ) : null}

            <div className="relative">
              {busy ? (
                <div
                  className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-[#FEF8EE]/90 backdrop-blur-[2px]"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <Loader2 className="h-7 w-7 animate-spin text-[#8B2635]" aria-hidden />
                </div>
              ) : null}

              {guidance ? (
                <div className="mb-5">
                  <AuthAlert variant="info" {...authGuidanceCopy[guidance]} />
                </div>
              ) : null}

              {error && !guidance ? (
                <div className="mb-5">
                  <AuthAlert message={error} />
                </div>
              ) : null}

              {hasProvider ? (
                <div className="flex flex-col gap-3">
                  <GoogleAuthButton
                    disabled={busy}
                    onCredential={onGoogleCredential}
                    onError={onGoogleError}
                  />
                  <FacebookAuthButton
                    disabled={busy}
                    onAccessToken={onFacebookToken}
                    onError={onFacebookError}
                  />
                </div>
              ) : (
                <p className="text-sm text-[#9B6B4A]">Sign-in is temporarily unavailable.</p>
              )}
            </div>

            <p className="mt-8 text-center text-sm text-[#6B4226]">
              {c.switchPrompt}{' '}
              <Link
                to={c.switchTo}
                className="font-bold text-[#8B2635] no-underline underline-offset-2 hover:underline"
              >
                {c.switchLink}
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
