// SVG recreation of the books-with-cherries logo illustration
export function BooksIllustration({ size = 320 }: { size?: number }) {
  const h = size * 0.75;
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 280 210"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0px 8px 24px rgba(80,30,10,0.18))" }}
    >
      {/* === DROP SHADOW === */}
      <ellipse cx="140" cy="204" rx="72" ry="6" fill="rgba(90,40,10,0.14)" />

      {/* ============ BOTTOM BOOK ============ */}
      {/* Page edge (right side) */}
      <rect x="188" y="146" width="13" height="44" rx="2" fill="#F2E3BB" />
      {[150, 155, 160, 165, 170, 175, 180, 185].map((y) => (
        <line
          key={y}
          x1="188"
          y1={y}
          x2="201"
          y2={y}
          stroke="#D9C69A"
          strokeWidth="0.6"
        />
      ))}
      {/* Main cover */}
      <rect x="36" y="143" width="155" height="47" rx="5" fill="#C4776A" />
      {/* Cover shading - top highlight */}
      <rect
        x="36"
        y="143"
        width="155"
        height="10"
        rx="5"
        fill="rgba(255,200,170,0.3)"
      />
      {/* Cover shading - bottom shadow */}
      <rect
        x="36"
        y="175"
        width="155"
        height="15"
        rx="5"
        fill="rgba(80,30,20,0.12)"
      />
      {/* Spine (left dark strip) */}
      <rect x="36" y="143" width="16" height="47" rx="5" fill="#A85E52" />
      <rect x="36" y="143" width="16" height="47" rx="5" fill="none" />
      {/* Spine inner line */}
      <line
        x1="52"
        y1="148"
        x2="52"
        y2="185"
        stroke="#8B4E44"
        strokeWidth="1"
      />
      {/* Cover decorative lines */}
      <line
        x1="66"
        y1="153"
        x2="66"
        y2="183"
        stroke="rgba(80,30,20,0.2)"
        strokeWidth="1"
      />
      {/* Book outline */}
      <rect
        x="36"
        y="143"
        width="165"
        height="47"
        rx="5"
        fill="none"
        stroke="#4A2310"
        strokeWidth="1.6"
      />

      {/* === LEATHER STRAP BETWEEN BOOKS === */}
      <rect x="85" y="134" width="72" height="11" rx="3" fill="#8B5240" />
      <rect
        x="85"
        y="134"
        width="72"
        height="11"
        rx="3"
        fill="none"
        stroke="#4A2310"
        strokeWidth="1.2"
      />
      {/* Strap buckle detail */}
      <rect x="119" y="137" width="12" height="5" rx="1.5" fill="#6A3A28" />

      {/* ============ TOP BOOK ============ */}
      {/* Page edge (right side) */}
      <rect x="184" y="98" width="12" height="39" rx="2" fill="#F2E3BB" />
      {[102, 107, 112, 117, 122, 127, 132].map((y) => (
        <line
          key={y}
          x1="184"
          y1={y}
          x2="196"
          y2={y}
          stroke="#D9C69A"
          strokeWidth="0.6"
        />
      ))}
      {/* Main cover */}
      <rect x="40" y="94" width="146" height="43" rx="5" fill="#D0856E" />
      {/* Top highlight */}
      <rect
        x="40"
        y="94"
        width="146"
        height="9"
        rx="5"
        fill="rgba(255,200,170,0.3)"
      />
      {/* Bottom shadow */}
      <rect
        x="40"
        y="124"
        width="146"
        height="13"
        rx="5"
        fill="rgba(80,30,20,0.12)"
      />
      {/* Spine */}
      <rect x="40" y="94" width="16" height="43" rx="5" fill="#B06858" />
      <line
        x1="56"
        y1="99"
        x2="56"
        y2="132"
        stroke="#956050"
        strokeWidth="1"
      />
      {/* Decorative cover line */}
      <line
        x1="70"
        y1="104"
        x2="70"
        y2="128"
        stroke="rgba(80,30,20,0.2)"
        strokeWidth="1"
      />
      {/* Book outline */}
      <rect
        x="40"
        y="94"
        width="156"
        height="43"
        rx="5"
        fill="none"
        stroke="#4A2310"
        strokeWidth="1.6"
      />

      {/* ============ CHERRY STEMS ============ */}
      {/* Main stem up from book center */}
      <path
        d="M 140 94 C 138 80 136 66 130 52"
        stroke="#4A2810"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left cherry stem */}
      <path
        d="M 130 52 C 126 44 116 42 110 52"
        stroke="#4A2810"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right cherry stem */}
      <path
        d="M 130 52 C 134 44 146 44 150 54"
        stroke="#4A2810"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* ============ LEAF ============ */}
      <path
        d="M 130 52 C 138 34 160 28 166 40 C 154 52 138 54 130 52 Z"
        fill="#4A7A3D"
      />
      {/* Leaf vein */}
      <path
        d="M 130 52 C 142 38 158 30 166 40"
        stroke="#3A6A2D"
        strokeWidth="0.9"
        fill="none"
      />
      <path
        d="M 130 52 C 150 34 158 30 166 40"
        stroke="#3A6A2D"
        strokeWidth="0.5"
        fill="none"
        opacity="0.6"
      />
      {/* Leaf outline */}
      <path
        d="M 130 52 C 138 34 160 28 166 40 C 154 52 138 54 130 52 Z"
        fill="none"
        stroke="#3A6A2D"
        strokeWidth="0.9"
      />

      {/* ============ LEFT CHERRY ============ */}
      {/* Cherry shadow */}
      <ellipse cx="111" cy="68" rx="13" ry="12" fill="rgba(80,10,20,0.18)" />
      {/* Cherry body */}
      <circle cx="110" cy="65" r="13" fill="#8B1A2A" />
      {/* Cherry gradient */}
      <circle cx="110" cy="65" r="13" fill="url(#cherryGrad1)" />
      {/* Shine */}
      <ellipse
        cx="105"
        cy="59"
        rx="4.5"
        ry="3"
        fill="rgba(255,210,200,0.35)"
        transform="rotate(-20 105 59)"
      />
      {/* Dark outline */}
      <circle
        cx="110"
        cy="65"
        r="13"
        fill="none"
        stroke="#5C0F18"
        strokeWidth="1.4"
      />

      {/* ============ RIGHT CHERRY ============ */}
      <ellipse cx="151" cy="70" rx="13" ry="12" fill="rgba(80,10,20,0.18)" />
      <circle cx="150" cy="67" r="13" fill="#9E2030" />
      <circle cx="150" cy="67" r="13" fill="url(#cherryGrad2)" />
      <ellipse
        cx="145"
        cy="61"
        rx="4.5"
        ry="3"
        fill="rgba(255,210,200,0.35)"
        transform="rotate(-20 145 61)"
      />
      <circle
        cx="150"
        cy="67"
        r="13"
        fill="none"
        stroke="#5C0F18"
        strokeWidth="1.4"
      />

      {/* ============ GRADIENTS ============ */}
      <defs>
        <radialGradient
          id="cherryGrad1"
          cx="35%"
          cy="35%"
          r="65%"
          fx="35%"
          fy="35%"
        >
          <stop offset="0%" stopColor="#C42040" />
          <stop offset="50%" stopColor="#8B1A2A" />
          <stop offset="100%" stopColor="#5C0F18" />
        </radialGradient>
        <radialGradient
          id="cherryGrad2"
          cx="35%"
          cy="35%"
          r="65%"
          fx="35%"
          fy="35%"
        >
          <stop offset="0%" stopColor="#C83040" />
          <stop offset="50%" stopColor="#9E2030" />
          <stop offset="100%" stopColor="#6A1020" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Compact version for the navbar
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Books */}
      <rect x="8" y="46" width="52" height="18" rx="3" fill="#C4776A" />
      <rect x="8" y="46" width="7" height="18" rx="3" fill="#A85E52" />
      <rect x="57" y="48" width="5" height="14" rx="1" fill="#F2E3BB" />
      <rect
        x="8"
        y="46"
        width="54"
        height="18"
        rx="3"
        fill="none"
        stroke="#4A2310"
        strokeWidth="1.2"
      />

      {/* Strap */}
      <rect x="22" y="40" width="30" height="7" rx="2" fill="#8B5240" />
      <rect
        x="22"
        y="40"
        width="30"
        height="7"
        rx="2"
        fill="none"
        stroke="#4A2310"
        strokeWidth="1"
      />

      {/* Top book */}
      <rect x="10" y="24" width="48" height="17" rx="3" fill="#D0856E" />
      <rect x="10" y="24" width="7" height="17" rx="3" fill="#B06858" />
      <rect x="55" y="26" width="5" height="13" rx="1" fill="#F2E3BB" />
      <rect
        x="10"
        y="24"
        width="50"
        height="17"
        rx="3"
        fill="none"
        stroke="#4A2310"
        strokeWidth="1.2"
      />

      {/* Stem */}
      <path
        d="M 35 24 C 34 18 32 12 30 6"
        stroke="#4A2810"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 30 6 C 28 3 24 3 22 8"
        stroke="#4A2810"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 30 6 C 32 3 38 3 39 8"
        stroke="#4A2810"
        strokeWidth="1.3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Leaf */}
      <path
        d="M 30 6 C 34 0 44 -1 46 5 C 40 10 32 8 30 6 Z"
        fill="#4A7A3D"
        stroke="#3A6A2D"
        strokeWidth="0.7"
      />

      {/* Cherries */}
      <circle cx="22" cy="12" r="6" fill="#8B1A2A" stroke="#5C0F18" strokeWidth="1" />
      <circle cx="39" cy="13" r="6" fill="#9E2030" stroke="#5C0F18" strokeWidth="1" />
      <circle cx="20" cy="10" r="1.8" fill="rgba(255,200,190,0.4)" />
      <circle cx="37" cy="11" r="1.8" fill="rgba(255,200,190,0.4)" />
    </svg>
  );
}
