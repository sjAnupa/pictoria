import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Crown,
  Globe,
  ImageIcon,
  Loader2,
  Lock,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import CategoryMultiSelect from '../../../components/admin/CategoryMultiSelect'
import ChapterPageEditor, { type ChapterPageItem } from '../../../components/admin/ChapterPageEditor'
import AdminToast, { type AdminToastState } from '../../../components/admin/AdminToast'
import { useUnsavedChangesGuard } from '../../../hooks/useUnsavedChangesGuard'
import { fetchCategories } from '../../../services/categoryService'
import {
  adminBookErrorMessage,
  createAdminBook,
  buildPageManifest,
  createAdminChapter,
  deleteAdminChapter,
  fetchBookForEdit,
  updateAdminBook,
  updateAdminChapter,
  type AdminBookEditRecord,
  type AdminChapterRecord,
} from '../../../services/adminBookService'
import type { AdminBookRow } from '../../../utils/mapAdminBook'
import { adminTheme, ADMIN_FONT } from '../adminTheme'
import { resolveMediaUrl } from '../../../utils/resolveMediaUrl'
import {
  AdminBackButton,
  AdminButton,
  AdminConfirmDialog,
  AdminDialog,
  AdminModalActions,
} from '../adminUi'

type FormChapter = {
  id: string
  serverId?: string
  number: number
  title: string
  pages: ChapterPageItem[]
}

type BookFormState = {
  title: string
  author: string
  publisher: string
  year: string
  pages: string
  genres: string[]
  tags: string[]
  description: string
  longDescription: string
  accessType: 'free' | 'registered' | 'premium'
  chapters: FormChapter[]
}

let _uid = 0
const uid = () => String(++_uid)

function makeDefaultChapter(num: number): FormChapter {
  return {
    id: uid(),
    number: num,
    title: '',
    pages: [],
  }
}

function mapChapterPagesFromRecord(ch: AdminChapterRecord): ChapterPageItem[] {
  const stored = ch.pageImageUrls ?? []
  const previews = ch.pageImagePreviewUrls ?? stored
  const names = ch.pageImageNames ?? []
  return stored.map((remoteUrl, index) => ({
    id: uid(),
    kind: 'remote' as const,
    url: resolveMediaUrl(previews[index] ?? remoteUrl),
    remoteUrl,
    name:
      names[index] ??
      remoteUrl.split('/').pop()?.split('?')[0] ??
      `page-${String(index + 1).padStart(3, '0')}`,
  }))
}

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  fontSize: 13,
  color: adminTheme.text,
  background: adminTheme.surface,
  border: `1px solid ${adminTheme.border}`,
  borderRadius: 7,
  outline: 'none',
  fontFamily: ADMIN_FONT,
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

function SectionCard({
  title,
  children,
  action,
  overflowVisible,
}: {
  title?: string
  children: ReactNode
  action?: ReactNode
  overflowVisible?: boolean
}) {
  return (
    <div
      style={{
        background: adminTheme.surface,
        border: `1px solid ${adminTheme.border}`,
        borderRadius: 10,
        overflow: overflowVisible ? 'visible' : 'hidden',
        boxShadow: '0 1px 3px rgba(90,40,10,0.06)',
      }}
    >
      {title ? (
        <div
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{title}</span>
          {action}
        </div>
      ) : null}
      {children}
    </div>
  )
}

function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
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
      {children}
      {hint ? <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{hint}</div> : null}
      {error ? <div style={{ fontSize: 11, color: '#B91C1C', marginTop: 4 }}>{error}</div> : null}
    </div>
  )
}

function StyledInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        ...inputStyle,
        borderColor: focused ? adminTheme.primary : adminTheme.border,
        boxShadow: focused ? '0 0 0 3px rgba(139,38,53,0.12)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      style={{
        ...inputStyle,
        resize: 'vertical',
        minHeight: 72,
        borderColor: focused ? adminTheme.primary : adminTheme.border,
        boxShadow: focused ? '0 0 0 3px rgba(139,38,53,0.12)' : 'none',
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function formFromEditRecord(record: AdminBookEditRecord): BookFormState {
  const chapters = (record.chapters ?? []) as AdminChapterRecord[]

  return {
    title: record.title ?? '',
    author: record.author ?? '',
    publisher: record.publisher ?? '',
    year: record.publicationYear ? String(record.publicationYear) : '',
    pages: record.pageCount ? String(record.pageCount) : '',
    genres: record.genres ?? [],
    tags: record.tags ?? [],
    description: record.description ?? '',
    longDescription: record.longDescription ?? '',
    accessType: record.accessType ?? 'free',
    chapters:
      chapters.length > 0
        ? chapters.map((ch) => ({
            id: uid(),
            serverId: String(ch._id),
            number: ch.chapterNumber,
            title: ch.title,
            pages: mapChapterPagesFromRecord(ch),
          }))
        : [makeDefaultChapter(1)],
  }
}

