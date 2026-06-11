import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageMeta from '../components/common/PageMeta'
import PictoriaHomeContent from '../components/home/PictoriaHomeContent'

const Home = () => {
  const location = useLocation()

  useEffect(() => {
    const raw = location.hash.replace(/^#/, '')
    if (!raw) return
    const el = document.getElementById(raw)
    if (!el) return
    const id = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => window.cancelAnimationFrame(id)
  }, [location.hash, location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <PageMeta
        title="Illustrated Storybooks Online"
        description="Browse free illustrated storybooks on Pictoria. Read chapter previews without an account, save progress when you sign in, and discover new arrivals."
        canonicalPath="/"
      />
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        <PictoriaHomeContent />
      </main>
      <Footer />
    </div>
  )
}

export default Home
