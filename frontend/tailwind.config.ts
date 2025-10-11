import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "oklch(0.9 0.01 250)",
        input: "oklch(0.9 0.01 250)",
        ring: "oklch(0.41 0.07 182)",
        background: "oklch(0.97 0.01 250)",
        foreground: "oklch(0.18 0.04 250)",
        primary: {
          DEFAULT: "#095256", 
          foreground: "oklch(0.98 0.01 90)",
        },
        secondary: {
          DEFAULT: "oklch(0.87 0.15 95)",
          foreground: "oklch(0.2 0.02 90)",
        },
        destructive: {
          DEFAULT: "oklch(0.55 0.2 25)",
          foreground: "oklch(0.98 0 0)",
        },
        muted: {
          DEFAULT: "oklch(0.95 0.01 250)",
          foreground: "oklch(0.35 0.02 250)",
        },
        accent: {
          DEFAULT: "oklch(0.95 0.01 250)",
          foreground: "oklch(0.2 0.02 250)",
        },
        popover: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.18 0.04 250)",
        },
        card: {
          DEFAULT: "oklch(1 0 0)",
          foreground: "oklch(0.18 0.04 250)",
        },
      },
      borderRadius: {
        lg: "0.65rem",
        md: "calc(0.65rem - 2px)",
        sm: "calc(0.65rem - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};

export default config;
