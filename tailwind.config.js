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
    extend: {
      backgroundImage: {
        "home": "url('/assets/bg.png')" // Adiciona sua imagem de fundo personalizada
      }
    },
  },
  plugins: [],
}

