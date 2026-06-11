import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, UserRound } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const menuItemClass =
  'mx-1.5 flex w-[calc(100%-12px)] items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold text-[#3D2314] transition-colors duration-150 hover:bg-[#F5D9A0]/55'

export default function UserAccountMenu() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const isAccount = location.pathname === '/account'

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const initial = (user?.name ?? 'R').charAt(0).toUpperCase()

  useEffect(() => {
    if (!menuOpen) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!confirmOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirmOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [confirmOpen])

  const openLogoutConfirm = () => {
    setMenuOpen(false)
    setConfirmOpen(true)
  }

  const handleLogout = () => {
    setConfirmOpen(false)
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Account menu"
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm transition-transform duration-200 hover:scale-[1.04] active:scale-[0.98] ${
            isAccount ? 'ring-2 ring-[#8B2635]/45 ring-offset-1 ring-offset-[#FDF0D5]' : ''
          } bg-gradient-to-br from-[#8B2635] to-[#C4776A]`}
        >
          {initial}
        </button>

        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              role="menu"
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-[calc(100%+8px)] z-[150] min-w-[210px] overflow-hidden rounded-xl border border-[#E8C98A] bg-[#FEF8EE] py-2 shadow-[0_12px_40px_rgba(90,40,10,0.14)]"
            >
              <div className="border-b border-[#E8C98A]/70 px-3.5 pb-2.5 pt-1">
                <p className="truncate text-sm font-bold text-[#3D2314]">{user?.name ?? 'Reader'}</p>
                <p className="truncate text-xs text-[#9B6B4A]">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  role="menuitem"
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className={`${menuItemClass} no-underline ${isAccount ? 'bg-[#F5D9A0]/45' : ''}`}
                >
                  <UserRound className="h-4 w-4 shrink-0 text-[#6B4226]" strokeWidth={2.25} aria-hidden />
                  My Library
                </Link>

                <button
                  type="button"
                  role="menuitem"
                  onClick={openLogoutConfirm}
                  className={`${menuItemClass} text-left`}
                >
                  <LogOut className="h-4 w-4 shrink-0 text-[#6B4226]" strokeWidth={2.25} aria-hidden />
                  Log out
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {confirmOpen
          ? createPortal(
              <motion.div
                className="fixed inset-0 z-[500] flex min-h-[100dvh] items-center justify-center p-4 sm:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-dialog-title"
              >
                <motion.button
                  type="button"
                  aria-label="Close dialog"
                  className="absolute inset-0 bg-[#3D2314]/40 backdrop-blur-[3px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setConfirmOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.96 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="relative w-full max-w-[400px] rounded-2xl border border-[#E8C98A] bg-[#FEF8EE] p-6 shadow-[0_24px_64px_rgba(90,40,10,0.22)]"
                >
                  <h2 id="logout-dialog-title" className="font-pictoria text-xl font-bold text-[#3D2314]">
                    Sign out?
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B4226]">
                    You will need to sign in again to access your library and reading progress.
                  </p>

                  <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      className="rounded-full border border-[#E8C98A] bg-[#FDF0D5] px-5 py-2.5 text-sm font-bold text-[#6B4226] transition-colors duration-150 hover:bg-[#F5D9A0]/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.35)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Yes, sign out
                    </button>
                  </div>
                </motion.div>
              </motion.div>,
              document.body,
            )
          : null}
      </AnimatePresence>
    </>
  )
}
