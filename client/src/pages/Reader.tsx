import { useCallback, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ChapterScrollReader from '../features/reader/ChapterScrollReader'
import { useChapterReader } from '../hooks/useBooks'
import { trackReading, flushReadingProgress } from '../hooks/useReadingProgress'
import { invalidateReadingProgress } from '../lib/queryClient'
import type { SaveProgressPayload } from '../types/progress.types'

const Reader = () => {
  const { bookId, chapterNumber } = useParams<{ bookId: string; chapterNumber: string }>()
  const chNum = Number(chapterNumber)
  const validChapter = Number.isFinite(chNum) && chNum > 0

  const { data, isLoading, isError } = useChapterReader(bookId, validChapter ? chNum : 0)

  const backSlug = data?.book.slug ?? 'the-enchanted-garden'
  const bookTitle = data?.book.title
  const chapterTitle = data?.chapter.title
  const pageUrls = data?.chapter.pageImageUrls
  const totalPages = pageUrls?.length ?? 0

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
    if (!bookId || !validChapter || isLoading || isError || !totalPages || openedRef.current) return

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
  }, [bookId, chNum, validChapter, isLoading, isError, totalPages])

  const persistPage = useCallback(
    (pageNumber: number) => {
      if (!bookId || !validChapter || pageNumber < 1) return
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
    [bookId, chNum, validChapter, totalPages],
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

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col bg-[#E8D4A8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#6B4226]">
              Loading chapter…
            </div>
          ) : isError || !pageUrls?.length ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="text-base font-semibold text-[#3D2314]">Chapter not found</p>
              <p className="text-sm text-[#9B6B4A]">This chapter may not exist or the book is unavailable.</p>
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
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Reader
