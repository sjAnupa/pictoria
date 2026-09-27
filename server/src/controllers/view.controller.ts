import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { paramString } from '../utils/paramString'
import { recordBookView } from '../services/view.service'

export const pingBookView = async (req: Request, res: Response): Promise<Response> => {
  const bookId = paramString(req.params.bookId)
  if (!Types.ObjectId.isValid(bookId)) {
    return errorResponse(res, 'Invalid book id', 400)
  }

  const anonId =
    typeof req.body?.anonId === 'string' && req.body.anonId.trim()
      ? req.body.anonId.trim().slice(0, 64)
      : undefined

  try {
    const result = await recordBookView(bookId, {
      userId: req.user ? String(req.user._id) : undefined,
      anonId,
    })
    return successResponse(res, result)
  } catch (err) {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
      return errorResponse(res, 'Book not found', 404)
    }
    throw err
  }
}
