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
          bg: "#090D14",
          surface: "#0F131C",
          card: "#151B26",
          well: "#1C2331",
          hover: "#222A3A",
          border: "#263042",
          subtle: "#8C9BAB",
          text: "#F1F5F9",
          secondary: "#CBD5E1",
          accent: "#579DFF",
        },
      },
    },
  },
  plugins: [],
};
