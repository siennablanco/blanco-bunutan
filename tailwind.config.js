/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        christmas: {
          red: '#D42426',
          darkRed: '#991B1B',
          green: '#165B33',
          darkGreen: '#114B27',
          mint: '#10B981',
          gold: '#FBBF24',
          yellow: '#F59E0B',
          cream: '#FFFBEB',
          snow: '#F0F9FF',
          pine: '#14532D',
          berry: '#E11D48',
        }
      },
      fontFamily: {
        holiday: ['"Mountains of Christmas"', 'cursive', 'sans-serif'],
        fun: ['"Quicksand"', '"Nunito"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2.5s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shake': 'shake 0.6s cubic-bezier(.36,.07,.19,.97) both',
        'wiggle': 'wiggle 1s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0) rotate(-2deg)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0) rotate(2deg)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0) rotate(-4deg)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0) rotate(4deg)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        }
      }
    },
  },
  plugins: [],
}

