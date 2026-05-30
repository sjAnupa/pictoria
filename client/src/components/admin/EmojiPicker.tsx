import { useEffect, useRef, useState } from 'react'

/** Curated emoji sets for book genres. */
export const EMOJI_GROUPS = [
  {
    label: 'Books & stories',
    emojis: ['📚', '📖', '📕', '📗', '📘', '📙', '✨', '🌟', '💫'],
  },
  {
    label: 'Adventure',
    emojis: ['⚓', '🚀', '🗺️', '🏔️', '🌊', '⚔️', '🛡️', '🧭', '🏰'],
  },
  {
    label: 'Mystery & mood',
    emojis: ['🔍', '🕵️', '🌙', '👻', '🎭', '🌸', '💕', '😄', '🎪'],
  },
  {
    label: 'Nature & places',
    emojis: ['🌲', '🌺', '🏛️', '🌍', '🔬', '🐉', '🦊', '🌈', '☕'],
  },
] as const

type EmojiPickerProps = {
  value: string
  onChange: (emoji: string) => void
  /** Renders as a compact icon button for inline form rows. */
  compact?: boolean
}

export default function EmojiPicker({ value, onChange, compact = false }: EmojiPickerProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const buttonSize = compact ? 42 : 44

  return (
    <div ref={rootRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Choose emoji icon"
        title="Choose emoji"
        style={{
          width: buttonSize,
          height: buttonSize,
          borderRadius: 10,
          border: open ? '2px solid #4F46E5' : '1px solid #D1D5DB',
          background: '#FAFAFA',
          fontSize: compact ? 20 : 22,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(79,70,229,0.15)' : 'none',
        }}
      >
        {value || '📚'}
      </button>

      {open ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 'calc(100% + 8px)',
            zIndex: 320,
            width: compact ? 280 : 300,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            padding: 12,
            boxShadow: '0 16px 40px rgba(0,0,0,0.14)',
            maxHeight: 260,
            overflowY: 'auto',
          }}
        >
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label} style={{ marginBottom: 10 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#9CA3AF',
                  marginBottom: 6,
                }}
              >
                {group.label}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      onChange(emoji)
                      setOpen(false)
                    }}
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      border: value === emoji ? '2px solid #4F46E5' : '1px solid transparent',
                      background: value === emoji ? '#EEF2FF' : 'transparent',
                      fontSize: 18,
                      cursor: 'pointer',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
