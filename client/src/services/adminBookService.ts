import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'
import type { ApiBookRecord } from '../types/book.types'

export type CatalogStats = {
  bookCount: number
  authorCount: number
  readerCount: number
}

export type AdminDashboardStats = {
  totals: {
    books: number
    users: number
    totalReads: number
    activeToday: number
  }
  dailyReads: Array<{ date: string; reads: number }>
  genreDistribution: Array<{ name: string; value: number; color: string }>
  mostReadBooks: Array<{ title: string; reads: number }>
  topReaders: Array<{
    name: string
    initials: string
    books: number
    status: 'Active' | 'Inactive'
  }>
}

export async function fetchCatalogStats(): Promise<CatalogStats> {
  const { data } = await api.get<ApiSuccess<CatalogStats>>('/books/catalog-stats')
  return data.data
}

export async function fetchAdminDashboard(): Promise<AdminDashboardStats> {
  const { data } = await api.get<ApiSuccess<AdminDashboardStats>>('/admin/dashboard')
  return data.data
}

export async function fetchAdminBooks(): Promise<ApiBookRecord[]> {
  const { data } = await api.get<ApiSuccess<{ books: ApiBookRecord[] }>>('/books', {
    params: { status: 'all', limit: 200, page: 1 },
  })
  return data.data.books
}

export async function updateAdminBookStatus(
  bookId: string,
  status: 'published' | 'draft' | 'hidden' | 'archived',
): Promise<void> {
  await api.put(`/books/${bookId}`, { status })
}

export async function deleteAdminBook(bookId: string): Promise<void> {
  await api.delete(`/books/${bookId}`)
}

export function adminBookErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const body = err.response?.data as { message?: string } | undefined
    if (body?.message) return body.message
  }
  return fallback
}
