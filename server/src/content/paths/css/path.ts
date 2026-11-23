import type { Scene, TopicPath } from "@fsl/shared";
import { advanced } from "./advanced.js";
import { basic } from "./basic.js";
import { intermediate } from "./intermediate.js";

const rulesScene: Scene = {
  id: "rules",
  title: "Rules paint the structure",
  actors: [
    { id: "css", label: "CSS rules", sub: "selectors + styles" },
    { id: "browser", label: "Browser", sub: "matches them" },
    { id: "elements", label: "Elements", sub: "from the HTML" },
    { id: "screen", label: "Screen", sub: "what you see" },
  ],
  steps: [
    {
      from: "css",
      to: "browser",
      message: ".note { … }",
      caption: "The browser reads every rule in the stylesheet.",
      detail: "A rule says which elements, and how they should look.",
    },
    {
      from: "browser",
      to: "elements",
      message: "which match?",
      caption: "It finds the elements each selector matches.",
      detail: "When rules disagree, the cascade picks the winner.",
    },
    {
      from: "browser",
      to: "screen",
      message: "layout",
      caption: "It works out every box's size and place.",
      detail: "The box model, flexbox and grid decide where things go.",
    },
    {
      from: "browser",
      to: "screen",
      message: "paint",
      caption: "It paints colours, text and borders.",
      detail: "Change the CSS and only this changes, not the HTML.",
    },
  ],
};

// CSS: 15 Basic, 10 Intermediate and 10 Advanced steps, numbered 1–35.
export const cssPath: TopicPath = {
  topicId: "css",
  summary: {
    what: "CSS is the language that decides how a page looks: colours, fonts, spacing, sizes and where everything sits.",
    does: "It turns plain HTML into a designed page, and lets the same page adapt from a phone to a wide screen.",
    how: "Rules select elements and set properties; the browser combines every rule that matches, then lays out and paints the boxes.",
  },
  overviewSceneId: "rules",
  scenes: [rulesScene],
  levels: { basic, intermediate, advanced },
};
