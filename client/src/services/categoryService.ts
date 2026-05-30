import axios from 'axios'
import api from './api'
import type { ApiSuccess } from '../types/api.types'

export type GenreColorPresetId = 'violet' | 'indigo' | 'rose' | 'amber' | 'emerald' | 'cyan' | 'slate'

export type CategoryType = 'genre' | 'tag'

export type CategoryRecord = {
  _id: string
  name: string
  slug: string
  type: CategoryType
  description?: string
  icon?: string
  colorPresetId?: GenreColorPresetId
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export type CreateCategoryInput = {
  name: string
  type: CategoryType
  icon?: string
  colorPresetId?: GenreColorPresetId
}

export class CategoryServiceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CategoryServiceError'
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

function mapCategory(raw: Record<string, unknown>): CategoryRecord {
  return {
    _id: String(raw._id),
    name: String(raw.name),
    slug: String(raw.slug),
    type: raw.type as CategoryType,
    description: raw.description as string | undefined,
    icon: raw.icon as string | undefined,
    colorPresetId: raw.colorPresetId as GenreColorPresetId | undefined,
    isActive: Boolean(raw.isActive),
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  }
}

export async function fetchCategories(type?: CategoryType): Promise<CategoryRecord[]> {
  try {
    const params: Record<string, string> = { activeOnly: 'false' }
    if (type) params.type = type
    const { data } = await api.get<ApiSuccess<Record<string, unknown>[]>>('/categories', { params })
    return data.data.map(mapCategory)
  } catch (err) {
    throw new CategoryServiceError(messageFromError(err, 'Failed to load categories.'))
  }
}

export async function createCategory(input: CreateCategoryInput): Promise<CategoryRecord> {
  try {
    const { data } = await api.post<ApiSuccess<Record<string, unknown>>>('/categories', input)
    return mapCategory(data.data)
  } catch (err) {
    throw new CategoryServiceError(messageFromError(err, 'Failed to create category.'))
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/categories/${id}`)
  } catch (err) {
    throw new CategoryServiceError(messageFromError(err, 'Failed to delete category.'))
  }
}
