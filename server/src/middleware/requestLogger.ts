import type { RequestHandler } from "express";
import type { DestinationStream } from "pino";
import { pinoHttp } from "pino-http";

/**
 * One structured JSON log line per request (method, URL, status, time),
 * so a host's log viewer can filter and search them. Headers and IP
 * addresses are never logged, and health checks and static files are
 * skipped because they would drown out everything else.
 */
export function requestLogger(
  level: string,
  /** Where lines go; stdout by default (tests pass their own). */
  destination?: DestinationStream,
): RequestHandler {
  return pinoHttp(
    {
      level,
      // Only what's needed to follow a request: no headers (cookies,
      // browser details) and no IP addresses.
      serializers: {
        req: (req: { id: unknown; method: string; url: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
      },
      autoLogging: {
        ignore: (req) =>
          req.url === "/api/health" || Boolean(req.url?.startsWith("/assets/")),
      },
      customLogLevel: (_req, res, err) =>
        err || res.statusCode >= 500
          ? "error"
          : res.statusCode >= 400
            ? "warn"
            : "info",
    },
    destination,
  );
}
