/* eslint-disable @typescript-eslint/no-require-imports */
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: ["hover:text-white", "hover:text-zinc-950"],
  theme: {
    extend: {
      maxWidth: { "7xl": "1440px" },
      colors: {
        /* Editorial FreshPick palette. Semantic aliases preserve status styling. */
        emerald: {
          50: "#F8F7F2",
          100: "#EFECE3",
          200: "#DADBD0",
          300: "#B3C0AB",
          400: "#84977A",
          500: "#2F6B45",
          600: "#2F6B45",
          700: "#2F6B45",
          800: "#2F6B45",
          900: "#2F6B45",
          950: "#102E1E",
        },
        orange: {
          50: "#fff7f1",
          100: "#feebdc",
          200: "#fbd3b7",
          300: "#f5b384",
          400: "#2F6B45",
          500: "#2F6B45",
          600: "#d96d31",
          700: "#b65225",
          800: "#923f24",
          900: "#763621",
          950: "#40190e",
        },
        brand: {
          green: "#2F6B45",
          leaf: "#61B547",
          ink: "#171815",
          tangerine: "#F4971A",
          sage: "#84977A",
          paper: "#EFECE3",
          amber: "#E6A23C",
          clay: "#A45F23",
          "green-deep": "#102E1E",
          orange: "#E6A23C",
          lime: "#84977A",
          cream: "#F8F7F2",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
      },
    },
    fontFamily: {
      default: ["var(--font-default)"],
      sans: ["var(--font-sans)", "sans-serif"],
      serif: ["var(--font-heading)", "serif"],
      accent: ["var(--font-accent)", "serif"],
      heading: ["var(--font-heading)", "serif"],
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
