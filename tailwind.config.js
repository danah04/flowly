/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Harbor theme — values are the source of truth (spec §6).
        // rgb(var() / <alpha-value>) lets opacity modifiers work.
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
        },
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        hairline: 'rgb(var(--color-hairline) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Albert Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '24px',
        btn: '18px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 4px 16px rgba(0,0,0,.06)',
        float: '0 8px 28px rgba(40,48,58,.12)',
      },
      maxWidth: {
        device: '390px',
      },
      height: {
        device: '844px',
      },
    },
  },
  plugins: [],
}
