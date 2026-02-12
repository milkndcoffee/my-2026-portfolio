// vite.config.js
import { defineConfig } from "vite";

export default defineConfig({
  // Public directory for static assets
  assetsInclude: ["**/*.svg"],
  publicDir: "public",

  // Server options
  server: {
    port: 3000,
    open: true,
  },

  // Build options
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
