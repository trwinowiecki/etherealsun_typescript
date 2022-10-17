/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'standard-bg': {
          DEFAULT: '#FAF1E2',
          darker: '#F0E0C5',
        },
      },
    },
  },
  plugins: [],
};
