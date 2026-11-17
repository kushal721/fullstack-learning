import {
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

// Responsive design in depth: why one page must fit every screen, the
// viewport meta tag, fluid units, the anatomy of a media query,
// mobile-first, a step-through of which rules apply at three widths,
// breakpoints, responsive images, layouts that adapt without queries,
// testing in DevTools, the Notes App on a phone, mistakes, practice and a
// recap. Keeps the old lesson's id so the level check still points here.
export const responsiveModule = moduleLesson(
  "media-queries",
  "Responsive design",
  45,
  [
    "Explain why one page must fit screens from 320px to 2,000px, and what the viewport tag does.",
    "Size things with fluid units: `%`, `rem`, `vw`, `max-width`, `min()` and `clamp()`.",
    "Read and write a media query, and build styles mobile-first.",
    "Work out which rules apply at a given screen width.",
    "Make images and layouts adapt, and test them in DevTools.",
  ],

  part(
    "why",
    "One page, every screen",
    explain(
      "The same page is opened on a 320px phone, a tablet, a laptop and a 2,000px monitor, held upright or sideways, zoomed in, with bigger text. You can't build a version for each. [[css-responsive|Responsive design]] builds **one** page whose layout adapts: a single column on a phone, more columns when there's room, text that stays readable everywhere.",
    ),
    keyPoints(
      "Most visits to most sites come from phones.",
      "Phones need one column, big tap targets and no sideways scroll.",
      "Wide screens need a maximum line length, not stretched text.",
      "The tools: the viewport tag, fluid units, media queries and flexible layouts.",
    ),
    playground("A page that's already fairly responsive", [
      "<style>",
      "  .page { max-width: 40rem; margin: 0 auto; padding: 0 1rem; }",
      "  img { max-width: 100%; }",
      "  .row { display: flex; flex-wrap: wrap; gap: 8px; }",
      "  .row > * { flex: 1 1 10rem; padding: 12px; background: #eef3ff; }",
      "</style>",
      '<div class="page">',
      "  <h1>My notes</h1>",
      '  <div class="row"><div>Shopping</div><div>Work</div><div>Ideas</div></div>',
      "  <p>Widen and narrow your window: the boxes wrap, the text never gets too long.</p>",
      "</div>",
    ]),
  ),

  part(
    "viewport",
    "The viewport meta tag",
    explain(
      "Without help, a phone pretends to be a 980px desktop and shrinks the whole page to fit, so text is tiny and your media queries never match. The [[viewport-meta|viewport meta tag]] in the `<head>` tells it: use your real width, at normal zoom. Every responsive page starts with this line, and it's the first thing to check when a page looks shrunk on a phone.",
    ),
    code(
      "html",
      "the line every responsive page needs",
      ['<meta name="viewport" content="width=device-width, initial-scale=1">'],
      {
        1: "width=device-width: the phone's real width; initial-scale=1: no zoom",
      },
    ),
    quickCheck(
      "A page has perfect media queries but looks tiny and zoomed-out on a phone. What's missing?",
      [
        "A `max-width` on images",
        "The viewport meta tag",
        "A media query for phones",
      ],
      1,
      'Without `<meta name="viewport" …>` the phone lays the page out at about 980px and shrinks it.',
    ),
  ),

  part(
    "fluid-units",
    "Fluid units",
    explain(
      "Fixed widths like `width: 800px` break on anything narrower. Fluid [[css-unit|units]] follow the space: `%` of the parent, `vw` of the window, `rem` of the text size. The most useful tool is a **limit**: `max-width` lets a box shrink but never grow past a size. `min()` picks the smaller of two sizes and `clamp()` keeps a value between a minimum and a maximum.",
    ),
    reference("Sizes that adapt", [
      ["%", "Part of the parent's width.", "width: 50%;"],
      ["vw / vh", "Part of the window's width / height.", "min-height: 100vh;"],
      ["rem", "× the root text size; follows text settings.", "padding: 1rem;"],
      [
        "max-width",
        "Shrinks freely, never grows past this.",
        "max-width: 40rem;",
      ],
      ["min(a, b)", "The smaller of the two.", "width: min(100%, 40rem);"],
      [
        "clamp(min, ideal, max)",
        "The ideal size, kept between min and max.",
        "font-size: clamp(1.5rem, 5vw, 3rem);",
      ],
    ]),
    playground("Resize the window: the heading and box adapt", [
      "<style>",
      "  h1 { font-size: clamp(1.5rem, 6vw, 3rem); }",
      "  .box { width: min(100%, 24rem); padding: 1rem;",
      "    background: #eef3ff; }",
      "  .fixed { width: 600px; background: #ffe8b3; padding: 1rem; }",
      "</style>",
      "<h1>Fluid heading</h1>",
      '<div class="box">min(100%, 24rem): fits any screen</div>',
      '<p class="fixed">600px: sticks out on a narrow screen</p>',
    ]),
  ),

  part(
    "media-query",
    "Anatomy of a media query",
    explain(
      "A [[media-query]] wraps rules that apply only when a condition is true. The condition is usually the width of the viewport, but it can also be the user's settings: dark mode, reduced motion, a mouse or a touch screen. Rules inside a query are ordinary rules; the cascade treats them like any others, so a later one still wins.",
    ),
    anatomy(
      "A media query",
      [
        "@media (min-width: 40rem) {",
        "  .notes { grid-template-columns: 1fr 1fr; }",
        "}",
      ],
      [
        [
          "@media",
          "the at-rule",
          "Starts a block of rules that only apply sometimes.",
        ],
        [
          "(min-width: 40rem)",
          "the condition",
          "True when the viewport is **at least** 40rem (640px) wide.",
        ],
        [
          ".notes { grid-template-columns: 1fr 1fr; }",
          "ordinary rules",
          "Applied only while the condition is true, on top of the rules outside.",
        ],
      ],
    ),
    reference("Conditions you'll use", [
      [
        "min-width",
        "At least this wide: mobile-first.",
        "@media (min-width: 40rem)",
      ],
      ["max-width", "At most this wide.", "@media (max-width: 39.99rem)"],
      [
        "prefers-color-scheme",
        "The user's light or dark setting.",
        "@media (prefers-color-scheme: dark)",
      ],
      [
        "prefers-reduced-motion",
        "The user asked for less animation.",
        "@media (prefers-reduced-motion: reduce)",
      ],
      ["hover", "A mouse that can hover (not touch).", "@media (hover: hover)"],
      [
        "orientation",
        "Upright or sideways.",
        "@media (orientation: landscape)",
      ],
    ]),
  ),

  part(
    "mobile-first",
    "Mobile first",
    explain(
      "**Mobile first** means the rules outside any query are the phone layout: one column, simple and small. Then `min-width` queries **add** layout as the screen grows. Phones download and apply the least CSS, and you never have to undo a desktop layout for small screens. The opposite, desktop-first with `max-width` queries, works too, but ends up overriding more.",
    ),
    code(
      "css",
      "mobile first: start small, add as space grows",
      [
        ".notes {",
        "  display: grid;",
        "  grid-template-columns: 1fr;",
        "  gap: 1rem;",
        "}",
        "",
        "@media (min-width: 40rem) {",
        "  .notes { grid-template-columns: repeat(2, 1fr); }",
        "}",
      ],
      {
        3: "the default: phones get one column",
        7: "from 40rem up…",
        8: "…two columns; nothing else changes",
      },
    ),
    quickCheck(
      "Mobile-first CSS means…",
      [
        "Phone styles outside queries, `min-width` queries for wider screens",
        "Hiding things on phones",
        "A separate site for phones",
      ],
      0,
      "Start simple for small screens and add layout as space allows.",
    ),
  ),

  part(
    "which-rules",
    "Which rules apply, move by move",
    explain(
      "The browser checks every query against the current width, keeps the rules whose condition is true, and then the cascade decides as usual: equal selectors, so the **later** rule wins. Step through the same CSS on three screens:",
    ),
    trace(
      "The notes grid at 375px, 800px and 1200px",
      [
        "<style>",
        "  .notes { grid-template-columns: 1fr; }",
        "  @media (min-width: 40rem) {",
        "    .notes { grid-template-columns: repeat(2, 1fr); }",
        "  }",
        "  @media (min-width: 64rem) {",
        "    .notes { grid-template-columns: repeat(3, 1fr); }",
        "  }",
        "</style>",
      ],
      [
        {
          line: 2,
          note: "On a 375px phone: the rule outside any query always applies.",
          vars: [
            ["viewport", "375px"],
            ["columns", "1fr"],
          ],
        },
        {
          line: 3,
          note: "40rem is 640px (16px × 40). 375 is less, so this query is false and its rule is skipped.",
          vars: [
            ["viewport", "375px"],
            ["min-width: 40rem", "false"],
            ["columns", "1fr"],
          ],
        },
        {
          line: 6,
          note: "64rem is 1024px: false too. The phone gets one column.",
          vars: [
            ["viewport", "375px"],
            ["min-width: 64rem", "false"],
            ["columns", "1fr"],
          ],
          output: "375px → 1 column",
        },
        {
          line: 4,
          note: "On an 800px tablet: 800 ≥ 640, so the first query is true and its later rule beats the default.",
          vars: [
            ["viewport", "800px"],
            ["min-width: 40rem", "true"],
            ["min-width: 64rem", "false"],
            ["columns", "repeat(2, 1fr)"],
          ],
          output: "800px → 2 columns",
        },
        {
          line: 7,
          note: "On a 1200px laptop **both** queries are true. All three rules match; the last one in the file wins.",
          vars: [
            ["viewport", "1200px"],
            ["min-width: 40rem", "true"],
            ["min-width: 64rem", "true"],
            ["columns", "repeat(3, 1fr)"],
          ],
          output: "1200px → 3 columns",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "If the 64rem query came **before** the 40rem one, what would a 1200px screen show?",
      ["3 columns", "2 columns", "1 column"],
      1,
      "Both are true and the selectors are equal, so the later rule wins: the 40rem one, with 2 columns. Mobile-first queries go smallest to largest.",
    ),
  ),

  part(
    "breakpoints",
    "Breakpoints",
    explain(
      "A **breakpoint** is a width where a [[media-query]] changes the layout. Don't chase device sizes; new phones appear every year. Instead, narrow the window until the layout looks wrong, and put a breakpoint there. Most sites need only two or three. Writing them in `rem` means they also respond when people enlarge their text.",
    ),
    reference("Common breakpoints (a starting point, not a rule)", [
      ["below 40rem", "Phones: one column. No query: the default.", "640px"],
      [
        "40rem",
        "Large phones sideways, small tablets: two columns.",
        "@media (min-width: 40rem)",
      ],
      [
        "64rem",
        "Tablets sideways, laptops: three columns, a sidebar.",
        "@media (min-width: 64rem)",
      ],
      [
        "80rem",
        "Wide screens: cap the width, add space.",
        "@media (min-width: 80rem)",
      ],
    ]),
    keyPoints(
      "Let the content choose breakpoints, not device names.",
      "Two or three are usually enough.",
      "Use `rem` so they follow the user's text size.",
    ),
  ),

  part(
    "images",
    "Responsive images",
    explain(
      "An image is as wide as its file unless you say otherwise, so a 1,200px photo bursts out of a phone screen. `max-width: 100%` lets it shrink with its box, and `height: auto` keeps its shape. For [[responsive-images|really responsive images]], `srcset` offers files of several sizes and the browser downloads the smallest that looks sharp.",
    ),
    reference("Images that fit", [
      [
        "max-width: 100%",
        "Never wider than its container.",
        "img { max-width: 100%; }",
      ],
      [
        "height: auto",
        "Keep the proportions while shrinking.",
        "img { height: auto; }",
      ],
      [
        "srcset + sizes",
        "Several files; the browser picks one.",
        '<img srcset="s.jpg 480w, l.jpg 1200w" sizes="100vw">',
      ],
      [
        "aspect-ratio",
        "Reserve the shape before it loads.",
        "aspect-ratio: 16 / 9;",
      ],
      [
        "object-fit: cover",
        "Fill a box, cropping instead of squashing.",
        "object-fit: cover;",
      ],
    ]),
    playground("Narrow the window", [
      "<style>",
      "  .fit { max-width: 100%; height: auto; }",
      "  .cover { width: 100%; aspect-ratio: 3 / 1; object-fit: cover; }",
      "</style>",
      '<img class="fit" width="900" height="200" alt="A wide placeholder"',
      '  src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 900 200%27%3E%3Crect width=%27900%27 height=%27200%27 fill=%27%2393c5fd%27/%3E%3C/svg%3E">',
      '<img class="cover" alt="The same picture, cropped to a 3:1 box"',
      '  src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 900 600%27%3E%3Crect width=%27900%27 height=%27600%27 fill=%27%23fcd34d%27/%3E%3C/svg%3E">',
    ]),
  ),

  part(
    "flexible-layouts",
    "Layouts that adapt by themselves",
    explain(
      "Some layouts need no media query at all. Flexbox with `flex-wrap: wrap` and a `flex-basis` wraps items onto new lines when they don't fit. Grid with `repeat(auto-fit, minmax(12rem, 1fr))` picks the number of columns itself. Reach for these first, and use media queries for the changes they can't make, like moving a sidebar or showing a menu button.",
    ),
    playground("Two layouts, zero media queries", [
      "<style>",
      "  .wrap { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }",
      "  .wrap > * { flex: 1 1 12rem; padding: 12px; background: #eef3ff; }",
      "  .auto { display: grid; gap: 8px;",
      "    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); }",
      "  .auto > * { padding: 12px; background: #ffe8b3; }",
      "</style>",
      '<div class="wrap"><div>Flex</div><div>wraps</div><div>when narrow</div></div>',
      '<div class="auto"><div>Grid</div><div>picks</div><div>its own</div><div>columns</div></div>',
    ]),
    quickCheck(
      "Which needs a media query?",
      [
        "Cards that wrap onto more rows on a phone",
        "A sidebar that moves below the content on a phone",
        "An image that shrinks to fit",
      ],
      1,
      "Moving whole regions is a layout change you decide at a width. Wrapping and shrinking happen by themselves with wrap, auto-fit and max-width.",
    ),
  ),

  part(
    "testing",
    "Testing in DevTools",
    explain(
      "You don't need a drawer full of phones. In the browser's DevTools, the **device toolbar** (the phone-and-tablet icon, or Ctrl+Shift+M / Cmd+Shift+M) shows the page at any width, with presets for popular phones. Drag the edge slowly from narrow to wide and watch for the moment something breaks: that's where a breakpoint belongs.",
    ),
    keyPoints(
      "Device toolbar: pick a phone, or drag to any width.",
      "Watch for sideways scrolling: something is too wide.",
      "The Elements panel shows which media queries are active.",
      "Finally, check on a real phone: touch and text size differ.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App on a phone",
    explain(
      "The Notes App is mobile-first from top to bottom. Its `index.html` has the viewport tag. Its stylesheet says so in the first comment: “the base rules are for small screens, and media queries add columns on wider ones”. Pages are capped with `max-width: 60rem` and centred, and the notes grid gains columns at 40rem and 64rem.",
    ),
    code(
      "css",
      "from the Notes App's stylesheet",
      [
        "/* Written mobile-first: the base rules are",
        "   for small screens, and media queries add",
        "   columns on wider ones. */",
        "",
        ".dashboard {",
        "  max-width: 60rem;",
        "  margin: 0 auto;",
        "  padding: 1.5rem 1rem;",
        "}",
      ],
      {
        6: "never wider than 60rem, but shrinks freely",
        7: "centred on wide screens",
        8: "1rem at the sides keeps text off the phone's edge",
      },
    ),
    inTheNotesApp(
      '`index.html` sets `<meta name="viewport" content="width=device-width, initial-scale=1.0">`, so the phone uses its real width.',
      { fileId: "frontend/index.html" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A fixed width",
      language: "css",
      wrong: [".page { width: 960px; }"],
      problem:
        "On a 375px phone the page is wider than the screen, and everything scrolls sideways.",
      right: [".page { max-width: 60rem; margin: 0 auto; }"],
      why: "`max-width` caps the width on big screens and lets it shrink on small ones.",
    }),
    mistake({
      title: "Queries in the wrong order",
      language: "css",
      wrong: [
        "@media (min-width: 64rem) { .a { columns: 3; } }",
        "@media (min-width: 40rem) { .a { columns: 2; } }",
      ],
      problem:
        "On a wide screen both match and the later one wins, so it never gets 3 columns.",
      right: [
        "@media (min-width: 40rem) { .a { columns: 2; } }",
        "@media (min-width: 64rem) { .a { columns: 3; } }",
      ],
      why: "Mobile-first `min-width` queries go from smallest to largest.",
    }),
    mistake({
      title: "Hiding content on phones",
      language: "css",
      wrong: [
        "@media (max-width: 40rem) {",
        "  .details { display: none; }",
        "}",
      ],
      problem:
        "Phone users lose information, even though they're most of the visitors.",
      right: [
        ".details { font-size: 0.875rem; }",
        "@media (min-width: 40rem) {",
        "  .details { font-size: 1rem; }",
        "}",
      ],
      why: "Rearrange or restyle content for small screens; don't take it away.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A page that fits a phone",
      task: "Cap `.page` at `600px` wide with `max-width`, give it `16px` of padding on the left and right, and make the image never wider than its container with `max-width: 100%`.",
      starter: [
        "<style>",
        "  .page { width: 900px; }",
        "</style>",
        '<div class="page">',
        "  <h1>Trip notes</h1>",
        '  <img width="1200" height="300" alt="A wide placeholder"',
        '    src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E">',
        "</div>",
      ],
      checks: [
        {
          kind: "style",
          label: "At most 600px wide",
          selector: ".page",
          property: "max-width",
          value: "600px",
        },
        {
          kind: "style",
          label: "16px on the left",
          selector: ".page",
          property: "padding-left",
          value: "16px",
        },
        {
          kind: "style",
          label: "16px on the right",
          selector: ".page",
          property: "padding-right",
          value: "16px",
        },
        {
          kind: "style",
          label: "The image shrinks to fit",
          selector: "img",
          property: "max-width",
          value: "100%",
        },
      ],
      hint: "Replace `width: 900px` with `max-width: 600px; padding: 0 16px;`, and add `img { max-width: 100%; height: auto; }`.",
      solution: [
        "<style>",
        "  .page { max-width: 600px; padding: 0 16px; }",
        "  img { max-width: 100%; height: auto; }",
        "</style>",
        '<div class="page">',
        "  <h1>Trip notes</h1>",
        '  <img width="1200" height="300" alt="A wide placeholder"',
        '    src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E">',
        "</div>",
      ],
    }),
    pageYourTurn({
      title: "Boxes that wrap without a query",
      task: "Make `.row` a flex container that wraps, and give each `.row > div` `flex-grow: 1` and a `flex-basis` of `200px`, so the boxes sit side by side when there's room and stack on a phone.",
      starter: [
        "<style>",
        "  .row > div { padding: 12px; background: #eef3ff; }",
        "</style>",
        '<div class="row"><div>Shopping</div><div>Work</div><div>Ideas</div></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "A flex container",
          selector: ".row",
          property: "display",
          value: "flex",
        },
        {
          kind: "style",
          label: "It wraps",
          selector: ".row",
          property: "flex-wrap",
          value: "wrap",
        },
        {
          kind: "style",
          label: "The boxes grow",
          selector: ".row > div",
          property: "flex-grow",
          value: "1",
        },
        {
          kind: "style",
          label: "They start at 200px",
          selector: ".row > div",
          property: "flex-basis",
          value: "200px",
        },
      ],
      hint: "`.row { display: flex; flex-wrap: wrap; gap: 8px; }` and add `flex: 1 1 200px;` to `.row > div`.",
      solution: [
        "<style>",
        "  .row { display: flex; flex-wrap: wrap; gap: 8px; }",
        "  .row > div { padding: 12px; background: #eef3ff; flex: 1 1 200px; }",
        "</style>",
        '<div class="row"><div>Shopping</div><div>Work</div><div>Ideas</div></div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Responsive design cheat sheet", [
      [
        "viewport meta",
        "Use the device's real width.",
        '<meta name="viewport" content="width=device-width, initial-scale=1">',
      ],
      ["max-width", "Cap a width; let it shrink.", "max-width: 60rem;"],
      [
        "min() / clamp()",
        "The smaller / a value between limits.",
        "font-size: clamp(1rem, 4vw, 2rem);",
      ],
      [
        "@media (min-width)",
        "Rules for this width and up.",
        "@media (min-width: 40rem) { … }",
      ],
      [
        "mobile first",
        "Phone styles outside queries; small → large.",
        "1 col → 2 → 3",
      ],
      ["breakpoints", "Where the content breaks, in rem.", "40rem, 64rem"],
      [
        "images",
        "Shrink and keep their shape.",
        "img { max-width: 100%; height: auto; }",
      ],
      [
        "no-query layouts",
        "Wrap and auto-fit.",
        "repeat(auto-fit, minmax(12rem, 1fr))",
      ],
      [
        "user settings",
        "Dark mode, less motion.",
        "@media (prefers-reduced-motion: reduce)",
      ],
    ]),
    quickCheck(
      "A page has `.layout { grid-template-columns: 1fr; }`, then `@media (min-width: 48rem) { .layout { grid-template-columns: 16rem 1fr; } }`. What does a 900px laptop show?",
      [
        "A 16rem sidebar beside the content",
        "One column",
        "Nothing: the queries clash",
      ],
      0,
      "48rem is 768px; 900 ≥ 768, so the query is true and its later rule wins: two columns.",
    ),
  ),
);
