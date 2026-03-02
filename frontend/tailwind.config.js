/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#800020",
        secondary: "#a5f3fc",
        accent: "#f9a8d4",
        highlight: "#fcd34d",
        bglight: "#fff7ed",
      },
    },
  },
  plugins: [],
};