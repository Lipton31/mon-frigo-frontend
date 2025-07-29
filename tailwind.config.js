    // mon-frigo-frontend/tailwind.config.js
    /** @type {import('tailwindcss').Config} */
    export default {
      // Indique à Tailwind quels fichiers scanner pour trouver les classes CSS
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      // Active le mode sombre basé sur la classe 'dark' sur l'élément <html>
      darkMode: 'class',
      theme: {
        extend: {
          // Définit la police Poppins comme police par défaut
          fontFamily: {
            sans: ['Poppins', 'sans-serif'],
          },
          // Animations personnalisées pour une meilleure réactivité perçue
          keyframes: {
            'fade-in': {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            'fade-in-down': {
              '0%': { opacity: '0', transform: 'translateY(-10px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            'scale-in': {
              '0%': { transform: 'scale(0.95)', opacity: '0' },
              '100%': { transform: 'scale(1)', opacity: '1' },
            },
          },
          animation: {
            'fade-in': 'fade-in 0.5s ease-out forwards',
            'fade-in-down': 'fade-in-down 0.4s ease-out forwards',
            'scale-in': 'scale-in 0.3s ease-out forwards',
          },
        },
      },
      plugins: [
        require('@tailwindcss/typography'), // Active le plugin typography
      ],
    }
    