import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { serveClient } from "./middleware/serveClient.js";
import { healthRouter } from "./routes/health.js";

type AppOptions = {
  /** Folder with the built client; when set, the app also serves the website. */
  clientDist?: string;
};

// Builds the Express app without starting it, so tests can import it.
export function createApp({ clientDist = config.clientDist }: AppOptions = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api", notFound);

  if (clientDist) app.use(serveClient(clientDist));

  app.use(errorHandler);
  return app;
}
