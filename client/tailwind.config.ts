import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        pictoria: ['Fraunces', 'Georgia', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        admin: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
