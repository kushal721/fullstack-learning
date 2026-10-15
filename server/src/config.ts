import { fileURLToPath } from "node:url";

// All configuration comes from environment variables, read in one place,
// so the rest of the server never touches process.env directly.
export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  version: process.env.APP_VERSION ?? "dev",
  // Folder with the built client (client/dist). Set in production so one
  // Node process serves both the website and the API; unset in development,
  // where Vite serves the client.
  clientDist: process.env.CLIENT_DIST,
  // The example Notes App whose files the platform shows. Defaults to the
  // repository's example-project/ (same relative place in src/ and dist/).
  // How many proxies sit in front of the server (e.g. 1 on Render). Only
  // then may Express read the client's IP from X-Forwarded-For; trusting
  // it without a proxy would let anyone fake their IP past the rate limit.
  trustProxy: Number(process.env.TRUST_PROXY ?? 0),
  // Other websites allowed to call the API from a browser, comma separated.
  // Empty (the default): only the platform's own pages, which are served
  // from the same origin.
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  // The site's public address, e.g. https://learn.example.com, for links
  // in the sitemap and link previews. Unset: taken from each request.
  publicUrl: process.env.PUBLIC_URL?.replace(/\/+$/, ""),
  // pino log level; tests are silent unless LOG_LEVEL says otherwise.
  logLevel:
    process.env.LOG_LEVEL ??
    (process.env.NODE_ENV === "test" ? "silent" : "info"),
  exampleProjectDir:
    process.env.EXAMPLE_PROJECT_DIR ??
    fileURLToPath(new URL("../../example-project/", import.meta.url)),
};
