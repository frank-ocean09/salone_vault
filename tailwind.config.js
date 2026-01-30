/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2EAF7D', // Bright Teal
          dark: '#02353C', // Deep Dark Teal
          light: '#3FD0C9', // Cyan
        },
        brand: {
          darkest: '#011F24',
          darker: '#012A31',
          dark: '#02353C',
          'lighter-dark': '#023F48',
          green: '#449342',
          teal: '#2EAF7D',
          cyan: '#3FD0C9',
          pale: '#C1F6ED',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
