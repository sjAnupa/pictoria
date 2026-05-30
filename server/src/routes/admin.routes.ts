import { Router } from 'express'
import * as adminController from '../controllers/admin.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.get('/dashboard', authMiddleware, requireRole('admin'), adminController.getDashboardStats)

export default router
