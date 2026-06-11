import { Router } from 'express'
import * as chapterController from '../controllers/chapter.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { uploadMultiple } from '../middleware/upload.middleware'

const router = Router()

router.get(
  '/book/:bookId/chapter/:chapterNumber',
  optionalAuthMiddleware,
  chapterController.getChapterForReading,
)
router.get('/book/:bookId', chapterController.getChaptersByBook)
router.get('/:id', chapterController.getChapterById)
router.post(
  '/',
  authMiddleware,
  requireRole('admin'),
  uploadMultiple,
  chapterController.createChapter,
)
router.put(
  '/:id',
  authMiddleware,
  requireRole('admin'),
  uploadMultiple,
  chapterController.updateChapter,
)
router.delete('/:id', authMiddleware, requireRole('admin'), chapterController.deleteChapter)

export default router
