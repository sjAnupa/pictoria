import { Router } from 'express'
import * as viewController from '../controllers/view.controller'
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware'
import { viewRateLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.post('/book/:bookId', viewRateLimiter, optionalAuthMiddleware, viewController.pingBookView)

export default router
