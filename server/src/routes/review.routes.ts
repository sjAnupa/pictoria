import { Router } from 'express'
import * as reviewController from '../controllers/review.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware'
import { requireRole } from '../middleware/role.middleware'
import { reviewWriteRateLimiter } from '../middleware/rateLimit.middleware'

const router = Router()

router.get('/book/:bookId', optionalAuthMiddleware, reviewController.getBookReviews)
router.post('/book/:bookId', authMiddleware, reviewWriteRateLimiter, reviewController.submitReview)
router.delete('/:id', authMiddleware, reviewWriteRateLimiter, reviewController.removeReview)
router.patch('/:id/hide', authMiddleware, requireRole('admin'), reviewController.toggleReviewHidden)

export default router
