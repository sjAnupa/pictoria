import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import Footer from '../../components/common/Footer'
import PageMeta from '../../components/common/PageMeta'

type LegalDocumentLayoutProps = {
  title: string
  description: string
  updated: string
  children: ReactNode
}

export default function LegalDocumentLayout({
  title,
  description,
  updated,
  children,
}: LegalDocumentLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <PageMeta title={title} description={description} />
      <Navbar />
      <main className="page-gutter flex-1 py-10 sm:py-14">
        <article className="mx-auto max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#9B6B4A]">Legal</p>
          <h1 className="font-pictoriya text-[2rem] font-bold leading-tight text-[#3D2314] sm:text-[2.4rem]">
            {title}
          </h1>
          <p className="mt-3 text-sm text-[#6B4226]">Last updated: {updated}</p>
          <div className="prose-legal mt-8 space-y-6 text-[15px] leading-relaxed text-[#3D2314]">
            {children}
          </div>
          <p className="mt-10 text-sm text-[#6B4226]">
            Questions? Email{' '}
            <a className="font-semibold text-[#8B2635] no-underline hover:underline" href="mailto:pictoria.library@gmail.com">
              pictoria.library@gmail.com
            </a>
            . Or return to the{' '}
            <Link to="/" className="font-semibold text-[#8B2635] no-underline hover:underline">
              home page
            </Link>
            .
          </p>
        </article>
      </main>
      <Footer />
    </div>
  )
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-pictoriya mb-2 text-xl font-semibold text-[#3D2314]">{title}</h2>
      <div className="space-y-3 text-[#6B4226]">{children}</div>
    </section>
  )
}
