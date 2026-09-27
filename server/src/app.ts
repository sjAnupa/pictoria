import path from 'path'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import morgan from 'morgan'
import { CLIENT_URL, NODE_ENV } from './config/env'
import { UPLOADS_ROOT } from './config/storage'
import authRoutes from './routes/auth.routes'
import bookRoutes from './routes/book.routes'
import chapterRoutes from './routes/chapter.routes'
import userRoutes from './routes/user.routes'
import categoryRoutes from './routes/category.routes'
import progressRoutes from './routes/progress.routes'
import engagementRoutes from './routes/engagement.routes'
import reviewRoutes from './routes/review.routes'
import viewRoutes from './routes/view.routes'
import adminRoutes from './routes/admin.routes'
import { errorMiddleware } from './middleware/error.middleware'

const app = express()

app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    crossOriginEmbedderPolicy: false,
  }),
)
app.use(cors({ origin: CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use('/uploads', express.static(UPLOADS_ROOT))

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() })
})

app.use('/api/auth', authRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/chapters', chapterRoutes)
app.use('/api/users', userRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/engagement', engagementRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/views', viewRoutes)
app.use('/api/admin', adminRoutes)

app.use(errorMiddleware)

export default app
