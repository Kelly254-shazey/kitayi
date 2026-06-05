/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#0A84FF", hover: "#0070E0", light: "#E6F2FF", dark: "#0055B3" },
        secondary: { DEFAULT: "#0F172A", hover: "#1E293B" },
        accent: { DEFAULT: "#06B6D4", light: "#CFFAFE" },
        success: { DEFAULT: "#10B981", light: "#D1FAE5" },
        warning: { DEFAULT: "#F59E0B", light: "#FEF3C7" },
        danger: { DEFAULT: "#EF4444", light: "#FEE2E2" },
        glass: {
          white: "rgba(255,255,255,0.08)",
          border: "rgba(255,255,255,0.15)",
          dark: "rgba(15,23,42,0.7)",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Manrope", "sans-serif"],
      },
      backgroundImage: {
        "water-gradient": "linear-gradient(135deg,#0a1628 0%,#0d2137 40%,#0a3d6b 70%,#0b4f8a 100%)",
        "glass-gradient": "linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))",
        "shine": "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.08) 50%,transparent 60%)",
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
        "glass-sm": "0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
        glow: "0 0 40px rgba(10,132,255,0.35)",
        "glow-sm": "0 0 20px rgba(10,132,255,0.25)",
      },
      backdropBlur: { xs: "4px" },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "shimmer": "shimmer 2s infinite",
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        pulseGlow: { "0%,100%": { boxShadow: "0 0 20px rgba(10,132,255,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(10,132,255,0.6)" } },
        slideUp: { from: { opacity: "0", transform: "translateY(20px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
    },
  },
  plugins: [],
};
