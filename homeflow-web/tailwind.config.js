/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f7f4',
          100: '#d5ebe1',
          200: '#aad5c5',
          300: '#7dbdaa',
          400: '#6ec5b0',  // teal accent — CTAs, progress
          500: '#a8c4b0',  // sage primary
          600: '#5f7a6b',  // primary dark
          700: '#4a6055',
          800: '#374840',
          900: '#252f29',
        },
        accent: {
          50:  '#fdf6f4',
          100: '#f9e4de',
          200: '#f0c4b8',
          500: '#e8b4a8',  // soft blush/coral — alerts, saved
          600: '#d4917f',
        },
        warm: {
          50:  '#faf8f3',  // lightest page bg
          100: '#f5f0e8',  // warm beige
          200: '#e8e4d9',  // soft stone border/bg
          300: '#d4cfc4',  // medium stone
          400: '#b8b2a6',
        },
        success: '#7cb39a',
        warning: '#e8b08c',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',  // 20px — standard card/button
        '3xl': '1.5rem',   // 24px — large cards
      },
      boxShadow: {
        card:       '0 8px 25px rgba(0,0,0,0.07), inset 2px 2px 4px rgba(255,255,255,0.65), inset -3px -3px 6px rgba(0,0,0,0.05)',
        'card-hover':'0 12px 32px rgba(0,0,0,0.10), inset 2px 2px 4px rgba(255,255,255,0.65), inset -3px -3px 6px rgba(0,0,0,0.07)',
        float:      '0 4px 24px rgba(110,197,176,0.30)',
        'neu-inset':'inset 3px 3px 6px rgba(0,0,0,0.07), inset -3px -3px 6px rgba(255,255,255,0.70)',
      },
      animation: {
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
        'pulse-ring':  'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        slideUp:    { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        bounceSoft: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.04)' } },
        pulseRing:  { '0%': { transform: 'scale(0.95)', opacity: '0.7' }, '100%': { transform: 'scale(1.2)', opacity: '0' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
