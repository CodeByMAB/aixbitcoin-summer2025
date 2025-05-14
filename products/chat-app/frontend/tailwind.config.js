/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f5f5f5',
        text: '#333333',
        accent: '#4a90e2',
        primary: '#2c3e50',
      },
      fontFamily: {
        'sans': ['Lato', 'sans-serif'],
        'serif': ['"Cormorant Garamond"', 'serif'],
      },
    },
  },
  plugins: [],
} 