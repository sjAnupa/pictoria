import { Link } from 'react-router-dom'
import { Star, BookOpen } from 'lucide-react'
import type { Book } from '../../types/book.types'
import { useAuthStore } from '../../store/authStore'
import { canAccessAdminPortal } from '../../utils/authPermissions'
import AdminPreviewStatusBadge from './AdminPreviewStatusBadge'

const genreColors: Record<string, { bg: string; text: string }> = {
  Fantasy: { bg: '#E8D5F5', text: '#6B2D8B' },
  Adventure: { bg: '#D5EAF5', text: '#1A5F8B' },
  Mystery: { bg: '#F5E8D5', text: '#8B5A1A' },
  Romance: { bg: '#F5D5E8', text: '#8B1A5F' },
  "Children's": { bg: '#D5F5E0', text: '#1A8B4A' },
  Humor: { bg: '#F5F5D5', text: '#6B6B1A' },
}

interface BookCardProps {
  book: Book
  variant?: 'default' | 'compact'
  shortTile?: boolean
}

export default function BookCard({ book, variant = 'default', shortTile = false }: BookCardProps) {
  const isAdmin = canAccessAdminPortal(useAuthStore((s) => s.user))
  const genreColor = genreColors[book.genre] || { bg: '#F5E8D5', text: '#8B5A1A' }

  if (variant === 'compact') {
    return (
      <Link to={`/books/${book.slug}`} className="block no-underline">
        <div className="flex gap-2.5 rounded-xl border-[1.5px] border-[#E8C98A] bg-[#FEF8EE] p-2.5 transition hover:-translate-y-0.5 hover:shadow-md sm:gap-3 sm:p-3">
          <div className="h-[60px] w-[44px] shrink-0 overflow-hidden rounded-md shadow-md">
            <img src={book.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-pictoriya text-[13px] font-semibold text-[#3D2314]">{book.title}</div>
            <div className="truncate text-[11px] text-[#9B6B4A]">{book.author}</div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[10px] font-semibold text-[#9B6B4A]">
              <span>{book.year}</span>
              <span className="text-[#E8C98A]">·</span>
              <span>{book.chapters.length} ch</span>
              <span className="text-[#E8C98A]">·</span>
              <span className="inline-flex items-center gap-0.5 text-[#6B4226]">
                <Star size={10} fill="#E8B84B" color="#E8B84B" aria-hidden />
                {book.rating}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const coverH = shortTile ? 'h-[132px] sm:h-[148px]' : 'h-[160px] sm:h-[200px]'

  return (
    <Link to={`/books/${book.slug}`} className="block h-full min-h-0 no-underline">
      <article className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-[1.5px] border-[#E8C98A] bg-[#FEF8EE] transition hover:-translate-y-1 hover:border-[#C9952A] hover:shadow-lg sm:rounded-[18px]">
        {book.isNew ? (
          <span className="absolute left-2.5 top-2.5 z-[2] rounded-full bg-[#8B2635] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            New
          </span>
        ) : null}
        {isAdmin ? <AdminPreviewStatusBadge status={book.status} /> : null}

        <div className={`relative shrink-0 overflow-hidden bg-[#F5E4C0] ${coverH}`}>
          <img
            src={book.coverImage}
            alt={book.title}
            className="h-full w-full object-cover transition duration-300 hover:scale-[1.04]"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#FEF8EE]/95 to-transparent sm:h-14"
            aria-hidden
          />
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
          <span
            className="mb-1.5 inline-block w-fit max-w-full truncate rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
            style={{ background: genreColor.bg, color: genreColor.text }}
          >
            {book.genre}
          </span>

          <h3 className="font-pictoriya line-clamp-2 min-h-[2.5rem] text-[15px] font-bold leading-snug text-[#3D2314] sm:min-h-[2.75rem] sm:text-base">
            {book.title}
          </h3>

          <p className="mt-0.5 truncate text-xs italic text-[#9B6B4A]">
            by {book.author}
          </p>

          <p className="mt-1.5 truncate text-[11px] font-semibold text-[#6B4226]">
            {book.year}
            <span className="text-[#E8C98A]"> · </span>
            {book.chapters.length} ch
          </p>

          <p className="mt-2 hidden line-clamp-2 text-xs leading-relaxed text-[#6B4226] sm:block">
            {book.description}
          </p>

          <div className="mt-auto flex flex-col gap-2 pt-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:pt-3.5">
            <div className="flex min-w-0 items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={shortTile ? 11 : 12}
                  fill={s <= Math.round(book.rating) ? '#E8B84B' : '#E8C98A'}
                  color={s <= Math.round(book.rating) ? '#E8B84B' : '#E8C98A'}
                  aria-hidden
                />
              ))}
              <span className="ml-0.5 shrink-0 text-xs font-bold text-[#6B4226]">{book.rating}</span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-[#9B6B4A] sm:text-xs">
              <BookOpen size={12} aria-hidden />
              {book.pages}p
            </span>
          </div>

          <span className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] py-2 text-xs font-bold tracking-wide text-[#FEF8EE] sm:py-2.5 sm:text-[13px]">
            <BookOpen size={13} aria-hidden />
            Read Now
          </span>
        </div>
      </article>
    </Link>
  )
}
