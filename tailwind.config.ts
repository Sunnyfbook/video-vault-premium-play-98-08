import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
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
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // Keeping this as is, will use brand.accent more
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        brand: {
          DEFAULT: '#1E3A8A', // Deep Blue
          accent: '#D946EF', // Vibrant Pink/Purple accent - was #DC2626 (Red)
          light: '#EFF6FF', // Light blue for backgrounds/accents
        },
        video: {
          background: '#0A0A0A', // Darker video background
          control: 'rgba(255, 255, 255, 0.85)',
        },
        ads: {
          background: 'hsl(var(--muted))', // Use muted for ad background for theme consistency
          border: 'hsl(var(--border))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)', // Adding xl radius
        '2xl': 'calc(var(--radius) + 8px)', // Adding 2xl radius
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' }, // Added subtle Y transform
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' }, // Added scale
          '50%': { opacity: '0.8', transform: 'scale(0.98)' }
        },
        'hover-lift': { // New animation
          '0%': { transform: 'translateY(0)', boxShadow: 'var(--tw-shadow)' },
          '100%': { transform: 'translateY(-4px)', boxShadow: 'var(--tw-shadow-lg)' }
        },
        'gradient-flow': { // New animation for backgrounds
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out forwards', // Ensure it stays at final state
        'fade-out': 'fade-out 0.3s ease-out forwards',
        'pulse-soft': 'pulse-soft 2.5s infinite ease-in-out',
        'hover-lift': 'hover-lift 0.3s ease-out forwards', // For card hover
        'gradient-flow': 'gradient-flow 15s ease infinite', // For dynamic backgrounds
      },
      boxShadow: { // Added more distinct shadow variants
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
