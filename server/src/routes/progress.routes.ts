import { Router } from 'express'
import * as progressController from '../controllers/progress.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/', authMiddleware, progressController.saveProgress)
router.get('/:bookId', authMiddleware, progressController.getProgress)

export default router
