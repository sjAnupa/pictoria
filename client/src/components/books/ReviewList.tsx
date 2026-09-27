import { formatDistanceToNow } from 'date-fns'
import { ChevronLeft, ChevronRight, EyeOff, Eye, Star, Trash2 } from 'lucide-react'
import { FONT_DISPLAY } from '../../theme/typography'
import type { Review } from '../../types/review.types'

type ReviewListProps = {
  reviews: Review[]
  isAdmin: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onToggleHidden?: (reviewId: string, hidden: boolean) => void
  onDelete?: (reviewId: string) => void
  busyReviewId?: string | null
}

function initialsColor(initials: string): string {
  const palette = ['#8B2635', '#6B4226', '#9B6B4A', '#C4776A', '#4A7A3D']
  const idx = initials.charCodeAt(0) % palette.length
  return palette[idx] ?? '#8B2635'
}

export default function ReviewList({
  reviews,
  isAdmin,
  page,
  totalPages,
  onPageChange,
  onToggleHidden,
  onDelete,
  busyReviewId,
}: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div
        style={{
          padding: '32px 20px',
          textAlign: 'center',
          background: '#FEF8EE',
          border: '1.5px solid #E8C98A',
          borderRadius: 14,
        }}
      >
        <p style={{ fontSize: 14, color: '#9B6B4A' }}>No reviews yet. Be the first to share your thoughts.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div
          key={review.id}
          style={{
            padding: '18px 20px',
            background: review.isHidden ? '#FEF2F2' : '#FEF8EE',
            border: `1.5px solid ${review.isHidden ? '#FCA5A5' : '#E8C98A'}`,
            borderRadius: 14,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: initialsColor(review.reviewer.initials),
                  color: '#FEF8EE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                  fontFamily: FONT_DISPLAY,
                }}
              >
                {review.reviewer.initials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#3D2314' }}>
                  {review.reviewer.name}
                  {review.isOwn ? (
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: '#9B6B4A' }}>(You)</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <div style={{ display: 'flex', gap: 1 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        fill={s <= review.rating ? '#E8B84B' : 'none'}
                        color={s <= review.rating ? '#E8B84B' : '#C9AE85'}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 12, color: '#9B6B4A' }}>
                    {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  </span>
                  {review.isHidden ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>
                      Hidden
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {isAdmin && onToggleHidden ? (
                <button
                  type="button"
                  onClick={() => onToggleHidden(review.id, !review.isHidden)}
                  disabled={busyReviewId === review.id}
                  title={review.isHidden ? 'Unhide review' : 'Hide review'}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: '1px solid #E8C98A',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6B4226',
                    cursor: 'pointer',
                  }}
                >
                  {review.isHidden ? <Eye size={13} /> : <EyeOff size={13} />}
                </button>
              ) : null}
              {(review.isOwn || isAdmin) && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(review.id)}
                  disabled={busyReviewId === review.id}
                  title="Delete review"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: '1px solid #FCA5A5',
                    background: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#B91C1C',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={13} />
                </button>
              ) : null}
            </div>
          </div>

          {review.comment ? (
            <p style={{ marginTop: 12, fontSize: 14, color: '#4A3423', lineHeight: 1.6 }}>{review.comment}</p>
          ) : null}
        </div>
      ))}

      {totalPages > 1 ? (
        <div className="mt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1.5px solid #E8C98A',
              background: '#FEF8EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B4226',
              cursor: page <= 1 ? 'default' : 'pointer',
              opacity: page <= 1 ? 0.4 : 1,
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 13, color: '#6B4226', fontWeight: 600 }}>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1.5px solid #E8C98A',
              background: '#FEF8EE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B4226',
              cursor: page >= totalPages ? 'default' : 'pointer',
              opacity: page >= totalPages ? 0.4 : 1,
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
