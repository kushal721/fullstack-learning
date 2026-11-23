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
import { flexboxModule } from "./flexbox.js";
import { gettingStartedModule } from "./getting-started.js";

// Basic: steps 1–11. Getting started, the box model and flexbox (modules),
// colours and text, units, display, with live examples to edit.
export const basic: LevelPlan = {
  outcome:
    "Style a page yourself: pick elements, set colours, fonts and spacing, and line things up with flexbox.",
  steps: [
    gettingStartedModule,
    lesson(
      "colours",
      "Colours",
      3,
      reference("Ways to write a colour", [
        ["name", "About 140 named colours.", "color: tomato;"],
        ["hex", "Red, green and blue in base 16.", "color: #1d4ed8;"],
        [
          "rgb()",
          "Red, green and blue from 0 to 255.",
          "color: rgb(29 78 216);",
        ],
        [
          "hsl()",
          "Hue (0–360), saturation and lightness: easy to tweak.",
          "color: hsl(220 76% 48%);",
        ],
        [
          "/ alpha",
          "A fourth part for transparency.",
          "background: rgb(0 0 0 / 40%);",
        ],
      ]),
      playground("Text and background colours", [
        "<style>",
        "  body { background: hsl(220 40% 96%); }",
        "  h1 { color: #1d4ed8; }",
        "  p { color: rgb(80 80 80); }",
        "  .tag { background: rgb(29 78 216 / 15%); }",
        "</style>",
        "<h1>Colours</h1>",
        '<p>A <span class="tag">tag</span> with a see-through background.</p>',
      ]),
      quickCheck(
        "`color` and `background-color`: which one colours the text?",
        ["`color`", "`background-color`", "Both"],
        0,
        "`color` is the text; `background-color` is behind it. Keep enough contrast between the two ([[css-color|colours in CSS]]).",
      ),
    ),
    lesson(
      "text-and-fonts",
      "Text and fonts",
      3,
      explain(
        "[[typography]] is most of design: the font, its size and weight, the space between lines and how text lines up.",
      ),
      reference("Text properties", [
        [
          "font-family",
          "Which font, with fallbacks.",
          "font-family: Georgia, serif;",
        ],
        ["font-size", "How big.", "font-size: 1.25rem;"],
        ["font-weight", "How bold: 400 normal, 700 bold.", "font-weight: 700;"],
        [
          "line-height",
          "Space between lines; ~1.5 for body text.",
          "line-height: 1.5;",
        ],
        ["text-align", "Left, center, right.", "text-align: center;"],
        ["text-decoration", "Underline, or none.", "text-decoration: none;"],
        [
          "text-transform",
          "Uppercase or capitalize.",
          "text-transform: uppercase;",
        ],
      ]),
      playground("Make the text readable", [
        "<style>",
        "  body { font-family: Georgia, serif; line-height: 1.6; }",
        "  h1 { font-family: system-ui, sans-serif; text-align: center; }",
        "  .small { font-size: 0.8rem; text-transform: uppercase; }",
        "</style>",
        "<h1>A good read</h1>",
        '<p class="small">Chapter one</p>',
        "<p>Change the line height to 1 and see how much harder this is to read.</p>",
      ]),
    ),
    lesson(
      "units",
      "Units: px, rem, % and more",
      3,
      reference("Units you'll meet", [
        ["px", "Fixed pixels.", "border: 1px solid;"],
        [
          "rem",
          "× the root font size (usually 16px); grows when people enlarge text.",
          "font-size: 1.5rem;",
        ],
        ["em", "× this element's font size.", "padding: 0.5em;"],
        ["%", "Part of the parent's size.", "width: 50%;"],
        ["vw / vh", "Part of the window's width or height.", "height: 100vh;"],
      ]),
      explain(
        "Use `rem` for most sizes so the page grows with people's text settings, and `px` for thin lines. See [[css-unit|units]].",
      ),
      quickCheck(
        "Someone sets a bigger default text size. Which font size follows it?",
        ["`16px`", "`1rem`", "Neither"],
        1,
        "`rem` is relative to the root font size, which the browser setting changes.",
      ),
    ),
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
    lesson(
      "inheritance",
      "What children inherit",
      2,
      explain(
        "Some properties pass from a parent to its children: [[inheritance]]. Set `font-family` and `color` once on `body` and every element inside uses them. Box properties like `margin` and `border` don't pass down.",
      ),
      quickCheck(
        "You set `color: navy` on a `<div>`. What colour is the `<p>` inside it?",
        ["Black, the default", "Navy, inherited", "It depends on the margin"],
        1,
        "`color` is inherited, so children use their parent's colour unless they set their own.",
      ),
    ),
    levelCheck("basic-check", "Basic check", [
      ["css-basic-property", "getting-started"],
      ["css-basic-class", "getting-started"],
      ["css-basic-rem", "units"],
      ["css-basic-padding", "box-model"],
      ["css-basic-display-none", "display"],
      ["css-basic-align", "flexbox"],
    ]),
  ],
};
