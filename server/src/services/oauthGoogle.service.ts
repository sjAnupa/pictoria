import { OAuth2Client } from 'google-auth-library'
import { GOOGLE_CLIENT_ID } from '../config/env'
import { IUser, User } from '../models/User.model'
import { OAuthError, type OAuthErrorCode } from './oauthFacebook.service'

export type GoogleAuthIntent = 'login' | 'register'

export type GoogleAuthErrorCode = OAuthErrorCode

export class GoogleAuthError extends OAuthError {}

export type GoogleProfile = {
  googleId: string
  email: string
  name: string
  picture?: string
  emailVerified: boolean
}

let oauthClient: OAuth2Client | null = null

function getOAuthClient(): OAuth2Client {
  if (!GOOGLE_CLIENT_ID) {
    throw new OAuthError(
      'GOOGLE_NOT_CONFIGURED',
      'Google sign-in is not configured on the server.',
      503,
    )
  }
  if (!oauthClient) {
    oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID)
  }
  return oauthClient
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  const client = getOAuthClient()
  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email) {
    throw new OAuthError('INVALID_TOKEN', 'Invalid Google sign-in token.', 401)
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase().trim(),
    name: (payload.name ?? payload.email.split('@')[0]).trim(),
    picture: payload.picture,
    emailVerified: payload.email_verified === true,
  }
}

export async function authenticateWithGoogle(
  idToken: string,
  intent: GoogleAuthIntent,
): Promise<IUser> {
  const profile = await verifyGoogleIdToken(idToken)

  if (!profile.emailVerified) {
    throw new GoogleAuthError(
      'EMAIL_NOT_VERIFIED',
      'Your Google email must be verified before signing in.',
      403,
    )
  }

  let user = await User.findOne({ googleId: profile.googleId })

  if (user) {
    if (!user.isActive) {
      throw new GoogleAuthError('ACCOUNT_INACTIVE', 'This account has been deactivated.', 403)
    }
    if (profile.picture && user.avatar !== profile.picture) {
      user.avatar = profile.picture
      await user.save()
    }
    return user
  }

  user = await User.findOne({ email: profile.email })

  if (user) {
    if (!user.isActive) {
      throw new GoogleAuthError('ACCOUNT_INACTIVE', 'This account has been deactivated.', 403)
    }

    if (intent === 'register') {
      throw new GoogleAuthError(
        'ACCOUNT_EXISTS',
        'An account with this email already exists. Sign in with Google or Facebook instead.',
        409,
      )
    }

    if (user.googleId && user.googleId !== profile.googleId) {
      throw new GoogleAuthError(
        'INVALID_TOKEN',
        'This email is linked to a different Google account.',
        409,
      )
    }

    user.googleId = profile.googleId
    if (!user.authProviders.includes('google')) {
      user.authProviders.push('google')
    }
    if (profile.picture) user.avatar = profile.picture
    if (!user.name?.trim()) user.name = profile.name
    await user.save()
    return user
  }

  if (intent === 'login') {
    throw new GoogleAuthError(
      'ACCOUNT_NOT_FOUND',
      'No account found for this Google email. Create an account first.',
      404,
    )
  }

  user = await User.create({
    name: profile.name,
    email: profile.email,
    googleId: profile.googleId,
    avatar: profile.picture,
    authProviders: ['google'],
    role: 'user',
    is_admin: false,
    is_super_admin: false,
  })

  return user
}
