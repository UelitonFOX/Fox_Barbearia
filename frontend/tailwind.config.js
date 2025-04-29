/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFA500", // Laranja
        secondary: "#FFD700", // Amarelo
        dark: "#121212", // Fundo escuro
        light: "#FFFFFF", // Texto branco
      },
    },
  },
  plugins: [],
} 