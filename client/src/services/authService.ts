import axios from 'axios'
import api from './api'
import type { AuthResponse, User } from '../types/user.types'

export type AuthIntent = 'login' | 'register'

export class AuthError extends Error {
  code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

type ApiUser = {
  _id: string
  name: string
  email: string
  is_admin?: boolean
  is_super_admin?: boolean
  avatar?: string
  createdAt?: string
}

type AuthPayload = {
  success: boolean
  message?: string
  code?: string
  data: {
    user: ApiUser
    token: string
  }
}

type MePayload = {
  success: boolean
  message?: string
  data: ApiUser
}

function mapApiUser(raw: ApiUser): User {
  return {
    _id: String(raw._id),
    name: raw.name,
    email: raw.email,
    is_admin: Boolean(raw.is_admin),
    is_super_admin: Boolean(raw.is_super_admin),
    avatar: raw.avatar,
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

function messageFromError(err: unknown, fallback: string): { message: string; code?: string } {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
      return {
        message:
          'We could not connect to Pictoriya right now. Please refresh the page and try again. If this continues, the service may be temporarily unavailable.',
        code: 'NETWORK_ERROR',
      }
    }
    const body = err.response?.data as { message?: string; errors?: string[]; code?: string } | undefined
    if (body?.errors?.length) return { message: body.errors.join(' '), code: body.code }
    if (body?.message) return { message: body.message, code: body.code }
  }
  return { message: fallback }
}

export async function signInWithGoogle(
  credential: string,
  intent: AuthIntent,
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthPayload>('/auth/google', { credential, intent })
    return {
      user: mapApiUser(data.data.user),
      token: data.data.token,
    }
  } catch (err) {
    const { message, code } = messageFromError(err, 'Google sign-in failed. Please try again.')
    throw new AuthError(message, code)
  }
}

export async function signInWithFacebook(
  accessToken: string,
  intent: AuthIntent,
): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthPayload>('/auth/facebook', { accessToken, intent })
    return {
      user: mapApiUser(data.data.user),
      token: data.data.token,
    }
  } catch (err) {
    const { message, code } = messageFromError(err, 'Facebook sign-in failed. Please try again.')
    throw new AuthError(message, code)
  }
}

export async function getMe(): Promise<User> {
  try {
    const { data } = await api.get<MePayload>('/auth/me')
    return mapApiUser(data.data)
  } catch (err) {
    const { message } = messageFromError(err, 'Session expired. Please sign in again.')
    throw new AuthError(message)
  }
}
