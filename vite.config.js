import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Ensure public/ files (sw.js, manifest.json, icons) are served at root
  publicDir: "public",
  build: {
    // Generate source maps for easier debugging on device
    sourcemap: false,
  },
  server: {
    // Allow sw.js to be served with correct headers in dev
    headers: {
      "Service-Worker-Allowed": "/",
    },
  },
});
