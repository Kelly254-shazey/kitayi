/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 30% brand
        brand: {
          DEFAULT: "#1B4FD8",
          dark:    "#1239A6",
          light:   "#EFF4FF",
          teal:    "#0D9488",
          navy:    "#0F2B6B",
        },
        "brand-navy": "#0F2B6B",
        // alias so dark-UI pages can use 'primary' instead of 'brand'
        primary: {
          DEFAULT: "#1B4FD8",
          dark:    "#1239A6",
          light:   "#EFF4FF",
        },
        // 10% CTA cyan
        cta: {
          DEFAULT: "#06B6D4",
          hover:   "#0891B2",
          dark:    "#0E7490",
          light:   "#ECFEFF",
        },
        // Semantic
        success: { DEFAULT: "#10B981", light: "#D1FAE5" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        danger:  { DEFAULT: "#EF4444", light: "#FEE2E2" },
        // 60% white base
        ink: {
          DEFAULT: "#0F172A",
          secondary: "#334155",
          muted:     "#64748B",
        },
        base: {
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
        },
      },
      fontFamily: {
        sans:    ["Inter", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      boxShadow: {
        card:       "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.04)",
        "card-md":  "0 4px 12px rgba(15,23,42,0.07), 0 12px 32px rgba(15,23,42,0.05)",
        brand:      "0 4px 20px rgba(27,79,216,0.25)",
        cta:        "0 4px 16px rgba(6,182,212,0.35)",
        "cta-lg":   "0 6px 28px rgba(6,182,212,0.45)",
      },
      animation: {
        "fade-in":  "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "float":    "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn:  { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        float:   { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
      },
      backgroundImage: {
        "hero-pattern": "linear-gradient(180deg, rgba(27,79,216,0.05) 0%, rgba(255,255,255,0) 360px), #ffffff",
        "grid-track": "linear-gradient(rgba(27,79,216,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(13,148,136,0.12) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};
