import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import PageMeta from '../../components/common/PageMeta'
import BookCard from '../../components/books/BookCard'
import type { Book } from '../../types/book.types'
import { usePublishedBooks } from '../../hooks/useBooks'
import { Search, X, Library, ChevronDown } from 'lucide-react'

type SortKey = 'featured' | 'title' | 'rating' | 'year'

function bookMatchesQuery(book: Book, q: string) {
  if (!q.trim()) return true
  const s = q.toLowerCase()
  return (
    book.title.toLowerCase().includes(s) ||
    book.author.toLowerCase().includes(s) ||
    book.genre.toLowerCase().includes(s) ||
    book.tags.some((t) => t.toLowerCase().includes(s))
  )
}

function suggestionsForQuery(q: string, books: Book[], limit = 8): Book[] {
  const t = q.trim().toLowerCase()
  if (!t) return []
  return books.filter((b) => bookMatchesQuery(b, t)).slice(0, limit)
}

function ChipScrollRail({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [fade, setFade] = useState({ left: false, right: true })

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setFade({
      left: scrollLeft > 8,
      right: scrollLeft < scrollWidth - clientWidth - 8,
    })
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const tick = () => onScroll()
    tick()
    const ro = new ResizeObserver(tick)
    ro.observe(el)
    window.addEventListener('resize', tick)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', tick)
    }
  }, [onScroll])

  return (
    <div className="relative min-w-0 rounded-lg border border-[#E8C98A] bg-[#FDF0D5]/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
      {fade.left ? (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-8 rounded-l-lg bg-gradient-to-r from-[#FEF8EE] via-[#FEF8EE]/95 to-transparent"
          aria-hidden
        />
      ) : null}
      {fade.right ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-8 rounded-r-lg bg-gradient-to-l from-[#FEF8EE] via-[#FEF8EE]/95 to-transparent"
          aria-hidden
        />
      ) : null}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="font-sans flex min-h-[38px] flex-nowrap items-center gap-1.5 overflow-x-auto overscroll-x-contain px-2.5 py-2 sm:px-3 sm:py-2 [scrollbar-width:thin] [scrollbar-color:#C9952A_#F5E6C8] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#C9952A]/70 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#F5E6C8]/80"
      >
        {children}
      </div>
    </div>
  )
}

