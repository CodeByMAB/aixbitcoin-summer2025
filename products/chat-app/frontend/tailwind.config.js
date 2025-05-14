/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'background': '#fdfdfd',
        'text': '#0b1f33',
        'accent': '#f7931a',
      },
      fontFamily: {
        'sans': ['Lato', 'sans-serif'],
        'serif': ['"Cormorant Garamond"', 'serif'],
      },
      backgroundImage: {
        'paper-texture': "url('assets/paper-texture.png')",
      },
    },
  },
  plugins: [],
} 