import { defineConfig } from "@playwright/test";

// npm run screenshots: the README's screenshots, taken from the production
// build (scripts/browser-check.mjs starts it and sets the port).
const port = Number(process.env.BROWSER_CHECK_PORT ?? 4400);

export default defineConfig({
  testDir: "scripts/screenshots",
  // Not *.spec.ts, so the scripts' unit tests (vitest) leave it alone.
  testMatch: "*.shots.ts",
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: "chromium",
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    colorScheme: "light",
  },
});
