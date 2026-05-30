import { Link } from 'react-router-dom'
import { Star, BookOpen } from 'lucide-react'
import type { Book } from '../../data/mockBooks'

const genreColors: Record<string, { bg: string; text: string }> = {
  Fantasy: { bg: "#E8D5F5", text: "#6B2D8B" },
  Adventure: { bg: "#D5EAF5", text: "#1A5F8B" },
  Mystery: { bg: "#F5E8D5", text: "#8B5A1A" },
  Romance: { bg: "#F5D5E8", text: "#8B1A5F" },
  "Children's": { bg: "#D5F5E0", text: "#1A8B4A" },
  Humor: { bg: "#F5F5D5", text: "#6B6B1A" },
};

interface BookCardProps {
  book: Book
  /** `compact` = horizontal list-style row. */
  variant?: 'default' | 'compact'
  /**
   * Default layout only: same card as home, with a shorter cover area and slightly
   * tighter body (e.g. browse catalog grid).
   */
  shortTile?: boolean
}

export default function BookCard({ book, variant = 'default', shortTile = false }: BookCardProps) {
  const genreColor = genreColors[book.genre] || {
    bg: "#F5E8D5",
    text: "#8B5A1A",
  };

  if (variant === "compact") {
    return (
      <Link
        to={`/books/${book.slug}`}
        style={{ textDecoration: "none" }}
      >
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "10px 12px",
            background: "#FEF8EE",
            borderRadius: 12,
            border: "1.5px solid #E8C98A",
            transition: "all 0.25s",
            cursor: "pointer",
            fontFamily: "'Nunito', sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 6px 20px rgba(90,40,10,0.14)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "none";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
        >
          <div
            style={{
              width: 44,
              height: 60,
              borderRadius: 7,
              overflow: "hidden",
              flexShrink: 0,
              boxShadow: "2px 2px 8px rgba(60,20,10,0.18)",
            }}
          >
            <img
              src={book.coverImage}
              alt={book.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 600,
                fontSize: 13,
                color: "#3D2314",
                marginBottom: 2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {book.title}
            </div>
            <div style={{ fontSize: 11, color: "#9B6B4A", marginBottom: 2 }}>
              {book.author}
            </div>
            <div style={{ fontSize: 10, color: '#9B6B4A', marginBottom: 4, fontWeight: 600 }}>
              {book.year} · {book.chapters.length} ch
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <Star size={10} fill="#E8B84B" color="#E8B84B" />
              <span style={{ fontSize: 11, color: "#6B4226", fontWeight: 600 }}>
                {book.rating}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#9B6B4A",
                  marginLeft: 4,
                }}
              >
                · {book.pages}p
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  const st = shortTile
    ? {
        coverH: 148,
        gradH: 48,
        pad: '12px 14px 14px' as const,
        titleFs: 15,
        metaMb: 8,
        descMb: 10,
        descFs: 11,
        rateMb: 10,
        star: 12,
        btnPy: '8px 0' as const,
        btnFs: 12,
        radius: 16,
      }
    : {
        coverH: 200,
        gradH: 60,
        pad: '14px 18px 18px' as const,
        titleFs: 16,
        metaMb: 10,
        descMb: 14,
        descFs: 12,
        rateMb: 14,
        star: 13,
        btnPy: '10px 0' as const,
        btnFs: 13,
        radius: 18,
      }

  return (
    <Link to={`/books/${book.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "#FEF8EE",
          borderRadius: st.radius,
          border: "1.5px solid #E8C98A",
          overflow: "hidden",
          transition: "all 0.3s ease",
          cursor: "pointer",
          fontFamily: "'Nunito', sans-serif",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 16px 40px rgba(90,40,10,0.18)";
          (e.currentTarget as HTMLElement).style.borderColor = "#C9952A";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "none";
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.borderColor = "#E8C98A";
        }}
      >
        {/* Badges */}
        {book.isNew && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "#8B2635",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              zIndex: 2,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            New
          </div>
        )}

        {/* Cover Image */}
        <div
          style={{
            height: st.coverH,
            overflow: "hidden",
            position: "relative",
            background: "#F5E4C0",
          }}
        >
          <img
            src={book.coverImage}
            alt={book.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1.06)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          />
          {/* Bottom gradient on image */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: st.gradH,
              background:
                "linear-gradient(to top, rgba(254,248,238,0.95) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: st.pad }}>
          {/* Genre tag */}
          <div
            style={{
              display: "inline-block",
              background: genreColor.bg,
              color: genreColor.text,
              fontSize: 10,
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: 20,
              marginBottom: shortTile ? 6 : 8,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            {book.genre}
          </div>

          {/* Title */}
          <div
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: st.titleFs,
              color: "#3D2314",
              marginBottom: 4,
              lineHeight: 1.3,
            }}
          >
            {book.title}
          </div>

          {/* Author */}
          <div
            style={{
              fontSize: 12,
              color: "#9B6B4A",
              marginBottom: shortTile ? 4 : 6,
              fontStyle: "italic",
              fontFamily: "'Lora', serif",
            }}
          >
            by {book.author}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              marginBottom: st.metaMb,
              fontSize: 11,
              color: '#6B4226',
              fontWeight: 600,
            }}
          >
            <span>{book.year}</span>
            <span style={{ color: '#E8C98A' }}>·</span>
            <span>{book.chapters.length} chapters</span>
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: st.descFs,
              color: "#6B4226",
              lineHeight: 1.6,
              marginBottom: st.descMb,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {book.description}
          </div>

          {/* Rating & Pages */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: st.rateMb,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={st.star}
                  fill={s <= Math.round(book.rating) ? "#E8B84B" : "#E8C98A"}
                  color={s <= Math.round(book.rating) ? "#E8B84B" : "#E8C98A"}
                />
              ))}
              <span
                style={{
                  fontSize: 12,
                  color: "#6B4226",
                  fontWeight: 700,
                  marginLeft: 2,
                }}
              >
                {book.rating}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#9B6B4A",
                fontSize: 12,
              }}
            >
              <BookOpen size={12} />
              <span>{book.pages} pages</span>
            </div>
          </div>

          {/* Read Now Button */}
          <button
            style={{
              width: "100%",
              padding: st.btnPy,
              background: "linear-gradient(135deg, #8B2635 0%, #A83040 100%)",
              color: "#FEF8EE",
              border: "none",
              borderRadius: 24,
              fontSize: st.btnFs,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: "0.04em",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "linear-gradient(135deg, #6E1A27 0%, #8B2635 100%)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "linear-gradient(135deg, #8B2635 0%, #A83040 100%)";
              (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            }}
          >
            <BookOpen size={shortTile ? 12 : 13} />
            Read Now
          </button>
        </div>
      </div>
    </Link>
  );
}
