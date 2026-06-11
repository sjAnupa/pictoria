import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../config/env'
import { User } from '../models/User.model'

interface JwtPayload {
  _id: string
}

/** Attaches req.user when a valid Bearer token is present; never rejects anonymous requests. */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
    const user = await User.findById(decoded._id).select(
      'role is_admin is_super_admin isActive',
    )

    if (user?.isActive) {
      req.user = {
        _id: String(user._id),
        role: user.role,
        is_admin: Boolean(user.is_admin),
        is_super_admin: Boolean(user.is_super_admin),
      }
    }
  } catch {
    // Invalid token — treat as anonymous for public catalog routes.
  }

  next()
}

export function isCatalogAdmin(req: Request): boolean {
  return Boolean(req.user?.is_admin || req.user?.is_super_admin)
}
