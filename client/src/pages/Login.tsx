import { FormEvent, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { login, AuthError } from '../services/authService'
import { useAuthStore } from '../store/authStore'
import { canAccessAdminPortal } from '../utils/authPermissions'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((s) => s.setAuth)
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string; requiresAdmin?: boolean } | null)?.from
  const requiresAdmin = (location.state as { requiresAdmin?: boolean } | null)?.requiresAdmin

  if (isAuthenticated && user) {
    if (requiresAdmin || from === '/admin') {
      if (canAccessAdminPortal(user)) return <Navigate to="/admin" replace />
      return <Navigate to="/" replace state={{ adminDenied: true }} />
    }
    return <Navigate to={from ?? '/'} replace />
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { user: nextUser, token } = await login(email, password)
      setAuth(nextUser, token)

      const wantsAdmin = requiresAdmin || from === '/admin'
      if (wantsAdmin) {
        navigate(canAccessAdminPortal(nextUser) ? '/admin' : '/', { replace: true })
        return
      }
      navigate(from ?? '/', { replace: true })
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #FDF0D5 0%, #F5D9A0 100%)',
        fontFamily: "'Nunito', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: '#FEF8EE',
          border: '1.5px solid #E8C98A',
          borderRadius: 20,
          padding: '32px 28px',
          boxShadow: '0 16px 48px rgba(90,40,10,0.12)',
        }}
      >
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 26,
            color: '#3D2314',
            marginBottom: 8,
            fontWeight: 700,
          }}
        >
          Welcome back
        </h1>
        <p style={{ color: '#9B6B4A', fontSize: 14, marginBottom: requiresAdmin ? 8 : 20 }}>
          Sign in to continue reading and manage your library.
        </p>
        {requiresAdmin ? (
          <p style={{ color: '#8B2635', fontSize: 13, marginBottom: 20, fontWeight: 600 }}>
            Admin portal requires an account with admin access.
          </p>
        ) : null}

        <form onSubmit={submit}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D2314', marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            style={{
              width: '100%',
              marginBottom: 16,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1.5px solid #E8C98A',
              background: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3D2314', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
            style={{
              width: '100%',
              marginBottom: 12,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1.5px solid #E8C98A',
              background: '#fff',
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />

          {error ? (
            <p style={{ color: '#8B2635', fontSize: 13, marginBottom: 12, fontWeight: 600 }}>{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 0',
              border: 'none',
              borderRadius: 28,
              background: loading
                ? '#B88A92'
                : 'linear-gradient(135deg, #8B2635 0%, #A83040 100%)',
              color: '#FEF8EE',
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? 'wait' : 'pointer',
              marginBottom: 16,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 14, color: '#6B4226' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#8B2635', fontWeight: 700 }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
