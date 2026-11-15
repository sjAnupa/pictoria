import { Link } from 'react-router-dom'
import { BookOpen, Sparkles, Heart } from 'lucide-react'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import PageMeta from '../components/common/PageMeta'
import { FONT_DISPLAY } from '../theme/typography'

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FDF0D5]">
      <PageMeta
        title="About us"
        description="Pictoriya helps readers grow their imaginary worlds by bringing richer illustration into the stories they love."
      />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-[#E8C98A]/60">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 18% 20%, rgba(232,184,75,0.35) 0%, transparent 48%),
                radial-gradient(ellipse at 88% 70%, rgba(196,119,106,0.22) 0%, transparent 42%),
                #F5D9A0
              `,
            }}
            aria-hidden
          />
          <div className="page-gutter relative z-[1] py-14 sm:py-20">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#8B2635]">About Pictoriya</p>
            <h1
              className="max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.15] text-[#3D2314]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Growing the imaginary worlds inside every reader
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#6B4226] sm:text-lg">
              We believe the books people already love can open even wider when stories are paired with
              richer pictures — pages that invite you to linger, wonder, and imagine further.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="page-gutter py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-2xl font-bold text-[#3D2314] sm:text-[1.75rem]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Our story
            </h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-[#6B4226] sm:text-base">
              <p>
                Pictoriya began with a simple wish: to help people expand their imaginary world. Many of us
                grew up with stories that lived mostly in words. We wanted a place where those familiar
                reading habits meet more illustration — so every chapter can feel like a small gallery of
                feeling, place, and character.
              </p>
              <p>
                We are a small group of people who care about curiosity, warmth, and the quiet joy of turning
                a page. Together we are building an illustrated library where readers can discover, read, and
                return to stories that look as vivid as they sound in the mind.
              </p>
            </div>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="border-y border-[#E8C98A]/70 bg-[#FEF8EE]/70">
          <div className="page-gutter grid gap-8 py-12 sm:grid-cols-2 sm:gap-10 sm:py-16">
            <div className="rounded-2xl border border-[#E8C98A] bg-[#FDF0D5]/90 p-6 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#8B2635]/10 text-[#8B2635]">
                <Sparkles className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-[#3D2314]" style={{ fontFamily: FONT_DISPLAY }}>
                Vision
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6B4226]">
                A world where every reader can step deeper into imagination — where illustrated stories make
                old favorites feel new, and new stories feel unforgettable.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E8C98A] bg-[#FDF0D5]/90 p-6 sm:p-8">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#8B2635]/10 text-[#8B2635]">
                <Heart className="h-5 w-5" strokeWidth={2.25} aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-[#3D2314]" style={{ fontFamily: FONT_DISPLAY }}>
                Mission
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-[#6B4226]">
                To build a warm digital library that brings more pictorial storytelling into the books people
                are used to reading — carefully curated, easy to explore, and made for everyday wonder.
              </p>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section className="page-gutter py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <h2
              className="text-2xl font-bold text-[#3D2314] sm:text-[1.75rem]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              What you will find here
            </h2>
            <ul className="mt-6 space-y-4">
              {[
                {
                  icon: BookOpen,
                  title: 'Illustrated reading',
                  body: 'Stories presented with art that supports the mood of each chapter — not decoration for its own sake.',
                },
                {
                  icon: Sparkles,
                  title: 'Familiar joy, expanded',
                  body: 'We start from the reading habits people already love, then widen the imaginary space around them.',
                },
                {
                  icon: Heart,
                  title: 'A human-built library',
                  body: 'Pictoriya is shaped by people who want imagination to feel welcoming, calm, and shared.',
                },
              ].map(({ icon: Icon, title, body }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-xl border border-[#E8C98A]/80 bg-[#FEF8EE]/50 p-4 sm:p-5"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F5D9A0] text-[#6B4226]">
                    <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-semibold text-[#3D2314]">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#6B4226]">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="page-gutter pb-14 sm:pb-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-[#E8C98A] bg-gradient-to-br from-[#F5D9A0]/80 to-[#FEF8EE] px-6 py-8 text-center sm:px-10 sm:py-10">
            <h2
              className="text-2xl font-bold text-[#3D2314]"
              style={{ fontFamily: FONT_DISPLAY }}
            >
              Start exploring
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-[#6B4226]">
              Browse the catalog, open a chapter, and let the pictures pull your imagination a little further.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/library"
                className="rounded-full bg-gradient-to-br from-[#8B2635] to-[#A83040] px-5 py-2.5 text-sm font-bold text-[#FEF8EE] no-underline shadow-md"
              >
                Browse catalog
              </Link>
              <Link
                to="/"
                className="rounded-full border border-[#E8C98A] bg-[#FEF8EE] px-5 py-2.5 text-sm font-bold text-[#6B4226] no-underline"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
