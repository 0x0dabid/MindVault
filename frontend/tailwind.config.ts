import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ritual design system tokens (ritual-dapp-design skill)
        ritual: {
          black:    '#000000',
          elevated: '#111827',
          surface:  '#1F2937',
          green:    '#19D184',
          lime:     '#BFFF00',
          pink:     '#FF1DCE',
          gold:     '#FACC15',
          red:      '#EF4444',
        },
        // MindVault palette (kept for existing components)
        vault: {
          bg:      '#07080A',
          surface: '#0F1117',
          border:  '#1A1D2A',
          teal:    '#5EEAD4',
          'teal-dim': '#2DD4BF40',
          text:    '#E8E8ED',
          muted:   '#6B7085',
          crisis:  '#FEF3C7',
          'crisis-border': '#F59E0B',
        },
      },
      fontFamily: {
        // Ritual design system fonts
        display: ['var(--font-display)', 'Archivo Black', 'system-ui', 'sans-serif'],
        body:    ['var(--font-body)',    'Barlow',        'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)',    'JetBrains Mono', 'Fira Code', 'monospace'],
        // Aliases for existing components that use font-serif / font-mono
        serif:   ['var(--font-display)', 'Georgia', 'serif'],
        sans:    ['var(--font-body)',    'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 30px -5px rgba(25,209,132,0.25)',
        'glow-pink':  '0 0 30px -5px rgba(255,29,206,0.2)',
        'glow-teal':  '0 0 20px -5px rgba(94,234,212,0.2)',
        card:         '0 4px 40px -12px rgba(0,0,0,0.6)',
      },
      animation: {
        breathe:       'breathe 4s ease-in-out infinite',
        'fade-in':     'fadeIn 0.3s ease-out',
        'slide-up':    'slideUp 0.3s ease-out',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
        shimmer:       'shimmer 2.5s linear infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(94,234,212,0.1)' },
          '50%':       { boxShadow: '0 0 0 8px rgba(94,234,212,0.0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(25,209,132,0.0)' },
          '50%':       { boxShadow: '0 0 16px 4px rgba(25,209,132,0.15)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
