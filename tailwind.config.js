/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0f1114',
          800: '#161b22',
          700: '#1e2530',
          600: '#252d3a',
          500: '#2d3848',
        },
        yellow: {
          DEFAULT: '#f5c400',
          400: '#ffd740',
          600: '#d4a900',
          700: '#b38f00',
        },
        risk: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#22c55e',
        },
      },
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Barlow', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'score': ['4rem', { lineHeight: '1', fontWeight: '700' }],
        'score-sm': ['2.5rem', { lineHeight: '1', fontWeight: '700' }],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}
