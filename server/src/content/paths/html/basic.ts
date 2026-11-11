import type { LevelPlan } from "@fsl/shared";
import { levelCheck } from "../blocks.js";
import { elementsModule } from "./elements.js";
import { formsModule } from "./forms.js";
import { mediaModule } from "./media.js";
import { skeletonModule } from "./skeleton.js";
import { textModule } from "./text.js";

// Basic: steps 1–6. Tags, elements and attributes (with references of the
// everyday ones and live examples), the page skeleton, text, lists, links,
// images and simple forms.
export const basic: LevelPlan = {
  outcome:
    "Write a simple page by hand: headings, text, lists, links, images and a form.",
  steps: [
    elementsModule,
    skeletonModule,
    textModule,
    mediaModule,
    formsModule,
    levelCheck("basic-check", "Basic check", [
      ["html-basic-closing-tag", "elements-and-attributes"],
      ["html-basic-nesting", "elements-and-attributes"],
      ["html-basic-head", "page-skeleton"],
      ["html-basic-ordered-list", "text-lists-links"],
      ["html-basic-entity", "text-lists-links"],
      ["html-basic-alt", "images-and-media"],
      ["html-basic-label", "forms"],
      ["html-basic-block-inline", "elements-and-attributes"],
    ]),
  ],
};
