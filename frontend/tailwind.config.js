/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ed',
          100: '#ffedd5',
          400: '#fb923c',
          500: '#FF6B35',
          600: '#ea580c',
          700: '#c2410c',
        },
        secondary: {
          400: '#facc15',
          500: '#FFD700',
          600: '#ca8a04',
        },
        kids: {
          purple: '#7C3AED',
          pink: '#EC4899',
          teal: '#14B8A6',
          green: '#22C55E',
          blue: '#3B82F6',
        }
      },
      fontFamily: {
        kids: ['"Nunito"', '"Comic Sans MS"', 'cursive'],
        display: ['"Fredoka One"', '"Nunito"', 'cursive'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'kids': '0 8px 30px rgba(255, 107, 53, 0.3)',
        'card': '0 4px 20px rgba(0,0,0,0.08)',
        'lg-colored': '0 10px 40px rgba(124, 58, 237, 0.2)',
      }
    },
  },
  plugins: [],
};
