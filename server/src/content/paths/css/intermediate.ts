import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { cascadeModule } from "./cascade.js";
import { gridModule } from "./grid.js";
import { positioningModule } from "./positioning.js";
import { responsiveModule } from "./responsive.js";
import { statesAndTransitionsModule } from "./states-and-transitions.js";

// Intermediate: steps 8–13. Grid, responsive design, positioning, states
// and transitions, and the cascade (modules).
export const intermediate: LevelPlan = {
  outcome:
    "Build layouts that work on every screen, and know which rule wins when two disagree.",
  steps: [
    gridModule,
    responsiveModule,
    positioningModule,
    statesAndTransitionsModule,
    cascadeModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["css-intermediate-fr", "grid"],
      ["css-intermediate-mobile-first", "media-queries"],
      ["css-intermediate-absolute", "positioning"],
      ["css-intermediate-specificity", "cascade"],
    ]),
  ],
};
