import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { animationsModule } from "./animations.js";
import { inPracticeModule } from "./in-practice.js";
import { modernCssModule } from "./modern-css.js";

// Advanced: steps 14–17. Modern CSS, animations and transforms, and CSS in
// practice (modules).
export const advanced: LevelPlan = {
  outcome:
    "Build themeable, component-friendly styles with variables, modern selectors, animation and dark mode, and work with Tailwind.",
  steps: [
    modernCssModule,
    animationsModule,
    inPracticeModule,
    levelCheck("advanced-check", "Advanced check", [
      ["css-advanced-var", "modern-css"],
      ["css-advanced-has", "modern-css"],
      ["css-advanced-container", "modern-css"],
      ["css-advanced-dark", "modern-css"],
    ]),
  ],
};
