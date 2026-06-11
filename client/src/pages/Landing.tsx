import { Link } from 'react-router-dom'
import { BookOpen, Sparkles } from 'lucide-react'
import { BooksIllustration } from '../components/illustrations/BooksIllustration'
import { FONT_DISPLAY } from '../theme/typography'

const Landing = () => {
  return (
    <div
      className="font-sans"
      style={{
        minHeight: '100vh',
        background: '#FDF0D5',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '1.5px solid #E8C98A',
          background: 'rgba(253, 240, 213, 0.95)',
        }}
      >
        <Link to="/" className="font-pictoria no-underline text-[22px] font-bold text-[#3D2314]">
          Pictoria
        </Link>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link
            to="/login"
            style={{ color: '#6B4226', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
          >
            Sign in
          </Link>
          <Link
            to="/register"
            style={{
              padding: '8px 18px',
              borderRadius: 24,
              background: 'linear-gradient(135deg, #8B2635 0%, #A83040 100%)',
              color: '#FEF8EE',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Join free
          </Link>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 48,
          alignItems: 'center',
          maxWidth: 1100,
          margin: '0 auto',
          padding: '48px 28px',
        }}
        className="max-lg:grid-cols-1"
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(139,38,53,0.1)',
              border: '1.5px solid rgba(139,38,53,0.25)',
              borderRadius: 24,
              padding: '5px 14px',
              marginBottom: 20,
            }}
          >
            <Sparkles size={13} color="#8B2635" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#8B2635',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Illustrated e-library
            </span>
          </div>
          <h1
            style={{
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 'clamp(32px, 5vw, 52px)',
              color: '#3D2314',
              lineHeight: 1.12,
              marginBottom: 16,
            }}
          >
            Stories that feel like{' '}
            <span style={{ color: '#8B2635', fontStyle: 'italic' }}>turning real pages</span>
          </h1>
          <p
            style={{
              fontSize: 17,
              color: '#6B4226',
              lineHeight: 1.75,
              marginBottom: 28,
              maxWidth: 480,
            }}
          >
            Pictoria is your warm, parchment-toned home for illustrated books. Sign in to browse the full library, or preview a title while you decide.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
            <Link
              to="/"
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #8B2635 0%, #A83040 100%)',
                color: '#FEF8EE',
                borderRadius: 32,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 6px 24px rgba(139,38,53,0.35)',
              }}
            >
              <BookOpen size={16} />
              Open library
            </Link>
            <Link
              to="/books/the-enchanted-garden"
              style={{
                padding: '14px 24px',
                border: '2px solid #C9952A',
                color: '#3D2314',
                borderRadius: 32,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Preview a book
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex" style={{ justifyContent: 'center' }}>
          <div
            style={{
              background: 'linear-gradient(145deg, #F5D9A0 0%, #EEC87A 50%, #E8B84B 100%)',
              borderRadius: 24,
              padding: '40px 48px 32px',
              border: '2.5px solid #C9952A',
              boxShadow: '0 20px 60px rgba(90,40,10,0.22), inset 0 1px 0 rgba(255,230,160,0.6)',
            }}
          >
            <BooksIllustration size={280} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Landing
