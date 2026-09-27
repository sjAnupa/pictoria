import { Router } from 'express'
import * as bookController from '../controllers/book.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { uploadSingle } from '../middleware/upload.middleware'
import { uploadRateLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.get('/catalog-stats', bookController.getCatalogStats)
router.get('/most-liked', bookController.getMostLikedBooks)
router.get(
  '/manage/:id',
  authMiddleware,
  requireRole('admin'),
  bookController.getBookForAdminEdit,
)
router.get('/', optionalAuthMiddleware, bookController.getAllBooks)
router.get('/:slug', optionalAuthMiddleware, bookController.getBookBySlug)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  uploadRateLimiter,
  uploadSingle,
  bookController.createBook,
)
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  uploadRateLimiter,
  uploadSingle,
  bookController.updateBook,
)
router.delete('/:id', authMiddleware, requireRole('admin'), bookController.deleteBook)

export default router
