/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:  '#FF6B35',
        accent2: '#FFB347',
        glass:   'rgba(255,255,255,0.07)',
      },
      fontFamily: {
        sans: ['-apple-system', 'SF Pro Display', 'Nunito', 'sans-serif'],
      },
      backdropBlur: {
        glass: '20px',
      },
    },
  },
  plugins: [],
}
