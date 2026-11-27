import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { hashingModule } from "./hashing.js";
import { passwordsModule } from "./passwords.js";
import { signingUpModule } from "./signing-up.js";
import { theLoginFlowModule } from "./the-login-flow.js";
import { whoAreYouModule } from "./who-are-you.js";

// Basic: steps 1–6. Who are you and who may do what, passwords, hashing, signing up and the login flow.
export const basic: LevelPlan = {
  outcome:
    "Tell authentication from authorization, store passwords safely, and build sign-up and login that don't leak who has an account.",
  steps: [
    whoAreYouModule,
    passwordsModule,
    hashingModule,
    signingUpModule,
    theLoginFlowModule,
    levelCheck("basic-check", "Basic check", [
      ["auth-basic-whose-note", "who-are-you"],
      ["auth-basic-password-rules", "passwords"],
      ["auth-basic-same-password", "hashing"],
      ["auth-basic-why-slow", "hashing"],
      ["auth-basic-signup-race", "signing-up"],
      ["auth-basic-signup-response", "signing-up"],
      ["auth-basic-login-same-message", "the-login-flow"],
      ["auth-basic-login-me", "the-login-flow"],
    ]),
  ],
};
