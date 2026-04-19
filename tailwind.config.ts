import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        push: {
          DEFAULT: "#185FA5",
          50: "#E8F1FA",
          500: "#185FA5",
          600: "#124A82",
          700: "#0D365F"
        },
        pull: {
          DEFAULT: "#1D9E75",
          50: "#E6F7F0",
          500: "#1D9E75",
          600: "#167D5C",
          700: "#105F46"
        },
        legs: {
          DEFAULT: "#BA7517",
          50: "#FBF1E3",
          500: "#BA7517",
          600: "#935C11",
          700: "#6D430C"
        },
        ink: {
          50: "#F7F8FA",
          100: "#EDEFF3",
          800: "#1B1F24",
          900: "#0E1116"
        }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"]
      },
      boxShadow: {
        card: "0 1px 2px rgb(0 0 0 / 0.06), 0 4px 12px rgb(0 0 0 / 0.04)"
      }
    }
  },
  plugins: []
};

export default config;
