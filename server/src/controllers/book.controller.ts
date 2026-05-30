import { Request, Response } from 'express'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { createBookSchema, updateBookSchema } from '../validators/book.validator'
import { paramString } from '../utils/paramString'
import {
  createBookRecord,
  deleteBookRecord,
  findAllBooks,
  findBookById,
  findBookBySlug,
  updateBookRecord,
} from '../services/book.service'

export const getAllBooks = async (req: Request, res: Response): Promise<Response> => {
  const result = await findAllBooks({
    genre: req.query.genre as string | undefined,
    tag: req.query.tag as string | undefined,
    status: (req.query.status as string) || 'published',
    search: req.query.search as string | undefined,
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 12,
  })

  return successResponse(res, result)
}

export const getBookBySlug = async (req: Request, res: Response): Promise<Response> => {
  const book = await findBookBySlug(paramString(req.params.slug))
  if (!book) {
    return errorResponse(res, 'Book not found', 404)
  }
  return successResponse(res, book)
}

export const createBook = async (req: Request, res: Response): Promise<Response> => {
  const parsed = createBookSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  if (!req.file) {
    return errorResponse(res, 'Cover image is required', 400)
  }

  const book = await createBookRecord(parsed.data, req.file, req.user!._id)
  return successResponse(res, book, 201, 'Book created')
}

export const updateBook = async (req: Request, res: Response): Promise<Response> => {
  const parsed = updateBookSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const book = await findBookById(paramString(req.params.id))
  if (!book) {
    return errorResponse(res, 'Book not found', 404)
  }

  const updated = await updateBookRecord(book, parsed.data, req.file)
  return successResponse(res, updated, 200, 'Book updated')
}

export const deleteBook = async (req: Request, res: Response): Promise<Response> => {
  const book = await findBookById(paramString(req.params.id))
  if (!book) {
    return errorResponse(res, 'Book not found', 404)
  }

  await deleteBookRecord(book)
  return successResponse(res, { message: 'Book deleted' })
}
