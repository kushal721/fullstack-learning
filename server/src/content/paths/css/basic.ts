import type { LevelPlan } from "@fsl/shared";
import {
  explain,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";
import { boxModelModule } from "./box-model.js";
import { coloursAndTextModule } from "./colours-and-text.js";
import { flexboxModule } from "./flexbox.js";
import { gettingStartedModule } from "./getting-started.js";

// Basic: steps 1–8. Getting started, colours and text, the box model and
// flexbox (modules), display, sizing and backgrounds.
export const basic: LevelPlan = {
  outcome:
    "Style a page yourself: pick elements, set colours, fonts and spacing, and line things up with flexbox.",
  steps: [
    gettingStartedModule,
    coloursAndTextModule,
    boxModelModule,
    lesson(
      "display",
      "display: how a box behaves",
      3,
      reference("display values", [
        ["block", "Starts on a new line, full width.", "display: block;"],
        [
          "inline",
          "Flows inside text; width and height are ignored.",
          "display: inline;",
        ],
        [
          "inline-block",
          "Flows in text but takes a width and padding.",
          "display: inline-block;",
        ],
        ["flex", "Lines its children up in a row or column.", "display: flex;"],
        ["grid", "Places its children in rows and columns.", "display: grid;"],
        ["none", "Hides it completely, taking no space.", "display: none;"],
      ]),
      explain(
        "[[css-display|display]] can turn any element into any kind of box: a link can become a block, a list can become a row.",
      ),
      quickCheck(
        "Which hides an element and takes up no space at all?",
        ["`display: none`", "`color: transparent`", "`display: inline`"],
        0,
        "`display: none` removes it from the layout; a transparent colour still takes space.",
      ),
    ),
    lesson(
      "sizes-and-overflow",
      "Widths, heights and overflow",
      3,
      reference("Sizing", [
        ["width / height", "A fixed size.", "width: 20rem;"],
        [
          "max-width",
          "Never wider than this, but can shrink.",
          "max-width: 40rem;",
        ],
        [
          "min-height",
          "At least this tall, grows with content.",
          "min-height: 10rem;",
        ],
        [
          "overflow",
          "When content is bigger: visible, hidden, auto.",
          "overflow: auto;",
        ],
      ]),
      explain(
        "Prefer `max-width` to `width`, so boxes shrink on phones. `max-width: 100%` on images stops them sticking out. More in [[overflow]].",
      ),
      playground("max-width keeps text readable", [
        "<style>",
        "  .article { max-width: 30rem; margin: 0 auto; }",
        "  img { max-width: 100%; }",
        "</style>",
        '<div class="article">',
        "  <p>Long lines are hard to read. A max-width keeps them comfortable on wide screens, and lets them shrink on phones.</p>",
        "</div>",
      ]),
    ),
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
      ["css-basic-display-none", "display"],
      ["css-basic-align", "flexbox"],
    ]),
  ],
};
