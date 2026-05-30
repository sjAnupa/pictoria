import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock, Lock, TrendingUp } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { books } from '../../data/mockBooks'

/** Design-only placeholders until reading progress API exists. */
const FINISHED_SLUGS = ['the-enchanted-garden', 'midnight-in-the-museum'] as const
const READING_SLUGS = ['sailing-to-tomorrow'] as const

type LibraryTab = 'reading' | 'finished'

export default function AccountPage() {
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('reading')
  const finished = books.filter((b) => (FINISHED_SLUGS as readonly string[]).includes(b.slug))
  const reading = books.filter((b) => (READING_SLUGS as readonly string[]).includes(b.slug))
  const finishedPages = finished.reduce((sum, b) => sum + b.pages, 0)
  const readingPages = reading.reduce((sum, b) => sum + b.pages, 0)

  const tabBtn = (active: boolean) =>
    [
      'flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:px-4',
      active
        ? 'bg-[#8B2635] text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.3)]'
        : 'text-[#6B4226] hover:bg-[#F5D9A0]/55',
    ].join(' ')

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <Navbar />
      <main className="page-gutter flex-1 py-8">
        <header className="mb-6 rounded-2xl border border-[#E8C98A] bg-[#FEF8EE]/90 p-5 shadow-[0_10px_30px_-18px_rgba(90,40,10,0.3)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 text-left">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8B2635]">Account center</p>
              <h1 className="font-pictoria mt-1 text-[clamp(1.6rem,3.4vw,2.4rem)] font-semibold leading-tight text-[#3D2314]">
                My library
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#9B6B4A]">
                Track your reading progress, continue current books, and manage account settings from one place.
              </p>
            </div>
            <div className="mx-auto grid w-full max-w-xl gap-3 sm:grid-cols-3 lg:mx-0 lg:max-w-[34rem]">
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3.5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Currently reading</p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{reading.length}</p>
              </div>
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3.5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Finished books</p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{finished.length}</p>
              </div>
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3.5 py-3 text-center sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Pages explored</p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{finishedPages + readingPages}</p>
              </div>
            </div>
          </div>
        </header>

        <section className="mb-8 rounded-2xl border border-[#E8C98A] bg-[#FEF8EE] p-1 shadow-sm sm:p-2">
          <div
            className="flex gap-1 rounded-xl bg-[#FDF0D5]/50 p-1"
            role="tablist"
            aria-label="Library lists"
          >
            <button
              type="button"
              role="tab"
              aria-selected={libraryTab === 'reading'}
              className={tabBtn(libraryTab === 'reading')}
              onClick={() => setLibraryTab('reading')}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Currently reading
                <span className="rounded-full bg-[#FDF0D5]/80 px-2 py-0.5 text-[11px] text-[#6B4226]">{reading.length}</span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={libraryTab === 'finished'}
              className={tabBtn(libraryTab === 'finished')}
              onClick={() => setLibraryTab('finished')}
            >
              <span className="inline-flex items-center justify-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                Finished
                <span className="rounded-full bg-[#FDF0D5]/80 px-2 py-0.5 text-[11px] text-[#6B4226]">{finished.length}</span>
              </span>
            </button>
          </div>

          <div
            role="tabpanel"
            className="h-[26rem] overflow-y-auto px-3 py-3 sm:px-4 sm:py-4"
            aria-label={libraryTab === 'reading' ? 'Currently reading' : 'Finished books'}
          >
            {libraryTab === 'reading' ? (
              <ul className="space-y-2 pr-1">
                {reading.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/read/${b.id}/chapter/1`}
                      className="flex items-center gap-3 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2.5 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5]"
                      style={{ textDecoration: 'none' }}
                    >
                      <img src={b.coverImage} alt="" className="h-16 w-12 shrink-0 rounded-md object-cover shadow-md" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[#3D2314]">{b.title}</div>
                        <div className="mt-0.5 text-xs text-[#9B6B4A]">Chapter 1 · {b.chapters[0] ?? 'Continue'}</div>
                        <div className="mt-1 text-[11px] font-semibold text-[#8B2635]">{b.pages} pages</div>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#8B2635] px-3 py-1 text-xs font-bold text-[#FEF8EE]">
                        <BookOpen className="h-3.5 w-3.5" />
                        Resume
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-2 pr-1">
                {finished.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/books/${b.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2.5 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5]"
                      style={{ textDecoration: 'none' }}
                    >
                      <img src={b.coverImage} alt="" className="h-16 w-12 shrink-0 rounded-md object-cover shadow-md" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[#3D2314]">{b.title}</div>
                        <div className="mt-0.5 text-xs text-[#9B6B4A]">{b.author}</div>
                      </div>
                      <span className="hidden shrink-0 text-xs font-semibold text-[#8B2635] sm:inline">View</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-[#E8C98A] bg-[#FEF8EE] p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-center gap-2 text-center text-[#3D2314]">
            <TrendingUp className="h-5 w-5 text-[#8B2635]" aria-hidden />
            <h2 className="text-lg font-bold">Reading insights</h2>
          </div>
          <div className="mx-auto mt-4 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Avg rating read</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">
                {finished.length ? (finished.reduce((sum, b) => sum + b.rating, 0) / finished.length).toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Top genre</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">{finished[0]?.genre ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Books in progress</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">{reading.length}</p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Total chapters</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">
                {finished.reduce((sum, b) => sum + b.chapters.length, 0) + reading.reduce((sum, b) => sum + b.chapters.length, 0)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#E8C98A] bg-[#FEF8EE] p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-[#3D2314]">
            <Lock className="h-5 w-5 text-[#6B4226]" aria-hidden />
            <h2 className="text-lg font-bold">Security</h2>
          </div>
          <p className="mb-4 text-sm text-[#9B6B4A]">
            Password changes and reset flows will connect to the API later. Fields below are layout-only.
          </p>
          <div className="mx-auto max-w-md space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wide text-[#6B4226]">
              Current password
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-[#E8C98A] bg-[#FDF0D5] px-3 py-2.5 text-sm text-[#3D2314] outline-none"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#6B4226]">
              New password
              <input
                type="password"
                disabled
                placeholder="At least 8 characters"
                className="mt-1.5 w-full rounded-xl border border-[#E8C98A] bg-[#FDF0D5] px-3 py-2.5 text-sm text-[#3D2314] outline-none"
              />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#6B4226]">
              Confirm new password
              <input
                type="password"
                disabled
                placeholder="Repeat new password"
                className="mt-1.5 w-full rounded-xl border border-[#E8C98A] bg-[#FDF0D5] px-3 py-2.5 text-sm text-[#3D2314] outline-none"
              />
            </label>
            <button
              type="button"
              disabled
              className="w-full rounded-full bg-[#8B2635] py-2.5 text-sm font-bold text-[#FEF8EE] opacity-50"
            >
              Update password (soon)
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
