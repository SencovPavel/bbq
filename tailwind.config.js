/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:  '#F97316',
        accent2: '#FBBF24',
        glass:   'rgba(255,240,200,0.05)',
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
