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
      colors: {
        /* The 60/30/10 fresh-market palette. Legacy emerald/orange aliases
           keep existing pages in the same brand family. */
        emerald: {
          50: "#f3f8ef",
          100: "#e4f0dc",
          200: "#c9dfb9",
          300: "#abc98c",
          400: "#6E9875",
          500: "#2F6B45",
          600: "#2F6B45",
          700: "#2F6B45",
          800: "#2F6B45",
          900: "#2F6B45",
          950: "#234F34",
        },
        orange: {
          50: "#fff7f1",
          100: "#feebdc",
          200: "#fbd3b7",
          300: "#f5b384",
          400: "#E6A23C",
          500: "#E6A23C",
          600: "#d96d31",
          700: "#b65225",
          800: "#923f24",
          900: "#763621",
          950: "#40190e",
        },
        brand: {
          green: "#2F6B45",
          amber: "#E6A23C",
          "green-deep": "#234F34",
          orange: "#E6A23C",
          lime: "#6E9875",
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
