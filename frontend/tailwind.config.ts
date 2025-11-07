import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "float": {
          "0%, 100%": { transform: "translateY(-3px)" },
          "50%": { transform: "translateY(3px)" }
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.45" },
          "50%": { opacity: "0.85" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "fade-in": "fade-in 1s ease forwards",
        "glow-pulse": "glow-pulse 5s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;
