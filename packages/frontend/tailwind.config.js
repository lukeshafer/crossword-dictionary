import defaultColors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          outline: defaultColors.sky[600],
        },
      },
    },
  },
  plugins: [],
};
