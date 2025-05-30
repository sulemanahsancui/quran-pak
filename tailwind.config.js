/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        arabic: ["Noto Naskh Arabic", "serif"],
      },
      colors: {
        // Light theme colors
        primary: {
          light: "#4CAF50",
          DEFAULT: "#2E7D32",
          dark: "#1B5E20",
        },
        background: {
          light: "#FFFFFF",
          DEFAULT: "#F5F5F5",
          dark: "#E0E0E0",
        },
        text: {
          light: "#000000",
          DEFAULT: "#333333",
          dark: "#666666",
        },
        // Dark theme colors
        dark: {
          primary: {
            light: "#81C784",
            DEFAULT: "#4CAF50",
            dark: "#388E3C",
          },
          background: {
            light: "#424242",
            DEFAULT: "#303030",
            dark: "#212121",
          },
          text: {
            light: "#FFFFFF",
            DEFAULT: "#E0E0E0",
            dark: "#BDBDBD",
          },
        },
      },
    },
  },
  plugins: [],
};
