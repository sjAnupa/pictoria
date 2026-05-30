/**
 * Mirrors backend user document fields.
 * - `is_admin`: grants admin portal access (books, analytics).
 * - `is_super_admin`: can promote/demote `is_admin` on other users.
 */
export interface User {
  _id: string
  name: string
  email: string
  is_admin: boolean
  is_super_admin: boolean
  avatar?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token: string
}
