import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { paramString } from '../utils/paramString'
import {
  getBookEngagement,
  getLikedBooks,
  getSavedBooks,
  toggleBookLike,
  toggleSavedBook,
} from '../services/engagement.service'

function parseBookId(res: Response, raw: string): string | null {
  if (!Types.ObjectId.isValid(raw)) {
    void errorResponse(res, 'Invalid book id', 400)
    return null
  }
  return raw
}

export const getEngagement = async (req: Request, res: Response): Promise<Response> => {
  const bookId = parseBookId(res, paramString(req.params.bookId))
  if (!bookId) return res

  const state = await getBookEngagement(String(req.user!._id), bookId)
  return successResponse(res, state)
}

export const toggleLike = async (req: Request, res: Response): Promise<Response> => {
  const bookId = parseBookId(res, paramString(req.params.bookId))
  if (!bookId) return res

  try {
    const state = await toggleBookLike(String(req.user!._id), bookId)
    return successResponse(res, state, 200, 'Like updated')
  } catch (err) {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
      return errorResponse(res, 'Book not found', 404)
    }
    throw err
  }
}

export const toggleSave = async (req: Request, res: Response): Promise<Response> => {
  const bookId = parseBookId(res, paramString(req.params.bookId))
  if (!bookId) return res

  try {
    const state = await toggleSavedBook(String(req.user!._id), bookId)
    return successResponse(res, state, 200, 'Save updated')
  } catch (err) {
    if (err instanceof Error && err.message === 'BOOK_NOT_FOUND') {
      return errorResponse(res, 'Book not found', 404)
    }
    throw err
  }
}

export const listSaved = async (req: Request, res: Response): Promise<Response> => {
  const items = await getSavedBooks(String(req.user!._id))
  return successResponse(res, items)
}

export const listLiked = async (req: Request, res: Response): Promise<Response> => {
  const items = await getLikedBooks(String(req.user!._id))
  return successResponse(res, items)
}
