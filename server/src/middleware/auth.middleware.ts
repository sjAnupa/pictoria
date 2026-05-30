import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
import { errorResponse } from '../utils/apiResponse'

interface JwtPayload {
  _id: string
  role: string
  is_admin: boolean
  is_super_admin: boolean
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    errorResponse(res, 'Authentication required', 401)
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    req.user = {
      _id: decoded._id,
      role: decoded.role,
      is_admin: Boolean(decoded.is_admin),
      is_super_admin: Boolean(decoded.is_super_admin),
    }
    next()
  } catch {
    errorResponse(res, 'Invalid or expired token', 401)
  }
}
