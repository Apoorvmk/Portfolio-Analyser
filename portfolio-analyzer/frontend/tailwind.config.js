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
          dark: '#0f172a',
          card: '#1e293b',
          border: '#334155',
        },
        fintech: {
          success: '#10b981',
          danger: '#f43f5e',
          warning: '#f59e0b',
          info: '#3b82f6',
          slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
            950: '#020617',
          }
        }
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.3), 0 2px 10px -2px rgba(0, 0, 0, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
