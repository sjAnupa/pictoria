import { Types } from 'mongoose'
import { Book } from '../models/Book.model'
import { User } from '../models/User.model'
import { ReadingEvent } from '../models/ReadingEvent.model'
import { ReadingProgress } from '../models/ReadingProgress.model'

const GENRE_CHART_COLORS = [
  '#7C3AED',
  '#F59E0B',
  '#059669',
  '#EC4899',
  '#0EA5E9',
  '#9CA3AF',
  '#DB2777',
  '#2563EB',
]

export type CatalogStats = {
  bookCount: number
  authorCount: number
  readerCount: number
}

export type AdminDashboardStats = {
  totals: {
    books: number
    users: number
    totalReads: number
    activeToday: number
  }
  dailyReads: Array<{ date: string; reads: number }>
  genreDistribution: Array<{ name: string; value: number; color: string }>
  mostReadBooks: Array<{ title: string; reads: number }>
  topReaders: Array<{
    name: string
    initials: string
    books: number
    status: 'Active' | 'Inactive'
  }>
}

export async function getCatalogStats(): Promise<CatalogStats> {
  const [bookCount, authors, readerCount] = await Promise.all([
    Book.countDocuments({ status: 'published' }),
    Book.distinct('author', { status: 'published' }),
    User.countDocuments({ isActive: { $ne: false } }),
  ])

  return {
    bookCount,
    authorCount: authors.length,
    readerCount,
  }
}

function formatChartDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  const [
    books,
    users,
    readsAgg,
    activeToday,
    dailyAgg,
    genreAgg,
    mostReadBooksRaw,
    topReadersAgg,
  ] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments(),
    Book.aggregate<{ total: number }>([{ $group: { _id: null, total: { $sum: '$stats.totalReads' } } }]),
    ReadingEvent.distinct('userId', { createdAt: { $gte: startOfToday } }),
    ReadingEvent.aggregate<{ _id: string; reads: number }>([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          reads: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Book.aggregate<{ _id: string; count: number }>([
      { $unwind: '$genres' },
      { $group: { _id: '$genres', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Book.find()
      .sort({ 'stats.totalReads': -1 })
      .limit(6)
      .select('title stats.totalReads')
      .lean(),
    ReadingProgress.aggregate<{ _id: Types.ObjectId; books: number; lastReadAt: Date }>([
      { $group: { _id: '$userId', books: { $sum: 1 }, lastReadAt: { $max: '$lastReadAt' } } },
      { $sort: { books: -1 } },
      { $limit: 5 },
    ]),
  ])

  const dailyMap = new Map(dailyAgg.map((d) => [d._id, d.reads]))
  const dailyReads: Array<{ date: string; reads: number }> = []
  for (let i = 0; i < 14; i += 1) {
    const day = new Date(fourteenDaysAgo)
    day.setDate(fourteenDaysAgo.getDate() + i)
    const key = day.toISOString().slice(0, 10)
    dailyReads.push({ date: formatChartDate(day), reads: dailyMap.get(key) ?? 0 })
  }

  const genreTotal = genreAgg.reduce((sum, g) => sum + g.count, 0) || 1
  const genreDistribution = genreAgg.map((g, i) => ({
    name: g._id,
    value: Math.round((g.count / genreTotal) * 100),
    color: GENRE_CHART_COLORS[i % GENRE_CHART_COLORS.length],
  }))

  const mostReadBooks = mostReadBooksRaw.map((b) => ({
    title: b.title,
    reads: b.stats?.totalReads ?? 0,
  }))

  const readerIds = topReadersAgg.map((r) => r._id)
  const readerUsers = await User.find({ _id: { $in: readerIds } })
    .select('name isActive')
    .lean()
  const userMap = new Map(readerUsers.map((u) => [String(u._id), u]))

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const topReaders = topReadersAgg.map((row) => {
    const user = userMap.get(String(row._id))
    const name = user?.name ?? 'Reader'
    const parts = name.trim().split(/\s+/)
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase()
    const active =
      user?.isActive !== false && row.lastReadAt >= thirtyDaysAgo ? 'Active' : 'Inactive'
    return { name, initials, books: row.books, status: active as 'Active' | 'Inactive' }
  })

  return {
    totals: {
      books,
      users,
      totalReads: readsAgg[0]?.total ?? 0,
      activeToday: activeToday.length,
    },
    dailyReads,
    genreDistribution,
    mostReadBooks,
    topReaders,
  }
}
