import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { corsModule } from "./cors.js";
import { csrfModule } from "./csrf.js";
import { secretsModule } from "./secrets.js";
import { securityHeadersModule } from "./security-headers.js";

// Intermediate: steps 7–11. CSRF, CORS, secrets and security headers.
export const intermediate: LevelPlan = {
  outcome:
    "Stop other sites acting as your users, open your API only as far as needed, keep secrets out of code and let headers protect the browser.",
  steps: [
    csrfModule,
    corsModule,
    secretsModule,
    securityHeadersModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["security-intermediate-samesite-lax", "csrf"],
      ["security-intermediate-get-delete", "csrf"],
      ["security-intermediate-cors-credentials", "cors"],
      ["security-intermediate-cors-not-auth", "cors"],
      ["security-intermediate-secret-pushed", "secrets"],
      ["security-intermediate-vite-secret", "secrets"],
      ["security-intermediate-csp", "security-headers"],
      ["security-intermediate-hsts", "security-headers"],
    ]),
  ],
};
