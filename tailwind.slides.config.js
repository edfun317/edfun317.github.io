/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./slides.html",
    "./src/slides/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      colors: {
        slate: {
          850: '#111827',
        },
        accent: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          blue: '#3b82f6',
        },
        brand: {
          navy: '#1E2336',
          card: '#F3F5F9',
          accent: '#D97706',
          blue: '#2563EB',
        },
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(56, 189, 248, 0.08) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
}
