import dns from 'node:dns'
import mongoose from 'mongoose'
import { MONGODB_URI } from './env'

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 15_000,
  socketTimeoutMS: 45_000,
  maxPoolSize: 10,
} as const

const STARTUP_RETRIES = 5
const STARTUP_RETRY_MS = 5_000

/** Router/ISP DNS on Windows often refuses SRV lookups from Node while nslookup works. */
export function prepareMongoConnection(): void {
  if (!MONGODB_URI.startsWith('mongodb+srv://')) {
    return
  }

  const custom = process.env.MONGODB_DNS_SERVERS?.split(',')
    .map((server) => server.trim())
    .filter(Boolean)

  if (custom?.length) {
    dns.setServers(custom)
    return
  }

  if (process.platform === 'win32') {
    dns.setServers(['8.8.8.8', '1.1.1.1', ...dns.getServers()])
  }
}

function attachConnectionListeners(): void {
  const connection = mongoose.connection

  connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — mongoose will reconnect automatically')
  })
  connection.on('reconnected', () => {
    console.log('MongoDB reconnected')
  })
  connection.on('error', (error: Error) => {
    console.error('MongoDB connection error:', error.message)
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isSrvDnsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: string }).code === 'ECONNREFUSED' &&
    'syscall' in error &&
    (error as { syscall?: string }).syscall === 'querySrv'
  )
}

function logConnectionHelp(error: unknown): void {
  if (isSrvDnsError(error)) {
    console.error(
      '\nAtlas SRV DNS lookup failed (querySrv ECONNREFUSED). Fixes:\n' +
        '  1. Add MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1 to server/.env\n' +
        '  2. Or use the standard mongodb:// connection string from Atlas (not mongodb+srv)\n' +
        '  3. In Atlas: resume the cluster if paused, and allow your IP under Network Access\n',
    )
  }
}

export const connectDB = async (): Promise<void> => {
  prepareMongoConnection()
  attachConnectionListeners()

  for (let attempt = 1; attempt <= STARTUP_RETRIES; attempt++) {
    try {
      await mongoose.connect(MONGODB_URI, MONGO_OPTIONS)
      console.log('MongoDB connected')
      return
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${STARTUP_RETRIES} failed:`, error)
      if (attempt === STARTUP_RETRIES) {
        logConnectionHelp(error)
        process.exit(1)
      }
      console.log(`Retrying in ${STARTUP_RETRY_MS / 1000}s…`)
      await sleep(STARTUP_RETRY_MS)
    }
  }
}
