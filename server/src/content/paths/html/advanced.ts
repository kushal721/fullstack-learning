import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { componentsModule } from "./components.js";
import { interactiveModule } from "./interactive.js";
import { reactModule } from "./react.js";
import { scriptsModule } from "./scripts.js";
import { searchModule } from "./search.js";

// Advanced: steps 14–19. Search engines and link previews, loading
// scripts, web components, built-in interactive elements and how HTML looks
// inside React.
export const advanced: LevelPlan = {
  outcome:
    "Make custom widgets accessible, help search engines and keep pages fast to load.",
  steps: [
    searchModule,
    scriptsModule,
    componentsModule,
    interactiveModule,
    reactModule,
    levelCheck("advanced-check", "Advanced check", [
      ["html-advanced-defer", "script-loading"],
      ["html-advanced-htmlfor", "html-in-react"],
      ["html-advanced-details", "details-and-dialog"],
      ["html-advanced-custom-element", "web-components"],
    ]),
  ],
};
