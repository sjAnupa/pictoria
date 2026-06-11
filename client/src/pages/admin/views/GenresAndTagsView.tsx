import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Plus, Trash2, Palette, Tag as TagIcon, BookMarked, Loader2 } from 'lucide-react'
import EmojiPicker from '../../../components/admin/EmojiPicker'
import AdminToast, { type AdminToastState } from '../../../components/admin/AdminToast'
import { ADMIN_FONT } from '../adminTheme'
import { AdminButton, AdminConfirmDialog, AdminDialog, AdminModalActions } from '../adminUi'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  type CategoryRecord,
  CategoryServiceError,
  type GenreColorPresetId,
} from '../../../services/categoryService'

/** Preset swatches for genres (high-level taxonomy for books). */
export const GENRE_COLOR_PRESETS = [
  { id: 'violet', label: 'Violet', dot: '#7C3AED', bg: '#EDE9FE' },
  { id: 'indigo', label: 'Indigo', dot: '#4F46E5', bg: '#EEF2FF' },
  { id: 'rose', label: 'Rose', dot: '#DB2777', bg: '#FCE7F3' },
  { id: 'amber', label: 'Amber', dot: '#D97706', bg: '#FEF3C7' },
  { id: 'emerald', label: 'Emerald', dot: '#059669', bg: '#D1FAE5' },
  { id: 'cyan', label: 'Cyan', dot: '#0891B2', bg: '#CFFAFE' },
  { id: 'slate', label: 'Slate', dot: '#475569', bg: '#F1F5F9' },
] as const

export type { GenreColorPresetId }

function presetById(id: GenreColorPresetId | string | undefined) {
  return GENRE_COLOR_PRESETS.find((p) => p.id === id) ?? GENRE_COLOR_PRESETS[1]
}

function SectionShell({
  title,
  subtitle,
  icon,
  action,
  children,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#FDF0D5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8B2635',
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{title}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B7280', maxWidth: 520 }}>{subtitle}</p>
          </div>
        </div>
        {action}
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </section>
  )
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  fontSize: 13,
  color: '#111827',
  background: '#FFFFFF',
  border: '1px solid #D1D5DB',
  borderRadius: 7,
  outline: 'none',
  fontFamily: ADMIN_FONT,
  boxSizing: 'border-box',
}

