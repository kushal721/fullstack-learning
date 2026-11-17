import type { LevelPlan } from "@fsl/shared";
import {
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";
import { gridModule } from "./grid.js";
import { responsiveModule } from "./responsive.js";

// Intermediate: steps 16–26. Grid and responsive design (modules),
// positioning, states, which rule wins, and transitions.
export const intermediate: LevelPlan = {
  outcome:
    "Build layouts that work on every screen, and know which rule wins when two disagree.",
  steps: [
    gridModule,
    responsiveModule,
    lesson(
      "position",
      "Positioning",
      3,
      reference("position values", [
        ["static", "The default: in the normal flow.", "position: static;"],
        [
          "relative",
          "Nudged from its normal place; anchors absolute children.",
          "position: relative; top: 4px;",
        ],
        [
          "absolute",
          "Placed inside the nearest positioned parent.",
          "position: absolute; top: 0; right: 0;",
        ],
        [
          "fixed",
          "Stays put relative to the window.",
          "position: fixed; bottom: 1rem;",
        ],
        [
          "sticky",
          "Scrolls, then sticks at an edge.",
          "position: sticky; top: 0;",
        ],
      ]),
      playground("A badge in the corner of a card", [
        "<style>",
        "  .card { position: relative; padding: 24px; background: #eef3ff; border-radius: 8px; }",
        "  .badge { position: absolute; top: 8px; right: 8px;",
        "    background: crimson; color: white; padding: 2px 8px; border-radius: 99px; }",
        "</style>",
        '<div class="card">A note <span class="badge">New</span></div>',
      ]),
      quickCheck(
        "An absolutely positioned badge jumps to the corner of the whole page. What's missing?",
        [
          "`position: relative` on the card",
          "A bigger `z-index`",
          "`display: flex`",
        ],
        0,
        "Absolute elements are placed inside the nearest positioned ancestor; make the card one with [[css-position|`position: relative`]].",
      ),
    ),
    lesson(
      "z-index",
      "What's on top: z-index",
      2,
      explain(
        "When positioned elements overlap, [[z-index]] decides which is drawn on top: the higher number wins, among elements in the same stacking context.",
      ),
      keyPoints(
        "Use it only for things that really overlap: menus, dialogs, sticky headers.",
        "It only works on positioned elements (and flex or grid children).",
        "A small scale (1, 10, 100) is easier than 99999.",
      ),
    ),
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
    lesson(
      "cascade",
      "When rules disagree: the cascade",
      3,
      explain(
        "Two rules can set the same property on the same element. [[cascade|The cascade]] picks one: first by importance, then by how specific the selector is, then by which comes last.",
      ),
      code(
        "css",
        "the later rule wins when they're equally specific",
        ["p { color: navy; }", "p { color: green; }"],
        { 2: "this one wins: same selector, written later" },
      ),
      quickCheck(
        "Both rules use the selector `p`. Which colour does a paragraph get?",
        ["The first one", "The last one", "A mix of both"],
        1,
        "With equal [[specificity]], the rule written last wins.",
      ),
    ),
    lesson(
      "specificity",
      "Specificity: which selector is stronger",
      3,
      explain(
        "[[specificity]] counts what a selector uses: ids beat classes, classes beat element names. A stronger selector wins even if it comes earlier.",
      ),
      reference("From weak to strong", [
        ["p", "An element name: weakest.", "0 – 0 – 1"],
        [".note", "A class (or attribute, or pseudo-class).", "0 – 1 – 0"],
        [".note p", "Adds up: one class, one element.", "0 – 1 – 1"],
        ["#title", "An id: stronger than any number of classes.", "1 – 0 – 0"],
        ['style="…"', "Inline styles beat all selectors.", "—"],
        [
          "!important",
          "Overrides everything else; avoid it.",
          "color: red !important;",
        ],
      ]),
      quickCheck(
        "`.title { color: red }` comes after `#main h1 { color: blue }`. The h1 has both. Colour?",
        ["Red, it's later", "Blue, the id makes it more specific", "Black"],
        1,
        "Specificity is checked before order: an id beats a class.",
      ),
    ),
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
      ["css-intermediate-absolute", "position"],
      ["css-intermediate-specificity", "specificity"],
    ]),
  ],
};
