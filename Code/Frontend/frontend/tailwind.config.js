/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#5C3A21",
        secondary: "#C5A059",
        parchment: "#F5F2EB",
        ivory: "#FAF9F6",
        accent: "#B8860B",
        "text-primary": "#1A1A1A",
        "text-secondary": "#4A4A4A",
        success: "#2E7D32",
        warning: "#ED6C02",
        danger: "#C62828",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Libre Baskerville", "Lora", "Georgia", "serif"],
        body: ["Source Serif 4", "Georgia", "serif"],
      },
      boxShadow: {
        courtroom: "0 2px 16px 0 rgba(92,58,33,0.10)",
        card: "0 1px 6px 0 rgba(92,58,33,0.08)",
      },
    },
  },
  plugins: [],
};
