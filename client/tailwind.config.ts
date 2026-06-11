import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        /** Book titles & section headings — readable literary serif */
        pictoria: ['Literata', 'Georgia', 'serif'],
        display: ['Literata', 'Georgia', 'serif'],
        /** Body, UI, admin — Lexend is designed for comfortable screen reading */
        sans: ['Lexend', 'system-ui', 'sans-serif'],
        admin: ['Lexend', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        reading: '1.75',
      },
    },
  },
  plugins: [],
} satisfies Config
