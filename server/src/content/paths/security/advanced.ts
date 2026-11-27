import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { dependencyAuditsModule } from "./dependency-audits.js";
import { loggingAttacksModule } from "./logging-attacks.js";
import { rateLimitingModule } from "./rate-limiting.js";
import { threatModellingModule } from "./threat-modelling.js";

// Advanced: steps 12–16. Threat modelling, dependency audits, rate limiting and logging attacks.
export const advanced: LevelPlan = {
  outcome:
    "Find the threats before attackers do, keep dependencies safe, slow down guessing and notice when someone is attacking.",
  steps: [
    threatModellingModule,
    dependencyAuditsModule,
    rateLimitingModule,
    loggingAttacksModule,
    levelCheck("advanced-check", "Advanced check", [
      ["security-advanced-stride-repudiation", "threat-modelling"],
      ["security-advanced-db-role", "threat-modelling"],
      ["security-advanced-transitive", "dependency-audits"],
      ["security-advanced-npm-ci", "dependency-audits"],
      ["security-advanced-lockout", "rate-limiting"],
      ["security-advanced-trust-proxy", "rate-limiting"],
      ["security-advanced-log-injection", "logging-attacks"],
      ["security-advanced-log-redaction", "logging-attacks"],
    ]),
  ],
};
