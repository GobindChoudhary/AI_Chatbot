/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#000000",
        border: "#000000",
        text: "#ffffff",
        muted: "#999999",
        accent: "#ffffff",
        glass: "rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};
