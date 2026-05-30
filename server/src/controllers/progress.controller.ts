import { Request, Response } from 'express'
import { z } from 'zod'
import { Types } from 'mongoose'
import { ReadingProgress } from '../models/ReadingProgress.model'
import { Book } from '../models/Book.model'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { paramString } from '../utils/paramString'

const progressSchema = z.object({
  bookId: z.string().min(1),
  currentChapter: z.coerce.number().int().positive(),
  currentPage: z.coerce.number().int().positive(),
})

export const saveProgress = async (req: Request, res: Response): Promise<Response> => {
  const parsed = progressSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  if (!Types.ObjectId.isValid(parsed.data.bookId)) {
    return errorResponse(res, 'Invalid book id', 400)
  }

  const book = await Book.findById(parsed.data.bookId)
  if (!book) {
    return errorResponse(res, 'Book not found', 404)
  }

  const completed =
    book.totalChapters > 0 && parsed.data.currentChapter >= book.totalChapters

  const progress = await ReadingProgress.findOneAndUpdate(
    { userId: req.user!._id, bookId: parsed.data.bookId },
    {
      $set: {
        currentChapter: parsed.data.currentChapter,
        currentPage: parsed.data.currentPage,
        lastReadAt: new Date(),
        completed,
        ...(completed ? { completedAt: new Date() } : {}),
      },
      $addToSet: { chaptersRead: parsed.data.currentChapter },
      $setOnInsert: { startedAt: new Date() },
    },
    { upsert: true, new: true },
  )

  return successResponse(res, progress)
}

export const getProgress = async (req: Request, res: Response): Promise<Response> => {
  if (!Types.ObjectId.isValid(paramString(req.params.bookId))) {
    return errorResponse(res, 'Invalid book id', 400)
  }

  const progress = await ReadingProgress.findOne({
    userId: req.user!._id,
    bookId: paramString(req.params.bookId),
  })

  return successResponse(res, progress ?? {})
}
