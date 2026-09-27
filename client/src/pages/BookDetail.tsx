import { useMemo, useState, useCallback, useEffect } from 'react'
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Star,
  BookOpen,
  Clock,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  Play,
  List,
  CheckCircle2,
  Eye,
} from 'lucide-react'
import { useBookBySlug, useAllPublishedBooksForSimilar } from '../hooks/useBooks'
import { useBookReadingProgress, trackReading } from '../hooks/useReadingProgress'
import type { SaveProgressPayload } from '../types/progress.types'
import BookCard from '../components/books/BookCard'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageMeta from '../components/common/PageMeta'
import { useBookEngagement, useToggleBookLike, useToggleSavedBook } from '../hooks/useBookEngagement'
import { useBookReviews, useDeleteReview, useSubmitReview, useToggleReviewHidden } from '../hooks/useReviews'
import { useTrackBookView } from '../hooks/useBookViews'
import { useAuthStore } from '../store/authStore'
import { canAccessAdminPortal } from '../utils/authPermissions'
import { getChapterAccess } from '../utils/chapterAccess'
import { findSimilarBooks } from '../utils/similarBooks'
import { FONT_DISPLAY } from '../theme/typography'
import AdminPreviewStatusBadge from '../components/books/AdminPreviewStatusBadge'
import RatingModal from '../components/books/RatingModal'
import ReviewList from '../components/books/ReviewList'

type BookDetailTab = 'overview' | 'chapters' | 'reviews' | 'similar'

function tabFromParam(value: string | null): BookDetailTab {
  if (value === 'chapters' || value === 'similar' || value === 'reviews' || value === 'overview') return value
  return 'overview'
}

const genreColors: Record<string, { bg: string; text: string }> = {
  Fantasy: { bg: "#E8D5F5", text: "#6B2D8B" },
  Adventure: { bg: "#D5EAF5", text: "#1A5F8B" },
  Mystery: { bg: "#F5E8D5", text: "#8B5A1A" },
  Romance: { bg: "#F5D5E8", text: "#8B1A5F" },
  "Children's": { bg: "#D5F5E0", text: "#1A8B4A" },
  Humor: { bg: '#F5F5D5', text: '#6B6B1A' },
}

function formatCompactCount(count: number): string {
  if (count >= 1000) {
    const rounded = Math.floor(count / 100) / 10
    return `${rounded % 1 === 0 ? Math.floor(count / 1000) : rounded}K`
  }
  return String(count)
}

function chapterReadMetrics(totalPages: number, chapterCount: number) {
  const n = Math.max(1, chapterCount)
  const pagesPerChapter = Math.max(1, Math.round(totalPages / n))
  const minutes = Math.max(1, Math.round(pagesPerChapter * 1.75))
  return { pagesPerChapter, minutes }
}

