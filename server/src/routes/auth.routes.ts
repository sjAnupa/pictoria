import { Router } from 'express'
import * as authController from '../controllers/auth.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { authRateLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.post('/google', authRateLimiter, authController.googleAuth)
router.post('/facebook', authRateLimiter, authController.facebookAuth)
router.get('/me', authMiddleware, authController.getMe)

export default router
