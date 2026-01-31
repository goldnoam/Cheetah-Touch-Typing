
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        assistant: ['Assistant', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        amber: {
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
}
