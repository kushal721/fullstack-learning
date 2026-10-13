import type { ApiError } from "@fsl/shared";
import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/http-error.js";

const BODY_ERRORS: Record<
  string,
  { status: number; code: string; message: string }
> = {
  "entity.parse.failed": {
    status: 400,
    code: "VALIDATION_ERROR",
    message: "The request body isn't valid JSON.",
  },
  "entity.too.large": {
    status: 413,
    code: "PAYLOAD_TOO_LARGE",
    message: "The request body is too large.",
  },
};

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

  // express.json() rejects bodies it can't read. That is the client's
  // mistake, so it gets a 4xx it can act on, not a 500.
  const bodyError = BODY_ERRORS[(err as { type?: string } | null)?.type ?? ""];
  if (bodyError) {
    const body: ApiError = {
      error: { code: bodyError.code, message: bodyError.message },
    };
    res.status(bodyError.status).json(body);
    return;
  }

  console.error(err);
  const body: ApiError = {
    error: { code: "INTERNAL", message: "Something went wrong" },
  };
  res.status(500).json(body);
};
