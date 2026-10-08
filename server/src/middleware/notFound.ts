import type { ApiError } from "@fsl/shared";
import type { RequestHandler } from "express";

// Any /api request that no route handled ends here.
export const notFound: RequestHandler = (req, res) => {
  const body: ApiError = {
    error: {
      code: "NOT_FOUND",
      message: `No API route for ${req.method} ${req.originalUrl}`,
    },
  };
  res.status(404).json(body);
};
