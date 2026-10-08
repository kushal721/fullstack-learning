import type { ApiError } from "@fsl/shared";
import type { ErrorRequestHandler } from "express";

// Central error handler: logs the real error on the server, but only sends a
// generic message to the client so internals (stack traces, SQL…) never leak.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) return;
  const body: ApiError = {
    error: { code: "INTERNAL", message: "Something went wrong" },
  };
  res.status(500).json(body);
};
