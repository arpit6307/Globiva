/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#8B1D1D',
        'brand-red-dark': '#5E1313',
        'brand-red-light': '#F7E3E3',
        'ink-black': '#111111',
        'paper-white': '#FFFDF9',
        'card-white': '#FFFFFF',
        'success-green': '#1F9D55',
        'error-red': '#D7263D',
        'warning-yellow': '#FFC93C',
      },
      fontFamily: {
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'brutal': '6px 6px 0px 0px #111111',
        'brutal-sm': '3px 3px 0px 0px #111111',
        'brutal-lg': '10px 10px 0px 0px #111111',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
}
