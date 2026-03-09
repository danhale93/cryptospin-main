/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-yellow': '#FBBF24',
        'primary-dark': '#1A1A1A',
      }
    },
  },
  plugins: [],
}