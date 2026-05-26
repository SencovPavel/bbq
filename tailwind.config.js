/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontSize: {
        xs: ['var(--t-xs)', { lineHeight: 'var(--lh-snug)' }],
        sm: ['var(--t-sm)', { lineHeight: 'var(--lh-snug)' }],
        md: ['var(--t-md)', { lineHeight: 'var(--lh-snug)' }],
        lg: ['var(--t-lg)', { lineHeight: 'var(--lh-tight)' }],
        xl: ['var(--t-xl)', { lineHeight: 'var(--lh-tight)' }],
        display: ['var(--t-display)', { lineHeight: '1' }],
      },
      borderRadius: {
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        pill: 'var(--r-pill)',
      },
      colors: {
        accent: 'var(--accent)',
        'accent-2': 'var(--accent-2)',
        text: 'var(--text)',
        muted: 'var(--muted)',
        glass: 'rgba(255,240,200,0.05)',
      },
      fontFamily: {
        sans: ['Nunito', '-apple-system', 'SF Pro Display', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
