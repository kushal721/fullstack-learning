import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { oauthModule } from "./oauth.js";
import { passwordResetModule } from "./password-reset.js";
import { refreshTokensModule } from "./refresh-tokens.js";
import { twoFactorModule } from "./two-factor.js";

// Advanced: steps 12–16. Refresh tokens, OAuth, two-factor login and password reset.
export const advanced: LevelPlan = {
  outcome:
    "Keep logins short-lived but smooth, let people log in with another site, add a second factor and reset passwords safely.",
  steps: [
    refreshTokensModule,
    oauthModule,
    twoFactorModule,
    passwordResetModule,
    levelCheck("advanced-check", "Advanced check", [
      ["auth-advanced-refresh-reuse", "refresh-tokens"],
      ["auth-advanced-short-access", "refresh-tokens"],
      ["auth-advanced-oauth-link", "oauth"],
      ["auth-advanced-oauth-state", "oauth"],
      ["auth-advanced-totp-reuse", "two-factor"],
      ["auth-advanced-recovery-storage", "two-factor"],
      ["auth-advanced-reset-answer", "password-reset"],
      ["auth-advanced-reset-token", "password-reset"],
    ]),
  ],
};
