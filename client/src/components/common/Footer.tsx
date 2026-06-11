import { Link } from 'react-router-dom'

const exploreLinks = [
  { label: 'Home', to: '/' },
  { label: 'Featured reads', to: '/#featured-reads' },
  { label: 'New arrivals', to: '/#new-arrivals' },
  { label: 'Browse catalog', to: '/library' },
] as const

const Footer = () => {
  return (
    <footer
      className="font-sans bg-[#3D2314] py-8 text-[#F5D9A0] sm:py-12"
      style={{ fontFamily: "'Nunito', sans-serif" }}
    >
      <div className="page-gutter mb-8 grid grid-cols-1 gap-8 sm:mb-10 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))] sm:gap-10">
        <div>
          <div className="font-pictoria mb-2.5 text-xl font-semibold text-[#F5D9A0] sm:text-[22px]">Pictoria</div>
          <p className="text-[13px] leading-relaxed text-[#9B6B4A]">
            A warm, illustrated library for curious readers who believe every story deserves beautiful art.
          </p>
        </div>
        <div>
          <div className="mb-3.5 text-xs font-bold uppercase tracking-wide text-[#C9952A]">Explore</div>
          {exploreLinks.map(({ label, to }) => (
            <div key={label} className="mb-2">
              <Link
                to={to}
                className="text-[13px] text-[#9B6B4A] no-underline transition-colors hover:text-[#F5D9A0]"
              >
                {label}
              </Link>
            </div>
          ))}
        </div>
        {[
          { title: 'Support', links: ['Help Center', 'Reading Guide', 'Contact Us', 'Feedback'] },
          { title: 'Company', links: ['About Us', 'Authors', 'Press', 'Careers'] },
        ].map((col) => (
          <div key={col.title}>
            <div className="mb-3.5 text-xs font-bold uppercase tracking-wide text-[#C9952A]">{col.title}</div>
            {col.links.map((link) => (
              <div key={link} className="mb-2">
                <a
                  href="#"
                  className="text-[13px] text-[#9B6B4A] no-underline transition-colors hover:text-[#F5D9A0]"
                >
                  {link}
                </a>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="page-gutter flex flex-col flex-wrap items-center justify-between gap-3 border-t border-[#E8C98A]/20 pt-6 sm:flex-row">
        <div className="text-xs text-[#6B4226]">© {new Date().getFullYear()} Pictoria. Made with care for readers everywhere.</div>
        <div className="flex gap-4">
          {['Privacy', 'Terms', 'Cookies'].map((item) => (
            <a key={item} href="#" className="text-xs text-[#6B4226] no-underline hover:text-[#9B6B4A]">
              {item}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
