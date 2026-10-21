import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // `npm run analyze -w client` writes dist/stats.html: what is in each
    // chunk and how big it is, to check before adding a dependency.
    process.env.ANALYZE
      ? visualizer({
          filename: "dist/stats.html",
          gzipSize: true,
          template: "treemap",
        })
      : null,
  ],
  server: {
    port: 5173,
    // In development the client and API run on different ports. The proxy
    // forwards /api (and the playground preview) to the API so the browser
    // sees one origin.
    proxy: {
      "/api": process.env.API_URL ?? "http://localhost:3000",
      "/playground": process.env.API_URL ?? "http://localhost:3000",
    },
  },
});
