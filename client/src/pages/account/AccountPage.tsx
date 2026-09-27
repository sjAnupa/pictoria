import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Bookmark, CheckCircle2, Clock, TrendingUp } from 'lucide-react'
import { useSavedBooks } from '../../hooks/useBookEngagement'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import { useMyReadingLibrary, trackReading } from '../../hooks/useReadingProgress'
import { useAuthStore } from '../../store/authStore'

type LibraryTab = 'reading' | 'finished' | 'saved'

export default function AccountPage() {
  const { data: library, isLoading, isError } = useMyReadingLibrary()
  const { data: savedBooks = [], isLoading: savedLoading, isError: savedError } = useSavedBooks()
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('reading')
  const user = useAuthStore((s) => s.user)

  const reading = library?.currentlyReading ?? []
  const finished = library?.finished ?? []
  const stats = library?.stats

  const tabBtn = (active: boolean) =>
    [
      'min-w-0 flex-1 rounded-xl px-2 py-2.5 text-xs font-bold transition sm:px-4 sm:py-2.5 sm:text-sm',
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
    <div className="flex min-h-screen flex-col bg-[#FDF0D5] font-sans">
      <Navbar />
      <main className="page-gutter flex-1 py-6 sm:py-8">
        <header className="mb-6 rounded-2xl border border-[#E8C98A] bg-[#FEF8EE]/90 p-4 shadow-[0_10px_30px_-18px_rgba(90,40,10,0.3)] backdrop-blur-sm sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 text-left">
              <h1 className="font-pictoriya text-[clamp(1.5rem,3.4vw,2.4rem)] font-semibold leading-tight text-[#3D2314]">
                My Library
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#9B6B4A]">
                Your reading library and progress — signed in as{' '}
                <span className="break-all">{user?.email ?? 'your account'}</span>.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:max-w-[34rem]">
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3 py-2.5 text-center sm:px-3.5 sm:py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B6B4A] sm:tracking-[0.14em]">
                  Reading
                </p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.currentlyReadingCount ?? 0}</p>
              </div>
              <div className="rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3 py-2.5 text-center sm:px-3.5 sm:py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B6B4A] sm:tracking-[0.14em]">
                  Finished
                </p>
                <p className="mt-1 text-lg font-bold text-[#3D2314]">{stats?.finishedCount ?? 0}</p>
              </div>
              <div className="col-span-2 rounded-xl border border-[#E8C98A]/80 bg-[#FDF0D5]/60 px-3 py-2.5 text-center sm:col-span-1 sm:px-3.5 sm:py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9B6B4A] sm:tracking-[0.14em]">
                  Pages explored
                </p>
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
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Clock className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="truncate">
                  <span className="sm:hidden">Reading</span>
                  <span className="hidden sm:inline">Currently reading</span>
                </span>
                <span className="shrink-0 rounded-full bg-[#FDF0D5]/80 px-1.5 py-0.5 text-[10px] text-[#6B4226] sm:px-2 sm:text-[11px]">
                  {reading.length}
                </span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={libraryTab === 'finished'}
              className={tabBtn(libraryTab === 'finished')}
              onClick={() => setLibraryTab('finished')}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span>Finished</span>
                <span className="shrink-0 rounded-full bg-[#FDF0D5]/80 px-1.5 py-0.5 text-[10px] text-[#6B4226] sm:px-2 sm:text-[11px]">
                  {finished.length}
                </span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={libraryTab === 'saved'}
              className={tabBtn(libraryTab === 'saved')}
              onClick={() => setLibraryTab('saved')}
            >
              <span className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Bookmark className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span className="truncate">
                  <span className="sm:hidden">Saved</span>
                  <span className="hidden sm:inline">Saved books</span>
                </span>
                <span className="shrink-0 rounded-full bg-[#FDF0D5]/80 px-1.5 py-0.5 text-[10px] text-[#6B4226] sm:px-2 sm:text-[11px]">
                  {savedBooks.length}
                </span>
              </span>
            </button>
          </div>

          <div
            role="tabpanel"
            className="max-h-[min(28rem,65vh)] min-h-[12rem] overflow-y-auto px-2 py-3 sm:px-4 sm:py-4"
            aria-label={
              libraryTab === 'reading'
                ? 'Currently reading'
                : libraryTab === 'finished'
                  ? 'Finished books'
                  : 'Saved books'
            }
          >
            {libraryTab === 'saved' ? (
              savedLoading ? (
                <p className="py-12 text-center text-sm text-[#9B6B4A]">Loading saved books…</p>
              ) : savedError ? (
                <p className="py-12 text-center text-sm text-[#9B6B4A]">Could not load saved books.</p>
              ) : savedBooks.length === 0 ? (
                <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 py-12 text-center">
                  <Bookmark className="h-10 w-10 text-[#C9952A]" aria-hidden />
                  <p className="text-sm font-semibold text-[#3D2314]">No saved books yet</p>
                  <p className="max-w-xs text-xs text-[#9B6B4A]">
                    Tap Save on a book page to add it here.
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
                  {savedBooks.map((b) => (
                    <li key={b.bookId}>
                      <Link
                        to={`/books/${b.slug}`}
                        className="flex items-center gap-2.5 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5] sm:gap-3 sm:px-2.5"
                        style={{ textDecoration: 'none' }}
                      >
                        <img
                          src={b.coverImageUrl}
                          alt=""
                          className="h-14 w-10 shrink-0 rounded-md object-cover shadow-md sm:h-16 sm:w-12"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-[#3D2314] sm:text-base">{b.title}</div>
                          <div className="mt-0.5 truncate text-xs text-[#9B6B4A]">{b.author}</div>
                          {b.savedAt ? (
                            <div className="mt-1 text-[11px] text-[#8B2635]">
                              Saved {new Date(b.savedAt).toLocaleDateString()}
                            </div>
                          ) : null}
                        </div>
                        <span className="hidden shrink-0 text-xs font-semibold text-[#8B2635] sm:inline">Open</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : isLoading ? (
              <p className="py-12 text-center text-sm text-[#9B6B4A]">Loading your library…</p>
            ) : isError ? (
              <p className="py-12 text-center text-sm text-[#9B6B4A]">Could not load reading history.</p>
            ) : libraryTab === 'reading' ? (
              reading.length === 0 ? (
                <div className="flex min-h-[10rem] flex-col items-center justify-center gap-3 py-8 text-center">
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
                        className="flex items-center gap-2.5 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5] sm:gap-3 sm:px-2.5"
                        style={{ textDecoration: 'none' }}
                      >
                        <img
                          src={b.coverImageUrl}
                          alt=""
                          className="h-14 w-10 shrink-0 rounded-md object-cover shadow-md sm:h-16 sm:w-12"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold text-[#3D2314] sm:text-base">
                            {b.title}
                          </div>
                          <div className="mt-0.5 truncate text-xs text-[#9B6B4A]">
                            Ch. {b.currentChapter} · {b.currentChapterTitle}
                          </div>
                          <div className="mt-1 text-[11px] font-semibold text-[#8B2635]">
                            Page {b.currentPage}
                            <span className="hidden text-[#9B6B4A] font-normal sm:inline">
                              {' '}
                              · {new Date(b.lastReadAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#8B2635] p-2 text-[#FEF8EE] sm:gap-1 sm:px-3 sm:py-1 sm:text-xs sm:font-bold">
                          <BookOpen className="h-3.5 w-3.5" aria-hidden />
                          <span className="hidden sm:inline">Resume</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : finished.length === 0 ? (
              <div className="flex min-h-[10rem] flex-col items-center justify-center gap-2 py-12 text-center">
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
                      className="flex items-center gap-2.5 rounded-xl border border-transparent bg-[#FDF0D5]/35 px-2 py-2.5 transition hover:border-[#E8C98A] hover:bg-[#FDF0D5] sm:gap-3 sm:px-2.5"
                      style={{ textDecoration: 'none' }}
                    >
                      <img
                        src={b.coverImageUrl}
                        alt=""
                        className="h-14 w-10 shrink-0 rounded-md object-cover shadow-md sm:h-16 sm:w-12"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-[#3D2314] sm:text-base">{b.title}</div>
                        <div className="mt-0.5 truncate text-xs text-[#9B6B4A]">{b.author}</div>
                        {b.completedAt ? (
                          <div className="mt-1 text-[11px] text-[#4A7A3D]">
                            Finished {new Date(b.completedAt).toLocaleDateString()}
                          </div>
                        ) : null}
                      </div>
                      <span className="hidden shrink-0 text-xs font-semibold text-[#8B2635] sm:inline">Open</span>
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
            <h2 className="text-base font-bold sm:text-lg">Reading insights</h2>
          </div>
          <div className="mx-auto mt-4 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-3 text-center sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9B6B4A] sm:text-[11px] sm:tracking-[0.14em]">
                Avg rating
              </p>
              <p className="mt-1 text-base font-bold text-[#3D2314] sm:text-lg">
                {stats?.averageRatingRead ? stats.averageRatingRead.toFixed(1) : '0.0'}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-3 text-center sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9B6B4A] sm:text-[11px] sm:tracking-[0.14em]">
                Top genre
              </p>
              <p className="mt-1 truncate text-base font-bold text-[#3D2314] sm:text-lg">
                {stats?.topGenre ?? '—'}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-3 text-center sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9B6B4A] sm:text-[11px] sm:tracking-[0.14em]">
                In progress
              </p>
              <p className="mt-1 text-base font-bold text-[#3D2314] sm:text-lg">
                {stats?.currentlyReadingCount ?? 0}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8C98A]/70 bg-[#FDF0D5]/60 p-3 text-center sm:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9B6B4A] sm:text-[11px] sm:tracking-[0.14em]">
                Chapters read
              </p>
              <p className="mt-1 text-base font-bold text-[#3D2314] sm:text-lg">
                {stats?.totalChaptersRead ?? 0}
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
