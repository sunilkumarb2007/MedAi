/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // IMPORTANT for toggle

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        // 🔵 Primary (soft blue, NOT neon)
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },

        // ⚫ ChatGPT-style neutral colors
        surface: {
          light: "#ffffff",
          dark: "#0b0f19",
        },

        chat: {
          light: "#f9fafb",
          dark: "#111827",
        },

        border: {
          light: "#e5e7eb",
          dark: "#1f2937",
        },

        text: {
          light: "#111827",
          dark: "#e5e7eb",
          secondary: "#6b7280",
        },
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },

      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.05)",
      },
    },
  },

  plugins: [],
};
