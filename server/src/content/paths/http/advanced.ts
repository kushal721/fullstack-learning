import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { cachingApisModule } from "./caching-apis.js";
import { idempotencyModule } from "./idempotency.js";
import { openapiModule } from "./openapi.js";
import { rateLimitsModule } from "./rate-limits.js";

// Advanced: steps 13–17. Retrying without doing things twice, limiting traffic, describing the API in OpenAPI, and caching responses safely.
export const advanced: LevelPlan = {
  outcome:
    "Make an API dependable at scale: safe retries, rate limits, a written contract and caching.",
  steps: [
    idempotencyModule,
    rateLimitsModule,
    openapiModule,
    cachingApisModule,
    levelCheck("advanced-check", "Advanced check", [
      ["http-advanced-idempotency-key", "idempotency"],
      ["http-advanced-retry-which", "idempotency"],
      ["http-advanced-retry-after", "rate-limits"],
      ["http-advanced-openapi-path", "openapi"],
      ["http-advanced-if-match", "caching-apis"],
      ["http-advanced-private-cache", "caching-apis"],
    ]),
  ],
};
