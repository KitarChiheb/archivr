import type { Config } from "tailwindcss";

// 📚 LEARN: Tailwind config is where we define our custom design system.
// By extending the default theme, we keep all of Tailwind's utilities
// while adding our own brand-specific tokens (colors, fonts, animations).
const config: Config = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS custom properties
        bg: {
          DEFAULT: "var(--color-bg)",
          surface: "var(--color-bg-surface)",
          "surface-hover": "var(--color-bg-surface-hover)",
        },
        border: {
          DEFAULT: "var(--color-border)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        accent: {
          purple: "#833AB4",
          red: "#FD1D1D",
          orange: "#F77737",
        },
        success: "#22C55E",
        warning: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "800" }],
        h2: ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        body: ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        caption: ["12px", { lineHeight: "1.4", letterSpacing: "0.05em", fontWeight: "500" }],
      },
      borderRadius: {
        glass: "16px",
      },
      animation: {
        "gradient-shift": "gradient-shift 8s ease infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backgroundSize: {
        "300%": "300% 300%",
      },
    },
  },
  plugins: [],
};
export default config;
