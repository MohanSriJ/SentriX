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
        sentrix: {
          bg: '#070C18',
          card: '#0F172A',
          cardHover: '#131F37',
          cardBorder: '#1E2D48',
          panel: '#0B1325',
          border: '#1E293B',
          accent: '#3B82F6',
          green: '#10B981',
          emerald: '#059669',
          yellow: '#F59E0B',
          amber: '#D97706',
          red: '#EF4444',
          crimson: '#DC2626',
          cyan: '#06B6D4',
          textMuted: '#94A3B8',
          textLight: '#F8FAFC',
          textDim: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
