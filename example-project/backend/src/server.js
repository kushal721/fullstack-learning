import { createApp } from "./app.js";

// Stop at once with a clear message if a setting is missing, instead of
// failing later on the first request.
const required = ["DATABASE_URL", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing environment variables: ${missing.join(", ")}`);
  console.error("Copy .env.example to .env and fill it in.");
  process.exit(1);
}

const port = Number(process.env.PORT ?? 3000);

createApp().listen(port, () => {
  console.log(`Notes API listening on http://localhost:${port}`);
});
