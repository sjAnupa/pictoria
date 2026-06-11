import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import ChapterScrollReader from '../features/reader/ChapterScrollReader'
import PageMeta from '../components/common/PageMeta'
import { useChapterReader } from '../hooks/useBooks'
import { trackReading, flushReadingProgress } from '../hooks/useReadingProgress'
import { invalidateReadingProgress } from '../lib/queryClient'
import { useAuthStore } from '../store/authStore'
import { getChapterAccess } from '../utils/chapterAccess'
import type { SaveProgressPayload } from '../types/progress.types'

const Reader = () => {
  const { bookId, chapterNumber } = useParams<{ bookId: string; chapterNumber: string }>()
  const chNum = Number(chapterNumber)
  const validChapter = Number.isFinite(chNum) && chNum > 0
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data, isLoading, isError } = useChapterReader(bookId, validChapter ? chNum : 0)

  const backSlug = data?.book.slug ?? ''
  const bookTitle = data?.book.title
  const chapterTitle = data?.chapter.title
  const pageUrls = data?.chapter.pageImageUrls
  const totalPages = pageUrls?.length ?? 0

  const access = useMemo(() => {
    if (!data?.book) return { allowed: true as const }
    return getChapterAccess(data.book, chNum, isAuthenticated)
  }, [data?.book, chNum, isAuthenticated])

  const lastSavedPage = useRef(0)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openedRef = useRef(false)

  const chapterLabel =
    validChapter && chapterTitle
      ? `Chapter ${chapterNumber} · ${chapterTitle}`
      : chapterNumber
        ? `Chapter ${chapterNumber}`
        : undefined

  useEffect(() => {
    openedRef.current = false
    lastSavedPage.current = 0
  }, [bookId, chNum])

  useEffect(() => {
    if (!access.allowed || !bookId || !validChapter || isLoading || isError || !totalPages || openedRef.current) {
      return
    }

    openedRef.current = true
    const payload: SaveProgressPayload = {
      bookId,
      currentChapter: chNum,
      currentPage: 1,
      totalPagesInChapter: totalPages,
      action: 'chapter_opened',
    }
    trackReading(payload)
    lastSavedPage.current = 1
  }, [access.allowed, bookId, chNum, validChapter, isLoading, isError, totalPages])

  const persistPage = useCallback(
    (pageNumber: number) => {
      if (!access.allowed || !bookId || !validChapter || pageNumber < 1) return
      if (pageNumber === lastSavedPage.current) return

      lastSavedPage.current = pageNumber
      trackReading({
        bookId,
        currentChapter: chNum,
        currentPage: pageNumber,
        totalPagesInChapter: totalPages,
        action: 'page_progress',
      })
    },
    [access.allowed, bookId, chNum, validChapter, totalPages],
  )

  const handlePageVisible = useCallback(
    (pageNumber: number, _pagesInChapter: number) => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        persistPage(pageNumber)
      }, 1500)
    },
    [persistPage],
  )

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      if (bookId) {
        void flushReadingProgress().then(() => invalidateReadingProgress(bookId))
      }
    }
  }, [bookId])

  const readerTitle = bookTitle
    ? chapterLabel
      ? `${bookTitle} — ${chapterLabel}`
      : bookTitle
    : 'Read on Pictoria'

  return (
    <div
      className="flex min-h-[100dvh] flex-col bg-[#E8D4A8]"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      {bookTitle ? (
        <PageMeta
          title={readerTitle}
          description={`Read ${bookTitle} on Pictoria.`}
          canonicalPath={backSlug ? `/books/${backSlug}` : undefined}
          type="book"
        />
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col">
        {isLoading ? (
          <div className="flex min-h-[50dvh] items-center justify-center px-4 text-sm text-[#6B4226]">
            Loading chapter…
          </div>
        ) : isError || !pageUrls?.length ? (
          <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-base font-semibold text-[#3D2314]">Chapter not found</p>
            <p className="text-sm text-[#9B6B4A]">This chapter may not exist or the book is unavailable.</p>
          </div>
        ) : !access.allowed ? (
          <div className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="max-w-md text-lg font-bold text-[#3D2314]">{access.message}</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {access.reason === 'login' ? (
                <>
                  <Link
                    to="/register"
                    state={{ from: `/read/${bookId}/chapter/${chNum}` }}
                    className="rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] no-underline shadow-md"
                  >
                    Create free account
                  </Link>
                  <Link
                    to="/login"
                    state={{ from: `/read/${bookId}/chapter/${chNum}` }}
                    className="rounded-full border border-[#E8C98A] bg-[#FEF8EE] px-5 py-2.5 text-sm font-bold text-[#6B4226] no-underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : null}
              {backSlug ? (
                <Link
                  to={`/books/${backSlug}`}
                  className="text-sm font-semibold text-[#8B2635] no-underline hover:underline"
                >
                  Back to book
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <ChapterScrollReader
            backTo={`/books/${backSlug}`}
            bookTitle={bookTitle}
            chapterLabel={chapterLabel}
            pageUrls={pageUrls}
            onPageVisible={handlePageVisible}
          />
        )}
      </main>
    </div>
  )
}

export default Reader
