import { z } from 'zod'

export const pageManifestEntrySchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('existing'),
    url: z.string().min(1),
    displayName: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('new'),
    fileIndex: z.number().int().min(0),
    displayName: z.string().min(1).optional(),
  }),
])

export const pageManifestSchema = z.array(pageManifestEntrySchema)

export type PageManifestEntry = z.infer<typeof pageManifestEntrySchema>

export const createChapterSchema = z.object({
  bookId: z.string().min(1),
  chapterNumber: z.coerce.number().int().positive(),
  title: z.string().min(1),
  pageManifest: z.string().optional(),
})

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  chapterNumber: z.coerce.number().int().positive().optional(),
  highlightUntil: z.coerce.date().optional(),
  pageManifest: z.string().optional(),
})

export type CreateChapterInput = z.infer<typeof createChapterSchema>
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>

export function parsePageManifest(value: unknown): PageManifestEntry[] | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      const result = pageManifestSchema.safeParse(parsed)
      return result.success ? result.data : null
    } catch {
      return null
    }
  }
  const result = pageManifestSchema.safeParse(value)
  return result.success ? result.data : null
}
