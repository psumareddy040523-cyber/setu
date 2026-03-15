/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Plus Jakarta Sans", "sans-serif"],
        display: ["Sora", "sans-serif"],
      },
      colors: {
        soil: "#4C3A2E",
        millet: "#EFD28D",
        leaf: "#2D6A4F",
        sky: "#CFE8FF",
        clay: "#C66A42",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};
