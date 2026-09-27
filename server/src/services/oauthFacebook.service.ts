import { FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from '../config/env'
import { IUser, User } from '../models/User.model'

export type OAuthIntent = 'login' | 'register'

export type OAuthErrorCode =
  | 'INVALID_TOKEN'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_EXISTS'
  | 'ACCOUNT_NOT_FOUND'
  | 'USE_OTHER_PROVIDER'
  | 'ACCOUNT_INACTIVE'
  | 'GOOGLE_NOT_CONFIGURED'
  | 'FACEBOOK_NOT_CONFIGURED'

export class OAuthError extends Error {
  constructor(
    public readonly code: OAuthErrorCode,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message)
    this.name = 'OAuthError'
  }
}

export type FacebookProfile = {
  facebookId: string
  email: string
  name: string
  picture?: string
}

type FacebookDebugTokenResponse = {
  data?: {
    is_valid?: boolean
    app_id?: string
    user_id?: string
  }
}

type FacebookMeResponse = {
  id?: string
  name?: string
  email?: string
  picture?: { data?: { url?: string } }
}

function assertFacebookConfigured(): void {
  if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
    throw new OAuthError(
      'FACEBOOK_NOT_CONFIGURED',
      'Facebook sign-in is not configured on the server.',
      503,
    )
  }
}

export async function verifyFacebookAccessToken(accessToken: string): Promise<FacebookProfile> {
  assertFacebookConfigured()

  const appAccessToken = `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
  const debugUrl = new URL('https://graph.facebook.com/debug_token')
  debugUrl.searchParams.set('input_token', accessToken)
  debugUrl.searchParams.set('access_token', appAccessToken)

  const debugRes = await fetch(debugUrl)
  const debugData = (await debugRes.json()) as FacebookDebugTokenResponse

  if (!debugData.data?.is_valid || debugData.data.app_id !== FACEBOOK_APP_ID) {
    throw new OAuthError('INVALID_TOKEN', 'Invalid Facebook sign-in token.', 401)
  }

  const meUrl = new URL('https://graph.facebook.com/me')
  meUrl.searchParams.set('fields', 'id,name,email,picture.type(large)')
  meUrl.searchParams.set('access_token', accessToken)

  const meRes = await fetch(meUrl)
  const me = (await meRes.json()) as FacebookMeResponse

  if (!me.id) {
    throw new OAuthError('INVALID_TOKEN', 'Could not load Facebook profile.', 401)
  }

  const email = (me.email ?? `${me.id}@facebook.pictoriya.local`).toLowerCase().trim()

  return {
    facebookId: me.id,
    email,
    name: (me.name ?? 'Pictoriya Reader').trim(),
    picture: me.picture?.data?.url,
  }
}

export async function authenticateWithFacebook(
  accessToken: string,
  intent: OAuthIntent,
): Promise<IUser> {
  const profile = await verifyFacebookAccessToken(accessToken)

  let user = await User.findOne({ facebookId: profile.facebookId })

  if (user) {
    if (!user.isActive) {
      throw new OAuthError('ACCOUNT_INACTIVE', 'This account has been deactivated.', 403)
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
      throw new OAuthError('ACCOUNT_INACTIVE', 'This account has been deactivated.', 403)
    }

    if (intent === 'register') {
      throw new OAuthError(
        'ACCOUNT_EXISTS',
        'An account with this email already exists. Sign in with Google or Facebook instead.',
        409,
      )
    }

    if (user.facebookId && user.facebookId !== profile.facebookId) {
      throw new OAuthError(
        'INVALID_TOKEN',
        'This email is linked to a different Facebook account.',
        409,
      )
    }

    user.facebookId = profile.facebookId
    if (!user.authProviders.includes('facebook')) {
      user.authProviders.push('facebook')
    }
    if (profile.picture) user.avatar = profile.picture
    if (!user.name?.trim()) user.name = profile.name
    await user.save()
    return user
  }

  if (intent === 'login') {
    throw new OAuthError(
      'ACCOUNT_NOT_FOUND',
      'No account found for this Facebook profile. Create an account first.',
      404,
    )
  }

  user = await User.create({
    name: profile.name,
    email: profile.email,
    facebookId: profile.facebookId,
    avatar: profile.picture,
    authProviders: ['facebook'],
    role: 'user',
    is_admin: false,
    is_super_admin: false,
  })

  return user
}
