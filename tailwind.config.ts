import type { Config } from "tailwindcss";

const config = {
  content: [
    // This ensures Tailwind scans your new [locale] folder structure
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
} satisfies Config;

export default config;
