export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#DEEBFF",
          100: "#B3D4FF",
          200: "#4C9AFF",
          500: "#0052CC",
          600: "#0747A6",
          700: "#00388B",
        },
        staffify: {
          dark: "#172B4D",
          text: "#172B4D",
          subtle: "#6B778C",
          border: "#DFE1E6",
          bg: "#F4F5F7",
        },
        dark: {
          bg: "#0B132B",
          surface: "#111C3D",
          card: "#16224A",
          border: "#202E5C",
          subtle: "#8993A4",
          text: "#F4F5F7",
        },
      },
    },
  },
  plugins: [],
};
