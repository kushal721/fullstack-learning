import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { loggingOutModule } from "./logging-out.js";
import { protectingRoutesModule } from "./protecting-routes.js";
import { sessionsAndCookiesModule } from "./sessions-and-cookies.js";
import { tokensJwtModule } from "./tokens-jwt.js";

// Intermediate: steps 7–11. Sessions and cookies, JWTs, protecting routes and logging out.
export const intermediate: LevelPlan = {
  outcome:
    "Keep people logged in with a session or a token, protect every route that needs it, and log out properly.",
  steps: [
    sessionsAndCookiesModule,
    tokensJwtModule,
    protectingRoutesModule,
    loggingOutModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["auth-intermediate-session-vs-token", "sessions-and-cookies"],
      ["auth-intermediate-httponly", "sessions-and-cookies"],
      ["auth-intermediate-jwt-payload", "tokens-jwt"],
      ["auth-intermediate-jwt-verify", "tokens-jwt"],
      ["auth-intermediate-idor", "protecting-routes"],
      ["auth-intermediate-logout-copied-token", "logging-out"],
    ]),
  ],
};
