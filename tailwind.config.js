/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'curious-blue': '#007ACC',
        'inquisitive-red': '#FE0000',
        'golly-gold': '#F9BB06',
        'why-white': '#FCFAFA',
        'heedless-black': '#00080D',
      },
    },
  },
  plugins: [],
}; 