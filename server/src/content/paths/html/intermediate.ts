import type { LevelPlan } from "@fsl/shared";
import { diagram, explain, lesson, levelCheck, quickCheck } from "../blocks.js";
import { accessibleModule } from "./accessible.js";
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
    lesson(
      "the-dom",
      "From HTML to the DOM",
      3,
      explain(
        "The browser turns the HTML into a tree of objects, the [[dom]]: every element becomes a node, and [[nesting]] becomes parents and children. JavaScript and screen readers work with this tree, not the file.",
      ),
      diagram([
        ["HTML text", "the file"],
        ["DOM tree", "live objects"],
        ["Page", "drawn from the tree"],
      ]),
      quickCheck(
        "JavaScript adds an element to the page. What changes?",
        [
          "The HTML file on the server",
          "The DOM in the browser",
          "Nothing until you reload",
        ],
        1,
        "Scripts change the [[dom]]; the file on the server stays the same.",
      ),
    ),
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
