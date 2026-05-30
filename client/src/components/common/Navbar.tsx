import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { BookOpen, Menu, X, LayoutDashboard, House, LibraryBig } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { canAccessAdminPortal } from '../../utils/authPermissions'
import UserAccountMenu from './UserAccountMenu'

function navItemClass(active: boolean) {
  return [
    'rounded-full px-3.5 py-2 text-sm font-semibold transition',
    active
      ? 'bg-[#8B2635] text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.35)]'
      : 'text-[#6B4226] hover:bg-[#F5D9A0]/70 hover:text-[#3D2314]',
  ].join(' ')
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const isAdmin = canAccessAdminPortal(user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { pathname, hash } = location
  const onHome = pathname === '/'
  const isCatalog = pathname === '/library'
  const isAdminRoute = pathname.startsWith('/admin')
  const featuredActive = onHome && hash === '#featured-reads'
  const newActive = onHome && hash === '#new-arrivals'

  return (
    <nav
      style={{
        background: 'rgba(253, 240, 213, 0.97)',
        borderBottom: '1.5px solid #E8C98A',
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      <div className="page-gutter flex min-h-[76px] h-[76px] items-center gap-3 sm:gap-4">
        <Link
          to="/"
          className="flex min-w-0 shrink-0 items-center gap-2.5 no-underline sm:gap-3"
          style={{ textDecoration: 'none' }}
          title="Pictoria — home"
        >
          <img
            src="/logo-mark.png"
            alt=""
            width={56}
            height={56}
            decoding="async"
            className="h-14 w-14 shrink-0 object-contain [image-rendering:-webkit-optimize-contrast]"
          />
          <span
            className="font-pictoria text-[1.35rem] font-semibold leading-none tracking-[-0.02em] text-[#3D2314] sm:text-[1.5rem]"
            style={{ fontFeatureSettings: '"opsz" 72' }}
          >
            Pictoria
          </span>
        </Link>

        {onHome ? (
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 px-2 md:flex lg:gap-2">
            <Link to="/#featured-reads" className={navItemClass(featuredActive)}>
              Featured reads
            </Link>
            <Link to="/#new-arrivals" className={navItemClass(newActive)}>
              New arrivals
            </Link>
            <Link to="/library" className={navItemClass(false)}>
              Browse catalog
            </Link>
          </div>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {!onHome ? (
            <Link
              to={isCatalog ? '/' : '/library'}
              className="hidden items-center gap-1.5 rounded-full border border-[#E8C98A] bg-[#FEF8EE] px-3 py-1.5 text-xs font-bold text-[#6B4226] no-underline transition hover:bg-[#F5D9A0]/80 md:inline-flex"
            >
              {isCatalog ? <House className="h-3.5 w-3.5" strokeWidth={2.5} /> : <LibraryBig className="h-3.5 w-3.5" strokeWidth={2.5} />}
              {isCatalog ? 'Home' : 'Catalog'}
            </Link>
          ) : null}
          {isAdmin && (
            <Link
              to="/admin"
              className={`hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold no-underline transition md:inline-flex ${
                isAdminRoute
                  ? 'border-[#8B2635]/35 bg-[#8B2635] text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.25)]'
                  : 'border-[#E8C98A] bg-[#FEF8EE] text-[#6B4226] hover:bg-[#F5D9A0]/80'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={2.5} />
              Admin
            </Link>
          )}
          {!isAuthenticated && (
            <Link
              to="/login"
              className="hidden rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-3.5 py-2 text-xs font-bold text-[#FEF8EE] no-underline shadow-md md:inline-flex"
            >
              Sign in
            </Link>
          )}
          {isAuthenticated && <UserAccountMenu />}

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E8C98A] bg-[#FEF8EE] text-[#6B4226] md:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="page-gutter border-t border-[#E8C98A] py-4 md:hidden"
          style={{ background: '#FDF0D5', fontFamily: "'Nunito', sans-serif" }}
        >
          <div className="flex flex-col gap-1">
            {onHome ? (
              <>
                <Link
                  to="/#featured-reads"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-[#6B4226] no-underline hover:bg-[#F5D9A0]/50"
                >
                  <BookOpen size={16} />
                  Featured reads
                </Link>
                <Link
                  to="/#new-arrivals"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-[#6B4226] no-underline hover:bg-[#F5D9A0]/50"
                >
                  <BookOpen size={16} />
                  New arrivals
                </Link>
                <Link
                  to="/library"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-3 py-3 text-[#6B4226] no-underline hover:bg-[#F5D9A0]/50"
                >
                  <BookOpen size={16} />
                  Browse catalog
                </Link>
              </>
            ) : (
              <Link
                to={isCatalog ? '/' : '/library'}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 rounded-xl px-3 py-3 text-[#6B4226] no-underline hover:bg-[#F5D9A0]/50"
              >
                {isCatalog ? <House size={16} /> : <LibraryBig size={16} />}
                {isCatalog ? 'Home' : 'Browse catalog'}
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-2 rounded-xl px-3 py-3 font-semibold no-underline ${
                  isAdminRoute
                    ? 'bg-[#8B2635] text-[#FEF8EE]'
                    : 'text-[#6B4226] hover:bg-[#F5D9A0]/50'
                }`}
              >
                <LayoutDashboard size={16} />
                Admin
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="mt-1 flex justify-center rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] py-3 font-bold text-[#FEF8EE] no-underline"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
