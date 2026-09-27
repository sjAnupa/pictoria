import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Sparkles, TrendingUp, Star, Heart } from 'lucide-react'
import BookCard from '../books/BookCard'
import { useFeaturedBooks, useMostLikedBooks, useNewBooks } from '../../hooks/useBooks'
import { useCatalogStats } from '../../hooks/useAdminBooks'
import { FONT_DISPLAY } from '../../theme/typography'

/** Only show a metric once it clears this floor — small exact counts stay off the hero. */
const HERO_STAT_THRESHOLDS = {
  books: 20,
  authors: 10,
  readers: 50,
} as const

const DISPLAY_FLOORS = [1000, 500, 250, 100, 50, 20, 10] as const

function formatFloorPlus(count: number, minFloor: number): string | null {
  if (count < minFloor) return null
  for (const floor of DISPLAY_FLOORS) {
    if (floor < minFloor) continue
    if (count >= floor) {
      if (floor >= 1000) return `${Math.floor(count / 1000)}K+`
      return `${floor}+`
    }
  }
  return null
}

type HeroStatItem = { num: string; label: string }

function buildHeroCatalogStats(input: {
  bookCount?: number
  authorCount?: number
  readerCount?: number
  loaded: boolean
}): { mode: 'loading' } | { mode: 'soft'; line: string } | { mode: 'stats'; items: HeroStatItem[] } {
  if (!input.loaded) return { mode: 'loading' }

  const items: HeroStatItem[] = []
  const books = formatFloorPlus(input.bookCount ?? 0, HERO_STAT_THRESHOLDS.books)
  const authors = formatFloorPlus(input.authorCount ?? 0, HERO_STAT_THRESHOLDS.authors)
  const readers = formatFloorPlus(input.readerCount ?? 0, HERO_STAT_THRESHOLDS.readers)

  if (books) items.push({ num: books, label: 'Books' })
  if (authors) items.push({ num: authors, label: 'Authors' })
  if (readers) items.push({ num: readers, label: 'Readers' })

  if (items.length === 0) {
    return { mode: 'soft', line: 'A growing curated library of illustrated stories' }
  }
  return { mode: 'stats', items }
}

