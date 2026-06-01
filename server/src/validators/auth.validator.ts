import { z } from 'zod'

export const googleAuthSchema = z.object({
  credential: z.string().min(1, 'Google credential is required'),
  intent: z.enum(['login', 'register']),
})

export const facebookAuthSchema = z.object({
  accessToken: z.string().min(1, 'Facebook access token is required'),
  intent: z.enum(['login', 'register']),
})

export type GoogleAuthInput = z.infer<typeof googleAuthSchema>
export type FacebookAuthInput = z.infer<typeof facebookAuthSchema>
