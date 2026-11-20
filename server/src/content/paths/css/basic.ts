import type { LevelPlan } from "@fsl/shared";
import { lesson, levelCheck, playground, reference } from "../blocks.js";
import { boxModelModule } from "./box-model.js";
import { coloursAndTextModule } from "./colours-and-text.js";
import { displayAndSizingModule } from "./display-and-sizing.js";
import { flexboxModule } from "./flexbox.js";
import { gettingStartedModule } from "./getting-started.js";

// Basic: steps 1–7. Getting started, colours and text, the box model,
// display and sizing, and flexbox (modules), then backgrounds.
export const basic: LevelPlan = {
  outcome:
    "Style a page yourself: pick elements, set colours, fonts and spacing, and line things up with flexbox.",
  steps: [
    gettingStartedModule,
    coloursAndTextModule,
    boxModelModule,
    displayAndSizingModule,
    flexboxModule,
    lesson(
      "backgrounds-and-borders",
      "Backgrounds, borders and shadows",
      3,
      reference("Decoration", [
        ["background-color", "A plain fill.", "background-color: #f6f8fa;"],
        [
          "background-image",
          "A picture or gradient.",
          "background-image: linear-gradient(#fff, #eef);",
        ],
        ["border", "A line around the box.", "border: 1px solid #d0d7de;"],
        [
          "border-radius",
          "Rounded corners; 50% makes a circle.",
          "border-radius: 50%;",
        ],
        [
          "box-shadow",
          "A shadow: x, y, blur, colour.",
          "box-shadow: 0 2px 6px rgb(0 0 0 / 15%);",
        ],
      ]),
      playground("Make a card", [
        "<style>",
        "  .card {",
        "    padding: 16px; max-width: 16rem;",
        "    background: linear-gradient(white, #eef3ff);",
        "    border: 1px solid #c8d3f0; border-radius: 12px;",
        "    box-shadow: 0 4px 12px rgb(0 0 0 / 12%);",
        "  }",
        "</style>",
        '<div class="card"><strong>Shopping</strong><p>Milk, bread.</p></div>',
      ]),
    ),
    levelCheck("basic-check", "Basic check", [
      ["css-basic-property", "getting-started"],
      ["css-basic-class", "getting-started"],
      ["css-basic-rem", "colours-and-text"],
      ["css-basic-padding", "box-model"],
      ["css-basic-display-none", "display-and-sizing"],
      ["css-basic-align", "flexbox"],
    ]),
  ],
};
