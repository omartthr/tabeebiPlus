/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#0ea5e9", // Medical Blue
        secondary: "#e0f2fe", // Light Blue background
        dark: "#1e293b",
        light: "#f8fafc",
      }
    },
  },
  plugins: [],
}
