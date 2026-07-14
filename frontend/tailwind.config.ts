import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0066FF",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#64748b",
          foreground: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
export default config;