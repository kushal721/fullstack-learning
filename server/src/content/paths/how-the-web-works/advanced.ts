import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { advancedNetworkingModule } from "./advanced-networking.js";
import { performanceAndProductionModule } from "./performance-and-production.js";

// Advanced: steps 14–16. The details professionals need: security, speed
// and scale, ending with the Notes App's real path in production.
export const advanced: LevelPlan = {
  outcome:
    "Reason about TLS, DNS records, CORS, CDNs, load balancers and where the time goes.",
  steps: [
    advancedNetworkingModule,
    performanceAndProductionModule,
    levelCheck("advanced-check", "Advanced check", [
      ["web-advanced-certificate", "advanced-networking"],
      ["web-advanced-cname", "performance-and-production"],
      ["web-advanced-cors", "advanced-networking"],
      ["web-advanced-load-balancer", "advanced-networking"],
    ]),
  ],
};
