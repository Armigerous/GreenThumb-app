/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          25: "#F7FAF5",
          50: "#ECF4E7",
          100: "#D6E8CC",
          200: "#BDDDB1",
          300: "#A5D196",
          400: "#8EC57B",
          500: "#77B860",
          600: "#5E994B",
          700: "#4A7A3B",
          800: "#355A2B",
          900: "#233C1B",
          950: "#162814",
        },
        cream: {
          50: "#fffefa",
          100: "#fffaef",
          200: "#fff8e8",
          300: "#ded8ca",
          400: "#9e9a90",
          500: "#807c74",
          600: "#636059",
          700: "#484540",
          800: "#161513",
          900: "#030303",
        },
        accent: {
          50: "#ffea92",
          100: "#ffe264",
          200: "#ffd900",
          300: "#debc00",
          400: "#bea100",
          500: "#9e8600",
          600: "#806c00",
          700: "#635300",
          800: "#483b00",
          900: "#161100",
        },
        background: "#fff8e8", // Cream 200
        foreground: "#2e2c29", // Cream 800
        primary: {
          DEFAULT: "#5E994B", // Brand 600
          foreground: "#fffefa", // Cream 800
        },
        destructive: {
          DEFAULT: "#E50000", // RED
          foreground: "#161100", // Accent 900
        },
      },
    },
  },
  plugins: [],
};
