import {
  analogy,
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  playground,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// The box model in depth: every element is a box (layered diagram), the
// four layers, one side at a time, shorthand with one to four values,
// borders, a step-through of how wide a box ends up, box-sizing:
// border-box, margin collapsing, inline boxes, inspecting boxes in
// DevTools, the Notes App's note card, mistakes, practice and a recap.
export const boxModelModule = moduleLesson(
  "box-model",
  "The box model",
  45,
  [
    "Name the four layers of every box: content, padding, border and margin.",
    "Set padding, border and margin on all sides or one side, with 1–4 value shorthand.",
    "Work out how wide a box really is, and make `width` mean width with `border-box`.",
    "Predict when two margins collapse into one, and why inline boxes ignore some sizes.",
    "Inspect any box's layers in DevTools to find where space comes from.",
  ],

  part(
    "why",
    "Every element is a box",
    explain(
      "Open any page and every element on it, a heading, a paragraph, a button, a link, is drawn as a rectangle. The [[css-box-model|box model]] describes that rectangle in four layers, from the inside out: the **content**, **padding** around it, a **border**, and **margin** outside that pushes other boxes away. Almost every spacing question in CSS is a question about one of these layers.",
    ),
    diagram([
      ["Margin", "space outside, pushes others away"],
      ["Border", "the line around the box"],
      ["Padding", "space inside the border"],
      ["Content", "text, image, children"],
    ]),
    analogy(
      "A framed picture on a wall: the picture is the content, the card mount is the padding, the frame is the border, and the gap to the next frame is the margin.",
    ),
    playground("Outline every box on the page", [
      "<style>",
      "  * { outline: 1px dashed crimson; }",
      "  .card { padding: 16px; border: 4px solid steelblue; margin: 24px; }",
      "</style>",
      "<h1>My notes</h1>",
      '<div class="card">',
      "  <h2>Shopping</h2>",
      '  <p>Milk and <a href="#">bread</a>.</p>',
      "</div>",
    ]),
  ),

  part(
    "anatomy",
    "The four layers, one property each",
    explain(
      "Each layer has its own property. `width` and `height` size the content, `padding` adds space inside the border, `border` draws the line, and `margin` adds space outside it. The background colour fills the content **and** the padding, stopping at the border's outer edge; the margin is always see-through.",
    ),
    anatomy(
      "A card's box, layer by layer",
      [
        ".card { width: 200px;",
        "  padding: 16px;",
        "  border: 2px solid gray;",
        "  margin: 24px; }",
      ],
      [
        [
          "width: 200px",
          "content",
          "How wide the content area is (by default). Height grows to fit the content unless you set one.",
        ],
        [
          "padding: 16px",
          "padding",
          "Space between the content and the border, on all four sides. The background shows through it.",
        ],
        [
          "border: 2px solid gray",
          "border",
          "A line around the padding: its width, its style (solid, dashed, dotted) and its colour.",
        ],
        [
          "margin: 24px",
          "margin",
          "Clear space outside the border. It pushes neighbours away and is always transparent.",
        ],
      ],
    ),
    quickCheck(
      "A card has a yellow background. Which layers are yellow?",
      [
        "Only the content",
        "The content and the padding",
        "Everything, margin included",
      ],
      1,
      "The background runs under the content and the padding up to the border. The margin is outside the box's paint and stays see-through.",
    ),
  ),

  part(
    "one-side",
    "One side at a time",
    explain(
      "Padding, border and margin each have four sides: top, right, bottom and left. Add the side to the property name to set just one. That's how you give a heading space below it but not above, or draw a line only under a navbar.",
    ),
    reference("Setting one side", [
      ["padding-top", "Space inside, above the content.", "padding-top: 8px;"],
      [
        "padding-left",
        "Space inside, left of the content.",
        "padding-left: 1rem;",
      ],
      [
        "margin-bottom",
        "Space outside, below the box.",
        "margin-bottom: 1.5rem;",
      ],
      ["margin-right", "Space outside, to the right.", "margin-right: 8px;"],
      [
        "border-bottom",
        "A line on one side only.",
        "border-bottom: 1px solid #d0d7de;",
      ],
      [
        "border-left",
        "A coloured stripe down the left.",
        "border-left: 4px solid crimson;",
      ],
      [
        "margin: 0 auto",
        "auto left and right margins share the free space: a block with a width is centred.",
        "max-width: 40rem; margin: 0 auto;",
      ],
    ]),
    playground("Space and lines on one side", [
      "<style>",
      "  h2 { margin-top: 0; margin-bottom: 4px; }",
      "  .note {",
      "    padding-left: 12px;",
      "    border-left: 4px solid crimson;",
      "    margin-bottom: 16px;",
      "  }",
      "  nav { padding-bottom: 8px; border-bottom: 1px solid #ccc; }",
      "</style>",
      "<nav>Home · Notes</nav>",
      '<div class="note"><h2>Urgent</h2><p>Pay the rent.</p></div>',
      '<div class="note"><h2>Later</h2><p>Fix the bike.</p></div>',
    ]),
  ),

  part(
    "shorthand",
    "Shorthand: one to four values",
    explain(
      "Writing four properties for every box gets long, so `padding` and `margin` take one to four values: a [[css-shorthand|shorthand]]. Four values go **clockwise from the top**: top, right, bottom, left. Fewer values repeat: two mean top-and-bottom then left-and-right. Remember it as a clock starting at 12.",
    ),
    reference("How many values, which sides", [
      ["1 value", "All four sides.", "padding: 16px;"],
      [
        "2 values",
        "Top and bottom, then left and right.",
        "padding: 8px 16px;",
      ],
      [
        "3 values",
        "Top, then left and right, then bottom.",
        "margin: 0 auto 24px;",
      ],
      [
        "4 values",
        "Top, right, bottom, left: clockwise.",
        "margin: 0 8px 16px 8px;",
      ],
      [
        "border",
        "Width, style, colour in any order; style is required.",
        "border: 2px dashed teal;",
      ],
    ]),
    playground("Change the numbers and watch each side", [
      "<style>",
      "  div { background: lightyellow; border: 1px solid orange;",
      "    margin-bottom: 8px; }",
      "  .one { padding: 16px; }",
      "  .two { padding: 4px 32px; }",
      "  .three { padding: 0 16px 32px; }",
      "  .four { padding: 0 8px 16px 48px; }",
      "</style>",
      '<div class="one">one value</div>',
      '<div class="two">two values</div>',
      '<div class="three">three values</div>',
      '<div class="four">four values</div>',
    ]),
    quickCheck(
      "Which sides get 20px in `margin: 0 20px`?",
      ["Top and bottom", "Left and right", "Only the right", "Top and left"],
      1,
      "Two values mean top-and-bottom first (0), then left-and-right (20px).",
    ),
  ),

  part(
    "borders",
    "Borders and rounded corners",
    explain(
      "A border needs a **style**, or it doesn't show: `border: 2px gray` draws nothing, `border: 2px solid gray` draws a line. `border-radius` rounds the corners, and the background follows the curve. A radius of half the width and height, or `50%`, turns a square into a circle. Thin borders are usually `1px`, the one place fixed pixels are the right unit.",
    ),
    reference("Border properties", [
      ["border", "Width, style and colour at once.", "border: 1px solid #ccc;"],
      [
        "border-style",
        "solid, dashed, dotted, double, none.",
        "border-style: dashed;",
      ],
      ["border-color", "Just the colour.", "border-color: crimson;"],
      ["border-radius", "Rounded corners.", "border-radius: 8px;"],
      [
        "border-radius: 50%",
        "A circle (on a square box).",
        "border-radius: 50%;",
      ],
      [
        "outline",
        "A line outside the border that takes no space: focus rings.",
        "outline: 2px solid blue;",
      ],
    ]),
    playground("Styles, radius and a circle", [
      "<style>",
      "  .box { padding: 12px; margin-bottom: 12px; }",
      "  .solid { border: 2px solid steelblue; border-radius: 8px; }",
      "  .dashed { border: 2px dashed crimson; }",
      "  .avatar { width: 64px; height: 64px; background: teal;",
      "    border-radius: 50%; }",
      "</style>",
      '<div class="box solid">Solid, rounded</div>',
      '<div class="box dashed">Dashed</div>',
      '<div class="avatar"></div>',
    ]),
  ),

  part(
    "how-wide",
    "How wide is the box, move by move",
    explain(
      "Here's the surprise most beginners hit. By default, `width` sizes only the **content**. Padding and border are added on top, so a box with `width: 200px` ends up wider than 200px. Step through how the browser works out the card's real width:",
    ),
    trace(
      "Working out the width the box takes up",
      [
        "<style>",
        "  .card {",
        "    width: 200px;",
        "    padding: 20px;",
        "    border: 4px solid gray;",
        "    margin: 10px;",
        "  }",
        "</style>",
      ],
      [
        {
          line: 3,
          note: "`width` sets the content area. With the default `box-sizing: content-box`, that's all it sets.",
          vars: [
            ["content", "200px"],
            ["box so far", "200px"],
          ],
        },
        {
          line: 4,
          note: "Padding is added on the left **and** the right: 20 + 20 more.",
          vars: [
            ["content", "200px"],
            ["padding", "20px + 20px"],
            ["box so far", "240px"],
          ],
        },
        {
          line: 5,
          note: "The border is added on both sides too: 4 + 4 more. This is the box you can see.",
          vars: [
            ["content", "200px"],
            ["padding", "20px + 20px"],
            ["border", "4px + 4px"],
            ["visible box", "248px"],
          ],
        },
        {
          line: 6,
          note: "Margin isn't part of the visible box, but it takes up room in the layout: 10 + 10 more.",
          vars: [
            ["visible box", "248px"],
            ["margin", "10px + 10px"],
            ["space taken", "268px"],
          ],
          output: "248px wide on screen, 268px of room",
        },
      ],
      { language: "html" },
    ),
    keyPoints(
      "By default, `width` is only the content.",
      "Padding and border add to both sides of it.",
      "Margin takes room but isn't part of the visible box.",
    ),
  ),

  part(
    "border-box",
    "box-sizing: width that means width",
    explain(
      "Adding up sides is tiring and error-prone: two `50%` columns with padding no longer fit side by side. [[box-sizing|`box-sizing: border-box`]] changes what `width` means: it now includes the padding and border, and the content shrinks to make room. `width: 200px` stays 200px whatever padding you add. Almost every stylesheet sets it on every element, first thing.",
    ),
    code(
      "css",
      "the rule almost every stylesheet starts with",
      ["*,", "*::before,", "*::after {", "  box-sizing: border-box;", "}"],
      {
        1: "every element…",
        2: "…and the boxes CSS adds before and after content",
        4: "width and height now include padding and border",
      },
    ),
    reference("The two box-sizing values", [
      [
        "content-box",
        "The default: width is the content; padding and border are added.",
        "200 + 2×20 + 2×4 = 248px",
      ],
      [
        "border-box",
        "Width includes padding and border; the content shrinks.",
        "200px wide, content 152px",
      ],
    ]),
    inTheNotesApp(
      "The Notes App's stylesheet starts with exactly this rule, with a comment saying why: so boxes are the size it sets.",
      { fileId: "frontend/src/index.css" },
    ),
    quickCheck(
      "With `box-sizing: border-box`, a box has `width: 300px`, `padding: 10px` and a 5px border. How wide is it on screen?",
      ["270px", "300px", "330px"],
      1,
      "`border-box` keeps the width you set; the content area shrinks to 300 − 20 − 10 = 270px instead.",
    ),
  ),

  part(
    "margin-collapsing",
    "When two margins become one",
    explain(
      "Stack two blocks, the first with `margin-bottom: 30px` and the second with `margin-top: 20px`, and the gap is **30px, not 50px**. Vertical margins between blocks [[margin-collapsing|collapse]]: the larger one wins. It only happens top-and-bottom, never left-and-right, and never inside flex or grid layouts. A child's top margin can also escape through a parent that has no padding or border.",
    ),
    playground("Two margins, one gap", [
      "<style>",
      "  p { background: lightyellow; margin: 0; }",
      "  .first { margin-bottom: 30px; }",
      "  .second { margin-top: 20px; }",
      "  .row { display: flex; }",
      "  .row p { margin: 0 30px 0 0; }",
      "</style>",
      '<p class="first">Bottom margin 30px</p>',
      '<p class="second">Top margin 20px: the gap is 30px</p>',
      '<div class="row"><p>Side margins</p><p>never collapse</p></div>',
    ]),
    keyPoints(
      "Only vertical margins between blocks collapse; the larger wins.",
      "Flex and grid items never collapse their margins.",
      "Padding or a border on the parent stops a child's margin escaping.",
      "Many teams space with one direction only, like `margin-bottom`.",
    ),
    quickCheck(
      "A heading has `margin-bottom: 24px`; the paragraph after it has `margin-top: 16px`. How big is the gap?",
      ["16px", "24px", "40px"],
      1,
      "Vertical margins between blocks collapse to the larger of the two: 24px.",
    ),
  ),

  part(
    "inline-boxes",
    "Inline boxes play by other rules",
    explain(
      "[[block-inline|Inline]] elements like `<a>`, `<span>` and `<strong>` flow inside a line of text, so they can't push lines apart. `width` and `height` are ignored, and top and bottom margins do nothing. Padding and borders are drawn but don't move the lines above and below. Make it `display: inline-block` (or `block`) and the whole box model applies again.",
    ),
    playground("inline versus inline-block", [
      "<style>",
      "  span { background: gold; padding: 8px; margin: 20px;",
      "    width: 200px; border: 2px solid orange; }",
      "  .ib { display: inline-block; }",
      "</style>",
      "<p>An <span>inline span</span> ignores width and the top margin.</p>",
      '<p>An <span class="ib">inline-block</span> uses them all.</p>',
    ]),
    quickCheck(
      "You give a link `width: 200px` and nothing changes. Why?",
      [
        "Links can't be styled",
        "It's inline, and inline boxes ignore width",
        "Width only works in rem",
      ],
      1,
      "`<a>` is inline. `display: inline-block` or `block` lets it take a width.",
    ),
  ),

  part(
    "devtools",
    "Inspecting boxes in DevTools",
    explain(
      "When spacing looks wrong, don't guess. Right-click the element, choose **Inspect**, and the browser's DevTools highlights its box on the page: content in blue, padding in green, border in yellow and margin in orange. The **Computed** tab draws the same layers as nested rectangles with the exact numbers, and clicking a number lets you change it live.",
    ),
    keyPoints(
      "Hover an element in the Elements panel to see its layers on the page.",
      "Computed tab: the box diagram, with every side's number.",
      "Orange around a box is margin; green inside it is padding.",
      "Edit values there to try a fix, then copy it into your CSS.",
    ),
    quickCheck(
      "There's an unexpected gap above a heading. In DevTools it's orange. What is it?",
      ["The heading's padding", "The heading's margin", "A border"],
      1,
      "DevTools draws margin in orange. Browsers give headings a default top and bottom margin; set `margin-top: 0` to remove it.",
    ),
  ),

  part(
    "notes-app",
    "The box model in the Notes App",
    explain(
      "Every note in the Notes App is a card made of exactly these layers. `.note-card` gets `padding: 1rem` so the text doesn't touch the edge, a `1px` border in the border colour, and rounded corners. Its heading drops the browser's default top margin with `margin: 0 0 0.5rem`, so the title sits right at the top of the padding.",
    ),
    code(
      "css",
      "the note card, from the Notes App's stylesheet",
      [
        ".note-card {",
        "  padding: 1rem;",
        "  background: white;",
        "  border: 1px solid var(--color-border);",
        "  border-radius: 0.5rem;",
        "}",
        "",
        ".note-card h2 {",
        "  margin: 0 0 0.5rem;",
        "  font-size: 1.125rem;",
        "}",
      ],
      {
        2: "space inside, all four sides",
        4: "a thin line: 1px",
        5: "rounded corners",
        9: "three values: no top, no sides, 0.5rem below",
      },
    ),
    inTheNotesApp(
      "`NoteCard` renders each note as an `<article>` with the `note-card` class, so every card gets this box.",
      { symbolId: "component:NoteCard" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Two half-width columns that don't fit",
      language: "css",
      wrong: [".column {", "  width: 50%;", "  padding: 16px;", "}"],
      problem:
        "Each column is 50% **plus** 32px of padding, so two of them are wider than their parent and the second wraps below.",
      right: [
        "* { box-sizing: border-box; }",
        ".column {",
        "  width: 50%;",
        "  padding: 16px;",
        "}",
      ],
      why: "With `border-box`, 50% includes the padding, so two columns fit exactly.",
    }),
    mistake({
      title: "A border with no style",
      language: "css",
      wrong: [".card { border: 2px crimson; }"],
      problem:
        "The default border style is `none`, so nothing is drawn, whatever the width and colour.",
      right: [".card { border: 2px solid crimson; }"],
      why: "A border needs a style: solid, dashed or dotted.",
    }),
    mistake({
      title: "Margin where you meant padding",
      language: "css",
      wrong: [".button {", "  background: navy;", "  margin: 12px;", "}"],
      problem:
        "The text still touches the edge of the navy background; the 12px lands outside, between buttons.",
      right: [".button {", "  background: navy;", "  padding: 12px;", "}"],
      why: "Space **inside** the background is padding; space between boxes is margin.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Style a note card",
      task: "Give `.card` `16px` of padding, a `2px solid` border in `steelblue`, rounded `8px` corners and a `24px` margin below it.",
      starter: [
        "<style>",
        "  .card {",
        "  }",
        "</style>",
        '<div class="card"><h2>Shopping</h2><p>Milk, bread.</p></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "16px of padding",
          selector: ".card",
          property: "padding-left",
          value: "16px",
        },
        {
          kind: "style",
          label: "A 2px border",
          selector: ".card",
          property: "border-top-width",
          value: "2px",
        },
        {
          kind: "style",
          label: "A solid border",
          selector: ".card",
          property: "border-top-style",
          value: "solid",
        },
        {
          kind: "style",
          label: "Rounded 8px corners",
          selector: ".card",
          property: "border-top-left-radius",
          value: "8px",
        },
        {
          kind: "style",
          label: "24px below the card",
          selector: ".card",
          property: "margin-bottom",
          value: "24px",
        },
      ],
      hint: "Inside `.card { }`: `padding: 16px; border: 2px solid steelblue; border-radius: 8px; margin-bottom: 24px;`",
      solution: [
        "<style>",
        "  .card {",
        "    padding: 16px;",
        "    border: 2px solid steelblue;",
        "    border-radius: 8px;",
        "    margin-bottom: 24px;",
        "  }",
        "</style>",
        '<div class="card"><h2>Shopping</h2><p>Milk, bread.</p></div>',
      ],
    }),
    pageYourTurn({
      title: "Shorthand and border-box",
      task: "Make every element use `border-box`. Then give `.button` padding of `8px` top and bottom and `16px` left and right, in one `padding` declaration.",
      starter: [
        "<style>",
        "  .button { background: navy; color: white; }",
        "</style>",
        '<a class="button" href="#">Save note</a>',
      ],
      checks: [
        {
          kind: "style",
          label: "Every element uses border-box",
          selector: "a",
          property: "box-sizing",
          value: "border-box",
        },
        {
          kind: "style",
          label: "8px at the top",
          selector: ".button",
          property: "padding-top",
          value: "8px",
        },
        {
          kind: "style",
          label: "8px at the bottom",
          selector: ".button",
          property: "padding-bottom",
          value: "8px",
        },
        {
          kind: "style",
          label: "16px on the left",
          selector: ".button",
          property: "padding-left",
          value: "16px",
        },
        {
          kind: "style",
          label: "16px on the right",
          selector: ".button",
          property: "padding-right",
          value: "16px",
        },
      ],
      hint: "`* { box-sizing: border-box; }`, and two values in `.button`: `padding: 8px 16px;` (top-and-bottom first).",
      solution: [
        "<style>",
        "  * { box-sizing: border-box; }",
        "  .button { background: navy; color: white; padding: 8px 16px; }",
        "</style>",
        '<a class="button" href="#">Save note</a>',
      ],
    }),
    pageYourTurn({
      title: "Tidy a heading's space",
      task: "The heading has the browser's default margins. Remove its top margin and set `8px` below it, with one three-value `margin`. Draw a `1px solid` line under it with `border-bottom`.",
      starter: [
        "<style>",
        "  h2 { }",
        "</style>",
        "<h2>Today</h2>",
        "<p>Send the report.</p>",
      ],
      checks: [
        {
          kind: "style",
          label: "No top margin",
          selector: "h2",
          property: "margin-top",
          value: "0px",
        },
        {
          kind: "style",
          label: "8px below",
          selector: "h2",
          property: "margin-bottom",
          value: "8px",
        },
        {
          kind: "style",
          label: "A 1px line underneath",
          selector: "h2",
          property: "border-bottom-width",
          value: "1px",
        },
        {
          kind: "style",
          label: "A solid line",
          selector: "h2",
          property: "border-bottom-style",
          value: "solid",
        },
      ],
      hint: "`h2 { margin: 0 0 8px; border-bottom: 1px solid gray; }`: three values are top, left-and-right, bottom.",
      solution: [
        "<style>",
        "  h2 { margin: 0 0 8px; border-bottom: 1px solid gray; }",
        "</style>",
        "<h2>Today</h2>",
        "<p>Send the report.</p>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Box model cheat sheet", [
      ["content", "width and height size it (by default).", "width: 20rem;"],
      [
        "padding",
        "Space inside the border; background shows.",
        "padding: 1rem;",
      ],
      [
        "border",
        "Width, style, colour; style is required.",
        "border: 1px solid #ccc;",
      ],
      [
        "margin",
        "Space outside; transparent; pushes others.",
        "margin-bottom: 1rem;",
      ],
      ["-top / -right…", "One side only.", "border-left: 4px solid red;"],
      [
        "1–4 values",
        "all · vertical horizontal · top sides bottom · clockwise",
        "padding: 8px 16px;",
      ],
      [
        "border-box",
        "Width includes padding and border.",
        "* { box-sizing: border-box; }",
      ],
      [
        "collapsing",
        "Vertical margins between blocks: larger wins.",
        "30px + 20px → 30px",
      ],
      [
        "border-radius",
        "Rounded corners; 50% for a circle.",
        "border-radius: 8px;",
      ],
    ]),
    quickCheck(
      "Without `border-box`, a box has `width: 100px`, `padding: 10px` and `border: 1px solid`. How wide is it on screen?",
      ["100px", "111px", "122px"],
      2,
      "100 for the content, plus 10 + 10 padding, plus 1 + 1 border: 122px. With `border-box` it would stay 100px.",
    ),
  ),
);
