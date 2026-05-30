import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'

export type AccountTypeFilter = 'all' | 'readers' | 'admins' | 'super_admins' | 'staff'

export type AdminDirectoryUser = {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'super_admin'
  is_admin: boolean
  is_super_admin: boolean
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export type UserListResponse = {
  users: AdminDirectoryUser[]
  totalCount: number
  totalPages: number
  currentPage: number
}

export type FetchUsersParams = {
  page?: number
  limit?: number
  search?: string
  accountType?: AccountTypeFilter
}

export class UserServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserServiceError'
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

export async function fetchUsers(params: FetchUsersParams = {}): Promise<UserListResponse> {
  try {
    const query: Record<string, string | number> = {
      page: params.page ?? 1,
      limit: params.limit ?? 100,
    }
    if (params.search?.trim()) query.search = params.search.trim()
    if (params.accountType && params.accountType !== 'all') {
      query.accountType = params.accountType
    }

    const { data } = await api.get<ApiSuccess<UserListResponse>>('/users', { params: query })
    return data.data
  } catch (err) {
    throw new UserServiceError(messageFromError(err, 'Failed to load users.'))
  }
}

export async function updateUserAdminAccess(userId: string, isAdmin: boolean): Promise<AdminDirectoryUser> {
  try {
    const { data } = await api.put<ApiSuccess<AdminDirectoryUser>>(`/users/${userId}`, { is_admin: isAdmin })
    return data.data as AdminDirectoryUser
  } catch (err) {
    throw new UserServiceError(messageFromError(err, 'Failed to update admin access.'))
  }
}

export function userInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'R'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}

export function userAvatarColor(email: string): string {
  const palette = ['#8B2635', '#4F46E5', '#059669', '#D97706', '#DB2777', '#0891B2', '#7C3AED']
  let hash = 0
  for (let i = 0; i < email.length; i += 1) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}
