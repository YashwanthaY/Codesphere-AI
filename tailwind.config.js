/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease forwards",
        "fade-in":    "fadeIn 0.3s ease forwards",
        "scale-in":   "scaleIn 0.3s ease forwards",
        "float":      "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};