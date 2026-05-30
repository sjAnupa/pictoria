import app from './app'
import { connectDB } from './config/db'
import { PORT } from './config/env'
import { getCoverStorageBackend, getPageStorageBackend } from './services/storage.service'

const start = async (): Promise<void> => {
  await connectDB()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Cover images: ${getCoverStorageBackend()} server (uploads/covers/)`)
    console.log(
      `Chapter pages: ${getPageStorageBackend() === 'r2' ? 'Cloudflare R2 + local fallback' : 'local disk (uploads/pages/)'}`,
    )
  })
}

start()
