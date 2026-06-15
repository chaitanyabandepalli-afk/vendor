/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0c10',
        darkCard: 'rgba(26, 27, 43, 0.45)',
        brandPurple: '#c084fc',
      }
    },
  },
  plugins: [],
}
