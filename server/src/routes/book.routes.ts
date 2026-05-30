import { Router } from 'express'
import * as bookController from '../controllers/book.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { uploadSingle } from '../middleware/upload.middleware'

const router = Router()

router.get('/', bookController.getAllBooks)
router.get('/:slug', bookController.getBookBySlug)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  uploadSingle,
  bookController.createBook,
)
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  uploadSingle,
  bookController.updateBook,
)
router.delete('/:id', authMiddleware, requireRole('admin'), bookController.deleteBook)

export default router
