import type { ApiError } from "@fsl/shared";
import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

// Central error handler. Expected errors (HttpError) become their status and
// message. Anything else is logged on the server and the client only gets a
// generic message, so internals (stack traces, SQL…) never leak.
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (res.headersSent) return;

  if (err instanceof HttpError) {
    const body: ApiError = { error: { code: err.code, message: err.message } };
    res.status(err.status).json(body);
    return;
  }

  console.error(err);
  const body: ApiError = {
    error: { code: "INTERNAL", message: "Something went wrong" },
  };
  res.status(500).json(body);
};
