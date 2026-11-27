import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { neverTrustInputModule } from "./never-trust-input.js";
import { safeErrorsModule } from "./safe-errors.js";
import { sqlInjectionModule } from "./sql-injection.js";
import { validationModule } from "./validation.js";
import { xssModule } from "./xss.js";

// Basic: steps 1–6. Never trust input, validation, XSS, SQL injection and safe error messages.
export const basic: LevelPlan = {
  outcome:
    "Treat everything a request brings as untrusted, check it on the server, and stop XSS, SQL injection and leaky errors.",
  steps: [
    neverTrustInputModule,
    validationModule,
    xssModule,
    sqlInjectionModule,
    safeErrorsModule,
    levelCheck("basic-check", "Basic check", [
      ["security-basic-owner", "never-trust-input"],
      ["security-basic-saved-data", "never-trust-input"],
      ["security-basic-allowlist", "validation"],
      ["security-basic-mass-assignment", "validation"],
      ["security-basic-textcontent", "xss"],
      ["security-basic-glued-title", "sql-injection"],
      ["security-basic-sort-column", "sql-injection"],
      ["security-basic-500-message", "safe-errors"],
    ]),
  ],
};
