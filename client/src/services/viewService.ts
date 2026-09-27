import api from './api'

export async function pingBookView(bookId: string, anonId?: string): Promise<void> {
  try {
    await api.post(`/views/book/${bookId}`, anonId ? { anonId } : {})
  } catch {
    // Fire-and-forget: view tracking must never disrupt reading.
  }
}
