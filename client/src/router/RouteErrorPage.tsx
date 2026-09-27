import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { Link } from 'react-router-dom'

function errorMessage(error: unknown): { title: string; detail: string } {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        title: 'Page not found',
        detail: 'This route does not exist or may have been moved.',
      }
    }
    return {
      title: 'Something went wrong',
      detail: error.statusText || `Request failed with status ${error.status}.`,
    }
  }

  if (error instanceof Error && error.message) {
    return {
      title: 'Something went wrong',
      detail: error.message,
    }
  }

  return {
    title: 'Something went wrong',
    detail: 'An unexpected error occurred while loading this page.',
  }
}

export default function RouteErrorPage() {
  const error = useRouteError()
  const { title, detail } = errorMessage(error)

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
        <img
          src="/logo-mark.png"
          alt=""
          decoding="async"
          draggable={false}
          className="h-[140px] w-[140px] object-contain sm:h-[180px] sm:w-[180px]"
        />
        <h1 className="font-pictoriya text-[28px] text-[#3D2314] sm:text-[32px]">{title}</h1>
        <p className="max-w-md text-sm leading-relaxed text-[#6B4226]">{detail}</p>
        <Link
          to="/"
          className="mt-2 rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] no-underline shadow-md"
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </div>
  )
}