function snapshotForm(form: BookFormState, coverFile: File | null, coverPreview: string | null) {
  return JSON.stringify({ ...form, coverFile: coverFile?.name ?? null, coverPreview })
}

function validateDraftForm(
  form: BookFormState,
  coverFile: File | null,
  existingCover: string | null,
): string | null {
  if (!form.title.trim()) return 'Book title is required.'
  if (!form.author.trim()) return 'Author is required.'
  if (!form.description.trim()) return 'Short description is required.'
  if (form.description.trim().length > 220) {
    return 'Short description should be under 200 characters.'
  }
  if (!coverFile && !existingCover) return 'Cover image is required.'
  if (form.genres.length === 0) return 'Select at least one genre.'
  return null
}

function validateChaptersForm(chapters: FormChapter[]): string | null {
  for (const chapter of chapters) {
    const hasContent = chapter.title.trim().length > 0 || chapter.pages.length > 0
    if (hasContent && chapter.pages.length === 0) {
      return `Chapter ${chapter.number} needs at least one page image before saving.`
    }
  }
  return null
}

type BookFormViewProps = {
  editingBook: AdminBookRow | null
  onBack: () => void
}

export default function BookFormView({ editingBook, onBack }: BookFormViewProps) {
  const isEdit = editingBook !== null
  const queryClient = useQueryClient()
  const coverInputRef = useRef<HTMLInputElement>(null)
  const chaptersSectionRef = useRef<HTMLDivElement>(null)

  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(null)

  const [form, setForm] = useState<BookFormState>(() => ({
    title: isEdit ? editingBook!.title : '',
    author: isEdit ? editingBook!.author : '',
    publisher: '',
    year: '',
    pages: '',
    genres: isEdit && editingBook!.genre ? [editingBook!.genre] : [],
    tags: [],
    description: '',
    longDescription: '',
    accessType: (editingBook?.accessType as BookFormState['accessType']) ?? 'free',
    chapters: [makeDefaultChapter(1)],
  }))

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(
    isEdit ? editingBook!.coverImageUrl : null,
  )
  const [initialSnapshot, setInitialSnapshot] = useState('')
  const [removedChapterIds, setRemovedChapterIds] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null)
  const [toast, setToast] = useState<AdminToastState | null>(null)
  const toastId = useRef(0)

  const showToast = useCallback((message: string, tone: AdminToastState['tone'] = 'error') => {
    toastId.current += 1
    setToast({ id: toastId.current, message, tone })
  }, [])

  const dismissToast = useCallback(() => setToast(null), [])

  const { data: editRecord, isLoading: loadingEdit } = useQuery({
    queryKey: ['admin', 'book-edit', editingBook?.id],
    queryFn: () => fetchBookForEdit(editingBook!.id),
    enabled: isEdit,
  })

  const { data: genreCategories = [] } = useQuery({
    queryKey: ['categories', 'genre'],
    queryFn: () => fetchCategories('genre'),
  })

  const { data: tagCategories = [] } = useQuery({
    queryKey: ['categories', 'tag'],
    queryFn: () => fetchCategories('tag'),
  })

  const genreOptions = genreCategories.filter((c) => c.isActive)
  const tagOptions = tagCategories.filter((c) => c.isActive)

  useEffect(() => {
    if (!editRecord) return
    const next = formFromEditRecord(editRecord)
    setForm(next)
    setCoverPreview(resolveMediaUrl(editRecord.coverImageUrl))
    setCoverFile(null)
    setRemovedChapterIds([])
    setExpandedChapterId(next.chapters[0]?.id ?? null)
    setInitialSnapshot(snapshotForm(next, null, resolveMediaUrl(editRecord.coverImageUrl)))
  }, [editRecord])

  useEffect(() => {
    if (isEdit || initialSnapshot) return
    setInitialSnapshot(snapshotForm(form, coverFile, coverPreview))
  }, [isEdit, initialSnapshot, form, coverFile, coverPreview])

  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false
    return snapshotForm(form, coverFile, coverPreview) !== initialSnapshot
  }, [form, coverFile, coverPreview, initialSnapshot])

  useEffect(() => {
    if (expandedChapterId === null && form.chapters.length > 0) {
      setExpandedChapterId(form.chapters[0].id)
    }
  }, [expandedChapterId, form.chapters])

  const setField = <K extends keyof BookFormState>(key: K, val: BookFormState[K]) => {
    setForm((f) => ({ ...f, [key]: val }))
    setFieldErrors((e) => ({ ...e, [key]: '' }))
  }

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setFieldErrors((err) => ({ ...err, cover: '' }))
  }

  const clearCover = () => {
    if (coverPreview?.startsWith('blob:')) URL.revokeObjectURL(coverPreview)
    setCoverFile(null)
    setCoverPreview(null)
  }

  const persistBook = useCallback(async (): Promise<boolean> => {
    const validation = validateDraftForm(form, coverFile, coverPreview)
    if (validation) {
      showToast(validation, 'error')
      return false
    }

    const chapterValidation = validateChaptersForm(form.chapters)
    if (chapterValidation) {
      showToast(chapterValidation, 'error')
      chaptersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return false
    }

    setSaving(true)

    try {
      const payload = {
        title: form.title,
        author: form.author,
        publisher: form.publisher,
        description: form.description,
        longDescription: form.longDescription || undefined,
        genres: form.genres,
        tags: form.tags,
        publicationYear: form.year ? Number(form.year) : undefined,
        pageCount: form.pages ? Number(form.pages) : undefined,
        accessType: form.accessType,
        status: 'draft' as const,
        coverFile,
      }

      let bookId = editingBook?.id ?? ''

      if (isEdit) {
        const updated = await updateAdminBook(bookId, payload)
        bookId = String(updated._id)
      } else {
        const created = await createAdminBook(payload)
        bookId = String(created._id)
      }

      for (const chapterId of removedChapterIds) {
        await deleteAdminChapter(chapterId)
      }

      for (const chapter of form.chapters) {
        const chapterTitle = chapter.title.trim() || `Chapter ${chapter.number}`

        if (chapter.serverId) {
          const { manifest, files } = buildPageManifest(chapter.pages)
          await updateAdminChapter(
            chapter.serverId,
            {
              title: chapterTitle,
              chapterNumber: chapter.number,
              pageManifest: manifest,
            },
            files,
          )
          continue
        }

        if (chapter.pages.length === 0) continue

        const { manifest, files } = buildPageManifest(chapter.pages)
        if (files.length === 0 && manifest.length === 0) continue

        await createAdminChapter(bookId, chapter.number, chapterTitle, manifest, files)
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'books'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      await queryClient.invalidateQueries({ queryKey: ['books'] })
      await queryClient.invalidateQueries({ queryKey: ['admin', 'book-edit', bookId] })

      setInitialSnapshot(snapshotForm(form, null, coverPreview))
      setCoverFile(null)
      setRemovedChapterIds([])
      return true
    } catch (err) {
      showToast(adminBookErrorMessage(err, 'Failed to save book.'), 'error')
      return false
    } finally {
      setSaving(false)
    }
  }, [
    coverFile,
    coverPreview,
    editingBook?.id,
    form,
    isEdit,
    queryClient,
    removedChapterIds,
    showToast,
  ])

  const {
    leaveDialogOpen,
    requestLeave,
    handleSaveAndLeave,
    handleDiscardAndLeave,
    handleStay,
  } = useUnsavedChangesGuard({
    isDirty,
    onSaveDraft: persistBook,
  })

  const handleBack = async () => {
    const canLeave = await requestLeave()
    if (canLeave) onBack()
  }

  const handleSave = async () => {
    const ok = await persistBook()
    if (ok) onBack()
  }

  const addChapter = () => {
    const next = makeDefaultChapter(form.chapters.length + 1)
    setField('chapters', [...form.chapters, next])
    setExpandedChapterId(next.id)
  }

  const toggleChapter = (chapterId: string) => {
    setExpandedChapterId((current) => (current === chapterId ? null : chapterId))
  }

  const confirmRemoveChapter = () => {
    if (!chapterToDelete) return
    const removingId = chapterToDelete
    const chapter = form.chapters.find((c) => c.id === removingId)
    if (chapter?.serverId) {
      setRemovedChapterIds((ids) => [...ids, chapter.serverId!])
    }
    chapter?.pages.forEach((page) => {
      if (page.kind === 'local' && page.url.startsWith('blob:')) {
        URL.revokeObjectURL(page.url)
      }
    })
    const updated = form.chapters
      .filter((c) => c.id !== removingId)
      .map((c, i) => ({ ...c, number: i + 1 }))
    setField('chapters', updated.length ? updated : [makeDefaultChapter(1)])
    setChapterToDelete(null)
    if (removingId === expandedChapterId) {
      setExpandedChapterId(updated[0]?.id ?? null)
    }
  }

  const updateChapter = (chapterId: string, patch: Partial<FormChapter>) => {
    setField(
      'chapters',
      form.chapters.map((c) => (c.id === chapterId ? { ...c, ...patch } : c)),
    )
  }

  if (isEdit && loadingEdit) {
    return (
      <div className="flex flex-1 items-center justify-center gap-2 bg-[#F9FAFB] text-sm text-[#6B7280]">
        <Loader2 size={18} className="animate-spin" />
        Loading book…
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#F9FAFB',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="admin-form-header">
        <AdminBackButton label="Back to books" onClick={() => void handleBack()} />
        <div style={{ width: 1, height: 20, background: '#E5E7EB' }} />
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>Books</span>
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
          {isEdit ? 'Edit Book' : 'Add New Book'}
        </span>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            background: '#F3F4F6',
            color: '#6B7280',
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 9px',
            borderRadius: 20,
          }}
        >
          Draft
        </span>
        <div style={{ flex: 1 }} />
        <AdminButton variant="secondary" onClick={() => void handleBack()} disabled={saving}>
          Cancel
        </AdminButton>
        <AdminButton variant="primary" onClick={() => void handleSave()} disabled={saving}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save draft'}
        </AdminButton>
      </div>

      <div className="admin-form-grid p-4 sm:p-6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionCard title="Basic information">
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField label="Book title" required error={fieldErrors.title}>
                <StyledInput
                  value={form.title}
                  onChange={(v) => setField('title', v)}
                  placeholder="e.g. The Enchanted Kingdom"
                />
              </FormField>
              <FormField label="Author" required error={fieldErrors.author}>
                <StyledInput
                  value={form.author}
                  onChange={(v) => setField('author', v)}
                  placeholder="e.g. Jane Smith"
                />
              </FormField>
              <FormField label="Publisher">
                <StyledInput
                  value={form.publisher}
                  onChange={(v) => setField('publisher', v)}
                  placeholder="e.g. Pictoria Press (optional)"
                />
              </FormField>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-3">
                <FormField label="Publication year">
                  <StyledInput
                    value={form.year}
                    onChange={(v) => setField('year', v)}
                    placeholder="e.g. 2024"
                    type="number"
                  />
                </FormField>
                <FormField label="Page count">
                  <StyledInput
                    value={form.pages}
                    onChange={(v) => setField('pages', v)}
                    placeholder="e.g. 280"
                    type="number"
                  />
                </FormField>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Cover image">
            <div style={{ padding: '16px 18px' }}>
              <FormField
                label="Book cover"
                required
                hint="Required — PNG or JPG, recommended 400×560px"
                error={fieldErrors.cover}
              >
                {coverPreview ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      style={{
                        width: '100%',
                        maxWidth: 220,
                        height: 280,
                        objectFit: 'cover',
                        borderRadius: 8,
                        display: 'block',
                        margin: '0 auto',
                        boxShadow: '0 8px 24px rgba(90,40,10,0.15)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={clearCover}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 'calc(50% - 102px)',
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'rgba(0,0,0,0.55)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                      }}
                    >
                      <X size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      style={{
                        marginTop: 12,
                        width: '100%',
                        padding: '7px 0',
                        border: `1px solid ${adminTheme.border}`,
                        borderRadius: 7,
                        background: '#FFFFFF',
                        fontSize: 12,
                        fontWeight: 500,
                        color: '#374151',
                        cursor: 'pointer',
                        fontFamily: ADMIN_FONT,
                      }}
                    >
                      Replace image
                    </button>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => coverInputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && coverInputRef.current?.click()}
                    style={{
                      border: `1.5px dashed ${adminTheme.border}`,
                      borderRadius: 8,
                      padding: '28px 16px',
                      textAlign: 'center',
                      background: '#FDF0D5',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 8,
                        background: '#F5E6C8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 10px',
                      }}
                    >
                      <ImageIcon size={20} color={adminTheme.textSoft} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: adminTheme.textMuted }}>
                      Click to upload cover
                    </div>
                  </div>
                )}
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleCoverUpload}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Description">
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <FormField
                label="Short description"
                required
                hint="Shown on book cards — keep under 200 characters"
              >
                <StyledTextarea
                  value={form.description}
                  onChange={(v) => setField('description', v)}
                  placeholder="Brief synopsis for readers…"
                  rows={3}
                />
              </FormField>
              <FormField
                label="Full description"
                hint="Optional — shown on the book detail page"
              >
                <StyledTextarea
                  value={form.longDescription}
                  onChange={(v) => setField('longDescription', v)}
                  placeholder="Longer description, themes, and reading notes…"
                  rows={6}
                />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard
            title={`Chapters (${form.chapters.length})`}
            action={
              <button
                type="button"
                onClick={addChapter}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 10px',
                  border: `1px solid ${adminTheme.border}`,
                  borderRadius: 6,
                  background: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 600,
                  color: adminTheme.textMuted,
                  cursor: 'pointer',
                  fontFamily: ADMIN_FONT,
                }}
              >
                <Plus size={12} /> Add chapter
              </button>
            }
          >
            <div ref={chaptersSectionRef} style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {form.chapters.map((chapter) => (
                <ChapterPanel
                  key={chapter.id}
                  chapter={chapter}
                  expanded={expandedChapterId === chapter.id}
                  canRemove={form.chapters.length > 1}
                  onToggle={() => toggleChapter(chapter.id)}
                  onTitleChange={(title) => updateChapter(chapter.id, { title })}
                  onPagesChange={(pages) => {
                    updateChapter(chapter.id, { pages })
                  }}
                  onRequestRemove={() => setChapterToDelete(chapter.id)}
                />
              ))}
            </div>
          </SectionCard>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SectionCard title="Publication">
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: '#FDF0D5',
                  border: `1px solid ${adminTheme.border}`,
                  fontSize: 12,
                  color: adminTheme.textMuted,
                  lineHeight: 1.5,
                }}
              >
                Books are saved as <strong>draft</strong> until you publish them from the books
                list. You can add chapters and details gradually — publishing can wait until the
                book is ready.
              </div>
              <FormField label="Access type">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 2 }}>
                  {(
                    [
                      {
                        value: 'free' as const,
                        icon: <Globe size={13} />,
                        color: '#059669',
                        label: 'Free',
                        desc: 'Anyone can read',
                      },
                      {
                        value: 'registered' as const,
                        icon: <Lock size={13} />,
                        color: '#D97706',
                        label: 'Registered',
                        desc: 'Login required',
                      },
                      {
                        value: 'premium' as const,
                        icon: <Crown size={13} />,
                        color: '#7C3AED',
                        label: 'Premium',
                        desc: 'Premium members',
                      },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setField('accessType', opt.value)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 12px',
                        border: `1.5px solid ${form.accessType === opt.value ? opt.color : '#E5E7EB'}`,
                        borderRadius: 8,
                        background: form.accessType === opt.value ? `${opt.color}0D` : '#FFFFFF',
                        cursor: 'pointer',
                        fontFamily: ADMIN_FONT,
                        textAlign: 'left',
                        width: '100%',
                      }}
                    >
                      <span style={{ color: opt.color }}>{opt.icon}</span>
                      <div>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: form.accessType === opt.value ? opt.color : '#374151',
                          }}
                        >
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>{opt.desc}</div>
                      </div>
                      {form.accessType === opt.value ? (
                        <Check size={13} style={{ marginLeft: 'auto', color: opt.color }} />
                      ) : null}
                    </button>
                  ))}
                </div>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard title="Categorization" overflowVisible>
            <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <CategoryMultiSelect
                label="Genres"
                required
                options={genreOptions}
                value={form.genres}
                onChange={(genres) => setField('genres', genres)}
                emptyMessage="No genres yet. Add them under Genres & tags."
              />
              <CategoryMultiSelect
                label="Tags"
                hint="Optional — pick from your tag library"
                options={tagOptions}
                value={form.tags}
                onChange={(tags) => setField('tags', tags)}
                emptyMessage="No tags yet. Add them under Genres & tags."
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <AdminConfirmDialog
        open={chapterToDelete !== null}
        title="Delete chapter?"
        message="This chapter and its pages will be removed when you save the book. This cannot be undone after saving."
        confirmLabel="Delete chapter"
        onConfirm={confirmRemoveChapter}
        onCancel={() => setChapterToDelete(null)}
      />

      <AdminDialog open={leaveDialogOpen} title="Unsaved changes" onClose={handleStay} maxWidth={440}>
        <p style={{ margin: '0 0 20px', fontSize: 13, color: '#4B5563', lineHeight: 1.55 }}>
          You have unsaved changes. Save this book as a draft before leaving, or discard your
          changes.
        </p>
        <AdminModalActions
          onCancel={handleStay}
          onConfirm={() => void handleSaveAndLeave()}
          confirmLabel={saving ? 'Saving…' : 'Save draft & leave'}
          confirmDisabled={saving}
        />
        <button
          type="button"
          onClick={handleDiscardAndLeave}
          style={{
            marginTop: 10,
            width: '100%',
            padding: '8px 0',
            border: 'none',
            background: 'transparent',
            color: '#B91C1C',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: ADMIN_FONT,
          }}
        >
          Discard changes and leave
        </button>
      </AdminDialog>

      <AdminToast toast={toast} onDismiss={dismissToast} durationMs={5000} />
    </div>
  )
}

