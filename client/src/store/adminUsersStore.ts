import { create } from 'zustand'
import { INITIAL_DIRECTORY_USERS, type DirectoryUser } from '../data/mockAuthUsers'

interface AdminUsersState {
  users: DirectoryUser[]
  setUserAdmin: (userId: string, isAdmin: boolean) => void
}

export const useAdminUsersStore = create<AdminUsersState>((set) => ({
  users: INITIAL_DIRECTORY_USERS,
  setUserAdmin: (userId, isAdmin) =>
    set((state) => ({
      users: state.users.map((u) => {
        if (u.id !== userId) return u
        if (u.is_super_admin) return u
        return { ...u, is_admin: isAdmin }
      }),
    })),
}))
