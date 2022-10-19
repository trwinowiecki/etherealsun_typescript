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
        primary: {
          DEFAULT: 'var(--color-primary)',
          darker: 'var(--color-primary-darker)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          darker: 'var(--color-secondary-darker)',
        },
        negative: 'var(--color-negative)',
        positive: 'var(--color-positive)',
        'primary-text': 'var(--color-text-primary)',
        'primary-background': {
          DEFAULT: 'var(--background-primary)',
          darker: 'var(--background-primary-darker)',
        },
        'sec-background': 'var(--background-sec)',
      },
    },
    backgroundColor: (theme) => ({
      ...theme('colors'),
    }),
  },
  variants: {
    backgroundColor: ['active'],
  },
  plugins: [],
};
