import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.post('/google', authController.googleAuth)
router.post('/facebook', authController.facebookAuth)
router.get('/me', authMiddleware, authController.getMe)

export default router
