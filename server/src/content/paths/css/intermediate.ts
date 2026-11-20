import type { LevelPlan } from "@fsl/shared";
import {
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";
import { cascadeModule } from "./cascade.js";
import { gridModule } from "./grid.js";
import { positioningModule } from "./positioning.js";
import { responsiveModule } from "./responsive.js";

// Intermediate: steps 8–16. Grid, responsive design, positioning and the
// cascade (modules), states and transitions.
export const intermediate: LevelPlan = {
  outcome:
    "Build layouts that work on every screen, and know which rule wins when two disagree.",
  steps: [
    gridModule,
    responsiveModule,
    positioningModule,
    lesson(
      "states",
      "States: hover, focus and more",
      3,
      reference("Pseudo-classes and pseudo-elements", [
        [
          ":hover",
          "While the mouse is over it.",
          "a:hover { text-decoration: underline; }",
        ],
        [
          ":focus-visible",
          "Keyboard focus: never hide it.",
          "button:focus-visible { outline: 2px solid; }",
        ],
        [
          ":disabled",
          "A disabled button or field.",
          "button:disabled { opacity: .5; }",
        ],
        [
          ":first-child",
          "The first child of its parent.",
          "li:first-child { font-weight: bold; }",
        ],
        [
          ":nth-child(odd)",
          "Every other one: stripes.",
          "tr:nth-child(odd) { background: #f6f8fa; }",
        ],
        [
          "::before",
          "Generated content before the element.",
          'a::before { content: "→ "; }',
        ],
      ]),
      playground("Hover, focus with Tab, and stripes", [
        "<style>",
        "  button:hover { background: gold; }",
        "  button:focus-visible { outline: 3px solid royalblue; }",
        "  li:nth-child(odd) { background: #eef3ff; }",
        "</style>",
        "<button>Hover me</button> <button>Then press Tab</button>",
        "<ul><li>One</li><li>Two</li><li>Three</li><li>Four</li></ul>",
      ]),
      explain(
        "A [[pseudo-class]] matches a state or a position, so you don't need extra classes or JavaScript for these.",
      ),
    ),
    cascadeModule,
    lesson(
      "transitions",
      "Transitions: smooth changes",
      3,
      explain(
        "A [[transition]] animates a change instead of switching at once: a button that fades to a new colour on hover.",
      ),
      playground("Hover the button", [
        "<style>",
        "  button {",
        "    padding: 8px 16px; border: 0; border-radius: 8px;",
        "    background: royalblue; color: white;",
        "    transition: background 300ms ease, transform 300ms ease;",
        "  }",
        "  button:hover { background: crimson; transform: translateY(-3px); }",
        "</style>",
        "<button>Save</button>",
      ]),
      quickCheck(
        "Where does the `transition` property go?",
        [
          "On the normal state, so it animates both ways",
          "Only in `:hover`",
          "On the parent",
        ],
        0,
        "Put it on the element itself; then the change in and the change back are both smooth.",
      ),
    ),
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
