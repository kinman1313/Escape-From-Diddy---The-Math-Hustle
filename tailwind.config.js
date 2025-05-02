// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Main game palette
        mathGreen: 'var(--math-green, #00ffcc)',
        diddyDanger: 'var(--diddy-danger, #ff003c)',
        midnight: 'var(--midnight, #030a1c)',
        
        // Extended palette for UI
        neonPink: '#ff00a2',
        neonBlue: '#00a2ff',
        neonPurple: '#9900ff',
        darkMidnight: '#020810',
        lightMidnight: '#0a1a33',
        success: '#00cc88',
        warning: '#ffcc00',
        error: '#ff3c66',
        
        // Gradients defined in CSS
        gradientPrimary: 'linear-gradient(135deg, var(--math-green), #00cc88)',
        gradientDanger: 'linear-gradient(135deg, var(--diddy-danger), #ff0066)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        game: ['VT323', 'monospace'], // Pixelated game font
        display: ['Audiowide', 'cursive'], // Fun display font
        mono: ['JetBrains Mono', 'monospace'],
      },
      
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.5s ease-out forwards',
        'scale-in': 'scaleIn 0.4s ease-out forwards',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { textShadow: '0 0 5px rgba(0, 255, 204, 0.5), 0 0 10px rgba(0, 255, 204, 0.3)' },
          '100%': { textShadow: '0 0 10px rgba(0, 255, 204, 0.7), 0 0 20px rgba(0, 255, 204, 0.5), 0 0 30px rgba(0, 255, 204, 0.3)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: 0 },
          '100%': { transform: 'translateX(0)', opacity: 1 },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
      },
      
      boxShadow: {
        'neon': '0 0 5px rgba(0, 255, 204, 0.5), 0 0 20px rgba(0, 255, 204, 0.3)',
        'neon-hover': '0 0 10px rgba(0, 255, 204, 0.7), 0 0 30px rgba(0, 255, 204, 0.5)',
        'danger': '0 0 5px rgba(255, 0, 60, 0.5), 0 0 20px rgba(255, 0, 60, 0.3)',
        'panel': '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 255, 204, 0.1)',
      },
      
      backgroundImage: {
        'math-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ffcc' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-game': 'linear-gradient(135deg, #030a1c 0%, #0f172a 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--math-green) 0%, transparent 70%)',
      },
      
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}