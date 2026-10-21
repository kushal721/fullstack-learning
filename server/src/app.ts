import compression from "compression";
import express from "express";
import { config } from "./config.js";
import { apiCaching } from "./middleware/caching.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFound.js";
import { requestLogger } from "./middleware/requestLogger.js";
import {
  corsPolicy,
  rateLimiters,
  type RateLimits,
  securityHeaders,
} from "./middleware/security.js";
import { serveClient } from "./middleware/serveClient.js";
import { buildStepsRouter } from "./routes/build-steps.js";
import { conceptsRouter } from "./routes/concepts.js";
import { courseMapRouter } from "./routes/course-map.js";
import { exercisesRouter } from "./routes/exercises.js";
import { filesRouter } from "./routes/files.js";
import { flowsRouter } from "./routes/flows.js";
import { glossaryRouter } from "./routes/glossary.js";
import { healthRouter } from "./routes/health.js";
import { pathsRouter } from "./routes/paths.js";
import { projectRouter } from "./routes/project.js";
import { searchRouter } from "./routes/search.js";
import { seoRouter } from "./routes/seo.js";
import { symbolsRouter } from "./routes/symbols.js";
import { topicsRouter } from "./routes/topics.js";

type AppOptions = {
  /** Folder with the built client; when set, the app also serves the website. */
  clientDist?: string;
  /** Lower limits let tests reach them quickly. */
  rateLimits?: RateLimits;
};

// Builds the Express app without starting it, so tests can import it.
export function createApp({
  clientDist = config.clientDist,
  rateLimits = config.rateLimits,
}: AppOptions = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", config.trustProxy);

  // Order matters: log every request, then add security headers, then
  // refuse what isn't allowed before any work is done.
  app.use(requestLogger(config.logLevel));
  app.use(securityHeaders());
  // gzip or brotli for JSON, HTML, JS and CSS: several times smaller over
  // the network. Small answers (under 1 KB) are sent as they are.
  app.use(compression());
  const limiters = rateLimiters(rateLimits);
  app.use("/api", corsPolicy(config.corsOrigins), limiters.api, apiCaching());
  app.post("/api/exercises/:id/check", limiters.checks);
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
  app.use("/api/paths", pathsRouter);
  app.use("/api/glossary", glossaryRouter);
  app.use("/api/course-map", courseMapRouter);
  app.use("/api/search", searchRouter);
  app.use("/api", notFound);
  app.use(seoRouter);

  if (clientDist) app.use(serveClient(clientDist));

  app.use(errorHandler);
  return app;
}
