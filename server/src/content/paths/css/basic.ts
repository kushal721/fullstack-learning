import type { LevelPlan } from "@fsl/shared";
import {
  analogy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  lesson,
  levelCheck,
  playground,
  quickCheck,
  reference,
} from "../blocks.js";

// Basic: steps 1–18. Rules and selectors, colours and text, units, the box
// model, display and flexbox, with live examples to edit.
export const basic: LevelPlan = {
  outcome:
    "Style a page yourself: pick elements, set colours, fonts and spacing, and line things up with flexbox.",
  steps: [
    lesson(
      "what-css-does",
      "What CSS does",
      2,
      explain(
        "[[css]] decides how a page looks: colours, sizes, spacing and where things sit. The [[html]] says what each part is; CSS says how it looks. Change the CSS and the same page can look completely different.",
      ),
      analogy(
        "If HTML is the walls and rooms of a house, CSS is the paint, the furniture and where it stands.",
      ),
      playground("Change the colour and the size", [
        "<style>",
        "  h1 { color: crimson; font-size: 40px; }",
        "  p { color: gray; }",
        "</style>",
        "<h1>My notes</h1>",
        "<p>Try changing crimson to teal, or 40px to 24px.</p>",
      ]),
    ),
    lesson(
      "rules",
      "Rules, properties and values",
      3,
      explain(
        "CSS is a list of [[css-rule|rules]]. Each rule has a selector (which elements) and declarations (how they look). A declaration is a [[css-property|property]], a colon, a [[css-value|value]] and a semicolon.",
      ),
      code(
        "css",
        "one rule",
        ["p {", "  color: navy;", "  font-size: 18px;", "}"],
        {
          1: "selector: every <p>",
          2: "property: value;",
          3: "another declaration",
        },
      ),
      quickCheck(
        "In `h1 { color: red; }`, what is `color`?",
        ["The selector", "The property", "The value"],
        1,
        "`h1` is the selector, `color` the [[css-property|property]] and `red` its [[css-value|value]].",
      ),
    ),
    lesson(
      "adding-css",
      "Three ways to add CSS",
      3,
      reference("Where CSS can live", [
        [
          "<link>",
          "A separate `.css` file, linked in `<head>`. The usual way.",
          '<link rel="stylesheet" href="style.css">',
        ],
        [
          "<style>",
          "Rules inside the page itself, in `<head>`.",
          "<style> p { color: navy; } </style>",
        ],
        [
          'style="…"',
          "Declarations on one element. Hard to reuse; avoid.",
          '<p style="color: navy">',
        ],
      ]),
      explain(
        "A [[stylesheet]] file can be shared by every page and cached by the browser, so it's the default. The playgrounds here use `<style>` so everything fits in one box.",
      ),
      quickCheck(
        "Your site has 20 pages. Where should the CSS go?",
        [
          "In a `style` attribute on each element",
          "In one stylesheet file linked from every page",
          "In a `<style>` block copied into each page",
        ],
        1,
        "One [[stylesheet]] means one place to change, and the browser downloads it once.",
      ),
    ),
    lesson(
      "selectors",
      "Selectors: picking elements",
      4,
      reference("The selectors you'll use most", [
        ["p", "Every element of that type.", "p { … }"],
        [".note", 'Every element with `class="note"`.', ".note { … }"],
        ["#title", 'The one element with `id="title"`.', "#title { … }"],
        [".card h2", "`h2`s anywhere inside a `.card`.", ".card h2 { … }"],
        ["h1, h2", "Both: a comma groups selectors.", "h1, h2 { … }"],
        ["a:hover", "Links while the mouse is over them.", "a:hover { … }"],
        ["*", "Every element.", "* { box-sizing: border-box; }"],
      ]),
      playground("Try different selectors", [
        "<style>",
        "  .note { background: lightyellow; }",
        "  .note h2 { color: darkorange; }",
        "  #first { border: 2px solid orange; }",
        "</style>",
        '<div class="note" id="first"><h2>Milk</h2><p>Buy two.</p></div>',
        '<div class="note"><h2>Bread</h2><p>Brown.</p></div>',
      ]),
      explain(
        "A [[css-selector|selector]] is a pattern; every element that matches gets the rule's styles.",
      ),
    ),
    lesson(
      "class-or-id",
      "Classes, not ids",
      2,
      explain(
        'Style with classes. A class can be reused on many elements and an element can have several (`class="note done"`). An id must be unique, and id selectors are so strong they\'re hard to override.',
      ),
      quickCheck(
        "Ten note cards should look the same. What do you give them?",
        ["The same id", "The same class", "A style attribute each"],
        1,
        "Ids must be unique; a class is made for sharing a look.",
      ),
    ),
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
    lesson(
      "box-model",
      "Every element is a box",
      3,
      explain(
        "The [[css-box-model|box model]]: every element is a rectangle of content, padding around it, a border, and margin outside that pushes other boxes away.",
      ),
      diagram([
        ["Margin", "space outside"],
        ["Border", "the line"],
        ["Padding", "space inside"],
        ["Content", "text, image"],
      ]),
      analogy(
        "A framed picture: the picture, the mount around it, the frame, and the gap to the next frame on the wall.",
      ),
    ),
    lesson(
      "spacing",
      "Padding, border and margin",
      4,
      reference("Box properties", [
        ["padding", "Space inside the border.", "padding: 1rem;"],
        [
          "border",
          "Width, style and colour of the line.",
          "border: 2px solid gray;",
        ],
        ["border-radius", "Rounded corners.", "border-radius: 8px;"],
        ["margin", "Space outside, pushing others away.", "margin: 1rem 0;"],
        ["margin: 0 auto", "Centres a block with a width.", "margin: 0 auto;"],
      ]),
      playground("Space things out", [
        "<style>",
        "  .card {",
        "    padding: 16px;",
        "    border: 2px solid steelblue;",
        "    border-radius: 8px;",
        "    margin: 12px 0;",
        "  }",
        "</style>",
        '<div class="card">Padding is inside the line.</div>',
        '<div class="card">Margin is the gap between cards.</div>',
      ]),
      quickCheck(
        "You want more space between a card's border and its text. Which property?",
        ["`margin`", "`padding`", "`border`"],
        1,
        "Padding is inside the border; margin is outside it.",
      ),
    ),
    lesson(
      "box-sizing",
      "Width that means width",
      2,
      explain(
        "By default, `width: 200px` plus `padding: 20px` makes a 240px-wide box. [[box-sizing|`box-sizing: border-box`]] makes `width` include padding and border, so 200px stays 200px.",
      ),
      code(
        "css",
        "the line almost every stylesheet starts with",
        ["*,", "*::before,", "*::after {", "  box-sizing: border-box;", "}"],
        { 4: "width now includes padding and border" },
      ),
      inTheNotesApp(
        "The Notes App's stylesheet starts with exactly this rule.",
        { fileId: "frontend/src/index.css" },
      ),
    ),
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
    lesson(
      "flexbox",
      "Flexbox: a row of things",
      3,
      explain(
        "[[css-flexbox|Flexbox]] lines children up. `display: flex` on the parent puts its children in a row; `gap` spaces them.",
      ),
      playground("A navigation bar with flexbox", [
        "<style>",
        "  nav { display: flex; gap: 16px; padding: 12px; background: #eef; }",
        "  nav a { color: navy; }",
        "</style>",
        "<nav>",
        '  <a href="#">Home</a>',
        '  <a href="#">Notes</a>',
        '  <a href="#">Settings</a>',
        "</nav>",
      ]),
      quickCheck(
        "Where do you write `display: flex`?",
        ["On each child", "On the parent", "On the `<body>` only"],
        1,
        "The parent becomes a flex container; its direct children become flex items.",
      ),
    ),
    lesson(
      "flex-alignment",
      "Aligning with flexbox",
      4,
      reference("Flex container properties", [
        [
          "flex-direction",
          "row (default) or column.",
          "flex-direction: column;",
        ],
        [
          "justify-content",
          "Along the main axis: start, center, space-between.",
          "justify-content: space-between;",
        ],
        [
          "align-items",
          "Across it: start, center, stretch.",
          "align-items: center;",
        ],
        ["gap", "Space between items.", "gap: 1rem;"],
        ["flex-wrap", "Let items move onto a new line.", "flex-wrap: wrap;"],
        [
          "flex: 1",
          "(on a child) Grow to fill free space.",
          ".search { flex: 1; }",
        ],
      ]),
      playground("Logo left, buttons right, all centred", [
        "<style>",
        "  header { display: flex; justify-content: space-between;",
        "    align-items: center; padding: 12px; background: #eef; }",
        "  .buttons { display: flex; gap: 8px; }",
        "</style>",
        "<header>",
        "  <strong>Notes</strong>",
        '  <div class="buttons"><button>New</button><button>Log out</button></div>',
        "</header>",
      ]),
      quickCheck(
        "Items are in a row. Which property centres them vertically?",
        ["`justify-content`", "`align-items`", "`text-align`"],
        1,
        "In a row, the [[main-axis|main axis]] is horizontal, so the vertical direction is the cross axis: `align-items`.",
      ),
    ),
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
      ["css-basic-property", "rules"],
      ["css-basic-class", "class-or-id"],
      ["css-basic-rem", "units"],
      ["css-basic-padding", "spacing"],
      ["css-basic-display-none", "display"],
      ["css-basic-align", "flex-alignment"],
    ]),
  ],
};
