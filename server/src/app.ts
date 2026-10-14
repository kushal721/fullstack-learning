import express from "express";
import { config } from "./config.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { serveClient } from "./middleware/serveClient.js";
import { buildStepsRouter } from "./routes/build-steps.js";
import { conceptsRouter } from "./routes/concepts.js";
import { exercisesRouter } from "./routes/exercises.js";
import { filesRouter } from "./routes/files.js";
import { flowsRouter } from "./routes/flows.js";
import { healthRouter } from "./routes/health.js";
import { projectRouter } from "./routes/project.js";
import { searchRouter } from "./routes/search.js";
import { symbolsRouter } from "./routes/symbols.js";
import { topicsRouter } from "./routes/topics.js";

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
  app.use("/api/topics", topicsRouter);
  app.use("/api/concepts", conceptsRouter);
  app.use("/api/files", filesRouter);
  app.use("/api/build-steps", buildStepsRouter);
  app.use("/api/project", projectRouter);
  app.use("/api/symbols", symbolsRouter);
  app.use("/api/flows", flowsRouter);
  app.use("/api/exercises", exercisesRouter);
  app.use("/api/search", searchRouter);
  app.use("/api", notFound);

  if (clientDist) app.use(serveClient(clientDist));

  app.use(errorHandler);
  return app;
}
