import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown, Search, X } from 'lucide-react'
import type { CategoryRecord } from '../../services/categoryService'
import { adminTheme, ADMIN_FONT } from '../../pages/admin/adminTheme'

type CategoryMultiSelectProps = {
  label: string
  required?: boolean
  hint?: string
  options: CategoryRecord[]
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  emptyMessage?: string
}

type PanelStyle = {
  top?: number
  bottom?: number
  left: number
  width: number
  maxHeight: number
}

function measurePanel(trigger: HTMLButtonElement): PanelStyle {
  const rect = trigger.getBoundingClientRect()
  const gap = 6
  const minHeight = 160
  const maxPanelHeight = 300
  const viewportPadding = 12

  const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
  const spaceAbove = rect.top - viewportPadding
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8))

  const openUpward = spaceBelow < minHeight && spaceAbove >= spaceBelow

  if (openUpward) {
    const maxHeight = Math.min(maxPanelHeight, Math.max(minHeight, spaceAbove))
    return {
      bottom: window.innerHeight - rect.top + gap,
      left,
      width: rect.width,
      maxHeight,
    }
  }

  const maxHeight = Math.min(maxPanelHeight, Math.max(minHeight, spaceBelow))
  return {
    top: rect.bottom + gap,
    left,
    width: rect.width,
    maxHeight,
  }
}

export default function CategoryMultiSelect({
  label,
  required,
  hint,
  options,
  value,
  onChange,
  placeholder = 'Search and select…',
  emptyMessage = 'No options available yet.',
}: CategoryMultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [panelStyle, setPanelStyle] = useState<PanelStyle | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((opt) => opt.name.toLowerCase().includes(q))
  }, [options, query])

  const reposition = useCallback(() => {
    if (!triggerRef.current) return
    setPanelStyle(measurePanel(triggerRef.current))
  }, [])

  const openDropdown = () => {
    if (!triggerRef.current) return
    setPanelStyle(measurePanel(triggerRef.current))
    setOpen(true)
  }

  const closeDropdown = () => {
    setOpen(false)
    setQuery('')
    setPanelStyle(null)
  }

  useEffect(() => {
    if (!open) return

    reposition()
    const onReflow = () => reposition()
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return () => {
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open, reposition])

  const toggle = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((v) => v !== name))
    } else {
      onChange([...value, name])
    }
  }

  const remove = (name: string) => {
    onChange(value.filter((v) => v !== name))
  }

  return (
    <div style={{ position: 'relative', minWidth: 0 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#374151',
          marginBottom: 5,
          letterSpacing: '0.01em',
        }}
      >
        {label}
        {required ? <span style={{ color: '#EF4444', marginLeft: 3 }}>*</span> : null}
      </label>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? closeDropdown() : openDropdown())}
        style={{
          width: '100%',
          minHeight: 40,
          padding: '8px 11px',
          fontSize: 13,
          color: adminTheme.text,
          background: adminTheme.surface,
          border: `1px solid ${open ? adminTheme.primary : adminTheme.border}`,
          borderRadius: 7,
          outline: 'none',
          fontFamily: ADMIN_FONT,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          cursor: 'pointer',
          boxShadow: open ? '0 0 0 3px rgba(139,38,53,0.12)' : 'none',
        }}
      >
        <span
          style={{
            color: value.length ? adminTheme.text : '#9CA3AF',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {value.length > 0 ? (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: 8,
            maxHeight: 96,
            overflowY: 'auto',
            paddingRight: 2,
          }}
        >
          {value.map((name) => (
            <span
              key={name}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                maxWidth: '100%',
                padding: '4px 8px',
                borderRadius: 999,
                background: '#FDF0D5',
                border: `1px solid ${adminTheme.border}`,
                fontSize: 11,
                fontWeight: 600,
                color: adminTheme.textMuted,
              }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </span>
              <button
                type="button"
                onClick={() => remove(name)}
                aria-label={`Remove ${name}`}
                style={{
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  color: '#9CA3AF',
                  flexShrink: 0,
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {hint ? (
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{hint}</div>
      ) : null}

      {open && panelStyle
        ? createPortal(
            <>
              <div
                role="presentation"
                style={{ position: 'fixed', inset: 0, zIndex: 400 }}
                onClick={closeDropdown}
              />
              <div
                style={{
                  position: 'fixed',
                  ...(panelStyle.top !== undefined ? { top: panelStyle.top } : {}),
                  ...(panelStyle.bottom !== undefined ? { bottom: panelStyle.bottom } : {}),
                  left: panelStyle.left,
                  width: panelStyle.width,
                  zIndex: 410,
                  background: adminTheme.surface,
                  border: `1px solid ${adminTheme.border}`,
                  borderRadius: 8,
                  boxShadow: '0 16px 40px rgba(90,40,10,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: panelStyle.maxHeight,
                  overflow: 'hidden',
                  animation: 'categoryDropdownIn 0.15s ease-out',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 10px',
                    borderBottom: `1px solid ${adminTheme.border}`,
                    flexShrink: 0,
                  }}
                >
                  <Search size={14} color="#9CA3AF" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Type to search…"
                    autoFocus
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: 13,
                      fontFamily: ADMIN_FONT,
                      background: 'transparent',
                      color: adminTheme.text,
                      minWidth: 0,
                    }}
                  />
                </div>
                <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain' }}>
                  {filtered.length === 0 ? (
                    <p style={{ margin: 0, padding: '14px 12px', fontSize: 12, color: '#9CA3AF' }}>
                      {options.length === 0 ? emptyMessage : 'No matches.'}
                    </p>
                  ) : (
                    filtered.map((opt) => {
                      const selected = value.includes(opt.name)
                      return (
                        <button
                          key={opt._id}
                          type="button"
                          onClick={() => toggle(opt.name)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 8,
                            padding: '10px 12px',
                            border: 'none',
                            borderBottom: '1px solid #F3F4F6',
                            background: selected ? '#FDF0D5' : '#FFFFFF',
                            cursor: 'pointer',
                            fontFamily: ADMIN_FONT,
                            fontSize: 13,
                            color: adminTheme.text,
                            textAlign: 'left',
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</span>
                          {selected ? (
                            <Check size={14} color={adminTheme.primary} style={{ flexShrink: 0 }} />
                          ) : null}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  )
}
