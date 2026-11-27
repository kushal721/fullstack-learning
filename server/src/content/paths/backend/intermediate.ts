import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { controllersModule } from "./controllers.js";
import { errorHandlingModule } from "./error-handling.js";
import { loggingModule } from "./logging.js";
import { settingsAndSecretsModule } from "./settings-and-secrets.js";
import { validationModule } from "./validation.js";

// Intermediate: steps 7–12. Controllers, validation, settings and secrets, error handling and logging.
export const intermediate: LevelPlan = {
  outcome:
    "Organise a backend that checks its input, reads its settings safely, handles errors in one place and logs what happens.",
  steps: [
    controllersModule,
    validationModule,
    settingsAndSecretsModule,
    errorHandlingModule,
    loggingModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["backend-intermediate-early-return", "controllers"],
      ["backend-intermediate-owner-id", "controllers"],
      ["backend-intermediate-server-check", "validation"],
      ["backend-intermediate-mass-assignment", "validation"],
      ["backend-intermediate-env-string", "settings-and-secrets"],
      ["backend-intermediate-leaked-secret", "settings-and-secrets"],
      ["backend-intermediate-error-handler", "error-handling"],
      ["backend-intermediate-log-body", "logging"],
    ]),
  ],
};
