import tailwindCustomConfig from "./.tailwind/tailwind.custom.config";
import tailwindAnimate from "tailwindcss-animate";

import { colors } from "./.tailwind/tokens";
import { fontFamily } from "./.tailwind/fonts";
import { gridTemplateColumns } from "./.tailwind/gridLayout";

export default {
  mode: "jit",
  presets: [tailwindCustomConfig],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily,
      colors,
      gridTemplateColumns,
    },
  },
  plugins: [tailwindAnimate],
};
