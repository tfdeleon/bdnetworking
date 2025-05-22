/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#000000",
        accent: {
          DEFAULT: "#C5A572",
          dark: "#B08D4C",
        },
      },
    },
  },
  plugins: [],
};
