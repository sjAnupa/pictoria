import { Router } from 'express'
import * as categoryController from '../controllers/category.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { requireRole } from '../middleware/role.middleware'

const router = Router()

router.get('/', categoryController.getCategories)
router.post('/', authMiddleware, requireRole('admin'), categoryController.createCategory)
router.put('/:id', authMiddleware, requireRole('admin'), categoryController.updateCategory)
router.delete('/:id', authMiddleware, requireRole('admin'), categoryController.deleteCategory)

export default router
