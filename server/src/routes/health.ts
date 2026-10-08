import { Router } from "express";
import { config } from "../config.js";

export const healthRouter = Router();

// Lets Docker, CI and the hosting platform check that the API is running.
healthRouter.get("/", (_req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    version: config.version,
  });
});
