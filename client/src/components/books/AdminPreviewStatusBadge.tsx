import type { BookStatus } from '../../types/book.types'

const STATUS_STYLES: Record<BookStatus, { bg: string; text: string; label: string }> = {
  Published: { bg: '#DCFCE7', text: '#15803D', label: 'Published' },
  Draft: { bg: '#F3F4F6', text: '#6B7280', label: 'Draft' },
  Hidden: { bg: '#FFEDD5', text: '#C2410C', label: 'Hidden' },
  Archived: { bg: '#FEE2E2', text: '#B91C1C', label: 'Archived' },
}

export default function AdminPreviewStatusBadge({ status }: { status: BookStatus }) {
  if (status === 'Published') return null

  const cfg = STATUS_STYLES[status]

  return (
    <span
      className="absolute right-2.5 top-2.5 z-[3] rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm"
      style={{ background: cfg.bg, color: cfg.text }}
      title={`Admin preview — ${cfg.label}`}
    >
      {cfg.label}
    </span>
  )
}
