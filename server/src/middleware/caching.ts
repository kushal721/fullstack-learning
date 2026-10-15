import type { RequestHandler } from "express";

/**
 * Content only changes with a deploy, but then it must show at once. So
 * GET answers may be kept, but must be re-checked every time
 * (`no-cache`): Express adds an ETag to every JSON answer, and an
 * unchanged answer comes back as a tiny `304 Not Modified`. Health checks
 * are never stored, so they always show the live server.
 */
export function apiCaching(): RequestHandler {
  return (req, res, next) => {
    if (req.method === "GET" || req.method === "HEAD") {
      res.set(
        "Cache-Control",
        req.originalUrl.startsWith("/api/health") ? "no-store" : "no-cache",
      );
    } else {
      res.set("Cache-Control", "no-store");
    }
    next();
  };
}