export default function PictoriyaHomeContent() {
  const { data: featuredBooks = [], isLoading: featuredLoading } = useFeaturedBooks()
  const { data: newBooks = [], isLoading: newLoading } = useNewBooks()
  const { data: mostLikedBooks = [] } = useMostLikedBooks()
  const { data: catalogStats, isSuccess: catalogStatsLoaded } = useCatalogStats()
  const heroSlug = featuredBooks[0]?.slug ?? 'the-enchanted-garden'
  const heroStats = buildHeroCatalogStats({
    bookCount: catalogStats?.bookCount,
    authorCount: catalogStats?.authorCount,
    readerCount: catalogStats?.readerCount,
    loaded: catalogStatsLoaded,
  })


  return (
    <div
      style={{
        background: '#FDF0D5',
      }}
    >
      {/* ===== HERO SECTION ===== */}
      <section
        className="relative flex min-h-0 items-center overflow-hidden py-10 sm:py-12 lg:min-h-[520px] lg:py-14"
      >
        {/* Watercolor parchment background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse at 15% 20%, rgba(232,184,75,0.38) 0%, transparent 45%),
              radial-gradient(ellipse at 80% 15%, rgba(196,119,106,0.2) 0%, transparent 40%),
              radial-gradient(ellipse at 8% 75%, rgba(201,149,42,0.28) 0%, transparent 45%),
              radial-gradient(ellipse at 88% 80%, rgba(232,184,75,0.22) 0%, transparent 50%),
              radial-gradient(ellipse at 45% 55%, rgba(240,200,130,0.18) 0%, transparent 55%),
              radial-gradient(ellipse at 65% 40%, rgba(196,119,106,0.12) 0%, transparent 40%),
              #F5D9A0
            `,
          }}
        />

        {/* SVG watercolor texture blobs */}
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}
          preserveAspectRatio="xMidYMid slice"
          viewBox="0 0 1440 580"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse cx="180" cy="120" rx="200" ry="140" fill="#E8B84B" opacity="0.3" />
          <ellipse cx="1300" cy="480" rx="240" ry="160" fill="#C9952A" opacity="0.22" />
          <ellipse cx="1100" cy="100" rx="180" ry="120" fill="#E8C98A" opacity="0.3" />
          <ellipse cx="400" cy="500" rx="260" ry="130" fill="#E8B84B" opacity="0.2" />
          <ellipse cx="750" cy="80" rx="140" ry="80" fill="#C4776A" opacity="0.12" />
          <ellipse cx="60" cy="480" rx="120" ry="100" fill="#C9952A" opacity="0.2" />
        </svg>

        {/* Vignette edges */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at center, transparent 50%, rgba(180,110,40,0.15) 100%)",
          }}
        />

        {/* Hero content */}
        <div className="page-gutter relative z-[2] grid w-full grid-cols-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div style={{ maxWidth: 580 }}>
            {/* Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(139,38,53,0.1)",
                border: "1.5px solid rgba(139,38,53,0.25)",
                borderRadius: 24,
                padding: "5px 14px",
                marginBottom: 24,
              }}
            >
              <Sparkles size={13} color="#8B2635" />
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#8B2635",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Illustrated Stories for Every Soul
              </span>
            </div>

            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 700,
                fontSize: "clamp(36px, 5vw, 58px)",
                color: "#3D2314",
                lineHeight: 1.15,
                marginBottom: 20,
              }}
            >
              Where Stories
              <br />
              <span
                style={{
                  color: "#8B2635",
                  fontStyle: "italic",
                }}
              >
                Come to Life
              </span>
              <br />
              in Illustration
            </h1>

            <p
              style={{
                fontSize: 17,
                color: "#6B4226",
                lineHeight: 1.75,
                marginBottom: 24,
                maxWidth: 480,
              }}
            >
              Discover a curated library of beautifully illustrated books — where
              every page is a painting and every chapter a journey worth taking.
            </p>

            {/* Catalog snapshot — numbers only after meaningful thresholds */}
            {heroStats.mode === 'loading' ? null : heroStats.mode === 'soft' ? (
              <p
                style={{
                  marginBottom: 28,
                  maxWidth: 420,
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#8B2635',
                  letterSpacing: '0.02em',
                }}
              >
                {heroStats.line}
              </p>
            ) : (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'stretch',
                  gap: 0,
                  marginBottom: 28,
                  flexWrap: 'wrap',
                  maxWidth: 420,
                }}
                aria-label="Library snapshot"
              >
                {heroStats.items.map((stat, index) => (
                  <div
                    key={stat.label}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      paddingRight: index < heroStats.items.length - 1 ? 20 : 0,
                      marginRight: index < heroStats.items.length - 1 ? 20 : 0,
                      borderRight:
                        index < heroStats.items.length - 1
                          ? '1px solid rgba(201,149,42,0.45)'
                          : 'none',
                      minWidth: 72,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                          fontSize: 26,
                          lineHeight: 1.1,
                          color: '#8B2635',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {stat.num}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 11,
                          color: '#9B6B4A',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                to={`/books/${heroSlug}`}
                style={{ textDecoration: 'none' }}
              >
                <button
                  style={{
                    padding: "14px 32px",
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
                    boxShadow: "0 6px 24px rgba(139,38,53,0.35)",
                    transition: "all 0.25s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 10px 32px rgba(139,38,53,0.45)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 6px 24px rgba(139,38,53,0.35)";
                  }}
                >
                  <BookOpen size={16} />
                  Start Reading
                </button>
              </Link>
              <Link
                to="/library"
                style={{
                  padding: "14px 28px",
                  background: "transparent",
                  color: "#3D2314",
                  border: "2px solid #C9952A",
                  borderRadius: 32,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.25s",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "#C9952A";
                  (e.currentTarget as HTMLElement).style.color = "#FEF8EE";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#3D2314";
                }}
              >
                Browse catalog
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          {/* Hero Illustration — visible on all breakpoints (Figma hid on small; we show scaled for parity testing) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0,
            }}
            className="mx-auto w-full max-w-[min(100%,360px)] justify-self-center lg:max-w-none lg:justify-self-end"
          >
            {/* Parchment card containing the illustration */}
            <div
              style={{
                background: "linear-gradient(145deg, #F5D9A0 0%, #EEC87A 50%, #E8B84B 100%)",
                borderRadius: 24,
                padding: "24px 20px 20px",
                border: "2.5px solid #C9952A",
                boxShadow:
                  "0 20px 60px rgba(90,40,10,0.22), inset 0 1px 0 rgba(255,230,160,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
              className="sm:!p-10 md:!px-12 md:!pb-10"
            >
              {/* Watercolor texture inside card */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `
                    radial-gradient(ellipse at 20% 30%, rgba(255,220,130,0.5) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 70%, rgba(200,140,50,0.3) 0%, transparent 45%),
                    radial-gradient(ellipse at 60% 20%, rgba(220,170,80,0.3) 0%, transparent 40%)
                  `,
                  borderRadius: 22,
                }}
              />
              <div style={{ position: 'relative', zIndex: 1 }} className="scale-[0.82] sm:scale-90 lg:scale-100">
                <img
                  src="/logo-mark.png"
                  alt=""
                  decoding="async"
                  draggable={false}
                  className="mx-auto h-[300px] w-[300px] max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COLOR PALETTE SHOWCASE ===== */}
      {/* <section
        style={{
          background: "#FEF8EE",
          borderTop: "1.5px solid #E8C98A",
          borderBottom: "1.5px solid #E8C98A",
          padding: "24px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#9B6B4A",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              Color Palette
            </span>
            <div
              style={{
                width: 1,
                height: 32,
                background: "#E8C98A",
                flexShrink: 0,
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                flex: 1,
              }}
            >
              {colorPaletteItems.map((c) => (
                <div
                  key={c.hex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                  }}
                  title={`${c.name} — ${c.hex}`}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: c.hex,
                      border: "2px solid rgba(90,40,10,0.15)",
                      boxShadow: "0 2px 6px rgba(90,40,10,0.12)",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#3D2314",
                        lineHeight: 1.1,
                      }}
                    >
                      {c.name}
                    </div>
                    <div style={{ fontSize: 10, color: "#9B6B4A" }}>
                      {c.hex}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}

      {/* ===== FEATURED BOOKS ===== */}
      <section id="featured-reads" className="scroll-mt-[88px]" style={{ padding: "32px 0 48px" }}>
        <div className="page-gutter">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
            <div className="min-w-0">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Star size={16} fill="#E8B84B" color="#E8B84B" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9B6B4A",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Editor's Pick
                </span>
              </div>
              <h2 className="font-pictoriya text-[clamp(1.35rem,3vw,1.75rem)] font-bold text-[#3D2314]">
                Featured Reads
              </h2>
            </div>
            <Link
              to="/library"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#8B2635] no-underline"
            >
              Open catalog <ChevronRight size={14} />
            </Link>
          </div>
          <div className="book-grid">
            {featuredLoading ? (
              <p className="text-sm text-[#9B6B4A]">Loading featured reads…</p>
            ) : featuredBooks.length === 0 ? (
              <p className="text-sm text-[#9B6B4A]">No featured books yet.</p>
            ) : (
              featuredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== BANNER: Reading Quote ===== */}
      <section
        className="page-gutter-inline relative overflow-hidden py-10 sm:py-14"
        style={{
          background: "linear-gradient(135deg, #3D2314 0%, #6B4226 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(ellipse at 10% 50%, rgba(232,184,75,0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 90% 50%, rgba(139,38,53,0.2) 0%, transparent 50%)
            `,
          }}
        />
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: FONT_DISPLAY,
              fontSize: "clamp(22px, 4vw, 38px)",
              fontStyle: "italic",
              color: "#F5D9A0",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            "A reader lives a thousand lives before he dies. The man who never
            reads lives only one."
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#C9952A",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            — George R.R. Martin
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section id="new-arrivals" className="scroll-mt-[88px]" style={{ padding: "48px 0 56px" }}>
        <div className="page-gutter">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
            <div className="min-w-0">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <TrendingUp size={16} color="#8B2635" />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#9B6B4A",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Just Added
                </span>
              </div>
              <h2 className="font-pictoriya text-[clamp(1.35rem,3vw,1.75rem)] font-bold text-[#3D2314]">
                New Arrivals
              </h2>
            </div>
            <Link
              to="/library"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#8B2635] no-underline"
            >
              Open catalog <ChevronRight size={14} />
            </Link>
          </div>
          <div className="book-grid">
            {newLoading ? (
              <p className="text-sm text-[#9B6B4A]">Loading new arrivals…</p>
            ) : newBooks.length === 0 ? (
              <p className="text-sm text-[#9B6B4A]">No new books yet.</p>
            ) : (
              newBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* ===== READER FAVORITES (most liked) ===== */}
      {mostLikedBooks.length > 0 && (
        <section id="reader-favorites" className="scroll-mt-[88px]" style={{ padding: "48px 0 56px", background: "#FEF8EE", borderTop: "1.5px solid #E8C98A", borderBottom: "1.5px solid #E8C98A" }}>
          <div className="page-gutter">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 sm:mb-7">
              <div className="min-w-0">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <Heart size={16} fill="#8B2635" color="#8B2635" />
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#9B6B4A",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Loved by readers
                  </span>
                </div>
                <h2 className="font-pictoriya text-[clamp(1.35rem,3vw,1.75rem)] font-bold text-[#3D2314]">
                  Reader Favorites
                </h2>
              </div>
              <Link
                to="/library"
                className="inline-flex shrink-0 items-center gap-1 text-[13px] font-bold text-[#8B2635] no-underline"
              >
                Open catalog <ChevronRight size={14} />
              </Link>
            </div>
            <div className="book-grid">
              {mostLikedBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CATALOG CTA (full list lives on /library) ===== */}
      <section
        id="browse-catalog"
        className="scroll-mt-[88px]"
        style={{
          padding: "48px 0 64px",
          background: "#FEF8EE",
          borderTop: "1.5px solid #E8C98A",
        }}
      >
        <div className="page-gutter flex flex-col items-center py-6 text-center sm:py-10">
          <h2 className="font-pictoriya text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[#3D2314]">Full catalog</h2>
          <p
            className="mt-3 max-w-lg text-sm leading-relaxed text-[#6B4226]"
          >
            Search, sort, and filter every title in one place. Highlights stay on this page; the catalog opens separately so filters never fight with the story sections above.
          </p>
          <Link
            to="/library"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-8 py-3.5 text-sm font-bold text-[#FEF8EE] shadow-[0_12px_32px_rgba(139,38,53,0.35)] no-underline transition hover:brightness-105"
          >
            Open catalog
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
