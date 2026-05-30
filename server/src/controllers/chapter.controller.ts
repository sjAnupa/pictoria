import { Request, Response } from 'express'
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

export const getChaptersByBook = async (req: Request, res: Response): Promise<Response> => {
  const chapters = await findChaptersByBookId(paramString(req.params.bookId))
  return successResponse(res, chapters)
}

export const getChapterById = async (req: Request, res: Response): Promise<Response> => {
  const chapter = await findChapterById(paramString(req.params.id))
  if (!chapter) {
    return errorResponse(res, 'Chapter not found', 404)
  }
  return successResponse(res, chapter)
}

export const createChapter = async (req: Request, res: Response): Promise<Response> => {
  const parsed = createChapterSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const files = (req.files as Express.Multer.File[]) ?? []
  const chapter = await createChapterRecord(parsed.data, files)
  if (!chapter) {
    return errorResponse(res, 'Book not found', 404)
  }

  return successResponse(res, chapter, 201, 'Chapter created')
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
  const updated = await updateChapterRecord(chapter, parsed.data, files)
  if (!updated) {
    return errorResponse(res, 'Book not found', 404)
  }

  return successResponse(res, updated, 200, 'Chapter updated')
}

export const deleteChapter = async (req: Request, res: Response): Promise<Response> => {
  const chapter = await findChapterDocumentById(paramString(req.params.id))
  if (!chapter) {
    return errorResponse(res, 'Chapter not found', 404)
  }

  await deleteChapterRecord(chapter)
  return successResponse(res, { message: 'Chapter deleted' })
}
