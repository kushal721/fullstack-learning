import { defineConfig } from "@playwright/test";

// The browser check (npm run check:browser): every page of the production
// build in a real browser, at phone and desktop widths, light and dark.
// scripts/browser-check.mjs builds, starts the server and sets the port.
const port = Number(process.env.BROWSER_CHECK_PORT ?? 4400);

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    browserName: "chromium",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "phone-light",
      use: { viewport: { width: 375, height: 800 }, colorScheme: "light" },
    },
    {
      name: "phone-dark",
      use: { viewport: { width: 375, height: 800 }, colorScheme: "dark" },
    },
    {
      name: "desktop-light",
      use: { viewport: { width: 1280, height: 900 }, colorScheme: "light" },
    },
  ],
});
