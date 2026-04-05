import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  base: '/maplestory-familiar-badge-tracker/',
  plugins: [vue()],
});
