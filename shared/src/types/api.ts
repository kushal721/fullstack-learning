// Shapes of API requests and responses. The server sends exactly these and
// the client expects exactly these, so a change here is checked on both sides.

/** Every error response from the API has this shape. */
export type ApiError = {
  error: {
    code: string;
    message: string;
  };
};

/** GET /api/health */
export type HealthResponse = {
  status: "ok";
  uptime: number;
  version: string;
};
