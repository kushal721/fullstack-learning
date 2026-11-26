import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { contextModule } from "./context.js";
import { customHooksModule } from "./custom-hooks.js";
import { effectsModule } from "./effects.js";
import { formsModule } from "./forms.js";
import { routingModule } from "./routing.js";

// Intermediate: steps 8–13. A real app: loading data, forms, screens and
// URLs, sharing data widely, and reusing logic.
export const intermediate: LevelPlan = {
  outcome:
    "Load data with effects, build forms, route between screens, share data with context and extract custom hooks.",
  steps: [
    effectsModule,
    formsModule,
    routingModule,
    contextModule,
    customHooksModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["react-intermediate-deps", "effects"],
      ["react-intermediate-cleanup", "effects"],
      ["react-intermediate-controlled", "forms"],
      ["react-intermediate-refresh", "routing"],
      ["react-intermediate-context", "context"],
      ["react-intermediate-hook-state", "custom-hooks"],
    ]),
  ],
};
