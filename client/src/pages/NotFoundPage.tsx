import { Link, useLocation } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageMeta from '../components/common/PageMeta'

export default function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <PageMeta title="Page not found" description="This page could not be found on Pictoriya." />
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <img
          src="/logo-mark.png"
          alt=""
          decoding="async"
          draggable={false}
          className="h-[140px] w-[140px] object-contain sm:h-[180px] sm:w-[180px]"
        />
        <p className="text-sm font-bold uppercase tracking-[0.12em] text-[#9B6B4A]">404</p>
        <h1 className="font-pictoriya text-[28px] text-[#3D2314] sm:text-[32px]">Page not found</h1>
        <p className="max-w-md text-sm leading-relaxed text-[#6B4226]">
          We could not find <span className="font-semibold text-[#3D2314]">{location.pathname}</span>.
          The link may be outdated or the page may have moved.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] no-underline shadow-md"
          >
            Back to home
          </Link>
          <Link
            to="/library"
            className="rounded-full border border-[#E8C98A] bg-[#FEF8EE] px-5 py-2.5 text-sm font-bold text-[#6B4226] no-underline"
          >
            Browse catalog
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
