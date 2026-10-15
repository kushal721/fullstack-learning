// npm run check:browser — builds the app, starts the production server on a
// free port and runs the Playwright browser check against it (see
// playwright.config.ts and e2e/). Extra arguments go to `playwright test`,
// e.g. `npm run check:browser -- --project=phone-light`.
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit", env });
  return result.status ?? 1;
}

/** A port nobody is using right now. */
function freePort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function waitForHealth(url, timeoutMs = 20_000) {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      if ((await fetch(url)).ok) return;
    } catch {
      // not listening yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`The server didn't start: ${url} never answered.`);
}

if (!process.argv.includes("--no-build")) {
  console.log("Building client and server…");
  if (run("npm", ["run", "build"]) !== 0) process.exit(1);
}

const port = await freePort();
const server = spawn("node", ["server/dist/index.js"], {
  cwd: root,
  stdio: ["ignore", "ignore", "inherit"],
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: "production",
    CLIENT_DIST: `${root}client/dist`,
    LOG_LEVEL: "silent",
    // Every page from one machine would hit the per-IP limits.
    RATE_LIMIT_API: "1000000",
    RATE_LIMIT_CHECKS: "1000000",
  },
});
const stop = () => server.kill();
process.on("exit", stop);

try {
  await waitForHealth(`http://localhost:${port}/api/health`);
  console.log(`Production server on http://localhost:${port}`);
  const args = process.argv.slice(2).filter((arg) => arg !== "--no-build");
  const status = run("npx", ["playwright", "test", ...args], {
    ...process.env,
    BROWSER_CHECK_PORT: String(port),
  });
  stop();
  process.exit(status);
} catch (error) {
  console.error(error.message);
  stop();
  process.exit(1);
}
