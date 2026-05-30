import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken'
import { User, sanitizeUser } from '../models/User.model'
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { loginSchema, registerSchema } from '../validators/auth.validator'

function signToken(user: {
  _id: unknown
  role: string
  is_admin: boolean
  is_super_admin: boolean
}) {
  return jwt.sign(
    {
      _id: String(user._id),
      role: user.role,
      is_admin: user.is_admin,
      is_super_admin: user.is_super_admin,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN } as SignOptions,
  )
}

export const register = async (req: Request, res: Response): Promise<Response> => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const { name, email, password } = parsed.data
  const existing = await User.findOne({ email })
  if (existing) {
    return errorResponse(res, 'Email already registered', 409)
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: 'user',
    is_admin: false,
    is_super_admin: false,
  })

  const token = signToken(user)
  const safeUser = await User.findById(user._id).select('-passwordHash')

  return successResponse(res, { user: sanitizeUser(safeUser!), token }, 201, 'Registered successfully')
}

export const login = async (req: Request, res: Response): Promise<Response> => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  const { email, password } = parsed.data
  const user = await User.findOne({ email }).select('+passwordHash')
  if (!user) {
    return errorResponse(res, 'Invalid email or password', 401)
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return errorResponse(res, 'Invalid email or password', 401)
  }

  if (!user.isActive) {
    return errorResponse(res, 'Account is deactivated', 403)
  }

  const token = signToken(user)
  const safeUser = await User.findById(user._id).select('-passwordHash')

  return successResponse(res, { user: sanitizeUser(safeUser!), token }, 200, 'Logged in successfully')
}

export const getMe = async (req: Request, res: Response): Promise<Response> => {
  const user = await User.findById(req.user!._id).select('-passwordHash')
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }
  return successResponse(res, sanitizeUser(user))
}
