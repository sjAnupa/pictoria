import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { FONT_DISPLAY } from '../../theme/typography'

type RatingModalProps = {
  open: boolean
  bookTitle: string
  initialRating?: number
  initialComment?: string
  submitting?: boolean
  onClose: () => void
  onSubmit: (rating: number, comment: string) => void
}

export default function RatingModal({
  open,
  bookTitle,
  initialRating = 0,
  initialComment = '',
  submitting = false,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(initialComment)
  const isEditing = initialRating > 0

  useEffect(() => {
    if (open) {
      setRating(initialRating)
      setComment(initialComment)
      setHoverRating(0)
    }
  }, [open, initialRating, initialComment])

  const handleSubmit = () => {
    if (rating < 1) return
    onSubmit(rating, comment.trim())
  }

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="rating-modal"
          className="fixed inset-0 z-[9999] flex min-h-[100dvh] items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="rating-modal-title"
        >
          <motion.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-[#3D2314]/40 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1] w-full max-w-[440px] rounded-2xl border border-[#E8C98A] bg-[#FEF8EE] p-6 shadow-[0_24px_64px_rgba(90,40,10,0.22)] sm:p-7"
          >
            <h2
              id="rating-modal-title"
              className="font-pictoriya text-xl font-bold text-[#3D2314]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              {isEditing ? 'Update your rating' : 'Rate this book'}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#6B4226]">
              {bookTitle}
            </p>

            <div className="mt-6 flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= (hoverRating || rating)
                return (
                  <button
                    key={s}
                    type="button"
                    aria-label={`${s} star${s > 1 ? 's' : ''}`}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="rounded-full p-1.5 transition-transform duration-150 hover:scale-110 active:scale-95"
                  >
                    <Star
                      size={34}
                      fill={filled ? '#E8B84B' : 'none'}
                      color={filled ? '#E8B84B' : '#C9AE85'}
                      strokeWidth={1.5}
                    />
                  </button>
                )
              })}
            </div>
            <p className="mt-1 text-center text-xs font-semibold uppercase tracking-wide text-[#9B6B4A]">
              {rating > 0 ? `${rating} out of 5` : 'Tap a star to rate'}
            </p>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what you loved (optional)…"
              rows={4}
              maxLength={1000}
              className="mt-5 w-full resize-none rounded-xl border border-[#E8C98A] bg-white px-3.5 py-3 text-sm text-[#3D2314] outline-none transition placeholder:text-[#C4A875] focus:border-[#8B2635] focus:ring-2 focus:ring-[#8B2635]/15"
            />

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-[#E8C98A] bg-[#FDF0D5] px-5 py-2.5 text-sm font-bold text-[#6B4226] transition-colors duration-150 hover:bg-[#F5D9A0]/70"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rating < 1 || submitting}
                onClick={handleSubmit}
                className="rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] shadow-[0_4px_14px_rgba(139,38,53,0.35)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {submitting ? 'Saving…' : isEditing ? 'Update review' : 'Submit review'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
