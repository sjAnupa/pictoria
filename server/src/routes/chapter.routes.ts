import { Router } from 'express'
import * as chapterController from '../controllers/chapter.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { uploadMultiple } from '../middleware/upload.middleware'
import { uploadRateLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.get(
  '/book/:bookId/chapter/:chapterNumber',
  optionalAuthMiddleware,
  chapterController.getChapterForReading,
)
router.get('/book/:bookId', chapterController.getChaptersByBook)
router.get('/:id', optionalAuthMiddleware, chapterController.getChapterById)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  uploadRateLimiter,
  uploadMultiple,
  chapterController.createChapter,
)
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  uploadRateLimiter,
  uploadMultiple,
  chapterController.updateChapter,
)
router.delete('/:id', authMiddleware, requireRole('admin'), chapterController.deleteChapter)

export default router
