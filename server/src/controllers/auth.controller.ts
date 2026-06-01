import { Request, Response } from 'express'
import { User, sanitizeUser } from '../models/User.model'
import { successResponse, errorResponse } from '../utils/apiResponse'
import { facebookAuthSchema, googleAuthSchema } from '../validators/auth.validator'
import { signAuthToken } from '../utils/authToken'
import { authenticateWithGoogle, GoogleAuthError } from '../services/oauthGoogle.service'
import {
  authenticateWithFacebook,
  OAuthError,
} from '../services/oauthFacebook.service'
import { isFacebookAuthConfigured, isGoogleAuthConfigured } from '../config/env'

export const googleAuth = async (req: Request, res: Response): Promise<Response> => {
  if (!isGoogleAuthConfigured()) {
    return errorResponse(
      res,
      'Google sign-in is not configured.',
      503,
      [],
      'GOOGLE_NOT_CONFIGURED',
    )
  }

  const parsed = googleAuthSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  try {
    const user = await authenticateWithGoogle(parsed.data.credential, parsed.data.intent)
    const token = signAuthToken(user)
    const safeUser = await User.findById(user._id).select('-passwordHash')
    const message =
      parsed.data.intent === 'register' ? 'Account created successfully' : 'Logged in successfully'
    return successResponse(res, { user: sanitizeUser(safeUser!), token }, 200, message)
  } catch (err) {
    if (err instanceof GoogleAuthError || err instanceof OAuthError) {
      return errorResponse(res, err.message, err.statusCode, [], err.code)
    }
    console.error('Google auth error:', err)
    return errorResponse(res, 'Google sign-in failed. Please try again.', 500)
  }
}

export const facebookAuth = async (req: Request, res: Response): Promise<Response> => {
  if (!isFacebookAuthConfigured()) {
    return errorResponse(
      res,
      'Facebook sign-in is not configured.',
      503,
      [],
      'FACEBOOK_NOT_CONFIGURED',
    )
  }

  const parsed = facebookAuthSchema.safeParse(req.body)
  if (!parsed.success) {
    return errorResponse(res, 'Validation failed', 400, parsed.error.issues.map((i) => i.message))
  }

  try {
    const user = await authenticateWithFacebook(parsed.data.accessToken, parsed.data.intent)
    const token = signAuthToken(user)
    const safeUser = await User.findById(user._id).select('-passwordHash')
    const message =
      parsed.data.intent === 'register' ? 'Account created successfully' : 'Logged in successfully'
    return successResponse(res, { user: sanitizeUser(safeUser!), token }, 200, message)
  } catch (err) {
    if (err instanceof OAuthError) {
      return errorResponse(res, err.message, err.statusCode, [], err.code)
    }
    console.error('Facebook auth error:', err)
    return errorResponse(res, 'Facebook sign-in failed. Please try again.', 500)
  }
}

export const getMe = async (req: Request, res: Response): Promise<Response> => {
  const user = await User.findById(req.user!._id).select('-passwordHash')
  if (!user) {
    return errorResponse(res, 'User not found', 404)
  }
  return successResponse(res, sanitizeUser(user))
}
