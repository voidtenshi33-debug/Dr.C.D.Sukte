/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          dark: "#0b1329",
          sidebar: "#0f172a",
          card: "#1e293b",
          border: "#334155",
          accent: "#2563eb",
          accentHover: "#1d4ed8"
        },
        severity: {
          critical: "#ef4444",
          high: "#f97316",
          medium: "#eab308",
          low: "#22c55e"
        }
      }
    },
  },
  plugins: [],
}
