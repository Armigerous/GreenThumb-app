/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors - Green palette
        // Use brand-600 as the primary color for buttons, links and accents
        // Use brand-700+ for hover states and darker accents
        // Use brand-25 through brand-200 for backgrounds, borders and subtle accents
        brand: {
          25: "#F7FAF5", // Extremely light background
          50: "#ECF4E7", // Light background
          100: "#D6E8CC", // Light border
          200: "#BDDDB1", // Border
          300: "#A5D196", // Light accent
          400: "#8EC57B", // Medium accent
          500: "#77B860", // Regular accent
          600: "#5E994B", // Primary brand color - Good contrast on white
          700: "#4A7A3B", // Hover state
          800: "#355A2B", // Dark accent - Good for text on light backgrounds
          900: "#233C1B", // Very dark - High contrast text on light backgrounds
          950: "#162814", // Ultra dark - For special cases
        },
        // Cream/Neutral palette
        // Use cream-50 for backgrounds
        // Use cream-200/300 for borders
        // Use cream-400/500 for disabled text
        // Use cream-600/700 for secondary text with good contrast
        // Use cream-800 (foreground) for primary text
        cream: {
          50: "#fffefa", // Background color
          100: "#fffaef", // Subtle background variation
          200: "#fff8e8", // Light borders
          300: "#ded8ca", // Border color
          400: "#9e9a90", // Light text - NOT for small text (poor contrast)
          500: "#807c74", // Medium text - USE SPARINGLY on white bg
          600: "#636059", // Medium-dark text - Better for white bg
          700: "#484540", // Dark text with good contrast - Recommended for most text on white
          800: "#2e2c29", // Foreground text - Best contrast on white
          900: "#030303", // Ultra dark - For special cases
        },
        // Accent/Yellow palette
        // Use for badges, warnings, and highlights
        // Use accent-700+ for text on light backgrounds
        // Use accent-200/300 for badge backgrounds
        accent: {
          50: "#ffea92", // Very light background
          100: "#ffe264", // Light accent
          200: "#ffd900", // Badge background
          300: "#debc00", // Border
          400: "#bea100", // Medium accent
          500: "#9e8600", // Medium accent - OK for large text
          600: "#806c00", // Medium-dark accent
          700: "#635300", // Dark accent
          800: "#483b00", // Dark amber text for badges - Good contrast on light backgrounds
          900: "#161100", // Very dark - High contrast
        },
        // Semantic colors
        background: "#fffefa", // Cream 50
        foreground: "#2e2c29", // Cream 800
        primary: {
          DEFAULT: "#5E994B", // Brand 600
          foreground: "#fffefa", // Cream 50
        },
        destructive: {
          DEFAULT: "#E50000", // RED
          foreground: "#fffefa", // cream 50
        },
      },
    },
  },
  plugins: [],
};
