/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,ejs}", // Monitorar todos os arquivos HTML, JS e EJS dentro de 'src'
    './src/index.js',           // Monitorar 'index.js' especificamente
    '!./node_modules/**/*',     // Ignorar arquivos dentro de 'node_modules'
  ],
  theme: {
    fontFamily: {
      'sans': ['Oswald', 'sans-serif'],
    },
    extend: {},
  },
  plugins: [],
}
