import { useRef } from 'react'
import { Reorder } from 'framer-motion'
import { GripVertical, ImagePlus, Trash2 } from 'lucide-react'
import { adminTheme, ADMIN_FONT } from '../../pages/admin/adminTheme'
import { AdminButton } from '../../pages/admin/adminUi'

export type ChapterPageItem = {
  id: string
  kind: 'remote' | 'local'
  url: string
  remoteUrl?: string
  file?: File
  name: string
}

type ChapterPageEditorProps = {
  pages: ChapterPageItem[]
  onChange: (pages: ChapterPageItem[]) => void
}

function pageLabel(page: ChapterPageItem, index: number): string {
  if (page.name) return page.name
  return `page-${String(index + 1).padStart(3, '0')}`
}

export function pagesFromFiles(files: File[], startIndex: number): ChapterPageItem[] {
  return files.map((file, i) => ({
    id: `${Date.now()}-${i}-${file.name}`,
    kind: 'local' as const,
    url: URL.createObjectURL(file),
    file,
    name: file.name || `page-${String(startIndex + i + 1).padStart(3, '0')}`,
  }))
}

function SortablePageRow({
  page,
  index,
  onRemove,
}: {
  page: ChapterPageItem
  index: number
  onRemove: (id: string) => void
}) {
  return (
    <Reorder.Item
      value={page}
      id={page.id}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderBottom: `1px solid ${adminTheme.border}`,
        background: '#FFFFFF',
        listStyle: 'none',
        cursor: 'grab',
      }}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 10px 28px rgba(90,40,10,0.16)',
        zIndex: 20,
        cursor: 'grabbing',
        background: '#FDF0D5',
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      dragListener
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          color: adminTheme.textSoft,
          flexShrink: 0,
          touchAction: 'none',
        }}
        aria-hidden
      >
        <GripVertical size={16} />
      </span>
      <span
        style={{
          width: 24,
          flexShrink: 0,
          fontSize: 11,
          fontWeight: 700,
          color: adminTheme.textSoft,
          textAlign: 'center',
        }}
      >
        {index + 1}
      </span>
      <img
        src={page.url}
        alt=""
        draggable={false}
        style={{
          width: 36,
          height: 48,
          objectFit: 'cover',
          borderRadius: 4,
          border: `1px solid ${adminTheme.border}`,
          flexShrink: 0,
          background: '#F5E6C8',
          pointerEvents: 'none',
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: adminTheme.text,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={pageLabel(page, index)}
        >
          {pageLabel(page, index)}
        </div>
        <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>
          {page.kind === 'remote' ? 'Saved on server' : 'New upload — saved with book'}
        </div>
      </div>
      <button
        type="button"
        onClick={() => onRemove(page.id)}
        aria-label="Remove page"
        style={{
          border: 'none',
          background: 'transparent',
          color: '#9CA3AF',
          cursor: 'pointer',
          padding: 4,
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = '#EF4444'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = '#9CA3AF'
        }}
      >
        <Trash2 size={15} />
      </button>
    </Reorder.Item>
  )
}

export default function ChapterPageEditor({ pages, onChange }: ChapterPageEditorProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  const remove = (id: string) => {
    const target = pages.find((p) => p.id === id)
    if (target?.kind === 'local' && target.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url)
    }
    onChange(pages.filter((p) => p.id !== id))
  }

  const addFiles = (files: FileList) => {
    const next = [...pages, ...pagesFromFiles(Array.from(files), pages.length)]
    onChange(next)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Pages ({pages.length})
        </span>
        <AdminButton variant="secondary" icon={ImagePlus} onClick={() => fileRef.current?.click()}>
          Add pages
        </AdminButton>
      </div>

      {pages.length === 0 ? (
        <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', lineHeight: 1.5 }}>
          No pages yet. Add images in reading order — drag to reorder before saving.
        </p>
      ) : (
        <div
          style={{
            border: `1px solid ${adminTheme.border}`,
            borderRadius: 8,
            maxHeight: 420,
            overflowY: 'auto',
            background: '#FEF8EE',
          }}
        >
          <Reorder.Group
            axis="y"
            values={pages}
            onReorder={onChange}
            as="div"
            style={{ margin: 0, padding: 0, listStyle: 'none' }}
          >
            {pages.map((page, index) => (
              <SortablePageRow key={page.id} page={page} index={index} onRemove={remove} />
            ))}
          </Reorder.Group>
        </div>
      )}

      <p style={{ margin: '8px 0 0', fontSize: 11, color: '#9CA3AF', lineHeight: 1.45, fontFamily: ADMIN_FONT }}>
        Drag the grip handle to reorder. Stored under{' '}
        <code style={{ fontSize: 10 }}>uploads/pages/books/&lt;slug&gt;/chapters/&lt;n&gt;/</code> until R2
        migration.
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && addFiles(e.target.files)}
      />
    </div>
  )
}
