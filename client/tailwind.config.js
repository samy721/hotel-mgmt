// client/tailwind.config.js
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}', 
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], 
      },
      colors: {
        primary: { 
          light: '#67e8f9',
          DEFAULT: '#06b6d4',
          dark: '#0e7490',
        }
      }
    },
  },
  plugins: [
    forms, 
  ],
};