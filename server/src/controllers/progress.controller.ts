import { Request, Response } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { paramString } from '../utils/paramString'
import {
  getBookProgress,
  getUserLibrary,
  saveReadingProgress,
} from '../services/progress.service'

const progressSchema = z.object({
  bookId: z.string().min(1),
  currentChapter: z.coerce.number().int().positive(),
  currentPage: z.coerce.number().int().positive(),
  totalPagesInChapter: z.coerce.number().int().positive().optional(),
  action: z
    .enum(['start_reading', 'continue_reading', 'chapter_opened', 'page_progress'])
    .optional(),
})

export const saveProgress = async (req: Request, res: Response): Promise<Response> => {
  const parsed = progressSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  if (!Types.ObjectId.isValid(parsed.data.bookId)) {
    return errorResponse(res, 'Invalid book id', 400)
  }

  try {
    const progress = await saveReadingProgress(String(req.user!._id), parsed.data)
    return successResponse(res, progress, 200, 'Progress saved')
  } catch (err) {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
      return errorResponse(res, 'Book not found', 404)
    }
    throw err
  }
}

export const getMyLibrary = async (req: Request, res: Response): Promise<Response> => {
  const library = await getUserLibrary(String(req.user!._id))
  return successResponse(res, library)
}

export const getProgress = async (req: Request, res: Response): Promise<Response> => {
  const bookId = paramString(req.params.bookId)
  if (!Types.ObjectId.isValid(bookId)) {
    return errorResponse(res, 'Invalid book id', 400)
  }

  const progress = await getBookProgress(String(req.user!._id), bookId)
  return successResponse(res, progress ?? {})
}
