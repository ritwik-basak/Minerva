/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        cream: {
          50: "#fdfcf8",
          100: "#faf8f2",
          200: "#f5f0e8",
          300: "#ede4d3",
        },
        gold: {
          300: "#d4a853",
          400: "#c49a3c",
          500: "#b8860b",
          600: "#9a7209",
        },
        obsidian: {
          800: "#1a1a2e",
          900: "#0f0f1a",
        }
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
}
