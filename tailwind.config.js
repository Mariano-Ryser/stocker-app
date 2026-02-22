/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./frontend/**/*.{js,ts,jsx,tsx}", // solo tus archivos de código
    "!./frontend/node_modules/**/*.{js,ts,jsx,tsx,css}", // excluye node_modules completamente, incluidos CSS
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}