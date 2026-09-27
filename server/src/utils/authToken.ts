import jwt, { SignOptions } from 'jsonwebtoken'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env'

export function signAuthToken(user: {
  _id: unknown
  role: string
  is_admin: boolean
  is_super_admin: boolean
}): string {
  return jwt.sign(
    {
      _id: String(user._id),
      role: user.role,
      is_admin: user.is_admin,
      is_super_admin: user.is_super_admin,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, algorithm: 'HS256' } as SignOptions,
  )
}
