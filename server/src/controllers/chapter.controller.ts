import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { createChapterSchema, updateChapterSchema } from '../validators/chapter.validator'
import { paramString } from '../utils/paramString'
import {
  createChapterRecord,
  deleteChapterRecord,
  findChapterById,
  findChapterDocumentById,
  findChaptersByBookId,
  updateChapterRecord,
} from '../services/chapter.service'
import { findChapterForReading } from '../services/book.service'
import { isCatalogAdmin } from '../middleware/optionalAuth.middleware'
import { User } from '../models/User.model'
import { Book } from '../models/Book.model'

async function resolveViewer(req: Request) {
  const isAdmin = isCatalogAdmin(req)
  let isPremium = false
  if (req.user?._id) {
    const user = await User.findById(req.user._id).select('subscription.status').lean()
    isPremium = user?.subscription?.status === 'premium'
  }
  return {
    isAuthenticated: Boolean(req.user),
    isAdmin,
    isPremium,
    catalogAdminPreview: isAdmin,
  }
}

export const getChaptersByBook = async (req: Request, res: Response): Promise<Response> => {
  const chapters = await findChaptersByBookId(paramString(req.params.bookId))
  return successResponse(res, chapters)
}

export const getChapterForReading = async (req: Request, res: Response): Promise<Response> => {
  const chapterNumber = Number(req.params.chapterNumber)
  if (!Number.isFinite(chapterNumber) || chapterNumber < 1) {
    return errorResponse(res, 'Invalid chapter number', 400)
  }

  const viewer = await resolveViewer(req)
  const payload = await findChapterForReading(
    paramString(req.params.bookId),
    chapterNumber,
    viewer,
  )
  if (!payload) {
    return errorResponse(res, 'Chapter not found', 404)
  }

  if (payload.denied) {
    return errorResponse(
      res,
      payload.message,
      403,
      [],
      payload.reason === 'premium' ? 'PREMIUM_REQUIRED' : 'LOGIN_REQUIRED',
    )
  }

  return successResponse(res, {
    book: payload.book,
    chapter: payload.chapter,
  })
}

export const getChapterById = async (req: Request, res: Response): Promise<Response> => {
  const chapter = await findChapterById(paramString(req.params.id))
  if (!chapter) {
    return errorResponse(res, 'Chapter not found', 404)
  }

  if (isCatalogAdmin(req)) {
    return successResponse(res, chapter)
  }

  if (!Types.ObjectId.isValid(String(chapter.bookId))) {
    return errorResponse(res, 'Chapter not found', 404)
  }

  const book = await Book.findById(chapter.bookId).select('status').lean()
  if (!book || book.status !== 'published') {
    return errorResponse(res, 'Chapter not found', 404)
  }

  // Never expose page image URLs on this route for non-admins.
  const { pageImageUrls: _urls, pageImageNames: _names, ...safe } = chapter
  return successResponse(res, safe)
}

export const createChapter = async (req: Request, res: Response): Promise<Response> => {
  const parsed = createChapterSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const files = (req.files as Express.Multer.File[]) ?? []

  try {
    const chapter = await createChapterRecord(parsed.data, files)
    if (!chapter) {
      return errorResponse(res, 'Book not found', 404)
    }

    return successResponse(res, chapter, 201, 'Chapter created')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create chapter pages'
    return errorResponse(res, message, 400)
  }
}

export const updateChapter = async (req: Request, res: Response): Promise<Response> => {
  const parsed = updateChapterSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const chapter = await findChapterDocumentById(paramString(req.params.id))
  if (!chapter) {
    return errorResponse(res, 'Chapter not found', 404)
  }

  const files = (req.files as Express.Multer.File[]) ?? undefined

  try {
    const updated = await updateChapterRecord(chapter, parsed.data, files)
    if (!updated) {
      return errorResponse(res, 'Book not found', 404)
    }
    return successResponse(res, updated, 200, 'Chapter updated')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update chapter pages'
    return errorResponse(res, message, 400)
  }
}

export const deleteChapter = async (req: Request, res: Response): Promise<Response> => {
  const chapter = await findChapterDocumentById(paramString(req.params.id))
  if (!chapter) {
    return errorResponse(res, 'Chapter not found', 404)
  }

  await deleteChapterRecord(chapter)
  return successResponse(res, { message: 'Chapter deleted' })
}
