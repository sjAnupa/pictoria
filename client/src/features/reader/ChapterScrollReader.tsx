import { useCallback, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

type ChapterScrollReaderProps = {
  bookTitle?: string
  chapterLabel?: string
  /** Book detail route (e.g. `/books/my-book-slug`). */
  backTo: string
  pageUrls?: string[]
  /** When set, reports which page is most visible while scrolling. */
  onPageVisible?: (pageNumber: number, totalPages: number) => void
}

/**
 * Vertical scroll of chapter page images (illustrated pages).
 */
const ChapterScrollReader = ({
  bookTitle,
  chapterLabel,
  backTo,
  pageUrls = [],
  onPageVisible,
}: ChapterScrollReaderProps) => {
  const pages = pageUrls.length ? pageUrls : []
  const figureRefs = useRef<(HTMLElement | null)[]>([])
  const onPageVisibleRef = useRef(onPageVisible)

  useEffect(() => {
    onPageVisibleRef.current = onPageVisible
  }, [onPageVisible])

  const setFigureRef = useCallback((index: number) => (el: HTMLElement | null) => {
    figureRefs.current[index] = el
  }, [])

  useEffect(() => {
    if (!pages.length || !onPageVisibleRef.current) return

    const visible = new Map<number, number>()

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = figureRefs.current.findIndex((el) => el === entry.target)
          if (index < 0) continue
          if (entry.isIntersecting) {
            visible.set(index, entry.intersectionRatio)
          } else {
            visible.delete(index)
          }
        }

        if (visible.size === 0) return

        let bestIndex = 0
        let bestRatio = 0
        for (const [index, ratio] of visible) {
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestIndex = index
          }
        }

        onPageVisibleRef.current?.(bestIndex + 1, pages.length)
      },
      { threshold: [0.25, 0.5, 0.75] },
    )

    figureRefs.current.forEach((el) => {
      if (el) observer.observe(el)
    })

    onPageVisibleRef.current(1, pages.length)

    return () => observer.disconnect()
  }, [pages.length])

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-[#E8D4A8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="sticky top-0 z-20 border-b border-[#C9A86A]/80 bg-[#FEF8EE]/95 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-[min(100%,720px)] items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 md:px-5">
          <Link
            to={backTo}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8C98A] bg-[#FDF0D5] text-[#6B4226] no-underline transition hover:border-[#C9952A] hover:bg-[#F5D9A0]/80"
            aria-label="Back to book"
            title="Back to book"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </Link>
          <div className="min-w-0 flex-1 text-left">
            {bookTitle && (
              <div className="truncate text-sm font-semibold text-[#3D2314]">{bookTitle}</div>
            )}
            {chapterLabel && (
              <div className="truncate text-xs text-[#6B4226]">{chapterLabel}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[min(100%,720px)] flex-1 px-0 py-1 pb-[env(safe-area-inset-bottom)] sm:px-3 sm:py-4 md:px-4">
        {pages.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6B4226]">No pages available for this chapter.</p>
        ) : (
          <div className="flex flex-col gap-0 sm:gap-1">
            {pages.map((src, index) => (
              <figure
                key={src}
                ref={setFigureRef(index)}
                className="m-0 overflow-hidden bg-transparent"
              >
                <img
                  src={src}
                  alt={bookTitle ? `${bookTitle} — page ${index + 1}` : `Page ${index + 1}`}
                  className="mx-auto block h-auto w-full object-contain"
                  loading={index < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                />
              </figure>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChapterScrollReader
