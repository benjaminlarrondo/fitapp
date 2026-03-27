import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  base: "/fitapp/",
  plugins: [react()],
  server: {
    port: 5417,
    strictPort: true,
  },
  preview: {
    port: 4417,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
