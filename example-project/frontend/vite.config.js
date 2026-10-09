import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    // The React app runs on port 5173 and the API on port 3000. Forwarding
    // /api to the API makes both look like one website to the browser, so
    // the login cookie is sent with every request.
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.js"],
  },
});