export default function BookDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<BookDetailTab>(() => tabFromParam(searchParams.get('tab')))
  const [accessNotice, setAccessNotice] = useState<string | null>(null)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isAdmin = canAccessAdminPortal(useAuthStore((s) => s.user))

  const { data: book, isLoading, isError } = useBookBySlug(slug)
  const { data: allBooks = [] } = useAllPublishedBooksForSimilar()
  const { data: progress } = useBookReadingProgress(book?.id)
  const { data: engagement } = useBookEngagement(book?.id)
  const toggleLike = useToggleBookLike(book?.id ?? '')
  const toggleSave = useToggleSavedBook(book?.id ?? '')

  const [reviewPage, setReviewPage] = useState(1)
  const [ratingModalOpen, setRatingModalOpen] = useState(false)
  const { data: reviewData } = useBookReviews(book?.id, reviewPage)
  const submitReviewMutation = useSubmitReview(book?.id ?? '')
  const deleteReviewMutation = useDeleteReview(book?.id ?? '')
  const toggleReviewHiddenMutation = useToggleReviewHidden(book?.id ?? '')

  useTrackBookView(book?.id)

  useEffect(() => {
    setActiveTab(tabFromParam(searchParams.get('tab')))
  }, [searchParams])

  const liked = engagement?.liked ?? false
  const bookmarked = engagement?.saved ?? false

  const hasProgress = Boolean(progress?._id)
  const resumeChapter = progress?.currentChapter ?? 1
  const isCompleted = Boolean(progress?.completed)

  const completedChapterIndexes = useMemo(() => {
    if (!progress?.chaptersRead?.length) return new Set<number>()
    return new Set(progress.chaptersRead.map((n) => n - 1))
  }, [progress?.chaptersRead])

  const openChapter = useCallback(
    (chapterNumber: number, action?: SaveProgressPayload['action']) => {
      if (!book) return

      const access = getChapterAccess(book, chapterNumber, isAuthenticated)
      if (!access.allowed) {
        setAccessNotice(access.message)
        return
      }

      setAccessNotice(null)

      const resumeSameChapter =
        hasProgress && progress!.currentChapter === chapterNumber && progress!.currentPage > 1

      trackReading({
        bookId: book.id,
        currentChapter: chapterNumber,
        currentPage: resumeSameChapter ? progress!.currentPage : 1,
        action:
          action ??
          (!hasProgress && chapterNumber === 1
            ? 'start_reading'
            : hasProgress
              ? 'continue_reading'
              : 'chapter_opened'),
      })
      navigate(`/read/${book.id}/chapter/${chapterNumber}`)
    },
    [book, hasProgress, progress, navigate, isAuthenticated],
  )

  const primaryCtaLabel =
    isCompleted ? 'Read again' : hasProgress ? 'Continue reading' : 'Start Reading'

  const { pagesPerChapter, minutes: minutesPerChapter } = book
    ? chapterReadMetrics(book.pages, book.chapters.length)
    : { pagesPerChapter: 0, minutes: 0 }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
        <Navbar />
        <main
          className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16"
        >
          <p className="text-sm text-[#9B6B4A]">Loading book…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (isError || !book) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
        <Navbar />
        <main
          className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16"
        >
          <img
            src="/logo-mark.png"
            alt=""
            decoding="async"
            draggable={false}
            className="h-[180px] w-[180px] object-contain"
          />
          <div className="font-pictoriya text-[28px] text-[#3D2314]">Book Not Found</div>
          <Link to="/" style={{ color: '#8B2635', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
            ← Back to home
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const genreColor = genreColors[book.genre] || { bg: "#F5E8D5", text: "#8B5A1A" };
  const displaySimilar = findSimilarBooks(book, allBooks, 4);

  const requireSignIn = () => {
    navigate('/login', { state: { from: `/books/${book.slug}` } })
  }

  const handleToggleLike = () => {
    if (!book) return
    if (!isAuthenticated) {
      requireSignIn()
      return
    }
    toggleLike.mutate()
  }

  const handleToggleSave = () => {
    if (!book) return
    if (!isAuthenticated) {
      requireSignIn()
      return
    }
    toggleSave.mutate()
  }

  const handleOpenRatingModal = () => {
    if (!isAuthenticated) {
      requireSignIn()
      return
    }
    setRatingModalOpen(true)
  }

  const handleSubmitReview = (rating: number, comment: string) => {
    submitReviewMutation.mutate(
      { rating, comment: comment || undefined },
      { onSuccess: () => setRatingModalOpen(false) },
    )
  }

  const handleToggleReviewHidden = (reviewId: string, hidden: boolean) => {
    toggleReviewHiddenMutation.mutate({ reviewId, hidden })
  }

  const handleDeleteReview = (reviewId: string) => {
    deleteReviewMutation.mutate(reviewId)
  }

  const bookJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: book.author },
    description: book.description,
    image: book.coverImage,
    url: `${window.location.origin}/books/${book.slug}`,
    inLanguage: 'en',
    numberOfPages: book.pages || undefined,
    datePublished: book.year ? String(book.year) : undefined,
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <PageMeta
        title={book.title}
        description={book.description}
        image={book.coverImage}
        canonicalPath={`/books/${book.slug}`}
        type="book"
        jsonLd={bookJsonLd}
      />
      <Navbar />
      {accessNotice ? (
        <div
          className="page-gutter py-3"
          role="alert"
          style={{
            background: '#FEE2E2',
            borderBottom: '1px solid #FECACA',
            color: '#991B1B',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{accessNotice}</span>
            <div className="flex flex-wrap gap-2">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="rounded-full bg-[#8B2635] px-4 py-1.5 text-xs font-bold text-white no-underline"
                  >
                    Create account
                  </Link>
                  <Link
                    to="/login"
                    state={{ from: `/books/${book.slug}` }}
                    className="rounded-full border border-[#FECACA] bg-white px-4 py-1.5 text-xs font-bold text-[#991B1B] no-underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : null}
              <button
                type="button"
                onClick={() => setAccessNotice(null)}
                className="rounded-full border border-transparent px-3 py-1.5 text-xs font-bold text-[#991B1B]"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {/* ===== HERO BOOK SECTION ===== */}
      <div
        style={{
          background: "linear-gradient(180deg, #3D2314 0%, #6B4226 60%, #FDF0D5 100%)",
          position: "relative",
          overflow: "hidden",
          paddingBottom: 0,
        }}
        className="pb-10 md:pb-16"
      >
        {/* Background texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse at 10% 40%, rgba(232,184,75,0.12) 0%, transparent 45%),
              radial-gradient(ellipse at 90% 60%, rgba(139,38,53,0.2) 0%, transparent 45%)
            `,
          }}
        />

        {/* Back navigation */}
        <div className="page-gutter relative z-[2] pt-6">
          <button
            onClick={() => navigate(-1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(232,201,138,0.3)",
              borderRadius: 20,
              padding: "8px 16px",
              color: "#F5D9A0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              backdropFilter: "blur(4px)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.18)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255,255,255,0.1)";
            }}
          >
            <ArrowLeft size={15} />
            Back to Library
          </button>
        </div>

        {/* Book Hero Content */}
        <div className="page-gutter relative z-[2] grid grid-cols-1 items-start gap-6 pb-4 pt-6 sm:gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:gap-10 lg:gap-12 md:pt-10">
          {/* Book Cover */}
          <div className="mx-auto w-full max-w-[220px] shrink-0 md:mx-0">
            <div
              className="mx-auto aspect-[11/15] w-full max-w-[220px]"
              style={{
                borderRadius: 16,
                overflow: "hidden",
                boxShadow:
                  "8px 12px 40px rgba(0,0,0,0.5), -4px 0 0 #8B5240, 0 0 0 1px rgba(255,255,255,0.1)",
                position: "relative",
              }}
            >
              {isAdmin ? <AdminPreviewStatusBadge status={book.status} /> : null}
              <img
                src={book.coverImage}
                alt={book.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {/* Book spine effect */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 12,
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.4), transparent)",
                }}
              />
            </div>
            {/* Action buttons under cover */}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 16,
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={handleToggleLike}
                disabled={toggleLike.isPending}
                aria-pressed={liked}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: liked
                    ? "rgba(139,38,53,0.3)"
                    : "rgba(255,255,255,0.1)",
                  border: `1px solid ${liked ? "rgba(139,38,53,0.6)" : "rgba(232,201,138,0.3)"}`,
                  borderRadius: 10,
                  color: liked ? "#C4776A" : "#9B6B4A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                <Heart size={13} fill={liked ? "#C4776A" : "none"} />
                {liked ? "Liked" : "Like"}
              </button>
              <button
                type="button"
                onClick={handleToggleSave}
                disabled={toggleSave.isPending}
                aria-pressed={bookmarked}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: bookmarked
                    ? "rgba(139,38,53,0.3)"
                    : "rgba(255,255,255,0.1)",
                  border: `1px solid ${bookmarked ? "rgba(139,38,53,0.6)" : "rgba(232,201,138,0.3)"}`,
                  borderRadius: 10,
                  color: bookmarked ? "#C4776A" : "#9B6B4A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  transition: "all 0.2s",
                }}
              >
                <Bookmark
                  size={13}
                  fill={bookmarked ? "#C4776A" : "none"}
                  color={bookmarked ? "#C4776A" : "#9B6B4A"}
                />
                {bookmarked ? "Saved" : "Save"}
              </button>
              <button
                style={{
                  width: 36,
                  padding: "8px 0",
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(232,201,138,0.3)",
                  borderRadius: 10,
                  color: "#9B6B4A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Share2 size={13} />
              </button>
            </div>
          </div>

          {/* Book Info */}
          <div className="min-w-0 text-center md:text-left">
            {/* Genre */}
            <div
              style={{
                display: "inline-block",
                background: genreColor.bg,
                color: genreColor.text,
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 14px",
                borderRadius: 20,
                marginBottom: 14,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {book.genre}
            </div>

            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 46px)",
                color: "#F5D9A0",
                lineHeight: 1.2,
                marginBottom: 10,
              }}
            >
              {book.title}
            </h1>

            <div
              style={{
                fontStyle: "italic",
                fontSize: 16,
                color: "#C9952A",
                marginBottom: 18,
              }}
            >
              by {book.author} · {book.year}
            </div>

            {/* Rating row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={16}
                    fill={s <= Math.round(book.rating) ? "#E8B84B" : "rgba(232,201,138,0.4)"}
                    color={s <= Math.round(book.rating) ? "#E8B84B" : "rgba(232,201,138,0.4)"}
                  />
                ))}
                <span
                  style={{
                    fontSize: 15,
                    color: "#F5D9A0",
                    fontWeight: 700,
                    marginLeft: 4,
                  }}
                >
                  {book.rating}
                </span>
                <span style={{ fontSize: 13, color: "#9B6B4A" }}>
                  · {book.totalReviews.toLocaleString()} {book.totalReviews === 1 ? 'review' : 'reviews'}
                </span>
                {book.reviewsEnabled ? (
                  <button
                    type="button"
                    onClick={handleOpenRatingModal}
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#E8B84B",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textDecoration: "underline",
                      textUnderlineOffset: 3,
                      padding: 0,
                    }}
                  >
                    {reviewData?.myReview ? 'Edit your rating' : 'Rate this book'}
                  </button>
                ) : null}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#9B6B4A",
                  fontSize: 13,
                }}
              >
                <BookOpen size={14} />
                {book.pages} pages
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  color: "#9B6B4A",
                  fontSize: 13,
                }}
              >
                <Clock size={14} />~{Math.round(book.pages / 30)} hrs read
              </div>
              {book.totalViews > 0 ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    color: "#9B6B4A",
                    fontSize: 13,
                  }}
                >
                  <Eye size={14} />
                  {formatCompactCount(book.totalViews)} views
                </div>
              ) : null}
            </div>

            {/* Tags */}
            <div
              style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}
            >
              {book.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    background: "rgba(232,184,75,0.15)",
                    border: "1px solid rgba(232,184,75,0.3)",
                    color: "#E8B84B",
                    fontSize: 12,
                    padding: "4px 12px",
                    borderRadius: 20,
                    fontWeight: 600,
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: 15,
                color: "#C4A875",
                lineHeight: 1.8,
                marginBottom: 32,
                maxWidth: "100%",
              }}
              className="md:max-w-[560px]"
            >
              {book.description}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-3.5">
              <button
                type="button"
                onClick={() =>
                  openChapter(
                    resumeChapter,
                    hasProgress ? 'continue_reading' : 'start_reading',
                  )
                }
                className="w-full justify-center sm:w-auto"
                style={{
                  padding: "14px 28px",
                  background: "linear-gradient(135deg, #8B2635 0%, #A83040 100%)",
                  color: "#FEF8EE",
                  border: "none",
                  borderRadius: 32,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 6px 24px rgba(139,38,53,0.4)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = "none";
                }}
              >
                <Play size={15} fill="#FEF8EE" />
                {primaryCtaLabel}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chapters')}
                className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#FEF8EE] bg-[#FEF8EE] px-7 py-3.5 text-[15px] font-bold text-[#8B2635] shadow-[0_4px_14px_rgba(0,0,0,0.22)] transition hover:border-[#FDF0D5] hover:bg-[#FDF0D5] sm:w-auto"
              >
                <List size={15} strokeWidth={2.25} aria-hidden />
                View Chapters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CONTENT TABS ===== */}
      <div className="page-gutter">
        {/* Tab Navigation */}
        <div
          className="-mx-1 flex gap-1 overflow-x-auto border-b-2 border-[#E8C98A] pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            marginBottom: 40,
            marginTop: 8,
          }}
        >
          {(book.reviewsEnabled
            ? (["overview", "chapters", "reviews", "similar"] as const)
            : (["overview", "chapters", "similar"] as const)
          ).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="shrink-0 whitespace-nowrap border-none bg-transparent px-3 py-3 text-[13px] font-bold capitalize tracking-wide sm:px-5 sm:py-3.5 sm:text-sm"
              style={{
                borderBottom: `3px solid ${activeTab === tab ? "#8B2635" : "transparent"}`,
                color: activeTab === tab ? "#8B2635" : "#9B6B4A",
                cursor: "pointer",
                textTransform: "capitalize",
                letterSpacing: "0.02em",
                marginBottom: -2,
                transition: "all 0.2s",
              }}
            >
              {tab === "overview"
                ? "Overview"
                : tab === "chapters"
                ? "Chapters"
                : tab === "reviews"
                ? "Reviews"
                : "Similar Books"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div
            className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)] lg:gap-12 lg:pb-16"
          >
            {/* Main content */}
            <div>
              <h2
                style={{
                  fontFamily: FONT_DISPLAY,
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#3D2314",
                  marginBottom: 16,
                }}
              >
                About this Book
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: "#6B4226",
                  lineHeight: 1.9,
                  marginBottom: 32,
                }}
              >
                {book.longDescription}
              </p>

              {/* Reading Preview Box */}
              <div
                style={{
                  background: "linear-gradient(145deg, #FEF8EE, #F5E4C0)",
                  border: "1.5px solid #E8C98A",
                  borderRadius: 20,
                  padding: "20px 18px",
                  position: "relative",
                }}
                className="overflow-hidden sm:p-8"
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background:
                      "radial-gradient(circle, rgba(232,184,75,0.2) 0%, transparent 70%)",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <BookOpen size={18} color="#8B2635" />
                  <span
                    style={{
                      fontFamily: FONT_DISPLAY,
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#3D2314",
                    }}
                  >
                    Chapter {resumeChapter}: {book.chapters[resumeChapter - 1] ?? book.chapters[0]}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 15,
                    color: "#6B4226",
                    lineHeight: 1.9,
                    fontStyle: "italic",
                    marginBottom: 20,
                  }}
                >
                  "The morning light fell through ancient leaves in amber shards,
                  dappling the path ahead with warm gold. She had walked this road
                  a thousand times in dreams — but today, for the first time, it
                  felt like it was waiting for her to arrive..."
                </p>
                <button
                  type="button"
                  onClick={() => openChapter(resumeChapter, 'continue_reading')}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #8B2635 0%, #A83040 100%)",
                    color: "#FEF8EE",
                    border: "none",
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Continue Reading <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Book Details Card */}
              <div
                style={{
                  background: "#FEF8EE",
                  border: "1.5px solid #E8C98A",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#3D2314",
                    marginBottom: 16,
                  }}
                >
                  Book Details
                </h3>
                {[
                  { label: "Author", value: book.author },
                  { label: "Published", value: book.year.toString() },
                  { label: "Pages", value: `${book.pages} pages` },
                  { label: "Genre", value: book.genre },
                  {
                    label: "Reading Time",
                    value: `~${Math.round(book.pages / 30)} hours`,
                  },
                  { label: "Chapters", value: `${book.chapters.length} chapters` },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(232,201,138,0.4)",
                    }}
                  >
                    <span
                      style={{ fontSize: 13, color: "#9B6B4A", fontWeight: 500 }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        color: "#3D2314",
                        fontWeight: 700,
                        textAlign: "right",
                        maxWidth: "55%",
                      }}
                      className="min-w-0 break-words"
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick chapters preview */}
              <div
                style={{
                  background: "#FEF8EE",
                  border: "1.5px solid #E8C98A",
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <h3
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 16,
                    color: "#3D2314",
                    marginBottom: 14,
                  }}
                >
                  Quick Chapter List
                </h3>
                {book.chapters.slice(0, 5).map((ch, i) => (
                  <div
                    key={i}
                    onClick={() => setActiveTab('chapters')}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                      marginBottom: 4,
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#F5E4C0";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: i === 0 ? "#8B2635" : "#E8C98A",
                        color: i === 0 ? "#fff" : "#9B6B4A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: i === 0 ? "#3D2314" : "#6B4226",
                        fontWeight: i === 0 ? 700 : 400,
                      }}
                    >
                      {ch}
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => setActiveTab("chapters")}
                  style={{
                    width: "100%",
                    marginTop: 8,
                    padding: "8px 0",
                    background: "transparent",
                    border: "1.5px solid #E8C98A",
                    borderRadius: 10,
                    color: "#9B6B4A",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#C9952A";
                    (e.currentTarget as HTMLElement).style.color = "#3D2314";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#E8C98A";
                    (e.currentTarget as HTMLElement).style.color = "#9B6B4A";
                  }}
                >
                  View all {book.chapters.length} chapters →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chapters Tab */}
        {activeTab === "chapters" && (
          <div style={{ paddingBottom: 64 }}>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 22,
                color: "#3D2314",
                marginBottom: 8,
              }}
            >
              {book.chapters.length} Chapters
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#9B6B4A",
                marginBottom: 28,
                fontStyle: "italic",
              }}
            >
              Select a chapter to begin reading
            </p>
            <div className="mx-auto grid max-w-[680px] gap-3 sm:gap-3">
              {book.chapters.map((ch, i) => (
                <div
                  key={i}
                  onClick={() => openChapter(i + 1, 'chapter_opened')}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 20px",
                    background: '#FEF8EE',
                    border: '1.5px solid #E8C98A',
                    borderRadius: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#E8B84B'
                    el.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = '#E8C98A'
                    el.style.transform = 'none'
                  }}
                >
                  {/* Chapter number */}
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: '#F5D9A0',
                      color: '#6B4226',
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                      fontFamily: FONT_DISPLAY,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 600,
                        fontSize: 15,
                        color: "#3D2314",
                        marginBottom: 4,
                      }}
                    >
                      {ch}
                    </div>
                    <div style={{ fontSize: 12, color: '#9B6B4A' }}>
                      ~{pagesPerChapter} pages · ~{minutesPerChapter} min read
                    </div>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    {completedChapterIndexes.has(i) ? (
                      <CheckCircle2 size={22} color="#4A7A3D" strokeWidth={2.25} aria-label="Completed" />
                    ) : (
                      <ChevronRight size={18} color="#9B6B4A" aria-hidden />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === "reviews" && book.reviewsEnabled && (
          <div style={{ paddingBottom: 64 }}>
            <div className="flex flex-wrap items-center justify-between gap-4" style={{ marginBottom: 28 }}>
              <div>
                <h2
                  style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 22,
                    color: "#3D2314",
                    marginBottom: 8,
                  }}
                >
                  Reader Reviews
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        fill={s <= Math.round(book.rating) ? "#E8B84B" : "none"}
                        color={s <= Math.round(book.rating) ? "#E8B84B" : "#C9AE85"}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#3D2314" }}>{book.rating}</span>
                  <span style={{ fontSize: 13, color: "#9B6B4A" }}>
                    · {book.totalReviews.toLocaleString()} {book.totalReviews === 1 ? "review" : "reviews"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenRatingModal}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.35)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Star size={14} fill="#FEF8EE" />
                {reviewData?.myReview ? "Edit your review" : "Rate this book"}
              </button>
            </div>

            <ReviewList
              reviews={reviewData?.reviews ?? []}
              isAdmin={isAdmin}
              page={reviewData?.currentPage ?? reviewPage}
              totalPages={reviewData?.totalPages ?? 1}
              onPageChange={setReviewPage}
              onToggleHidden={isAdmin ? handleToggleReviewHidden : undefined}
              onDelete={handleDeleteReview}
              busyReviewId={
                toggleReviewHiddenMutation.isPending || deleteReviewMutation.isPending
                  ? (toggleReviewHiddenMutation.variables?.reviewId ?? deleteReviewMutation.variables ?? null)
                  : null
              }
            />
          </div>
        )}

        {/* Similar Books Tab */}
        {activeTab === "similar" && (
          <div style={{ paddingBottom: 64 }}>
            <h2
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: 22,
                color: "#3D2314",
                marginBottom: 8,
              }}
            >
              You May Also Enjoy
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "#9B6B4A",
                fontStyle: "italic",
                marginBottom: 28,
              }}
            >
              Curated picks with matching genres and tags
            </p>
            <div className="book-grid">
              {displaySimilar.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}
      </div>
      <RatingModal
        open={ratingModalOpen}
        bookTitle={book.title}
        initialRating={reviewData?.myReview?.rating ?? 0}
        initialComment={reviewData?.myReview?.comment ?? ''}
        submitting={submitReviewMutation.isPending}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
      <Footer />
    </div>
  )
}
