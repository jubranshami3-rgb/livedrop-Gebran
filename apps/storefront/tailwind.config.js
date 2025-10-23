/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        // Using only Tailwind's default spacing scale
        // No custom spacing values
      },
      maxWidth: {
        '8xl': '88rem',
      }
    },
  },
  plugins: [],
}