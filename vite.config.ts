import { defineConfig } from "vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

// base relativo + salida en docs/ para publicar con GitHub Pages
export default defineConfig({
  base: "./",
  build: {
    outDir: "docs",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        groupOrder: resolve(root, "group-order.html"),
      },
    },
  },
});
