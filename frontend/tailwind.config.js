/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#03A65A',
        noir: '#111827',
        header: '#061141',
        vert: '#018777',
        gris: '#D1D5DB',
        bleu: '#D5EDF6',
        slot: '#F2F7FA',
        side: '#013844',
        
      },
    },
  },
  plugins: [],
}
