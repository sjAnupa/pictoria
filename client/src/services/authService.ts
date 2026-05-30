import axios from 'axios'
import api from './api'
import type { AuthResponse, User } from '../types/user.types'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
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

function messageFromError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string; errors?: string[] } | undefined
    if (body?.errors?.length) return body.errors.join(' ')
    if (body?.message) return body.message
  }
  return fallback
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthPayload>('/auth/register', { name, email, password })
    return {
      user: mapApiUser(data.data.user),
      token: data.data.token,
    }
  } catch (err) {
    throw new AuthError(messageFromError(err, 'Registration failed. Please try again.'))
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data } = await api.post<AuthPayload>('/auth/login', { email, password })
    return {
      user: mapApiUser(data.data.user),
      token: data.data.token,
    }
  } catch (err) {
    throw new AuthError(messageFromError(err, 'Invalid email or password.'))
  }
}

export async function getMe(): Promise<User> {
  try {
    const { data } = await api.get<MePayload>('/auth/me')
    return mapApiUser(data.data)
  } catch (err) {
    throw new AuthError(messageFromError(err, 'Session expired. Please sign in again.'))
  }
}
