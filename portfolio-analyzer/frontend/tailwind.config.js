/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3b82f6',
          secondary: '#10b981',
          accent: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
