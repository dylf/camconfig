/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{html,js,jsx,md,mdx,ts,tsx}", "./index.html"],
  presets: [require("./suc.preset.js")],
  plugins: [require("@tailwindcss/forms")],
};
