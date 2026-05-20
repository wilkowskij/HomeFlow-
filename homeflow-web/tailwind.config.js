/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand: Rich Gold ─────────────────────────────────────────────────
        brand: {
          50:  '#1a1508',   // gold-tinted darkest surface
          100: '#2a2210',   // gold-tinted dark surface
          200: '#3d3118',   // gold-tinted elevated
          300: '#E8C670',   // light gold
          400: '#DCC050',   // medium gold
          500: '#D4AF37',   // primary gold
          600: '#B8941E',   // deep gold (hover/dark)
          700: '#9A7A10',
          800: '#7D6108',
          900: '#5C4600',
        },
        // ── Warm: Remapped to Charcoal/Black ─────────────────────────────────
        warm: {
          50:  '#0F0F0F',   // deepest — main page bg
          100: '#121212',   // app bg
          200: '#1C1C1C',   // card bg / secondary surface
          300: '#2A2A2A',   // elevated surface
          400: '#3A3A3A',   // borders / dividers
        },
        // ── Slate: Inverted for dark theme ────────────────────────────────────
        slate: {
          50:  '#1C1C1C',   // bg-slate-50  → dark surface
          100: '#252525',   // bg-slate-100 → elevated dark
          200: '#2A2A2A',   // borders
          300: '#3A3A3A',   // muted border
          400: '#666666',   // muted icons
          500: '#A8A8A8',   // secondary text
          600: '#C0C0C0',   // tertiary text
          700: '#D8D8D8',   // secondary primary text
          800: '#EEEEEE',   // near-white
          900: '#FFFFFF',   // primary text → white
        },
        // ── Accent ────────────────────────────────────────────────────────────
        accent: {
          50:  '#1a1208',
          100: '#2a1e10',
          200: '#3d2d18',
          500: '#D4AF37',
          600: '#B8941E',
        },
        success: '#4ade80',
        warning: '#D4AF37',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card:        '0 8px 32px rgba(0,0,0,0.40), 0 1px 0 rgba(212,175,55,0.08)',
        'card-hover':'0 16px 48px rgba(0,0,0,0.50), 0 1px 0 rgba(212,175,55,0.15)',
        float:       '0 4px 24px rgba(212,175,55,0.25)',
        'neu-inset': 'inset 0 2px 8px rgba(0,0,0,0.40)',
        gold:        '0 4px 20px rgba(212,175,55,0.30)',
        'gold-lg':   '0 8px 32px rgba(212,175,55,0.40)',
      },
      animation: {
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.2s ease-out',
        'bounce-soft': 'bounceSoft 0.4s ease-out',
        'pulse-ring':  'pulseRing 1.5s ease-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        slideUp:    { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        bounceSoft: { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.04)' } },
        pulseRing:  { '0%': { transform: 'scale(0.95)', opacity: '0.7' }, '100%': { transform: 'scale(1.2)', opacity: '0' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
