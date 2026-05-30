import { Router } from 'express'
import * as userController from '../controllers/user.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.get('/', authMiddleware, requireRole('admin'), userController.getAllUsers)
router.put('/:id', authMiddleware, requireRole('admin'), userController.updateUser)
router.delete('/:id', authMiddleware, requireRole('admin'), userController.deleteUser)

export default router
