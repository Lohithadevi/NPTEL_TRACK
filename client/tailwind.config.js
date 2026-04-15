/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 900: '#0f172a', 800: '#1e293b', 700: '#334155' },
        slate: { 600: '#475569', 400: '#94a3b8', 200: '#e2e8f0' },
      },
      fontFamily: { sans: ['Inter', 'Roboto', 'sans-serif'] },
    },
  },
  plugins: [],
};
