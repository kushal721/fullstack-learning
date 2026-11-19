import {
  analogy,
  anatomy,
  code,
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

// Colours, text and units: colour and background, the ways to write a
// colour, transparency, contrast, fonts and font stacks, size and weight,
// line height and alignment, units, em versus rem step by step, what text
// inherits, the Notes App's colours and fonts, mistakes, practice and a
// recap.
export const coloursAndTextModule = moduleLesson(
  "colours-and-text",
  "Colours, text and units",
  45,
  [
    "Write colours as names, hex, `rgb()` and `hsl()`, with or without transparency.",
    "Pick text and background colours with enough contrast to read.",
    "Set fonts with a font stack, and size, weight, line height and alignment.",
    "Choose between `px`, `rem`, `em`, `%` and `vw`, and explain why `rem` suits text.",
    "Use inheritance to set the font and colour once, on `body`.",
  ],

  part(
    "colour-basics",
    "Colour and background",
    explain(
      "Two properties do most of the colouring. `color` sets the **text** colour, and also the default for borders and underlines. `background-color` fills the box **behind** the text, including its padding. The simplest values are the 140 or so colour names, like `navy`, `crimson` or `lightyellow`.",
    ),
    playground("Text colour and background", [
      "<style>",
      "  h1 { color: navy; }",
      "  .note { color: darkslategray; background-color: lightyellow; padding: 12px; }",
      "  .warning { color: white; background-color: crimson; padding: 4px 8px; }",
      "</style>",
      "<h1>My notes</h1>",
      '<p class="note">Buy milk. <span class="warning">Today!</span></p>',
    ]),
    quickCheck(
      "`color` and `background-color`: which one colours the text?",
      ["`color`", "`background-color`", "Both"],
      0,
      "`color` is the text; `background-color` is behind it. Keep enough contrast between the two ([[css-color|colours in CSS]]).",
    ),
  ),

  part(
    "writing-colours",
    "Four ways to write a colour",
    explain(
      "Names are handy but limited. Screens mix every colour from **red, green and blue** light, and the other formats say how much of each. Hex writes the three amounts in base 16, `00` to `ff`. `rgb()` writes them from 0 to 255. `hsl()` describes the colour the way people do: which hue, how strong, how light.",
    ),
    reference("Ways to write a colour", [
      ["name", "About 140 named colours.", "color: tomato;"],
      ["hex", "Red, green and blue in base 16.", "color: #1d4ed8;"],
      ["short hex", "One digit each, doubled: #f60 = #ff6600.", "color: #f60;"],
      ["rgb()", "Red, green and blue from 0 to 255.", "color: rgb(29 78 216);"],
      [
        "hsl()",
        "Hue (0–360), saturation and lightness.",
        "color: hsl(220 76% 48%);",
      ],
      ["transparent", "Fully see-through.", "background: transparent;"],
    ]),
    anatomy(
      "One hsl() colour",
      ["color: hsl(220 76% 48% / 50%);"],
      [
        [
          "220",
          "hue",
          "An angle on the colour wheel: 0 red, 120 green, 220 blue.",
        ],
        ["76%", "saturation", "How strong: 0% is grey, 100% is vivid."],
        ["48%", "lightness", "0% is black, 100% white, 50% the pure colour."],
        [
          "50%",
          "alpha",
          "Optional, after a slash: how opaque. 50% is half see-through.",
        ],
      ],
    ),
    quickCheck(
      "You want the same blue, a bit lighter. Which format makes that easiest?",
      ["Hex", "`hsl()`", "A colour name"],
      1,
      "Raise the lightness in [[css-color|`hsl()`]] and keep the hue and saturation; in hex all three numbers change.",
    ),
  ),

  part(
    "transparency",
    "Transparency: alpha and opacity",
    explain(
      "A colour can be partly see-through: add `/ alpha` to `rgb()` or `hsl()`, from `0` (invisible) to `1` or `100%`. Only that one colour is see-through. The `opacity` property is different: it fades the **whole element**, its text, borders and children included.",
    ),
    playground("Alpha on the background versus opacity", [
      "<style>",
      "  .stage { padding: 8px; background: linear-gradient(90deg, gold, tomato); }",
      "  .box { padding: 12px; margin: 8px 0; color: black; }",
      "  .alpha { background: rgb(255 255 255 / 60%); }",
      "  .faded { background: white; opacity: 0.6; }",
      "</style>",
      '<div class="stage">',
      '  <div class="box alpha">Alpha: only the background lets the colours through.</div>',
      '  <div class="box faded">Opacity: the text fades too.</div>',
      "</div>",
    ]),
    quickCheck(
      "A card needs a see-through background but solid, readable text. What do you use?",
      [
        "`opacity: 0.5` on the card",
        "A background colour with alpha, like `rgb(255 255 255 / 50%)`",
        "`color: transparent`",
      ],
      1,
      "Alpha affects one colour only. `opacity` fades everything in the element, text included.",
    ),
  ),

  part(
    "contrast",
    "Contrast: colours people can read",
    explain(
      "Pale grey on white looks elegant and is hard to read, in sunlight, on a cheap screen or with weaker eyesight. [[color-contrast|Contrast]] is measured as a ratio from 1:1 (the same colour) to 21:1 (black on white). Aim for at least **4.5:1** for normal text and 3:1 for large text. DevTools shows the ratio when you inspect a colour.",
    ),
    reference("Grey text on white", [
      ["#999999", "2.85:1. Too faint for text.", "color: #999;"],
      ["#777777", "4.48:1. Just under the line.", "color: #777;"],
      ["#595959", "7:1. Comfortable.", "color: #595959;"],
      ["#1d4ed8", "6.7:1. This blue is fine for links.", "color: #1d4ed8;"],
    ]),
    playground("Which lines are easy to read?", [
      "<style>",
      "  body { background: white; font-size: 16px; }",
      "  .a { color: #999; } .b { color: #777; } .c { color: #595959; }",
      "</style>",
      '<p class="a">#999 on white: 2.85 to 1</p>',
      '<p class="b">#777 on white: 4.48 to 1</p>',
      '<p class="c">#595959 on white: 7 to 1</p>',
    ]),
    keyPoints(
      "Never use colour alone to carry meaning: add a word or an icon to red errors.",
      "Check text on top of images and gradients too, at its lightest point.",
      "Low contrast is an accessibility problem, and automated checkers flag it.",
    ),
  ),

  part(
    "fonts",
    "Fonts and font stacks",
    explain(
      "`font-family` takes a list, a [[font-stack]]. The browser uses the first font the device has, so it ends with a **generic family** that always exists. Names with spaces go in quotes. `system-ui` uses the device's own interface font: fast, familiar, nothing to download.",
    ),
    reference("Generic families", [
      ["serif", "Small strokes at the ends: Georgia, Times.", "Georgia, serif"],
      [
        "sans-serif",
        "Plain strokes: Arial, Helvetica.",
        '"Helvetica Neue", Arial, sans-serif',
      ],
      [
        "monospace",
        "Every letter the same width, for code.",
        "Menlo, Consolas, monospace",
      ],
      [
        "system-ui",
        "The phone or computer's own font.",
        "system-ui, sans-serif",
      ],
    ]),
    playground("Same text, four stacks", [
      "<style>",
      "  .a { font-family: Georgia, serif; }",
      "  .b { font-family: system-ui, sans-serif; }",
      "  .c { font-family: Menlo, Consolas, monospace; }",
      '  .d { font-family: "Comic Sans MS", cursive; }',
      "</style>",
      '<p class="a">Georgia, serif: a book.</p>',
      '<p class="b">system-ui: an app.</p>',
      '<p class="c">monospace: some code.</p>',
      '<p class="d">cursive: a party invitation.</p>',
    ]),
    explain(
      "A **web font** is downloaded with the page, so it looks the same everywhere. A font service gives you a `<link>` to add, or you host the file and describe it with `@font-face`. Each one costs a download, so use one or two, and keep a generic family at the end of the stack.",
    ),
    code(
      "css",
      "a web font you host yourself",
      [
        "@font-face {",
        '  font-family: "Inter";',
        '  src: url("/fonts/inter.woff2") format("woff2");',
        "  font-display: swap;",
        "}",
        'body { font-family: "Inter", system-ui, sans-serif; }',
      ],
      {
        2: "the name you'll use in font-family",
        3: "where the file is; woff2 is the small modern format",
        4: "show a fallback font until it arrives",
        6: "the stack: Inter if loaded, else the system font",
      },
    ),
  ),

  part(
    "size-and-weight",
    "Size, weight and style",
    explain(
      "`font-size` sets how big the letters are; the browser default is `16px`, which is right for body text. `font-weight` goes from `100` (thin) to `900` (black): `400` is `normal` and `700` is `bold`, but a font only has the weights it was made with. `font-style: italic` slants it.",
    ),
    reference("Text properties", [
      ["font-size", "How big.", "font-size: 1.25rem;"],
      ["font-weight", "How bold: 400 normal, 700 bold.", "font-weight: 700;"],
      ["font-style", "Italic or normal.", "font-style: italic;"],
      [
        "font",
        "Shorthand: style, weight, size/line-height, family.",
        "font: italic 700 1.25rem/1.4 Georgia, serif;",
      ],
      [
        "font: inherit",
        "Use the parent's font (for buttons and inputs).",
        "button { font: inherit; }",
      ],
    ]),
    playground("A heading scale", [
      "<style>",
      "  body { font-family: system-ui, sans-serif; }",
      "  h1 { font-size: 2rem; font-weight: 800; }",
      "  h2 { font-size: 1.5rem; font-weight: 600; }",
      "  .meta { font-size: 0.875rem; font-style: italic; }",
      "</style>",
      "<h1>Notes</h1>",
      "<h2>Shopping</h2>",
      '<p class="meta">Edited today</p>',
      "<p>Milk, bread and eggs.</p>",
    ]),
  ),

  part(
    "text-layout",
    "Line height, alignment and spacing",
    explain(
      "[[typography|Typography]] is mostly about space. `line-height` is the height of each line: about `1.5` for paragraphs, tighter for big headings. Write it **without a unit**, so it's a multiple of each element's own font size. `text-align` lines text up; left-aligned is easiest to read in long paragraphs.",
    ),
    reference("Space and decoration", [
      [
        "line-height",
        "Height of a line; ~1.5 for body text, no unit.",
        "line-height: 1.5;",
      ],
      ["text-align", "left, center, right, justify.", "text-align: center;"],
      ["letter-spacing", "Space between letters.", "letter-spacing: 0.05em;"],
      [
        "text-transform",
        "uppercase, lowercase, capitalize.",
        "text-transform: uppercase;",
      ],
      [
        "text-decoration",
        "Underline, line-through, or none.",
        "text-decoration: none;",
      ],
      [
        "max-width in ch",
        "About 60–75 characters per line reads best.",
        "max-width: 65ch;",
      ],
    ]),
    playground("Make the text readable", [
      "<style>",
      "  body { font-family: Georgia, serif; line-height: 1.6; }",
      "  h1 { font-family: system-ui, sans-serif; line-height: 1.1; text-align: center; }",
      "  .label { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.1em; }",
      "  p { max-width: 40ch; }",
      "</style>",
      "<h1>A good read</h1>",
      '<p class="label">Chapter one</p>',
      "<p>Change the line height to 1 and see how much harder this is to read. Then remove the max-width on a wide screen.</p>",
    ]),
    quickCheck(
      "Which `line-height` is safest to set on `body`?",
      ["`1.5`", "`24px`", "`1.5em`"],
      0,
      "A unitless number is passed down as a multiple, so each child works it out from its own size. `24px` and `1.5em` pass down a fixed length.",
    ),
  ),

  part(
    "units",
    "Units: px, rem, em, % and more",
    explain(
      "Every length has a [[css-unit|unit]]. `px` is fixed. The rest are **relative**: `rem` to the root font size (16px unless someone changes it), `em` to this element's font size, `%` to the parent, `vw` and `vh` to the window. People raise their browser's text size to read more easily, and only relative units follow them.",
    ),
    analogy(
      "`px` is a measurement in centimetres. `rem` is “twice the page's standard letter size”: if the reader asks for bigger letters, everything measured that way grows with them.",
    ),
    reference("Units you'll meet", [
      ["px", "Fixed pixels.", "border: 1px solid;"],
      [
        "rem",
        "× the root font size; follows the reader's text setting.",
        "font-size: 1.25rem;",
      ],
      ["em", "× this element's font size.", "padding: 0.5em 1em;"],
      ["%", "Part of the parent's size.", "width: 50%;"],
      ["vw / vh", "1% of the window's width / height.", "height: 100vh;"],
      ["ch", "The width of a “0”: good for line length.", "max-width: 65ch;"],
    ]),
    keyPoints(
      "`rem` for font sizes and most spacing.",
      "`em` for padding that should grow with a button's own text.",
      "`px` for thin lines like `1px` borders.",
      "`%` and `vw` for widths that follow the space.",
    ),
  ),

  part(
    "em-and-rem",
    "em versus rem, step by step",
    explain(
      "An `em` is relative to the element's own font size, which it inherits from its parent, so `em` sizes **multiply** as elements nest. A `rem` always goes back to the root, so it never compounds. Step through a nested list sized with `em`:",
    ),
    trace(
      "Font sizes in a nested list",
      [
        "<style>",
        "  html { font-size: 16px; }",
        "  .list { font-size: 1.25em; }",
        "  li { font-size: 1.25em; }",
        "</style>",
        '<ul class="list">',
        "  <li>Notes",
        "    <ul><li>Today</li></ul>",
        "  </li>",
        "</ul>",
      ],
      [
        {
          line: 2,
          note: "The root is 16px. Every `rem` on this page means 16px.",
          vars: [["html", "16px"]],
        },
        {
          line: 6,
          note: "`.list` is `1.25em` of its parent's 16px.",
          vars: [
            ["html", "16px"],
            [".list", "20px"],
          ],
        },
        {
          line: 7,
          note: "The outer `li` is `1.25em` of **its** parent, the list: 1.25 × 20.",
          vars: [
            ["html", "16px"],
            [".list", "20px"],
            ["outer li", "25px"],
          ],
        },
        {
          line: 8,
          note: "The inner `ul` has no size rule, so it inherits 25px. Its `li` is 1.25 × 25 again.",
          vars: [
            ["html", "16px"],
            [".list", "20px"],
            ["outer li", "25px"],
            ["inner li", "31.25px"],
          ],
        },
        {
          line: 4,
          note: "Write `li { font-size: 1.25rem; }` instead and every `li` is 1.25 × 16 = 20px, however deep.",
          vars: [
            [".list", "20px"],
            ["every li (rem)", "20px"],
          ],
          output: "em: 25px, 31.25px · rem: 20px",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "A button's padding should grow when the button's own text is bigger. Which unit?",
      ["`px`", "`em`", "`vh`"],
      1,
      "`em` follows the element's own font size, so `padding: 0.5em 1em` scales with the button's text.",
    ),
  ),

  part(
    "inheritance",
    "What text inherits",
    explain(
      "Text properties pass from a parent to its children: [[inheritance]]. Set `font-family`, `color` and `line-height` once on `body` and every element inside uses them, unless it sets its own. Box properties like `margin`, `padding`, `border` and `background` don't pass down.",
    ),
    playground("Set it once on body", [
      "<style>",
      "  body { font-family: Georgia, serif; color: #1f2328; line-height: 1.5; }",
      "  .card { border: 1px solid #d0d7de; padding: 12px; }",
      "  .muted { color: #59636e; }",
      "</style>",
      '<div class="card">',
      "  <h2>Shopping</h2>",
      "  <p>The font and colour come from body.</p>",
      '  <p class="muted">This one sets its own colour.</p>',
      "</div>",
    ]),
    quickCheck(
      "You set `color: navy` on a `<div>`. What colour is the `<p>` inside it?",
      ["Black, the default", "Navy, inherited", "It depends on the margin"],
      1,
      "`color` is inherited, so children use their parent's colour unless they set their own.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's colours and fonts",
    explain(
      "The Notes App names its six colours once at the top of `index.css`, then uses those names everywhere (how the `--` names work comes in Modern CSS). The `body` rule sets the font, line height and text colour once, and every component inherits them. Sizes are in `rem`; only the 1px borders use `px`.",
    ),
    code(
      "css",
      "the top of the Notes App's index.css",
      [
        ":root {",
        "  --color-text: #1f2328;",
        "  --color-muted: #59636e;",
        "  --color-border: #d0d7de;",
        "  --color-background: #f6f8fa;",
        "  --color-primary: #1d4ed8;",
        "  --color-danger: #b42318;",
        "}",
        "",
        "body {",
        "  font-family: system-ui, sans-serif;",
        "  line-height: 1.5;",
        "  color: var(--color-text);",
        "  background: var(--color-background);",
        "}",
      ],
      {
        2: "near-black text: 14.8:1 on the background",
        3: "grey for less important text, still 5.7:1",
        11: "the system font: nothing to download",
        12: "unitless, so every child works it out for itself",
        13: "inherited by every element in the app",
      },
    ),
    inTheNotesApp(
      "`.navbar-user` uses the muted grey, `.button-danger` the red, and note titles are `1.125rem`, all on top of what `body` set.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Fading the text with opacity",
      language: "css",
      wrong: [".card { background: white; opacity: 0.7; }"],
      problem:
        "`opacity` fades the whole card, so the text becomes hard to read too.",
      right: [".card { background: rgb(255 255 255 / 70%); }"],
      why: "Put the transparency in the background colour's alpha; the text stays solid.",
    }),
    mistake({
      title: "Font sizes in px",
      language: "css",
      wrong: ["body { font-size: 14px; }"],
      problem:
        "A reader who sets a bigger default text size still gets 14px: `px` ignores their setting.",
      right: ["body { font-size: 0.875rem; }"],
      why: "`rem` is relative to the reader's chosen size, so it grows with it.",
    }),
    mistake({
      title: "em sizes that keep growing",
      language: "css",
      wrong: ["li { font-size: 1.2em; }"],
      problem:
        "Each nested list multiplies again: 1.2, then 1.44, then 1.73 times the page size.",
      right: ["li { font-size: 1.2rem; }"],
      why: "`rem` always measures from the root, so nesting doesn't change it.",
    }),
    mistake({
      title: "A font stack with no fallback",
      language: "css",
      wrong: ['body { font-family: "Inter"; }'],
      problem:
        "On a device without Inter, and before a web font loads, the browser picks its own default, often a serif.",
      right: ['body { font-family: "Inter", system-ui, sans-serif; }'],
      why: "End every stack with a generic family, so the fallback is a font you chose.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Colour the note",
      task: "Make the `h1` the blue `#1d4ed8`, the paragraph text `rgb(80 80 80)`, and give `.tag` a background of the same blue at 15% alpha.",
      starter: [
        "<style>",
        "</style>",
        "<h1>Shopping</h1>",
        '<p>Milk and bread. <span class="tag">today</span></p>',
      ],
      checks: [
        {
          kind: "style",
          label: "The heading is #1d4ed8",
          selector: "h1",
          property: "color",
          value: "rgb(29, 78, 216)",
        },
        {
          kind: "style",
          label: "The paragraph is dark grey",
          selector: "p",
          property: "color",
          value: "rgb(80, 80, 80)",
        },
        {
          kind: "style",
          label: "The tag has a see-through blue background",
          selector: ".tag",
          property: "background-color",
          value: "rgba(29, 78, 216, 0.15)",
        },
      ],
      hint: "`#1d4ed8` is `rgb(29 78 216)`, so the tag is `background: rgb(29 78 216 / 15%);`.",
      solution: [
        "<style>",
        "  h1 { color: #1d4ed8; }",
        "  p { color: rgb(80 80 80); }",
        "  .tag { background: rgb(29 78 216 / 15%); }",
        "</style>",
        "<h1>Shopping</h1>",
        '<p>Milk and bread. <span class="tag">today</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Set the text once",
      task: "Give `body` the font stack `Georgia, serif` so every element inherits it. Then centre the `h1`, and make `.label` uppercase with `letter-spacing: 2px`.",
      starter: [
        "<style>",
        "</style>",
        "<h1>A good read</h1>",
        '<p class="label">Chapter one</p>',
        "<p>It was a quiet morning.</p>",
      ],
      checks: [
        {
          kind: "style",
          label: "The paragraph inherits Georgia, serif",
          selector: "p:last-of-type",
          property: "font-family",
          value: "Georgia, serif",
        },
        {
          kind: "style",
          label: "The heading is centred",
          selector: "h1",
          property: "text-align",
          value: "center",
        },
        {
          kind: "style",
          label: "The label is uppercase",
          selector: ".label",
          property: "text-transform",
          value: "uppercase",
        },
        {
          kind: "style",
          label: "The label's letters are spaced 2px",
          selector: ".label",
          property: "letter-spacing",
          value: "2px",
        },
      ],
      hint: "`body { font-family: Georgia, serif; }`, `h1 { text-align: center; }` and `.label { text-transform: uppercase; letter-spacing: 2px; }`.",
      solution: [
        "<style>",
        "  body { font-family: Georgia, serif; }",
        "  h1 { text-align: center; }",
        "  .label { text-transform: uppercase; letter-spacing: 2px; }",
        "</style>",
        "<h1>A good read</h1>",
        '<p class="label">Chapter one</p>',
        "<p>It was a quiet morning.</p>",
      ],
    }),
    pageYourTurn({
      title: "Sizes in rem and em",
      task: "The root font size is 16px. Make `.card` `1.25rem` (20px), its `h2` `1.5em` of the card (30px), and `.meta` `0.75rem` (12px).",
      starter: [
        "<style>",
        "</style>",
        '<div class="card">',
        "  <h2>Shopping</h2>",
        "  <p>Milk and bread.</p>",
        '  <p class="meta">Edited today</p>',
        "</div>",
      ],
      checks: [
        {
          kind: "style",
          label: "The card's text is 20px",
          selector: ".card",
          property: "font-size",
          value: "20px",
        },
        {
          kind: "style",
          label: "The heading is 30px",
          selector: ".card h2",
          property: "font-size",
          value: "30px",
        },
        {
          kind: "style",
          label: "The meta line is 12px",
          selector: ".meta",
          property: "font-size",
          value: "12px",
        },
      ],
      hint: "`.card { font-size: 1.25rem; }`, `.card h2 { font-size: 1.5em; }` (1.5 × 20) and `.meta { font-size: 0.75rem; }` (0.75 × 16, not of the card).",
      solution: [
        "<style>",
        "  .card { font-size: 1.25rem; }",
        "  .card h2 { font-size: 1.5em; }",
        "  .meta { font-size: 0.75rem; }",
        "</style>",
        '<div class="card">',
        "  <h2>Shopping</h2>",
        "  <p>Milk and bread.</p>",
        '  <p class="meta">Edited today</p>',
        "</div>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Colours, text and units cheat sheet", [
      ["color", "Text colour; inherited.", "color: #1f2328;"],
      ["background-color", "Behind the text.", "background-color: #f6f8fa;"],
      ["rgb() / hsl()", "Mix a colour; add / alpha.", "rgb(0 0 0 / 40%)"],
      ["contrast", "At least 4.5:1 for normal text.", "#595959 on white: 7:1"],
      ["font-family", "A stack ending in a generic.", "system-ui, sans-serif"],
      ["font-size", "In rem.", "font-size: 1.125rem;"],
      ["font-weight", "400 normal, 700 bold.", "font-weight: 700;"],
      ["line-height", "Unitless, ~1.5 for body text.", "line-height: 1.5;"],
      ["rem / em", "Root size / own size.", "padding: 0.5em 1em;"],
      ["inheritance", "Set text styles once on body.", "body { color: … }"],
    ]),
    quickCheck(
      "The root is 16px and a `.card` is `2rem`. What is `0.5em` on a paragraph inside the card that sets no font size?",
      ["8px", "16px", "32px"],
      1,
      "The paragraph inherits the card's 32px, so `0.5em` is 16px. `0.5rem` would be 8px.",
    ),
  ),
);
