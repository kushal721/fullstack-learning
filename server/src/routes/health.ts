import type { HealthResponse } from "@fsl/shared";
import { Router } from "express";
import { config } from "../config.js";

export const healthRouter = Router();

// Lets Docker, CI and the hosting platform check that the API is running.
healthRouter.get("/", (_req, res) => {
  const body: HealthResponse = {
    status: "ok",
    uptime: process.uptime(),
    version: config.version,
  };
  res.json(body);
});
