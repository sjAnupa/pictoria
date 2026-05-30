import { useParams } from 'react-router-dom'
import { getBookById } from '../data/mockBooks'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ChapterScrollReader from '../features/reader/ChapterScrollReader'

const Reader = () => {
  const { bookId, chapterNumber } = useParams<{ bookId: string; chapterNumber: string }>()
  const book = bookId ? getBookById(bookId) : undefined
  const backSlug = book?.slug ?? 'the-enchanted-garden'
  const chNum = Number(chapterNumber)
  const chapterTitle =
    book && chapterNumber && !Number.isNaN(chNum)
      ? book.chapters[chNum - 1] ?? `Chapter ${chapterNumber}`
      : chapterNumber
        ? `Chapter ${chapterNumber}`
        : undefined

  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <Navbar />
      <main className="flex min-h-0 flex-1 flex-col bg-[#E8D4A8]" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ChapterScrollReader
            backTo={`/books/${backSlug}`}
            bookTitle={book?.title}
            chapterLabel={
              chapterNumber && chapterTitle
                ? `Chapter ${chapterNumber} · ${chapterTitle}`
                : chapterTitle
            }
          />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Reader
