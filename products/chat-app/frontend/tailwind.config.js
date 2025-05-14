/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        satoshi: "#f7931a",
        navy: "#0b1f33",
        grain: "#fdfdfd"
      },
      backgroundImage: {
        sigil: "url('/assets/the_seeking_blade_gold.png')"
      }
    },
  },
  plugins: [],
} 