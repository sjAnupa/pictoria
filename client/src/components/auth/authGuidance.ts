export type AuthGuidanceKind = 'account_not_found' | 'account_exists'

export const authGuidanceCopy: Record<
  AuthGuidanceKind,
  { message: string; action: { label: string; to: string } }
> = {
  account_not_found: {
    message: 'No account with this sign-in.',
    action: { label: 'Sign up', to: '/register' },
  },
  account_exists: {
    message: 'You already have an account.',
    action: { label: 'Sign in', to: '/login' },
  },
}
