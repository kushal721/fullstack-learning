import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { apisAndJsonModule } from "./apis-and-json.js";
import { cookiesAndCachingModule } from "./cookies-and-caching.js";
import { hostingAndCdnsModule } from "./hosting-and-cdns.js";
import { insideTheBrowserModule } from "./inside-the-browser.js";
import { portsAndTcpModule } from "./ports-and-tcp.js";

// Intermediate: steps 8–13. How it really works, enough to build the Notes
// App: connections, headers, cookies, caching, APIs and where code runs.
export const intermediate: LevelPlan = {
  outcome:
    "Read real requests and responses, and know how cookies, caching and APIs fit in.",
  steps: [
    portsAndTcpModule,
    cookiesAndCachingModule,
    apisAndJsonModule,
    hostingAndCdnsModule,
    insideTheBrowserModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["web-intermediate-port", "ports-and-tcp"],
      ["web-intermediate-stateless", "cookies-and-caching"],
      ["web-intermediate-no-store", "cookies-and-caching"],
      ["web-intermediate-api", "apis-and-json"],
    ]),
  ],
};
