import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, X, XCircle } from 'lucide-react'
import { ADMIN_FONT } from '../../pages/admin/adminTheme'

export type AdminToastTone = 'success' | 'error'

export type AdminToastState = {
  id: number
  message: string
  tone: AdminToastTone
}

type AdminToastProps = {
  toast: AdminToastState | null
  onDismiss: () => void
  durationMs?: number
}

export default function AdminToast({ toast, onDismiss, durationMs = 3800 }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [toast, onDismiss, durationMs])

  const isSuccess = toast?.tone === 'success'

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          role={isSuccess ? 'status' : 'alert'}
          aria-live={isSuccess ? 'polite' : 'assertive'}
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 400,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            minWidth: 280,
            maxWidth: 'min(420px, calc(100vw - 40px))',
            padding: '14px 16px',
            borderRadius: 12,
            background: isSuccess ? '#FFFFFF' : '#FEF2F2',
            border: `1px solid ${isSuccess ? '#BBF7D0' : '#FCA5A5'}`,
            boxShadow: isSuccess
              ? '0 16px 40px rgba(0,0,0,0.12)'
              : '0 16px 40px rgba(220,38,38,0.18)',
            fontFamily: ADMIN_FONT,
          }}
        >
          {isSuccess ? (
            <CheckCircle2 size={20} color="#16A34A" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
          ) : (
            <XCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden />
          )}
          <p style={{ margin: 0, flex: 1, fontSize: 13, fontWeight: 600, color: isSuccess ? '#111827' : '#991B1B', lineHeight: 1.45 }}>
            {toast.message}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              color: '#9CA3AF',
              display: 'flex',
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
