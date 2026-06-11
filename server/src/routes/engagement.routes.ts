import { Router } from 'express'
import * as engagementController from '../controllers/engagement.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

router.get('/me/saved', engagementController.listSaved)
router.get('/me/liked', engagementController.listLiked)
router.get('/book/:bookId', engagementController.getEngagement)
router.put('/book/:bookId/like', engagementController.toggleLike)
router.put('/book/:bookId/save', engagementController.toggleSave)

export default router
