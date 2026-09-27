import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
import { User } from '../models/User.model'
import { errorResponse } from '../utils/apiResponse'

interface JwtPayload {
  _id: string
}

/** Verifies JWT, then loads current role flags from MongoDB (so DB admin updates apply without re-login). */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    errorResponse(res, 'Authentication required', 401)
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as JwtPayload
    const user = await User.findById(decoded._id).select(
      'role is_admin is_super_admin isActive',
    )

    if (!user) {
      errorResponse(res, 'User not found', 401)
      return
    }

    if (!user.isActive) {
      errorResponse(res, 'Account is deactivated', 403)
      return
    }

    req.user = {
      _id: String(user._id),
      role: user.role,
      is_admin: Boolean(user.is_admin),
      is_super_admin: Boolean(user.is_super_admin),
    }
    next()
  } catch {
    errorResponse(res, 'Invalid or expired token', 401)
  }
}
