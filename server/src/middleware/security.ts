import type { ApiError } from "@fsl/shared";
import cors from "cors";
import type { RequestHandler } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";

/**
 * Security headers (helmet). The built client loads only its own files (no
 * inline scripts, CDNs or external fonts), so the Content Security Policy
 * can allow just 'self'. React and React Flow set styles from JavaScript,
 * which a style-src policy doesn't block. upgrade-insecure-requests is off:
 * the host already redirects to HTTPS and sends HSTS, and the directive
 * would break running the production build over http://localhost.
 */
export function securityHeaders(): RequestHandler {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: null,
      },
    },
  });
}

/**
 * CORS: by default no other website may read API responses in a browser;
 * the platform's own pages are same-origin and need no CORS headers.
 * `origins` (from CORS_ORIGINS) can allow specific other sites.
 */
export function corsPolicy(origins: string[]): RequestHandler {
  return cors({ origin: origins.length > 0 ? origins : false });
}

function limiter(limit: number, windowMs: number, what: string) {
  return rateLimit({
    windowMs,
    limit,
    // RateLimit-* headers tell well-behaved clients how much is left.
    standardHeaders: "draft-8",
    legacyHeaders: false,
    // Docker and the host check health often; never block them.
    skip: (req) => req.originalUrl === "/api/health",
    handler: (_req, res, _next, options) => {
      const body: ApiError = {
        error: {
          code: "RATE_LIMITED",
          message: `Too many ${what}. Please wait a moment and try again.`,
        },
      };
      res.status(options.statusCode).json(body);
    },
  });
}

export type RateLimits = {
  /** Requests per IP to /api per 15 minutes. */
  api: number;
  /** Answer checks per IP per minute. */
  checks: number;
};

/** One limiter for the whole API, a stricter one for answer checks. */
export function rateLimiters(limits: RateLimits) {
  return {
    api: limiter(limits.api, 15 * 60 * 1000, "requests"),
    checks: limiter(limits.checks, 60 * 1000, "answers checked"),
  };
}
