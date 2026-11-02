import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { closuresModule } from "./closures.js";
import { debuggingModule } from "./debugging.js";
import { eventLoopModule } from "./event-loop.js";
import { referencesModule } from "./references.js";
import { thisAndClassesModule } from "./this-and-classes.js";
import { typescriptModule } from "./typescript.js";

// Advanced: steps 18–24. How JavaScript works underneath (closures, the
// event loop, `this`, references), classes, TypeScript, and debugging.
export const advanced: LevelPlan = {
  outcome:
    "Understand the behaviour behind surprising bugs, use TypeScript's types, and debug with confidence.",
  steps: [
    closuresModule,
    eventLoopModule,
    thisAndClassesModule,
    referencesModule,
    typescriptModule,
    debuggingModule,
    levelCheck("advanced-check", "Advanced check", [
      ["js-advanced-closure", "closures"],
      ["js-advanced-event-loop", "event-loop"],
      ["js-advanced-reference", "references"],
      ["js-advanced-optional-type", "typescript"],
    ]),
  ],
};
