import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { accessibleModule } from "./accessible.js";
import { htmlDomModule } from "./dom.js";
import { formsDepthModule } from "./forms-depth.js";
import { structureModule } from "./structure.js";
import { tablesModule } from "./tables.js";

// Intermediate: steps 8–13. Meaningful structure, forms in depth, tables,
// accessibility and what the browser builds from HTML.
export const intermediate: LevelPlan = {
  outcome:
    "Structure a page so browsers, search engines and screen readers all understand it, with forms that check themselves.",
  steps: [
    structureModule,
    formsDepthModule,
    tablesModule,
    accessibleModule,
    htmlDomModule,
    levelCheck("intermediate-check", "Intermediate check", [
      ["html-intermediate-main", "semantic-structure"],
      ["html-intermediate-required", "forms-in-depth"],
      ["html-intermediate-radio", "forms-in-depth"],
      ["html-intermediate-icon-button", "accessible-html"],
      ["html-intermediate-aria", "accessible-html"],
      ["html-intermediate-div-button", "accessible-html"],
    ]),
  ],
};
