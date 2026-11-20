import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { backgroundsModule } from "./backgrounds.js";
import { boxModelModule } from "./box-model.js";
import { coloursAndTextModule } from "./colours-and-text.js";
import { displayAndSizingModule } from "./display-and-sizing.js";
import { flexboxModule } from "./flexbox.js";
import { gettingStartedModule } from "./getting-started.js";

// Basic: steps 1–7. Getting started, colours and text, the box model,
// display and sizing, flexbox and backgrounds (modules), then the check.
export const basic: LevelPlan = {
  outcome:
    "Style a page yourself: pick elements, set colours, fonts and spacing, and line things up with flexbox.",
  steps: [
    gettingStartedModule,
    coloursAndTextModule,
    boxModelModule,
    displayAndSizingModule,
    flexboxModule,
    backgroundsModule,
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
