/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Water Company Identity (Blue & White focus)
        brand: {
          DEFAULT: "#2563eb", // Trusted Primary Blue
          primary: "#2563eb",
          secondary: "#0ea5e9", // Sky/Water Blue
          light:   "#f8fafc", // Clean Surface
          soft:    "#eff6ff", // Very Light Blue
          cyan:    "#06b6d4", // Action Cyan
          navy:    "#1e40af", // Deep Trusted Blue
          dark:    "#0f172a", // Dark Mode Base
          black:   "#020617", // Ultra Premium Dark
        },
        primary: {
          DEFAULT: "#2563eb",
          dark:    "#1e3a8a",
          light:   "#dbeafe",
        },
        cta: {
          DEFAULT: "#0ea5e9",
          hover:   "#0284c7",
          dark:    "#0369a1",
        },
        ink: {
          DEFAULT: "#0f172a",
          secondary: "#334155",
          muted:     "#64748b",
        },
        base: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
        },
      },
      fontFamily: {
        sans: ["Geist Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
      },
      backdropBlur: {
        premium: '24px',
        elite: '40px',
      },
      boxShadow: {
        premium: "0 20px 50px -12px rgba(37, 99, 235, 0.15)",
        glow: "0 0 20px rgba(37, 99, 235, 0.4)",
        card: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)",
      },
      backgroundImage: {
        "water-mesh": "radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(14, 165, 233, 0.05) 0, transparent 50%)",
        "premium-gradient": "linear-gradient(135deg, #2563eb, #0ea5e9)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
      },
      animation: {
        "wave": "wave 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "mesh": "mesh 15s ease-in-out infinite",
      },
      keyframes: {
        wave: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(2deg)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        mesh: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.05)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};
