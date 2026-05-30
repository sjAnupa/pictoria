import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { DEMO_CHAPTER_1_PAGE_URLS } from '../../config/chapterAssets'

type ChapterScrollReaderProps = {
  bookTitle?: string
  chapterLabel?: string
  /** Book detail route (e.g. `/books/my-book-slug`). */
  backTo: string
  pageUrls?: string[]
}

/**
 * Vertical scroll of chapter page images (illustrated pages).
 */
const ChapterScrollReader = ({
  bookTitle,
  chapterLabel,
  backTo,
  pageUrls = DEMO_CHAPTER_1_PAGE_URLS,
}: ChapterScrollReaderProps) => {
  const pages = pageUrls.length ? pageUrls : DEMO_CHAPTER_1_PAGE_URLS

  return (
    <div className="w-full bg-[#E8D4A8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
      <div className="sticky top-0 z-20 border-b border-[#C9A86A]/80 bg-[#FEF8EE]/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-[min(100%,720px)] items-center gap-2 px-3 py-2.5 sm:px-5">
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

      <div className="mx-auto max-w-[min(100%,720px)] px-2 py-3 sm:px-4 sm:py-5">
        <div className="flex flex-col gap-0 sm:gap-1">
          {pages.map((src, index) => (
            <figure key={src} className="m-0 overflow-hidden bg-transparent">
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
      </div>
    </div>
  )
}

export default ChapterScrollReader
