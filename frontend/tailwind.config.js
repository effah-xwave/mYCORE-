export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
      },
      colors: {
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          800: "#102a43",
          900: "#0a1929", // Deep Navy
          950: "#050b14", // Almost Black
        },
        dark: {
          bg: "#0B1121", // Main background
          card: "#151E32", // Card background
          cardHover: "#1B2640", // Card hover
          border: "#2A3655", // Borders
          text: "#E2E8F0", // Primary text
          muted: "#94A3B8", // Secondary text
          accent: "#3B82F6", // Primary Blue
        },
        ios: {
          bg: "#F5F5F7",
          card: "#FFFFFF",
          input: "#F2F2F7",
          blue: "#007AFF",
          green: "#34C759",
          red: "#FF3B30",
          gray: "#8E8E93",
          separator: "#C6C6C8",
        },
      },
      boxShadow: {
        soft: "0 2px 10px rgba(0, 0, 0, 0.03)",
        apple:
          "0 10px 40px -6px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.02)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.08)",
        glow: "0 0 25px rgba(59, 130, 246, 0.2)",
        "glow-indigo": "0 0 25px rgba(99, 102, 241, 0.2)",
        "inner-light": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)",
        card: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.04)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.6s ease-out forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        blob: "blob 10s infinite",
        wave: "wave 2.5s infinite",
      },
      keyframes: {
        wave: {
          "0%": { transform: "rotate(0.0deg)" },
          "10%": { transform: "rotate(14.0deg)" },
          "20%": { transform: "rotate(-8.0deg)" },
          "30%": { transform: "rotate(14.0deg)" },
          "40%": { transform: "rotate(-4.0deg)" },
          "50%": { transform: "rotate(10.0deg)" },
          "60%": { transform: "rotate(0.0deg)" },
          "100%": { transform: "rotate(0.0deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
