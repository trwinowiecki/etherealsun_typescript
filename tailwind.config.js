/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        'standard-bg': {
          DEFAULT: '#FAF1E2',
          darker: '#F0E0C5',
        },
        primary: '#C19728',
        accent: {
          DEFAULT: '#62BD72',
          darker: '#376B40',
        },
      },
    },
  },
  plugins: [],
};
