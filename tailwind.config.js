/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./**/*.{html,js,ejs}",
    "./public/**/*.html",
    "./src/index.js",
    '!./node_modules/**/*',
  ],
  theme: {
    fontFamily:{
      'sans': ['Oswald', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
}

