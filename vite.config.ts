import { defineConfig } from "vite";

// base relativo + salida en docs/ para publicar con GitHub Pages
export default defineConfig({
  base: "./",
  build: { outDir: "docs", emptyOutDir: true },
});
