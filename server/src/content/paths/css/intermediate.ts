import type { LevelPlan } from "@fsl/shared";
import {
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
} from "../blocks.js";
import { cascadeModule } from "./cascade.js";
import { gridModule } from "./grid.js";
import { positioningModule } from "./positioning.js";
import { responsiveModule } from "./responsive.js";
import { statesAndTransitionsModule } from "./states-and-transitions.js";

// Intermediate: steps 8–15. Grid, responsive design, positioning, states
// and transitions, and the cascade (modules), forms and the Notes App.
export const intermediate: LevelPlan = {
  outcome:
    "Build layouts that work on every screen, and know which rule wins when two disagree.",
  steps: [
    gridModule,
    responsiveModule,
    positioningModule,
    statesAndTransitionsModule,
    cascadeModule,
    lesson(
      "forms-and-buttons",
      "Styling forms and buttons",
      3,
      explain(
        "Fields and buttons don't inherit the page's font by default, and their default look varies between browsers. A few rules make them consistent and easy to use.",
      ),
      playground("A clear, friendly form", [
        "<style>",
        "  input, button { font: inherit; }",
        "  label { display: block; margin-top: 8px; }",
        "  input { width: 100%; padding: 8px; border: 1px solid #c8d3f0; border-radius: 6px; }",
        "  input:focus-visible { outline: 3px solid royalblue; }",
        "  button { margin-top: 12px; padding: 8px 16px; border: 0; border-radius: 6px;",
        "    background: royalblue; color: white; cursor: pointer; }",
        "</style>",
        '<label for="t">Title</label><input id="t" placeholder="Shopping">',
        "<button>Save</button>",
      ]),
      quickCheck(
        "Why `font: inherit` on inputs and buttons?",
        [
          "They don't use the page's font by default",
          "It makes them bold",
          "Browsers require it",
        ],
        0,
        "Form controls ignore [[inheritance]] of fonts by default, so they look out of place without it.",
      ),
    ),
    lesson(
      "the-notes-app-styles",
      "How the Notes App is styled",
      3,
      inTheNotesApp(
        "The Notes App has one stylesheet: custom colours at the top, then a rule per component, like `.navbar` (flexbox), `.form-field` and `.button`.",
        { fileId: "frontend/src/index.css" },
      ),
      keyPoints(
        "`.navbar`: flexbox with `justify-content: space-between`.",
        "`.button:disabled` and `.button:focus-visible`: states.",
        "`.notes-grid`: a grid with two media queries.",
      ),
      quickCheck(
        "The save button looks faded while saving. Which rule does that?",
        ["`.button:disabled`", "`.navbar`", "`@media (min-width: 40rem)`"],
        0,
        "The form disables the button while saving, and the `:disabled` [[pseudo-class]] styles it.",
      ),
    ),
    levelCheck("intermediate-check", "Intermediate check", [
      ["css-intermediate-fr", "grid"],
      ["css-intermediate-mobile-first", "media-queries"],
      ["css-intermediate-absolute", "positioning"],
      ["css-intermediate-specificity", "cascade"],
    ]),
  ],
};
