import type { ErrorRequestHandler } from "express";

// Central error handler: logs the real error on the server, but only sends a
// generic message to the client so internals (stack traces, SQL…) never leak.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  res.status(500).json({
    error: { code: "INTERNAL", message: "Something went wrong" },
  });
};
