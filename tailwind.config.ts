import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "var(--c-bg)",
        surface: {
          DEFAULT: "var(--c-surface)",
          2: "var(--c-surface-2)",
        },
        ink: {
          DEFAULT: "var(--c-ink)",
          2: "var(--c-ink-2)",
        },
        muted: "var(--c-muted)",
        line: {
          DEFAULT: "var(--c-line)",
          soft: "var(--c-line-soft)",
        },
        lemon: "var(--c-lemon)",
        coral: {
          DEFAULT: "var(--c-coral)",
          ink: "var(--c-coral-ink)",
        },
        mint: "var(--c-mint)",
        violet: "var(--c-violet)",
        cyan: "var(--c-cyan)",
        "on-accent": {
          DEFAULT: "var(--c-on-accent)",
          2: "var(--c-on-accent-2)",
        },
        danger: {
          DEFAULT: "var(--c-danger)",
          bg: "var(--c-danger-bg)",
        },
        warning: {
          DEFAULT: "var(--c-warning)",
          bg: "var(--c-warning-bg)",
        },
        success: {
          DEFAULT: "var(--c-success)",
          bg: "var(--c-success-bg)",
        },
        info: {
          DEFAULT: "var(--c-info)",
          bg: "var(--c-info-bg)",
        },
        praise: "var(--c-praise-bg)",
        roast: "var(--c-roast-bg)",
        tip: "var(--c-tip-bg)",
        neutral: "var(--c-neutral-bg)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["var(--fs-2xs)", { lineHeight: "1.27" }],
        "display-sm": ["var(--fs-2xl)", { lineHeight: "1.05" }],
        "display-md": ["var(--fs-3xl)", { lineHeight: "1" }],
        "display-lg": ["var(--fs-4xl)", { lineHeight: "0.95" }],
        score: ["var(--fs-5xl)", { lineHeight: "0.9" }],
      },
      boxShadow: {
        "hard-1": "var(--shadow-1)",
        "hard-2": "var(--shadow-2)",
        "hard-3": "var(--shadow-3)",
        "hard-4": "var(--shadow-4)",
      },
      borderRadius: {
        "nb-sm": "var(--r-sm)",
        "nb-md": "var(--r-md)",
        "nb-lg": "var(--r-lg)",
      },
      borderWidth: {
        "3": "3px",
      },
    },
  },
  plugins: [],
};

export default config;
