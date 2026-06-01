import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { useMyReadingLibrary, trackReading } from '../../hooks/useReadingProgress'
import { useAuthStore } from '../../store/authStore'

type LibraryTab = 'reading' | 'finished'

export default function AccountPage() {
  const { data: library, isLoading, isError } = useMyReadingLibrary()
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('reading')
  const user = useAuthStore((s) => s.user)

  const reading = library?.currentlyReading ?? []
  const finished = library?.finished ?? []
  const stats = library?.stats

  const tabBtn = (active: boolean) =>
    [
      'flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:px-4',
      active
        ? 'bg-[#8B2635] text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.3)]'
        : 'text-[#6B4226] hover:bg-[#F5D9A0]/55',
    ].join(' ')

  const handleResume = (bookId: string, chapter: number, page: number) => {
    trackReading({
      bookId,
      currentChapter: chapter,
      currentPage: page,
      action: 'continue_reading',
    })
  }

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
                Your reading library and progress — signed in as {user?.email ?? 'your account'}.
              </p>
            </div>
            <div className="mx-auto grid w-full max-w-xl gap-3 sm:grid-cols-3 lg:mx-0 lg:max-w-[34rem]">
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3.5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Currently reading</p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.currentlyReadingCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3.5 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Finished books</p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.finishedCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3.5 py-3 text-center sm:col-span-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Pages explored</p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.pagesExplored ?? 0}</p>
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
            {isLoading ? (
              <p className="py-12 text-center text-sm text-[#9B6B4A]">Loading your library…</p>
            ) : isError ? (
              <p className="py-12 text-center text-sm text-[#9B6B4A]">Could not load reading history.</p>
            ) : libraryTab === 'reading' ? (
              reading.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
                  <BookOpen className="h-10 w-10 text-[#C9952A]" aria-hidden />
                  <p className="text-sm font-semibold text-[#3D2314]">No books in progress</p>
                  <p className="max-w-xs text-xs text-[#9B6B4A]">
                    Open a book and tap Start Reading — your progress will appear here.
                  </p>
                  <Link
                    to="/library"
                    className="mt-1 rounded-full bg-[#8B2635] px-4 py-2 text-xs font-bold text-[#FEF8EE] no-underline"
                  >
                    Browse catalog
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2 pr-1">
                  {reading.map((b) => (
                    <li key={b.bookId}>
                      <Link
                        to={`/read/${b.bookId}/chapter/${b.currentChapter}`}
                        onClick={() => handleResume(b.bookId, b.currentChapter, b.currentPage)}
                        className="flex items-center gap-3 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2.5 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5]"
                        style={{ textDecoration: 'none' }}
                      >
                        <img src={b.coverImageUrl} alt="" className="h-16 w-12 shrink-0 rounded-md object-cover shadow-md" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-[#3D2314]">{b.title}</div>
                          <div className="mt-0.5 text-xs text-[#9B6B4A]">
                            Chapter {b.currentChapter} · {b.currentChapterTitle}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-[#8B2635]">
                            Page {b.currentPage} · Last read {new Date(b.lastReadAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#8B2635] px-3 py-1 text-xs font-bold text-[#FEF8EE]">
                          <BookOpen className="h-3.5 w-3.5" />
                          Resume
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : finished.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-12 text-center">
                <CheckCircle2 className="h-10 w-10 text-[#4A7A3D]" aria-hidden />
                <p className="text-sm font-semibold text-[#3D2314]">No finished books yet</p>
                <p className="text-xs text-[#9B6B4A]">Complete a book to see it here.</p>
              </div>
            ) : (
              <ul className="space-y-2 pr-1">
                {finished.map((b) => (
                  <li key={b.bookId}>
                    <Link
                      to={`/books/${b.slug}`}
                      className="flex items-center gap-3 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2.5 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5]"
                      style={{ textDecoration: 'none' }}
                    >
                      <img src={b.coverImageUrl} alt="" className="h-16 w-12 shrink-0 rounded-md object-cover shadow-md" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-[#3D2314]">{b.title}</div>
                        <div className="mt-0.5 text-xs text-[#9B6B4A]">{b.author}</div>
                        {b.completedAt ? (
                          <div className="mt-1 text-[11px] text-[#4A7A3D]">
                            Finished {new Date(b.completedAt).toLocaleDateString()}
                          </div>
                        ) : null}
                      </div>
                      <span className="hidden shrink-0 text-xs font-semibold text-[#8B2635] sm:inline">Open book</span>
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
                {stats?.averageRatingRead ? stats.averageRatingRead.toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Top genre</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.topGenre ?? '—'}</p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Books in progress</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.currentlyReadingCount ?? 0}</p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-4 text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Total chapters</p>
              <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.totalChaptersRead ?? 0}</p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