function ChapterPanel({
  chapter,
  expanded,
  canRemove,
  onToggle,
  onTitleChange,
  onPagesChange,
  onRequestRemove,
}: {
  chapter: FormChapter
  expanded: boolean
  canRemove: boolean
  onToggle: () => void
  onTitleChange: (t: string) => void
  onPagesChange: (pages: ChapterPageItem[]) => void
  onRequestRemove: () => void
}) {
  const subtitle = chapter.title.trim() || 'No title yet'

  return (
    <div
      style={{
        border: `1px solid ${adminTheme.border}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: '#FFFFFF',
        transition: 'box-shadow 0.2s ease',
        boxShadow: expanded ? '0 4px 14px rgba(90,40,10,0.08)' : 'none',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 12px',
          background: expanded ? '#FDF0D5' : '#FFFFFF',
          border: 'none',
          borderBottom: expanded ? `1px solid ${adminTheme.border}` : 'none',
          cursor: 'pointer',
          textAlign: 'left',
          fontFamily: ADMIN_FONT,
          transition: 'background 0.2s ease',
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            background: adminTheme.primary,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 10,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {chapter.number}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: adminTheme.text }}>
            Chapter {chapter.number}
          </div>
          <div
            style={{
              fontSize: 11,
              color: adminTheme.textSoft,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: 2,
            }}
          >
            {subtitle} · {chapter.pages.length} page{chapter.pages.length === 1 ? '' : 's'}
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} color={adminTheme.textSoft} style={{ flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} color={adminTheme.textSoft} style={{ flexShrink: 0 }} />
        )}
      </button>

      {expanded ? (
        <div style={{ padding: 14, animation: 'adminFadeIn 0.2s ease' }}>
          <FormField label="Chapter title" hint="Optional display name for readers">
            <StyledInput
              value={chapter.title}
              onChange={onTitleChange}
              placeholder={`Chapter ${chapter.number}`}
            />
          </FormField>

          <div style={{ marginTop: 14 }}>
            <ChapterPageEditor pages={chapter.pages} onChange={onPagesChange} />
          </div>

          {canRemove ? (
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${adminTheme.border}` }}>
              <AdminButton variant="secondary" icon={Trash2} onClick={onRequestRemove}>
                Delete chapter
              </AdminButton>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
