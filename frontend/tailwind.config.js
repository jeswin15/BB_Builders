import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Times New Roman"', 'Times', 'serif'],
      },
      colors: {
        // Exact Orange from BB Builders Logo
        blue: {
          50: '#fff3ea',
          100: '#ffe4c5',
          200: '#ffc885',
          300: '#ffa63f',
          400: '#ff8a0b',
          500: '#f96b07', // Base Logo Orange
          600: '#ea5400',
          700: '#c23c02',
          800: '#9a2f0a',
          900: '#7c280b',
          950: '#431103',
        },
        // Exact Charcoal Gray from BB Builders Logo
        slate: {
          50: '#f5f6f8',
          100: '#e4e7ec',
          200: '#ccd3dc',
          300: '#a7b4c4',
          400: '#7a8fa5',
          500: '#59718a',
          600: '#43586f',
          700: '#36475a',
          800: '#2f3c4c',
          900: '#2a323c', // Base Logo Dark Gray
          950: '#1b2027',
        }
      }
    },
  },
  plugins: [],
}
