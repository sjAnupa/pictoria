import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, Sparkles, TrendingUp, Star } from 'lucide-react'
import { BooksIllustration } from '../illustrations/BooksIllustration'
import BookCard from '../books/BookCard'
import { featuredBooks, newBooks } from '../../data/mockBooks'

export default function PictoriaHomeContent() {
  return (
    <div
      style={{
        background: '#FDF0D5',
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {/* ===== HERO SECTION ===== */}
      <section
        style={{
          position: "relative",
          overflow: "hidden",
          minHeight: 580,
          display: "flex",
          alignItems: "center",
        }}
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
                fontFamily: "'Playfair Display', serif",
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
                fontFamily: "'Lora', serif",
                fontSize: 17,
                color: "#6B4226",
                lineHeight: 1.75,
                marginBottom: 32,
                maxWidth: 480,
              }}
            >
              Discover a curated library of beautifully illustrated books — where
              every page is a painting and every chapter a journey worth taking.
            </p>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link
                to={`/books/${featuredBooks[0]?.slug ?? 'the-enchanted-garden'}`}
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
                    fontFamily: "'Nunito', sans-serif",
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
                  fontFamily: "'Nunito', sans-serif",
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

            {/* Quick Stats */}
            <div
              style={{
                display: "flex",
                gap: 28,
                marginTop: 40,
                flexWrap: "wrap",
              }}
            >
              {[
                { num: "2,400+", label: "Illustrated Books" },
                { num: "340+", label: "Authors" },
                { num: "98K+", label: "Readers" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 700,
                      fontSize: 22,
                      color: "#8B2635",
                    }}
                  >
                    {stat.num}
                  </div>
                  <div style={{ fontSize: 12, color: "#9B6B4A", fontWeight: 500 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
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
                padding: "48px 56px 40px",
                border: "2.5px solid #C9952A",
                boxShadow:
                  "0 20px 60px rgba(90,40,10,0.22), inset 0 1px 0 rgba(255,230,160,0.6)",
                position: "relative",
                overflow: "hidden",
              }}
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
                <BooksIllustration size={300} />
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div>
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
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#3D2314",
                }}
              >
                Featured Reads
              </h2>
            </div>
            <Link
              to="/library"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "transparent",
                border: "none",
                color: "#8B2635",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Nunito', sans-serif",
                textDecoration: "none",
              }}
            >
              Open catalog <ChevronRight size={14} />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}
          >
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== BANNER: Reading Quote ===== */}
      <section
        style={{
          background: "linear-gradient(135deg, #3D2314 0%, #6B4226 100%)",
          padding: "56px 32px",
          position: "relative",
          overflow: "hidden",
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
              fontFamily: "'Playfair Display', serif",
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
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            — George R.R. Martin
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section id="new-arrivals" className="scroll-mt-[88px]" style={{ padding: "48px 0 56px" }}>
        <div className="page-gutter">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 28,
            }}
          >
            <div>
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
              <h2
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 700,
                  fontSize: 28,
                  color: "#3D2314",
                }}
              >
                New Arrivals
              </h2>
            </div>
            <Link
              to="/library"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 13,
                fontWeight: 700,
                color: "#8B2635",
                textDecoration: "none",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              Open catalog <ChevronRight size={14} />
            </Link>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 24,
            }}
          >
            {newBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      </section>

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
          <h2 className="font-pictoria text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[#3D2314]">Full catalog</h2>
          <p
            className="mt-3 max-w-lg text-sm leading-relaxed text-[#6B4226]"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Search, sort, and filter every title in one place. Highlights stay on this page; the catalog opens separately so filters never fight with the story sections above.
          </p>
          <Link
            to="/library"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-8 py-3.5 text-sm font-bold text-[#FEF8EE] shadow-[0_12px_32px_rgba(139,38,53,0.35)] no-underline transition hover:brightness-105"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Open catalog
            <ChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
