import { Link } from 'react-router-dom'
import { Globe, ArrowLeft, type LucideIcon } from 'lucide-react'
import type { CSSProperties, ReactNode } from 'react'

const FONT = "'Inter', sans-serif"

type AdminButtonProps = {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'secondary' | 'primary' | 'danger' | 'ghost'
  icon?: LucideIcon
  disabled?: boolean
  style?: CSSProperties
}

const VARIANTS: Record<
  NonNullable<AdminButtonProps['variant']>,
  { base: CSSProperties; hover: CSSProperties }
> = {
  secondary: {
    base: {
      padding: '8px 14px',
      border: '1px solid #D1D5DB',
      borderRadius: 8,
      background: '#FFFFFF',
      fontSize: 13,
      fontWeight: 600,
      color: '#374151',
      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
    },
    hover: { background: '#F9FAFB', borderColor: '#9CA3AF' },
  },
  primary: {
    base: {
      padding: '8px 18px',
      border: 'none',
      borderRadius: 8,
      background: '#4F46E5',
      fontSize: 13,
      fontWeight: 600,
      color: '#FFFFFF',
      boxShadow: '0 1px 4px rgba(79,70,229,0.35)',
    },
    hover: { background: '#4338CA' },
  },
  danger: {
    base: {
      padding: '9px 14px',
      border: 'none',
      borderRadius: 8,
      background: '#EF4444',
      fontSize: 13,
      fontWeight: 600,
      color: '#FFFFFF',
    },
    hover: { background: '#DC2626' },
  },
  ghost: {
    base: {
      padding: '8px 12px',
      border: '1px solid #E5E7EB',
      borderRadius: 8,
      background: '#FFFFFF',
      fontSize: 12,
      fontWeight: 600,
      color: '#374151',
    },
    hover: { background: '#F9FAFB', borderColor: '#D1D5DB' },
  },
}

export function AdminButton({
  children,
  onClick,
  type = 'button',
  variant = 'secondary',
  icon: Icon,
  disabled,
  style,
}: AdminButtonProps) {
  const v = VARIANTS[variant]
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: FONT,
        transition: 'all 0.15s ease',
        opacity: disabled ? 0.55 : 1,
        ...v.base,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (disabled) return
        Object.assign(e.currentTarget.style, v.hover)
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, {
          background: v.base.background as string,
          borderColor: (v.base.border as string)?.replace('none', '') || v.base.border,
        })
        if (variant === 'secondary' || variant === 'ghost') {
          e.currentTarget.style.borderColor = variant === 'ghost' ? '#E5E7EB' : '#D1D5DB'
        }
      }}
    >
      {Icon ? <Icon size={15} strokeWidth={2.25} aria-hidden /> : null}
      {children}
    </button>
  )
}

type PublicSiteButtonProps = {
  /** Light top bar vs dark sidebar */
  variant?: 'header' | 'sidebar'
  fullWidth?: boolean
}

export function PublicSiteButton({ variant = 'header', fullWidth }: PublicSiteButtonProps) {
  const isSidebar = variant === 'sidebar'

  return (
    <Link
      to="/"
      title="Open the public Pictoria website"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: fullWidth ? '100%' : undefined,
        padding: isSidebar ? '10px 12px' : '8px 14px',
        borderRadius: 8,
        border: isSidebar ? '1px solid rgba(201,149,42,0.45)' : '1px solid #E8C98A',
        background: isSidebar
          ? 'linear-gradient(135deg, rgba(201,149,42,0.18) 0%, rgba(139,38,53,0.12) 100%)'
          : 'linear-gradient(135deg, #FEF8EE 0%, #FDF0D5 100%)',
        color: isSidebar ? '#F5D9A0' : '#6B4226',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: FONT,
        textDecoration: 'none',
        boxShadow: isSidebar ? 'none' : '0 1px 3px rgba(90,40,10,0.08)',
        transition: 'all 0.15s ease',
        letterSpacing: '0.01em',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)'
        e.currentTarget.style.boxShadow = isSidebar
          ? '0 4px 12px rgba(0,0,0,0.2)'
          : '0 4px 14px rgba(90,40,10,0.12)'
        if (isSidebar) {
          e.currentTarget.style.borderColor = 'rgba(245,217,160,0.65)'
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(201,149,42,0.28) 0%, rgba(139,38,53,0.18) 100%)'
        } else {
          e.currentTarget.style.borderColor = '#C9952A'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.boxShadow = isSidebar ? 'none' : '0 1px 3px rgba(90,40,10,0.08)'
        e.currentTarget.style.borderColor = isSidebar ? 'rgba(201,149,42,0.45)' : '#E8C98A'
        e.currentTarget.style.background = isSidebar
          ? 'linear-gradient(135deg, rgba(201,149,42,0.18) 0%, rgba(139,38,53,0.12) 100%)'
          : 'linear-gradient(135deg, #FEF8EE 0%, #FDF0D5 100%)'
      }}
    >
      <Globe size={16} strokeWidth={2.25} aria-hidden />
      View public site
    </Link>
  )
}

export function AdminBackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <AdminButton variant="ghost" icon={ArrowLeft} onClick={onClick}>
      {label}
    </AdminButton>
  )
}

export function AdminUserChip({
  name,
  role,
}: {
  name: string
  role: string
}) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px 6px 6px',
        borderRadius: 999,
        border: '1px solid #E5E7EB',
        background: '#F9FAFB',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#374151',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 140,
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{role}</div>
      </div>
    </div>
  )
}

export function AdminModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  danger,
  confirmDisabled,
}: {
  onCancel: () => void
  onConfirm: () => void
  confirmLabel: string
  danger?: boolean
  confirmDisabled?: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <AdminButton variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
        Cancel
      </AdminButton>
      <AdminButton
        variant={danger ? 'danger' : 'primary'}
        onClick={onConfirm}
        disabled={confirmDisabled}
        style={{ flex: 1 }}
      >
        {confirmLabel}
      </AdminButton>
    </div>
  )
}

type AdminDialogProps = {
  open: boolean
  title: string
  children: ReactNode
  onClose: () => void
  maxWidth?: number
}

export function AdminDialog({ open, title, children, onClose, maxWidth = 420 }: AdminDialogProps) {
  if (!open) return null

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17,24,39,0.45)',
          backdropFilter: 'blur(2px)',
          zIndex: 300,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-dialog-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%,-50%)',
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 24,
          zIndex: 310,
          width: `min(${maxWidth}px, calc(100vw - 32px))`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          fontFamily: FONT,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
        }}
      >
        <div id="admin-dialog-title" style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          {title}
        </div>
        {children}
      </div>
    </>
  )
}

type AdminConfirmDialogProps = {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function AdminConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading,
}: AdminConfirmDialogProps) {
  return (
    <AdminDialog open={open} title={title} onClose={onCancel} maxWidth={400}>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>{message}</p>
      <AdminModalActions
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel={loading ? 'Working…' : confirmLabel}
        danger
        confirmDisabled={loading}
      />
    </AdminDialog>
  )
}
