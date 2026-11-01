import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { asyncModule } from "./async.js";
import { errorsModule } from "./errors.js";
import { jsonAndDataModule } from "./json-and-data.js";
import { modernSyntaxModule } from "./modern-syntax.js";
import { readingRealCodeModule } from "./reading-real-code.js";

// Intermediate: steps 12–17. Data as JSON, waiting with promises and
// async/await, fetching from an API, handling errors, modules, and the
// modern syntax the Notes App's code uses.
export const intermediate: LevelPlan = {
  outcome:
    "Load data from an API, handle what goes wrong, and read modern JavaScript like the Notes App's.",
  steps: [
    jsonAndDataModule,
    asyncModule,
    errorsModule,
    modernSyntaxModule,
    readingRealCodeModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["js-intermediate-json", "json"],
      ["js-intermediate-async", "async"],
      ["js-intermediate-fetch-ok", "async"],
      ["js-intermediate-spread", "modules-and-syntax"],
      ["js-intermediate-nullish", "modules-and-syntax"],
    ]),
  ],
};
