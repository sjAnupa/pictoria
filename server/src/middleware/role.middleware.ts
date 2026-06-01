import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../utils/apiResponse'

function roleMatches(userRole: string, allowed: string): boolean {
  if (userRole === allowed) return true
  if (allowed === 'admin' && userRole === 'super_admin') return true
  return false
}

export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Authentication required', 401)
      return
    }

    const allowed =
      roles.includes('admin') && req.user.is_admin
        ? true
        : roles.some((role) => roleMatches(req.user!.role, role))

    if (!allowed) {
      errorResponse(res, 'Forbidden: insufficient permissions', 403, [], 'FORBIDDEN')
      return
    }

    next()
  }

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user?.is_super_admin) {
    errorResponse(res, 'Forbidden: super admin access required', 403)
    return
  }
  next()
}
