import { Request, Response } from 'express'
import { Types } from 'mongoose'
import { User, IUser, sanitizeUser } from '../models/User.model'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { paramString } from '../utils/paramString'

export const getAllUsers = async (req: Request, res: Response): Promise<Response> => {
  const page = Math.max(1, Number(req.query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20))
  const skip = (page - 1) * limit

  const filter: Record<string, unknown> = {}
  const andClauses: Record<string, unknown>[] = []

  if (req.query.role) filter.role = req.query.role
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true'

  if (req.query.search) {
    const search = String(req.query.search)
    andClauses.push({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    })
  }

  const accountType = req.query.accountType
  if (accountType === 'readers') {
    filter.is_admin = false
    filter.is_super_admin = false
  } else if (accountType === 'admins') {
    filter.is_admin = true
    filter.is_super_admin = false
  } else if (accountType === 'super_admins') {
    filter.is_super_admin = true
  } else if (accountType === 'staff') {
    andClauses.push({ $or: [{ is_admin: true }, { is_super_admin: true }] })
  }

  if (andClauses.length === 1) {
    Object.assign(filter, andClauses[0])
  } else if (andClauses.length > 1) {
    filter.$and = andClauses
  }

  const [users, totalCount] = await Promise.all([
    User.find(filter).select('-passwordHash').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ])

  return successResponse(res, {
    users,
    totalCount,
    totalPages: Math.ceil(totalCount / limit) || 1,
    currentPage: page,
  })
}

export const updateUser = async (req: Request, res: Response): Promise<Response> => {
  const id = paramString(req.params.id)
  if (!Types.ObjectId.isValid(id)) {
    return errorResponse(res, 'Invalid user id', 400)
  }

  const user = await User.findById(id)
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  const { name, role, isActive, is_admin } = req.body as {
    name?: string
    role?: string
    isActive?: boolean
    is_admin?: boolean
  }

  if (name !== undefined) user.name = name
  if (isActive !== undefined) user.isActive = isActive

  if (req.user!.is_super_admin) {
    if (is_admin !== undefined && !user.is_super_admin) {
      user.is_admin = Boolean(is_admin)
      user.role = is_admin ? 'admin' : 'user'
    }
    if (role !== undefined && role !== 'super_admin') {
      user.role = role as IUser['role']
      user.is_admin = role === 'admin'
    }
  } else if (role !== undefined || is_admin !== undefined) {
    return errorResponse(res, 'Only super admins can change admin access', 403)
  }

  if (user.is_super_admin) {
    user.is_admin = true
    user.role = 'super_admin'
  }

  await user.save()

  const safe = await User.findById(user._id).select('-passwordHash')
  return successResponse(res, sanitizeUser(safe!))
}

export const deleteUser = async (req: Request, res: Response): Promise<Response> => {
  const id = paramString(req.params.id)
  if (!Types.ObjectId.isValid(id)) {
    return errorResponse(res, 'Invalid user id', 400)
  }

  const user = await User.findById(id)
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }

  if (user.is_super_admin) {
    return errorResponse(res, 'Cannot delete a super admin account', 403)
  }

  await user.deleteOne()
  return successResponse(res, { message: 'User deleted' })
}
