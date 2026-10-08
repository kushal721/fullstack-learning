import express, { Router } from "express";
import path from "node:path";

// Serves the built React app. Hashed files in /assets never change, so the
// browser may cache them forever; index.html must always be re-checked so a
// new deploy is picked up.
export function serveClient(clientDist: string) {
  const router = Router();
  const indexHtml = path.join(clientDist, "index.html");

  router.use(
    "/assets",
    express.static(path.join(clientDist, "assets"), {
      immutable: true,
      maxAge: "1y",
    }),
  );
  router.use(express.static(clientDist, { index: false }));

  // Single-page app fallback: React Router handles paths like /learn in the
  // browser, so every other GET returns index.html.
  router.get("/{*path}", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(indexHtml);
  });

  return router;
}
