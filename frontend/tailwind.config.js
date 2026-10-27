/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0c10',
        card: '#12161f',
        'card-hover': '#181e2b',
        border: '#1f2737',
        primary: {
          DEFAULT: '#f59e0b', // warm amber
          hover: '#d97706',
          light: '#fef3c7',
        },
        coral: {
          DEFAULT: '#f43f5e',
          hover: '#e11d48',
        },
        muted: '#94a3b8',
        'muted-foreground': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-coral': '0 0 25px -5px rgba(244, 63, 94, 0.3)',
      },
    },
  },
  plugins: [],
}

