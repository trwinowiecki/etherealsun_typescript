/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      screens: {
        xs: '480px'
      },
      colors: {
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          darker: withOpacity('--color-primary-darker')
        },
        secondary: {
          DEFAULT: withOpacity('--color-secondary'),
          darker: withOpacity('--color-secondary-darker')
        },
        negative: withOpacity('--color-negative'),
        positive: withOpacity('--color-positive'),
        'primary-text': withOpacity('--color-text-primary'),
        'primary-background': {
          DEFAULT: withOpacity('--background-primary'),
          darker: withOpacity('--background-primary-darker')
        },
        'sec-background': withOpacity('--background-sec'),
        white: withOpacity('--white-override'),
        black: withOpacity('--black-override')
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite'
      }
    },
    backgroundColor: theme => ({
      ...theme('colors')
    })
  },
  variants: {
    backgroundColor: ['active']
  },
  plugins: []
};
