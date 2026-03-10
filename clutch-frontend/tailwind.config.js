/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        clutch: {
          50: '#eff6ff',  // Very subtle blue-white for backgrounds
          100: '#dbeafe', // Light borders
          500: '#3b82f6', // Primary accent (buttons, active states)
          800: '#1e40af', // Deep professional blue (TopNav, heavy text)
          900: '#1e3a8a', // Darkest blue for ultimate contrast
        },
        surface: '#ffffff',     // Pure white for cards
        background: '#f8fafc',  // Off-white for the main app background
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', // That subtle floating shadow you wanted
      }
    },
  },
  plugins: [],
}