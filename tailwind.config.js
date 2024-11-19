/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js}", // Inclui arquivos HTML e JS na pasta src e subpastas
    "./index.html"   // Inclui seu arquivo HTML principal
  ],
  theme: {
    fontFamily:{
      'sans': ['Josefin Sans', 'sans-serif'],
      'links': ['Staatliches', 'serif']
    },
    extend: {
      backgroundImage: {
        "home": "url('/assets/bg.png')"
      }
    },
  },
  plugins: [],
};
