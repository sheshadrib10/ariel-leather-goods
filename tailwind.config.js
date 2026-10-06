/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ariel: {
          espresso: "#17120e",
          dark: "#231b14",
          cognac: "#4a2d1b",
          saddle: "#7c4826",
          amber: "#b87333",
          tan: "#cfa675",
          sand: "#f4ede2",
          cream: "#fbf8f3",
          gold: "#d4af37",
          goldLight: "#f3e5ab",
          olive: "#3d4035",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
