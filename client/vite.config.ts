import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the client and API run on different ports. The proxy
    // forwards /api requests to the API so the browser sees one origin.
    proxy: {
      "/api": process.env.API_URL ?? "http://localhost:3000",
    },
  },
});
