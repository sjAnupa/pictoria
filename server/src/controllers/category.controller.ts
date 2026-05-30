import { Request, Response } from 'express'
import { z } from 'zod'
import { Category } from '../models/Category.model'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { generateSlug } from '../utils/generateSlug'

const colorPresetIds = ['violet', 'indigo', 'rose', 'amber', 'emerald', 'cyan', 'slate'] as const

const categorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['genre', 'tag']),
  description: z.string().optional(),
  icon: z.string().max(16).optional(),
  colorPresetId: z.enum(colorPresetIds).optional(),
})

const updateCategorySchema = categorySchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const getCategories = async (req: Request, res: Response): Promise<Response> => {
  const filter: Record<string, unknown> = {}

  if (req.query.type) {
    filter.type = req.query.type
  }

  if (req.query.activeOnly === 'true') {
    filter.isActive = true
  }

  const categories = await Category.find(filter).sort({ type: 1, name: 1 }).lean()
  return successResponse(res, categories)
}

export const createCategory = async (req: Request, res: Response): Promise<Response> => {
  const parsed = categorySchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const slug = generateSlug(parsed.data.name)
  const existing = await Category.findOne({ slug })
  if (existing) {
    return errorResponse(res, 'Category already exists', 409)
  }

  const category = await Category.create({
    ...parsed.data,
    slug,
    icon: parsed.data.type === 'tag' ? parsed.data.icon ?? '🏷️' : parsed.data.icon,
    colorPresetId: parsed.data.colorPresetId ?? 'indigo',
  })

  console.log(
    `[categories] created "${category.name}" (${category.type}) in db=${Category.db.name} collection=${Category.collection.name} id=${category._id}`,
  )

  return successResponse(res, category, 201, 'Category created')
}

export const updateCategory = async (req: Request, res: Response): Promise<Response> => {
  const parsed = updateCategorySchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const category = await Category.findById(req.params.id)
  if (!category) {
    return errorResponse(res, 'Category not found', 404)
  }

  if (parsed.data.name !== undefined) {
    category.name = parsed.data.name
    category.slug = generateSlug(parsed.data.name)
  }
  if (parsed.data.description !== undefined) category.description = parsed.data.description
  if (parsed.data.icon !== undefined) category.icon = parsed.data.icon
  if (parsed.data.colorPresetId !== undefined) category.colorPresetId = parsed.data.colorPresetId
  if (parsed.data.isActive !== undefined) category.isActive = parsed.data.isActive

  await category.save()
  return successResponse(res, category)
}

export const deleteCategory = async (req: Request, res: Response): Promise<Response> => {
  const category = await Category.findById(req.params.id)
  if (!category) {
    return errorResponse(res, 'Category not found', 404)
  }

  await category.deleteOne()
  console.log(
    `[categories] deleted "${category.name}" from db=${Category.db.name} collection=${Category.collection.name}`,
  )
  return successResponse(res, { message: 'Category deleted' })
}
