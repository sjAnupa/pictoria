import dotenv from 'dotenv'

dotenv.config()

function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, value: string | undefined, fallback: string): string {
  if (!value || value.trim() === '') {
    return fallback
  }
  return value
}

export const PORT = Number(optional('PORT', process.env.PORT, '5000'))
export const NODE_ENV = optional('NODE_ENV', process.env.NODE_ENV, 'development')
export const MONGODB_URI = required('MONGODB_URI', process.env.MONGODB_URI)
export const JWT_SECRET = required('JWT_SECRET', process.env.JWT_SECRET)
export const JWT_EXPIRES_IN = optional('JWT_EXPIRES_IN', process.env.JWT_EXPIRES_IN, '7d')
export const CLIENT_URL = optional('CLIENT_URL', process.env.CLIENT_URL, 'http://localhost:5173')
export const CLOUDFLARE_ACCOUNT_ID = optional(
  'CLOUDFLARE_ACCOUNT_ID',
  process.env.CLOUDFLARE_ACCOUNT_ID,
  'placeholder',
)
export const R2_ACCESS_KEY_ID = optional('R2_ACCESS_KEY_ID', process.env.R2_ACCESS_KEY_ID, 'placeholder')
export const R2_SECRET_ACCESS_KEY = optional(
  'R2_SECRET_ACCESS_KEY',
  process.env.R2_SECRET_ACCESS_KEY,
  'placeholder',
)
export const R2_BUCKET_NAME = optional('R2_BUCKET_NAME', process.env.R2_BUCKET_NAME, 'pictoria-books')
export const R2_PUBLIC_URL = optional('R2_PUBLIC_URL', process.env.R2_PUBLIC_URL, 'https://pub-placeholder.r2.dev')

export const isR2Configured = (): boolean =>
  CLOUDFLARE_ACCOUNT_ID !== 'placeholder' &&
  R2_ACCESS_KEY_ID !== 'placeholder' &&
  R2_SECRET_ACCESS_KEY !== 'placeholder'
