/** @type {import('tailwindcss').Config} */
module.exports = {
  // Archivos donde Tailwind busca clases para incluir en el bundle
  content: [
    "./src/**/*.{html,ts,css}",
  ],
  // Habilitar modo oscuro basado en clase CSS en <html>
  darkMode: 'class',
  theme: {
    extend: {
      // Paleta de colores personalizada NYT
      colors: {
        nyt: {
          black: '#121212',
          white: '#FFFFFF',
          gray: {
            100: '#F7F7F5',
            200: '#E2E2E2',
            300: '#C8C8C8',
            500: '#727272',
            700: '#333333',
          },
          red: '#D0021B',
          blue: '#326891',
        }
      },
      fontFamily: {
        // Fuentes editoriales estilo NYT
        serif: ['"Libre Baskerville"', '"Georgia"', 'serif'],
        sans: ['"Libre Franklin"', '"Helvetica Neue"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
