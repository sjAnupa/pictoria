import type { User } from '../types/user.types'

export function canAccessAdminPortal(user: User | null | undefined): boolean {
  return Boolean(user?.is_admin)
}

export function canManageAdminRoles(user: User | null | undefined): boolean {
  return Boolean(user?.is_super_admin)
}

export function adminRoleLabel(user: User | null | undefined): string {
  if (!user?.is_admin) return 'Reader'
  if (user.is_super_admin) return 'Super admin'
  return 'Admin'
}
