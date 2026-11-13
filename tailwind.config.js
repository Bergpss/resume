const role = (name) => `oklch(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        mono: [
          "var(--font-geist-mono)",
          "ui-monospace",
          "monospace",
          "PingFang SC",
          "Hiragino Sans GB",
          "Noto Sans CJK SC",
          "Noto Sans SC",
          "Source Han Sans SC",
          "Microsoft YaHei",
          "WenQuanYi Micro Hei",
          "sans-serif",
        ],
        pixel: [
          "var(--font-geist-pixel-square)",
          "var(--font-geist-mono)",
          "monospace",
          "PingFang SC",
          "Hiragino Sans GB",
          "Noto Sans CJK SC",
          "Noto Sans SC",
          "Source Han Sans SC",
          "Microsoft YaHei",
          "WenQuanYi Micro Hei",
          "sans-serif",
        ],
      },
      colors: {
        border: role("rule"),
        ring: role("ink"),
        background: role("bg"),
        foreground: role("ink"),
        body: role("body"),
        muted: {
          DEFAULT: role("wash"),
          foreground: role("faint"),
        },
        accent: {
          DEFAULT: role("wash"),
          foreground: role("ink"),
        },
        popover: {
          DEFAULT: role("bg"),
          foreground: role("ink"),
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}