export default function GenresAndTagsView() {
  const queryClient = useQueryClient()
  const [genreModal, setGenreModal] = useState(false)
  const [tagModal, setTagModal] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<CategoryRecord | null>(null)
  const [newGenreName, setNewGenreName] = useState('')
  const [newGenrePreset, setNewGenrePreset] = useState<GenreColorPresetId>('indigo')
  const [newGenreIcon, setNewGenreIcon] = useState('📚')
  const [newTagName, setNewTagName] = useState('')
  const [newTagPreset, setNewTagPreset] = useState<GenreColorPresetId>('slate')
  const [formError, setFormError] = useState<string | null>(null)
  const [toast, setToast] = useState<AdminToastState | null>(null)
  const toastId = useRef(0)

  const showToast = useCallback((message: string, tone: AdminToastState['tone'] = 'success') => {
    toastId.current += 1
    setToast({ id: toastId.current, message, tone })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const categoriesQuery = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => fetchCategories(),
  })

  const genres = (categoriesQuery.data ?? []).filter((c) => c.type === 'genre')
  const tags = (categoriesQuery.data ?? []).filter((c) => c.type === 'tag')

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onError: (err) => {
      setFormError(err instanceof CategoryServiceError ? err.message : 'Save failed.')
      showToast(err instanceof CategoryServiceError ? err.message : 'Could not save. Please try again.', 'error')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onError: (err) => {
      setFormError(err instanceof CategoryServiceError ? err.message : 'Delete failed.')
      setPendingDelete(null)
      showToast(err instanceof CategoryServiceError ? err.message : 'Could not delete. Please try again.', 'error')
    },
  })

  const resetGenreForm = () => {
    setNewGenreName('')
    setNewGenreIcon('📚')
    setNewGenrePreset('indigo')
    setFormError(null)
  }

  const resetTagForm = () => {
    setNewTagName('')
    setNewTagPreset('slate')
    setFormError(null)
  }

  const addGenre = async () => {
    const n = newGenreName.trim()
    if (!n) {
      setFormError('Enter a genre name.')
      return
    }
    setFormError(null)
    try {
      const record = await createMutation.mutateAsync({
        name: n,
        type: 'genre',
        icon: newGenreIcon || '📚',
        colorPresetId: newGenrePreset,
      })
      invalidate()
      showToast(`Genre "${record.name}" added`)
      resetGenreForm()
      setGenreModal(false)
    } catch {
      /* formError set in mutation onError */
    }
  }

  const addTag = async () => {
    const n = newTagName.trim()
    if (!n) {
      setFormError('Enter a tag name.')
      return
    }
    setFormError(null)
    try {
      const record = await createMutation.mutateAsync({
        name: n,
        type: 'tag',
        colorPresetId: newTagPreset,
      })
      invalidate()
      showToast(`Tag "${record.name}" added`)
      resetTagForm()
      setTagModal(false)
    } catch {
      /* formError set in mutation onError */
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const { _id, name, type } = pendingDelete
    try {
      await deleteMutation.mutateAsync(_id)
      setPendingDelete(null)
      invalidate()
      showToast(type === 'tag' ? `Tag "${name}" deleted` : `Genre "${name}" deleted`)
    } catch {
      /* handled in mutation onError */
    }
  }

  if (categoriesQuery.isLoading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#6B7280' }}>
        <Loader2 size={18} className="animate-spin" />
        Loading genres & tags from API…
      </div>
    )
  }

  if (categoriesQuery.isError) {
    return (
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ padding: 16, borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', fontSize: 13 }}>
          Could not load categories. Make sure the API server is running and you are signed in as an admin.
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page flex flex-col gap-5">
      <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.55 }}>
        Manage catalog genres and book tags. Changes save automatically and appear in the library when books are connected.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <SectionShell
          title={`Genres (${genres.length})`}
          subtitle="High-level shelves. Pick an emoji icon and color preset for each genre."
          icon={<BookMarked size={20} />}
          action={
            <AdminButton
              variant="primary"
              icon={Plus}
              onClick={() => {
                setFormError(null)
                resetGenreForm()
                setGenreModal(true)
              }}
            >
              Add genre
            </AdminButton>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {genres.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>No genres yet. Add your first genre to get started.</p>
            ) : null}
            {genres.map((g) => {
              const p = presetById(g.colorPresetId)
              return (
                <div
                  key={g._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    background: '#FAFAFA',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: p.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                      boxShadow: `inset 0 0 0 1px ${p.dot}22`,
                    }}
                  >
                    {g.icon || '📚'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                      Preset: <span style={{ color: p.dot, fontWeight: 600 }}>{p.label}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${g.name}`}
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setFormError(null)
                      setPendingDelete(g)
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </SectionShell>

        <SectionShell
          title={`Tags (${tags.length})`}
          subtitle="Flexible labels for tropes, moods, or art style — attached to individual books."
          icon={<TagIcon size={20} />}
          action={
            <AdminButton
              variant="ghost"
              icon={Plus}
              onClick={() => {
                setFormError(null)
                resetTagForm()
                setTagModal(true)
              }}
            >
              Add tag
            </AdminButton>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {tags.length === 0 ? (
              <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF' }}>No tags yet. Add labels like Magic, Cozy, or Illustrated.</p>
            ) : null}
            {tags.map((t) => {
              const p = presetById(t.colorPresetId)
              return (
                <div
                  key={t._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '12px 14px',
                    border: '1px solid #E5E7EB',
                    borderRadius: 10,
                    background: '#FAFAFA',
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: p.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      flexShrink: 0,
                      boxShadow: `inset 0 0 0 1px ${p.dot}22`,
                    }}
                  >
                    {t.icon || '🏷️'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                      Tag · <span style={{ color: p.dot, fontWeight: 600 }}>{p.label}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${t.name}`}
                    disabled={deleteMutation.isPending}
                    onClick={() => {
                      setFormError(null)
                      setPendingDelete(t)
                    }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: '1px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: '#9CA3AF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            })}
          </div>
        </SectionShell>
      </div>

      <AdminDialog
        open={genreModal}
        title="Add genre"
        onClose={() => {
          setGenreModal(false)
          setFormError(null)
        }}
        maxWidth={440}
      >
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Genre name & icon
        </label>
        <div
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'stretch',
            marginBottom: 6,
          }}
        >
          <EmojiPicker compact value={newGenreIcon} onChange={setNewGenreIcon} />
          <input
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            placeholder="e.g. Science Fiction"
            autoFocus
            style={{ ...inputStyle, flex: 1, minWidth: 0, height: 42, padding: '0 12px' }}
          />
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 11, color: '#9CA3AF' }}>
          Click the emoji button to pick an icon for this genre.
        </p>

        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Color preset</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {GENRE_COLOR_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setNewGenrePreset(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 8,
                border: newGenrePreset === p.id ? `2px solid ${p.dot}` : '1px solid #E5E7EB',
                background: p.bg,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              <Palette size={12} color={p.dot} />
              {p.label}
            </button>
          ))}
        </div>

        {formError ? <p style={{ color: '#B91C1C', fontSize: 12, marginBottom: 12 }}>{formError}</p> : null}

        <AdminModalActions
          onCancel={() => {
            setGenreModal(false)
            setFormError(null)
          }}
          onConfirm={() => void addGenre()}
          confirmLabel={createMutation.isPending ? 'Saving…' : 'Save genre'}
          confirmDisabled={createMutation.isPending}
        />
      </AdminDialog>

      <AdminDialog
        open={tagModal}
        title="Add tag"
        onClose={() => {
          setTagModal(false)
          setFormError(null)
        }}
      >
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Tag name</label>
        <input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="e.g. Slow burn"
          autoFocus
          style={{ ...inputStyle, marginBottom: 14 }}
        />
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Color preset</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {GENRE_COLOR_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setNewTagPreset(p.id)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: newTagPreset === p.id ? `2px solid ${p.dot}` : '1px solid #E5E7EB',
                background: p.bg,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        {formError ? <p style={{ color: '#B91C1C', fontSize: 12, marginBottom: 12 }}>{formError}</p> : null}
        <AdminModalActions
          onCancel={() => {
            setTagModal(false)
            setFormError(null)
          }}
          onConfirm={() => void addTag()}
          confirmLabel={createMutation.isPending ? 'Saving…' : 'Save tag'}
          confirmDisabled={createMutation.isPending}
        />
      </AdminDialog>

      <AdminConfirmDialog
        open={Boolean(pendingDelete)}
        title={pendingDelete?.type === 'tag' ? 'Delete tag?' : 'Delete genre?'}
        message={
          pendingDelete ? (
            <>
              Are you sure you want to remove <strong>{pendingDelete.name}</strong>? This cannot be undone.
            </>
          ) : null
        }
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
      />

      <AdminToast toast={toast} onDismiss={dismissToast} />
    </div>
  )
}
