/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          500: '#a855f7',
          600: '#9333ea',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 16px 0 rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px 0 rgba(0,0,0,0.12)',
        float: '0 4px 24px 0 rgba(14,165,233,0.18)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
