import express from "express";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { healthRouter } from "./routes/health.js";

// Builds the Express app without starting it, so tests can import it.
export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json());

  app.use("/api/health", healthRouter);

  app.use("/api", notFound);
  app.use(errorHandler);
  return app;
}
