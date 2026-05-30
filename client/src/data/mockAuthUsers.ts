import type { User } from '../types/user.types'

/** Demo login accounts (password for all: `demo123`). */
export const MOCK_LOGIN_ACCOUNTS: Array<{
  email: string
  password: string
  user: User
}> = [
  {
    email: 'superadmin@pictoria.dev',
    password: 'demo123',
    user: {
      _id: 'usr_super_001',
      name: 'Alex Morgan',
      email: 'superadmin@pictoria.dev',
      is_admin: true,
      is_super_admin: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  },
  {
    email: 'admin@pictoria.dev',
    password: 'demo123',
    user: {
      _id: 'usr_admin_001',
      name: 'Jordan Lee',
      email: 'admin@pictoria.dev',
      is_admin: true,
      is_super_admin: false,
      createdAt: '2026-02-10T00:00:00.000Z',
    },
  },
  {
    email: 'reader@pictoria.dev',
    password: 'demo123',
    user: {
      _id: 'usr_reader_001',
      name: 'Sam Rivera',
      email: 'reader@pictoria.dev',
      is_admin: false,
      is_super_admin: false,
      createdAt: '2026-03-05T00:00:00.000Z',
    },
  },
]

export type DirectoryUser = {
  id: string
  name: string
  email: string
  books: number
  lastActive: string
  status: 'Active' | 'Inactive' | 'Premium'
  joined: string
  initials: string
  color: string
  is_admin: boolean
  is_super_admin: boolean
}

/** Registered users shown in admin directory (super admin can toggle `is_admin`). */
export const INITIAL_DIRECTORY_USERS: DirectoryUser[] = [
  { id: 'usr_super_001', name: 'Alex Morgan', email: 'superadmin@pictoria.dev', books: 0, lastActive: 'Today', status: 'Active', joined: 'Jan 2026', initials: 'AM', color: '#4F46E5', is_admin: true, is_super_admin: true },
  { id: 'usr_admin_001', name: 'Jordan Lee', email: 'admin@pictoria.dev', books: 3, lastActive: 'Today', status: 'Active', joined: 'Feb 2026', initials: 'JL', color: '#0284C7', is_admin: true, is_super_admin: false },
  { id: 'usr_002', name: 'Sarah Chen', email: 'sarah.c@email.com', books: 24, lastActive: 'Today', status: 'Active', joined: 'Jan 2026', initials: 'SC', color: '#7C3AED', is_admin: false, is_super_admin: false },
  { id: 'usr_003', name: 'Mike Rodriguez', email: 'mike.r@email.com', books: 19, lastActive: 'Yesterday', status: 'Active', joined: 'Feb 2026', initials: 'MR', color: '#059669', is_admin: false, is_super_admin: false },
  { id: 'usr_004', name: 'Aisha Patel', email: 'aisha.p@email.com', books: 17, lastActive: '2 days ago', status: 'Active', joined: 'Mar 2026', initials: 'AP', color: '#D97706', is_admin: false, is_super_admin: false },
  { id: 'usr_005', name: 'Tom Williams', email: 'tom.w@email.com', books: 15, lastActive: '1 week ago', status: 'Inactive', joined: 'Jan 2026', initials: 'TW', color: '#6B7280', is_admin: false, is_super_admin: false },
  { id: 'usr_006', name: 'Emma Laurent', email: 'emma.l@email.com', books: 14, lastActive: 'Today', status: 'Active', joined: 'Feb 2026', initials: 'EL', color: '#DB2777', is_admin: false, is_super_admin: false },
  { id: 'usr_007', name: 'James Park', email: 'james.p@email.com', books: 11, lastActive: '3 days ago', status: 'Active', joined: 'Mar 2026', initials: 'JP', color: '#2563EB', is_admin: false, is_super_admin: false },
  { id: 'usr_008', name: 'Leo Tanaka', email: 'leo.t@email.com', books: 7, lastActive: 'Today', status: 'Premium', joined: 'Apr 2026', initials: 'LT', color: '#0EA5E9', is_admin: false, is_super_admin: false },
]
