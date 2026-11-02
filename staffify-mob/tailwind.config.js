/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        atlassian: {
          blue: "#0052CC",
          blueHover: "#0747A6",
          blueActive: "#00388B",
          blueLight: "#DEEBFF",
          canvasDark: "#090D14",
          surfaceDark: "#0F131C",
          surfaceDarkAlt: "#151B26",
          borderDark: "#263042",
          accentDark: "#579DFF",
        },
      },
    },
  },
  plugins: [],
};
