import type { Config } from 'tailwindcss';

// Custom radial gradient plugin
const plugin = require('tailwindcss/plugin');
const radialGradientPlugin = plugin(
  function ({ matchUtilities, theme }: { matchUtilities: any, theme: any }) {
    matchUtilities(
      {
        'bg-grid': (value: any) => ({
          backgroundImage: `url("/grid.svg")`,
        }),
        'bg-grid-small': (value: any) => ({
          backgroundImage: `url("/grid-small.svg")`,
        }),
        'bg-grid-cyan-400/10': (value: any) => ({
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='%2322d3ee' stroke-opacity='0.1'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e")`,
        }),
      },
      { values: theme('backgroundColor') }
    )
  }
);


export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // MD3 Surface System
        surface: {
          DEFAULT: 'hsl(var(--surface, var(--background)))',
          dim: 'hsl(var(--surface-dim, var(--background)))',
          bright: 'hsl(var(--surface-bright, var(--card)))',
        },
        'surface-container': {
          DEFAULT: 'hsl(var(--surface-container))',
          low: 'hsl(var(--surface-container-low, var(--surface-container)))',
          high: 'hsl(var(--surface-container-high, var(--surface-container)))',
          highest: 'hsl(var(--surface-container-highest, var(--card)))',
        },
        'surface-variant': {
          DEFAULT: 'hsl(var(--surface-variant))',
          foreground: 'hsl(var(--on-surface-variant))',
        },
        // MD3 On-Surface Colors
        'on-surface': {
          DEFAULT: 'hsl(var(--on-surface, var(--foreground)))',
          variant: 'hsl(var(--on-surface-variant))',
        },
        'on-primary': 'hsl(var(--on-primary, var(--primary-foreground)))',
        'on-secondary': 'hsl(var(--on-secondary, var(--secondary-foreground)))',
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        // MD3 Elevation Shadows
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.30), 0 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0 1px 3px 0 rgba(0, 0, 0, 0.30), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0 1px 3px 0 rgba(0, 0, 0, 0.30), 0 4px 8px 3px rgba(0, 0, 0, 0.15)',
        'elevation-4': '0 2px 6px 2px rgba(0, 0, 0, 0.30), 0 8px 24px 4px rgba(0, 0, 0, 0.15)',
        'elevation-5': '0 4px 8px 3px rgba(0, 0, 0, 0.30), 0 16px 48px 4px rgba(0, 0, 0, 0.15)',
        // Legacy shadows for backward compatibility
        'md3-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md3-2': '0 1px 3px 1px rgba(0, 0, 0, 0.06)',
        'md3-3': '0 2px 6px 2px rgba(0, 0, 0, 0.08)',
        'md3-4': '0 4px 8px 3px rgba(0, 0, 0, 0.10)',
        'md3-5': '0 6px 10px 4px rgba(0, 0, 0, 0.12)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        cinzel: ['var(--font-cinzel)'],
      },
      fontSize: {
        // MD3 Typography Scale
        'display-large': ['3.5rem', { lineHeight: '4rem', fontWeight: '400' }],
        'display-medium': ['2.8125rem', { lineHeight: '3.25rem', fontWeight: '400' }],
        'display-small': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '400' }],
        'headline-large': ['2rem', { lineHeight: '2.5rem', fontWeight: '400' }],
        'headline-medium': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '400' }],
        'headline-small': ['1.5rem', { lineHeight: '2rem', fontWeight: '400' }],
        'title-large': ['1.375rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'title-medium': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }],
        'title-small': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-large': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'label-medium': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-small': ['0.6875rem', { lineHeight: '0.875rem', fontWeight: '500' }],
        'body-large': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-medium': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-slow': {
          '50%': { opacity: '0.7' },
        },
        'check-circle': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 5px hsl(var(--primary) / 0.4)' },
          '50%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.6)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'check-circle': 'check-circle 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scale-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-down': 'slide-down 0.4s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    radialGradientPlugin,
    plugin(function ({ addVariant, addUtilities }: { addVariant: any, addUtilities: any }) {
      addVariant('reduce-motion', '.reduce-motion &')
      addUtilities({
        '.pb-safe': {
          'padding-bottom': 'env(safe-area-inset-bottom)',
        },
        '.pt-safe': {
          'padding-top': 'env(safe-area-inset-top)',
        },
        '.mb-safe': {
          'margin-bottom': 'env(safe-area-inset-bottom)',
        },
        '.mt-safe': {
          'margin-top': 'env(safe-area-inset-top)',
        },
      })
    })
  ],
} satisfies Config;
