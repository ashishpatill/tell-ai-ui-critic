import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-raised": "rgb(var(--surface-raised) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        secondary: "rgb(var(--text-secondary) / <alpha-value>)",
        muted: "rgb(var(--text-muted) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-hover": "rgb(var(--accent-hover) / <alpha-value>)",
        ok: "rgb(var(--ok) / <alpha-value>)",
        drift: "rgb(var(--drift) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "var(--radius-card)",
      },
      fontSize: {
        meta: ["0.75rem", { lineHeight: "1.25" }],
        label: ["0.875rem", { lineHeight: "1.35" }],
      },
      spacing: {
        "4.5": "1.125rem",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        signal: "0 0 0 1px rgb(var(--accent)), 0 0 20px rgb(var(--accent) / .16)",
      },
    },
  },
  plugins: [],
};

export default config;
