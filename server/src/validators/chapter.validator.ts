import { z } from 'zod'

export const createChapterSchema = z.object({
  bookId: z.string().min(1),
  chapterNumber: z.coerce.number().int().positive(),
  title: z.string().min(1),
})

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  chapterNumber: z.coerce.number().int().positive().optional(),
  highlightUntil: z.coerce.date().optional(),
})

export type CreateChapterInput = z.infer<typeof createChapterSchema>
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>
