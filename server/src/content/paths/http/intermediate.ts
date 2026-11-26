import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { authHeadersModule } from "./auth-headers.js";
import { paginationModule } from "./pagination.js";
import { validationErrorsModule } from "./validation-errors.js";
import { versioningModule } from "./versioning.js";

// Intermediate: steps 8–12. Lists too long for one response, errors people can fix, changing an API without breaking its clients, and proving who is calling.
export const intermediate: LevelPlan = {
  outcome:
    "Design API responses for real use: paged lists, field errors a form can show, versions and authentication.",
  steps: [
    paginationModule,
    validationErrorsModule,
    versioningModule,
    authHeadersModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["http-intermediate-page-cap", "pagination"],
      ["http-intermediate-cursor", "pagination"],
      ["http-intermediate-field-errors", "validation-errors"],
      ["http-intermediate-breaking", "versioning"],
      ["http-intermediate-401-403", "auth-headers"],
      ["http-intermediate-token-url", "auth-headers"],
    ]),
  ],
};
