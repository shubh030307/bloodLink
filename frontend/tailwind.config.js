/** @type {import('tailwindcss').Config} */
export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        success: {
          DEFAULT: "hsl(142 70.6% 45.3%)",
          foreground: "hsl(210 40% 98%)",
        },
        warning: {
          DEFAULT: "hsl(38 92.1% 50.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        info: {
          DEFAULT: "hsl(198 93.2% 59.6%)",
          foreground: "hsl(210 40% 98%)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        blood: {
          50: '#fcf3f3',
          100: '#fadcdc',
          200: '#f5baba',
          300: '#ee8b8b',
          400: '#e55c5c',
          500: '#dc2626', // Standard Red
          600: '#C61313', // Deep Red matching logo
          700: '#a31010',
          800: '#851010',
          900: '#6e1111',
          950: '#3d0404',
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.7)',
          dark: 'rgba(0, 0, 0, 0.5)',
          border: 'rgba(255, 255, 255, 0.2)',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      }
    },
  },
  plugins: [],
}
