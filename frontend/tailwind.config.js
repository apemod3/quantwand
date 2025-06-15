/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bloomberg': {
          'dark': '#000000',
          'orange': '#FF6900',
          'blue': '#1E3A8A',
          'gray': '#1F2937',
          'light-gray': '#374151'
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}