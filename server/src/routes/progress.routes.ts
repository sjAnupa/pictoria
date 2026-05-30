import { Router } from 'express'
import * as progressController from '../controllers/progress.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.get('/me', authMiddleware, progressController.getMyLibrary)
router.post('/', authMiddleware, progressController.saveProgress)
router.get('/book/:bookId', authMiddleware, progressController.getProgress)

export default router