function FilterToggle({
  id,
  label,
  count,
  expanded,
  onToggle,
  children,
}: {
  id: string
  label: string
  count: number
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-lg border border-[#E8C98A]/80 bg-[#FDF0D5]/30">
      <button
        type="button"
        id={`${id}-btn`}
        aria-expanded={expanded}
        aria-controls={`${id}-panel`}
        onClick={onToggle}
        className="font-sans flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left transition hover:bg-[#F5D9A0]/25 sm:px-3.5"
      >
        <span className="min-w-0">
          <span className="block text-xs font-bold text-[#3D2314]">{label}</span>
          <span className="mt-0.5 block text-[11px] font-medium leading-snug text-[#9B6B4A]">
            {count} option{count !== 1 ? 's' : ''} · tap to expand
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#8B2635] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>
      {expanded ? (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} className="border-t border-[#E8C98A]/60 px-2.5 pb-3 pt-1 sm:px-3">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default function LibraryPage() {
  const { data: books = [], isLoading, isError } = usePublishedBooks(100)
  const allGenres = useMemo(() => [...new Set(books.map((b) => b.genre))].sort(), [books])
  const allTags = useMemo(() => [...new Set(books.flatMap((b) => b.tags))].sort(), [books])

  const [query, setQuery] = useState('')
  const [openSuggest, setOpenSuggest] = useState(false)
  const [genres, setGenres] = useState<string[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [sort, setSort] = useState<SortKey>('featured')
  const [genreOpen, setGenreOpen] = useState(false)
  const [tagOpen, setTagOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpenSuggest(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = useCallback((list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }, [])

  const filtered = useMemo(() => {
    let list = books.filter((b) => bookMatchesQuery(b, query))
    if (genres.length) list = list.filter((b) => genres.includes(b.genre))
    if (tags.length) list = list.filter((b) => tags.some((t) => b.tags.includes(t)))

    const out = [...list]
    if (sort === 'title') out.sort((a, b) => a.title.localeCompare(b.title))
    else if (sort === 'rating') out.sort((a, b) => b.rating - a.rating)
    else if (sort === 'year') out.sort((a, b) => b.year - a.year)
    else out.sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.rating - a.rating)

    return out
  }, [books, query, genres, tags, sort])

  const suggest = useMemo(() => suggestionsForQuery(query, books), [query, books])

  const clearFilters = () => {
    setQuery('')
    setGenres([])
    setTags([])
    setSort('featured')
  }

  const hasFilters = genres.length > 0 || tags.length > 0 || query.trim().length > 0 || sort !== 'featured'
  const activeChips = useMemo(
    () => [
      ...genres.map((g) => ({ kind: 'genre' as const, value: g })),
      ...tags.map((t) => ({ kind: 'tag' as const, value: t })),
    ],
    [genres, tags],
  )

  const removeChip = (kind: 'genre' | 'tag', value: string) => {
    if (kind === 'genre') setGenres(genres.filter((x) => x !== value))
    else setTags(tags.filter((x) => x !== value))
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5] font-sans">
      <PageMeta
        title="Browse Storybook Catalog"
        description="Search and browse illustrated storybooks on Pictoria. Filter by genre, tag, and rating — read free previews instantly."
        canonicalPath="/library"
      />
      <Navbar />
      <main className="relative z-0 flex-1 min-w-0 w-full">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(201,149,42,0.32),transparent)]" />

        <div className="page-gutter relative pb-20 pt-8 sm:pt-10">
          <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="font-sans text-[11px] font-bold uppercase tracking-[0.2em] text-[#8B2635]/90">Catalog</p>
              <h1 className="font-pictoria text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-tight tracking-tight text-[#3D2314]">
                Browse catalog
              </h1>
              <p className="font-sans mt-2 max-w-2xl text-sm leading-relaxed text-[#6B4226]">
                Search with suggestions, then open genre or tag filters only when you need them.
              </p>
            </div>
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="font-sans inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-[#E8C98A] bg-[#FEF8EE] px-3 py-2 text-xs font-semibold text-[#6B4226] shadow-sm transition hover:bg-[#F5D9A0]/70 sm:self-auto"
              >
                <X className="h-3.5 w-3.5 shrink-0" />
                Reset all
              </button>
            ) : null}
          </header>

          <section
            className="relative z-[50] mb-10 overflow-visible rounded-xl border border-[#E8C98A]/90 bg-[#FEF8EE]/90 p-3 shadow-[0_16px_40px_-16px_rgba(90,40,10,0.16)] backdrop-blur-md sm:p-4"
            aria-label="Search and filters"
          >
            <div ref={wrapRef} className="relative z-[60] min-w-0 overflow-visible">
              <label
                htmlFor="catalog-search"
                className="font-sans mb-2 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B4226]"
              >
                Search
              </label>
              <div className="group relative overflow-visible rounded-lg border border-[#f0e0c4] bg-gradient-to-br from-white/90 to-[#FEF8EE]/95 p-px shadow-[0_12px_32px_-10px_rgba(139,38,53,0.14)] backdrop-blur-md">
                <div className="flex items-center gap-2 rounded-md bg-[#FDF0D5]/40 px-3 py-2 sm:px-3.5 sm:py-2">
                  <Search className="h-4 w-4 shrink-0 text-[#8B2635]" strokeWidth={2.2} aria-hidden />
                  <input
                    id="catalog-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setOpenSuggest(true)}
                    placeholder="Titles, authors, genres, tags…"
                    className="font-sans min-w-0 flex-1 border-0 bg-transparent text-sm text-[#3D2314] placeholder:text-[#9B6B4A]/75 outline-none focus:ring-0"
                    autoComplete="off"
                  />
                  {query ? (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setQuery('')}
                      className="shrink-0 rounded-md p-1 text-[#9B6B4A] transition hover:bg-[#E8C98A]/35 hover:text-[#3D2314]"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              </div>

              {openSuggest && suggest.length > 0 ? (
                <ul
                  className="absolute left-0 right-0 top-full z-[200] mt-1.5 max-h-[min(70vh,20rem)] overflow-y-auto overscroll-contain rounded-lg border border-[#f0e0c4] bg-gradient-to-br from-white/95 to-[#FEF8EE]/98 py-0.5 shadow-[0_16px_40px_-8px_rgba(90,40,10,0.22)] backdrop-blur-xl [scrollbar-width:thin]"
                  role="listbox"
                >
                  {suggest.map((b) => (
                    <li key={b.id} role="option">
                      <button
                        type="button"
                        onClick={() => {
                          setQuery(b.title)
                          setOpenSuggest(false)
                        }}
                        className="font-sans flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition hover:bg-[#F5D9A0]/55"
                      >
                        <img src={b.coverImage} alt="" className="h-10 w-7 shrink-0 rounded object-cover shadow-sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold text-[#3D2314]">{b.title}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-[#9B6B4A]">{b.author}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[#E8D5F5] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#6B2D8B]">
                          {b.genre}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {activeChips.length > 0 ? (
              <div className="mt-5 border-t border-[#E8C98A]/60 pt-5">
                <p className="font-sans mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B4226]">Active filters</p>
                <div className="flex flex-wrap gap-2">
                  {activeChips.map(({ kind, value }) => (
                    <button
                      key={`${kind}-${value}`}
                      type="button"
                      onClick={() => removeChip(kind, value)}
                      className="font-sans inline-flex items-center gap-1.5 rounded-full border border-[#8B2635]/25 bg-[#8B2635]/10 py-1.5 pl-3 pr-2 text-xs font-semibold text-[#3D2314] transition hover:bg-[#8B2635]/18"
                    >
                      <span className="text-[10px] font-bold uppercase text-[#8B2635]">{kind === 'genre' ? 'Genre' : 'Tag'}</span>
                      {value}
                      <X className="h-3.5 w-3.5 opacity-70" aria-hidden />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 border-t border-[#E8C98A]/55 pt-6 sm:gap-4">
              <FilterToggle
                id="genre-filters"
                label="Filter by genre"
                count={allGenres.length}
                expanded={genreOpen}
                onToggle={() => setGenreOpen((o) => !o)}
              >
                <ChipScrollRail>
                  {allGenres.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggle(genres, setGenres, g)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        genres.includes(g)
                          ? 'bg-[#8B2635] text-[#FEF8EE] shadow-sm ring-1 ring-[#8B2635]/25'
                          : 'border border-[#E8C98A] bg-white/70 text-[#6B4226] hover:border-[#C9952A] hover:bg-[#FDF0D5]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </ChipScrollRail>
              </FilterToggle>

              <FilterToggle
                id="tag-filters"
                label="Filter by tags"
                count={allTags.length}
                expanded={tagOpen}
                onToggle={() => setTagOpen((o) => !o)}
              >
                <ChipScrollRail>
                  {allTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggle(tags, setTags, t)}
                      className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        tags.includes(t)
                          ? 'bg-[#3D2314] text-[#FEF8EE] shadow-sm ring-1 ring-[#3D2314]/25'
                          : 'border border-[#E8C98A]/90 bg-white/75 text-[#6B4226] hover:border-[#C9952A] hover:bg-[#FEF8EE]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </ChipScrollRail>
              </FilterToggle>
            </div>

            <div className="mt-5 flex flex-col gap-3 border-t border-[#E8C98A]/55 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <label htmlFor="library-sort" className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[#6B4226]">
                  Sort by
                </label>
                <div className="relative inline-flex w-[min(100%,220px)]">
                  <select
                    id="library-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="font-sans w-full cursor-pointer appearance-none rounded-lg border border-[#E8C98A] bg-[#FDF0D5] py-2 pl-3 pr-9 text-xs font-semibold text-[#3D2314] shadow-sm outline-none transition focus:ring-2 focus:ring-[#8B2635]/20"
                  >
                    <option value="featured">Featured first</option>
                    <option value="rating">Highest rated</option>
                    <option value="year">Newest year</option>
                    <option value="title">Title A–Z</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6B4226]"
                    aria-hidden
                  />
                </div>
              </div>
              <p className="font-sans flex items-center gap-2 text-xs font-semibold tabular-nums text-[#6B4226] sm:text-sm">
                <Library className="h-3.5 w-3.5 text-[#8B2635] sm:h-4 sm:w-4" aria-hidden />
                <span className="text-[#9B6B4A]">Results</span>
                <span className="text-[#3D2314]">{filtered.length}</span>
              </p>
            </div>
          </section>

          {isLoading ? (
            <div className="relative z-0 rounded-xl border border-[#E8C98A] bg-[#FEF8EE]/50 py-24 text-center">
              <p className="font-sans text-sm text-[#9B6B4A]">Loading catalog…</p>
            </div>
          ) : isError ? (
            <div className="relative z-0 rounded-xl border border-dashed border-[#E8C98A] bg-[#FEF8EE]/50 py-24 text-center">
              <p className="font-pictoria text-xl text-[#3D2314]">Could not load books</p>
              <p className="font-sans mt-2 text-sm text-[#9B6B4A]">Check that the server is running and try again.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="relative z-0 rounded-xl border border-dashed border-[#E8C98A] bg-[#FEF8EE]/50 py-24 text-center">
              <p className="font-pictoria text-xl text-[#3D2314]">No matches</p>
              <p className="font-sans mt-2 text-sm text-[#9B6B4A]">Try clearing search or filters.</p>
            </div>
          ) : (
            <div className="book-grid relative z-0">
              {filtered.map((book) => (
                <BookCard key={book.id} book={book} shortTile />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
