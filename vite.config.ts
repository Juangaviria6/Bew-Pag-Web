import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        // Prototipo aparte: juego de movimiento (no enlazado desde el sitio).
        juego: resolve(__dirname, "juego/index.html"),
      },
    },
  },
});
