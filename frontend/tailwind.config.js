/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        
        // 1. DEFINE THE MOVEMENT STEPS HERE
        keyframes: {
          slideInRight: {
            '0%': { transform: 'translateX(100%)' },
            '100%': { transform: 'translateX(0)' },
          },
          fadeIn: {
            '0%': { opacity: '0', transform: 'translateY(4px)' },
            '100%': { opacity: '1', transform: 'translateY(0)' },
          },
        },
  
        // 2. CREATE THE TAILWIND UTILITY CLASSES HERE
        animation: {
          slideInRight: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          fadeIn: 'fadeIn 0.2s ease-out forwards',
        },
  
      },
    },
    plugins: [],
  }