import type { RequestHandler } from "express";

// Any /api request that no route handled ends here.
export const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: `No API route for ${req.method} ${req.originalUrl}`,
    },
  });
};
