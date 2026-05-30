import { create } from 'zustand'
import type { User } from '../types/user.types'

const USER_STORAGE_KEY = 'pictoria_user'

function readStoredUser(): User | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function persistUser(user: User | null) {
  if (typeof localStorage === 'undefined') return
  if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(USER_STORAGE_KEY)
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  logout: () => void
}

function readInitialAuth(): Pick<AuthState, 'user' | 'token' | 'isAuthenticated'> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('pictoria_token') : null

  // Clear stale tokens from earlier dev-only auth experiments.
  if (token === 'dev-dummy-token' || token?.startsWith('mock-jwt-')) {
    localStorage.removeItem('pictoria_token')
    persistUser(null)
    return { user: null, token: null, isAuthenticated: false }
  }

  const user = readStoredUser()
  return { user, token, isAuthenticated: Boolean(token && user) }
}

const initial = readInitialAuth()

export const useAuthStore = create<AuthState>((set) => ({
  user: initial.user,
  token: initial.token,
  isAuthenticated: initial.isAuthenticated,
  setAuth: (user, token) => {
    localStorage.setItem('pictoria_token', token)
    persistUser(user)
    set({ user, token, isAuthenticated: true })
  },
  setUser: (user) => {
    persistUser(user)
    set({ user })
  },
  logout: () => {
    localStorage.removeItem('pictoria_token')
    persistUser(null)
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
