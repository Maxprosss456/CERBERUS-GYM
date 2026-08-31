import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En Electron cargamos el build desde archivo (file://), por eso base relativa.
export default defineConfig({
  plugins: [react()],
  base: "./",
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "dist",
  },
});
