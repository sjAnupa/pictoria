import { useParams, Link, useNavigate } from 'react-router-dom'
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
} from 'lucide-react'
import { getBookBySlug, books } from '../data/mockBooks'
import BookCard from '../components/books/BookCard'
import { BooksIllustration } from '../components/illustrations/BooksIllustration'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { useMemo, useState } from 'react'

const genreColors: Record<string, { bg: string; text: string }> = {
  Fantasy: { bg: "#E8D5F5", text: "#6B2D8B" },
  Adventure: { bg: "#D5EAF5", text: "#1A5F8B" },
  Mystery: { bg: "#F5E8D5", text: "#8B5A1A" },
  Romance: { bg: "#F5D5E8", text: "#8B1A5F" },
  "Children's": { bg: "#D5F5E0", text: "#1A8B4A" },
  Humor: { bg: '#F5F5D5', text: '#6B6B1A' },
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
  const [bookmarked, setBookmarked] = useState(false)
  const [liked, setLiked] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'chapters' | 'similar'>('overview')

  const book = getBookBySlug(slug ?? '')
  const completedChapterIndexes = useMemo(() => new Set([0, 1]), [])
  const { pagesPerChapter, minutes: minutesPerChapter } = book
    ? chapterReadMetrics(book.pages, book.chapters.length)
    : { pagesPerChapter: 0, minutes: 0 }

  if (!book) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
        <Navbar />
        <main
          className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          <BooksIllustration size={180} />
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#3D2314' }}>Book Not Found</div>
          <Link to="/" style={{ color: '#8B2635', textDecoration: 'none', fontWeight: 700, fontSize: 15 }}>
            ← Back to home
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const genreColor = genreColors[book.genre] || { bg: "#F5E8D5", text: "#8B5A1A" };
  const similarBooks = books.filter((b) => b.id !== book.id && b.genre === book.genre).slice(0, 4);
  const otherBooks = books.filter((b) => b.id !== book.id).slice(0, 4);
  const displaySimilar = similarBooks.length >= 2 ? similarBooks : otherBooks;

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <Navbar />
      <div className="flex-1 w-full min-w-0" style={{ fontFamily: "'Nunito', sans-serif" }}>
      {/* ===== HERO BOOK SECTION ===== */}
      <div
        style={{
          background: "linear-gradient(180deg, #3D2314 0%, #6B4226 60%, #FDF0D5 100%)",
          position: "relative",
          overflow: "hidden",
          paddingBottom: 60,
        }}
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
              fontFamily: "'Nunito', sans-serif",
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
        <div className="page-gutter relative z-[2] grid grid-cols-[auto_minmax(0,1fr)] items-start gap-12 pb-4 pt-10">
          {/* Book Cover */}
          <div style={{ flexShrink: 0 }}>
            <div
              style={{
                width: 220,
                height: 300,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow:
                  "8px 12px 40px rgba(0,0,0,0.5), -4px 0 0 #8B5240, 0 0 0 1px rgba(255,255,255,0.1)",
                position: "relative",
              }}
            >
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
                onClick={() => setLiked(!liked)}
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
                  fontFamily: "'Nunito', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                <Heart size={13} fill={liked ? "#C4776A" : "none"} />
                {liked ? "Liked" : "Like"}
              </button>
              <button
                onClick={() => setBookmarked(!bookmarked)}
                style={{
                  flex: 1,
                  padding: "8px 0",
                  background: bookmarked
                    ? "rgba(232,184,75,0.2)"
                    : "rgba(255,255,255,0.1)",
                  border: `1px solid ${bookmarked ? "rgba(232,184,75,0.5)" : "rgba(232,201,138,0.3)"}`,
                  borderRadius: 10,
                  color: bookmarked ? "#E8B84B" : "#9B6B4A",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif",
                  transition: "all 0.2s",
                }}
              >
                <Bookmark
                  size={13}
                  fill={bookmarked ? "#E8B84B" : "none"}
                  color={bookmarked ? "#E8B84B" : "#9B6B4A"}
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
          <div>
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
                fontFamily: "'Playfair Display', serif",
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
                fontFamily: "'Lora', serif",
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
                  · 2.4k reviews
                </span>
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
                fontFamily: "'Lora', serif",
                fontSize: 15,
                color: "#C4A875",
                lineHeight: 1.8,
                marginBottom: 32,
                maxWidth: 560,
              }}
            >
              {book.description}
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => navigate(`/read/${book.id}/chapter/1`)}
                style={{
                  padding: "14px 36px",
                  background: "linear-gradient(135deg, #8B2635 0%, #A83040 100%)",
                  color: "#FEF8EE",
                  border: "none",
                  borderRadius: 32,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
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
                Start Reading
              </button>
              <button
                style={{
                  padding: "14px 28px",
                  background: "rgba(255,255,255,0.08)",
                  color: "#F5D9A0",
                  border: "1.5px solid rgba(232,201,138,0.35)",
                  borderRadius: 32,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  backdropFilter: "blur(4px)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255,255,255,0.08)";
                }}
              >
                <List size={15} />
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
          style={{
            display: "flex",
            gap: 4,
            borderBottom: "2px solid #E8C98A",
            marginBottom: 40,
            marginTop: 8,
          }}
        >
          {(["overview", "chapters", "similar"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                borderBottom: `3px solid ${activeTab === tab ? "#8B2635" : "transparent"}`,
                color: activeTab === tab ? "#8B2635" : "#9B6B4A",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
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
                : "Similar Books"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 320px",
              gap: 48,
              paddingBottom: 64,
            }}
          >
            {/* Main content */}
            <div>
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
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
                  fontFamily: "'Lora', serif",
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
                  padding: 32,
                  position: "relative",
                  overflow: "hidden",
                }}
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
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#3D2314",
                    }}
                  >
                    Chapter 1: {book.chapters[0]}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Lora', serif",
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
                  onClick={() => navigate(`/read/${book.id}/chapter/1`)}
                  style={{
                    padding: "10px 24px",
                    background: "linear-gradient(135deg, #8B2635 0%, #A83040 100%)",
                    color: "#FEF8EE",
                    border: "none",
                    borderRadius: 24,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Nunito', sans-serif",
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
                    fontFamily: "'Playfair Display', serif",
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
                        maxWidth: 140,
                      }}
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
                    fontFamily: "'Playfair Display', serif",
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
                    fontFamily: "'Nunito', sans-serif",
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
                fontFamily: "'Playfair Display', serif",
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
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
              }}
            >
              Select a chapter to begin reading
            </p>
            <div
              style={{
                display: "grid",
                gap: 12,
                maxWidth: 680,
              }}
            >
              {book.chapters.map((ch, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/read/${book.id}/chapter/${i + 1}`)}
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
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
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

        {/* Similar Books Tab */}
        {activeTab === "similar" && (
          <div style={{ paddingBottom: 64 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
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
                fontFamily: "'Lora', serif",
                fontStyle: "italic",
                marginBottom: 28,
              }}
            >
              Curated picks based on {book.title}
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 24,
              }}
            >
              {displaySimilar.map((b) => (
                <BookCard key={b.id} book={b} />
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </div>
  )
}
