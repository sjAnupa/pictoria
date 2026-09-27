import { z } from 'zod'

export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  publisher: z.string().optional(),
  description: z.string().min(1),
  longDescription: z.string().optional(),
  genres: z.union([z.array(z.string()), z.string()]).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  language: z.string().optional(),
  publicationYear: z.coerce.number().optional(),
  pageCount: z.coerce.number().optional(),
  freeChapterLimit: z.coerce.number().optional(),
  accessType: z.enum(['free', 'registered', 'premium']).optional(),
  status: z.enum(['draft', 'published', 'hidden', 'archived']).optional(),
  featured: z.coerce.boolean().optional(),
  newArrival: z.coerce.boolean().optional(),
  reviewsEnabled: z.coerce.boolean().optional(),
})

export const updateBookSchema = createBookSchema.partial()

export type CreateBookInput = z.infer<typeof createBookSchema>
export type UpdateBookInput = z.infer<typeof updateBookSchema>

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed.map(String)
    } catch {
      return value.split(',').map((s) => s.trim()).filter(Boolean)
    }
  }
  return []
}
