// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        diddyDanger: "#ff003c",
        mathGreen: "#00ffcc",
        midnight: "#030a1c"
      },
    },
  },
  plugins: [],
}
