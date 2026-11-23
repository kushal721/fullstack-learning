import {
  anatomy,
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

// Positioning and layers: normal flow, relative, absolute and the box it's
// placed in (step by step), offsets and inset, fixed, sticky, what's drawn
// on top, stacking contexts, when to position at all (and the Notes App,
// which doesn't), mistakes, practice and a recap.
export const positioningModule = moduleLesson(
  "positioning",
  "Positioning and layers",
  40,
  [
    "Explain normal flow, and what `relative`, `absolute`, `fixed` and `sticky` take out of it.",
    "Find the box an absolutely positioned element is placed in, and set it with `position: relative`.",
    "Place elements with `top`, `right`, `bottom`, `left` and `inset`.",
    "Decide what's drawn on top with source order, `z-index` and stacking contexts.",
    "Choose between positioning and flexbox or grid for a layout.",
  ],

  part(
    "normal-flow",
    "Normal flow, and leaving it",
    explain(
      "Without positioning, boxes are laid out in **normal flow**: blocks stack down the page, inline boxes run along the lines, and each box makes room for the next. That's `position: static`, the default. The other [[css-position|`position`]] values let a box be moved, or lifted out of the flow so it can overlap others.",
    ),
    reference("position values", [
      ["static", "The default: in the normal flow.", "position: static;"],
      [
        "relative",
        "Nudged from its place; its space is kept.",
        "position: relative; top: 4px;",
      ],
      [
        "absolute",
        "Out of the flow; placed in the nearest positioned ancestor.",
        "position: absolute; top: 0; right: 0;",
      ],
      [
        "fixed",
        "Out of the flow; placed in the window.",
        "position: fixed; bottom: 1rem;",
      ],
      [
        "sticky",
        "In the flow, until it reaches an edge and sticks.",
        "position: sticky; top: 0;",
      ],
    ]),
    quickCheck(
      "Which `position` is every element unless you change it?",
      ["`relative`", "`static`", "`absolute`"],
      1,
      "`static` is the default: the box sits in the normal flow and `top`, `left` and `z-index` do nothing to it.",
    ),
  ),

  part(
    "relative",
    "position: relative",
    explain(
      "`position: relative` keeps the box in the flow. Add `top` or `left` and it's drawn shifted from where it would have been, but its **original space stays** and nothing around it moves. Most of the time you'll set `relative` with no offsets at all, just to make the box the anchor for `absolute` children.",
    ),
    playground("Moved, but its space is kept", [
      "<style>",
      "  .box { display: inline-block; width: 70px; height: 70px; background: #93c5fd; }",
      "  .moved { position: relative; top: 20px; left: 20px; background: #1d4ed8; }",
      "</style>",
      '<span class="box"></span>',
      '<span class="box moved"></span>',
      '<span class="box"></span>',
      "<p>The dark box moved, but its neighbours didn't.</p>",
    ]),
  ),

  part(
    "absolute",
    "position: absolute",
    explain(
      "`position: absolute` lifts the box out of the flow: the rest of the page closes up as if it weren't there. It's placed with `top`, `right`, `bottom` and `left`, measured from the edges of its **containing block**: the nearest ancestor that is positioned (anything but `static`). Its width shrinks to fit its content.",
    ),
    playground("A badge in the corner of a card", [
      "<style>",
      "  .card { position: relative; padding: 24px; background: #eef3ff; border-radius: 8px; }",
      "  .badge { position: absolute; top: 8px; right: 8px;",
      "    background: crimson; color: white; padding: 2px 8px; border-radius: 99px; }",
      "</style>",
      '<div class="card">Buy milk <span class="badge">New</span></div>',
    ]),
    quickCheck(
      "An absolutely positioned badge jumps to the top corner of the whole page. What's missing?",
      [
        "`position: relative` on the card",
        "A bigger `z-index`",
        "`display: flex` on the card",
      ],
      0,
      "With no positioned ancestor, the badge is placed in the page itself. `position: relative` on the card makes the card its containing block.",
    ),
  ),

  part(
    "containing-block",
    "Which box is it placed in? Move by move",
    explain(
      "To place an absolute box, the browser walks **up** through its ancestors and stops at the first one that's positioned. The offsets are measured from that box's padding edge, inside its border. If none is positioned, it uses the starting box the size of the window, at the top of the page. Step through it:",
    ),
    trace(
      "Finding the badge's containing block",
      [
        "<style>",
        "  .card { position: relative; padding: 24px; }",
        "  .body { padding: 8px; }",
        "  .badge { position: absolute; top: 0; right: 0; }",
        "</style>",
        '<div class="page">',
        '  <div class="card">',
        '    <div class="body">',
        '      <span class="badge">New</span>',
        "    </div>",
        "  </div>",
        "</div>",
      ],
      [
        {
          line: 9,
          note: "The badge is `absolute`, so it leaves the flow. The browser looks for its containing block, starting with its parent.",
          vars: [["checking", ".body"]],
        },
        {
          line: 8,
          note: "`.body` is `static` (it sets no position), so it can't be the containing block. Keep going up.",
          vars: [
            [".body", "static: skip"],
            ["checking", ".card"],
          ],
        },
        {
          line: 7,
          note: "`.card` is `relative`: found it. Its own padding doesn't matter, and neither does `.body`'s.",
          vars: [
            [".body", "static: skip"],
            [".card", "relative: containing block"],
          ],
        },
        {
          line: 4,
          note: "`top: 0; right: 0` puts the badge's top-right corner on the card's top-right corner, just inside its border.",
          vars: [
            ["containing block", ".card"],
            ["badge at", "card's top-right corner"],
          ],
        },
        {
          line: 2,
          note: "Delete `position: relative` here and the walk carries on: `.page`, `body` and `html` are all static, so the badge lands in the top-right corner of the page.",
          vars: [
            [".card", "static: skip"],
            ["containing block", "the page"],
          ],
          output: "with relative: card's corner · without: page's corner",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "A `.menu` is `absolute` inside a `<li>` that's `relative`, inside a `<nav>` that's also `relative`. Which box is it placed in?",
      ["The `<nav>`", "The `<li>`", "The page"],
      1,
      "The browser stops at the **nearest** positioned ancestor, the `<li>`. The `<nav>` further up is never reached.",
    ),
  ),

  part(
    "offsets",
    "top, right, bottom, left and inset",
    explain(
      "The offsets say how far each edge sits from the same edge of the containing block. Set opposite sides together and the box stretches between them: `top: 0; bottom: 0` makes it full height. `inset` is the shorthand for all four, in the same order as `margin`, so `inset: 0` covers the containing block exactly.",
    ),
    anatomy(
      "A layer over the whole card",
      [
        ".card { position: relative; }",
        ".overlay {",
        "  position: absolute;",
        "  inset: 0; }",
      ],
      [
        [
          "position: relative",
          "the anchor",
          "Makes the card the overlay's containing block. No offsets, so the card doesn't move.",
        ],
        [
          "position: absolute",
          "out of the flow",
          "The overlay takes no space, so the card's content isn't pushed down.",
        ],
        [
          "inset: 0",
          "all four edges",
          "Short for top, right, bottom and left: 0. The overlay is stretched over the whole card.",
        ],
      ],
    ),
    playground("Stretching and centring with offsets", [
      "<style>",
      "  .card { position: relative; height: 64px; margin-bottom: 8px;",
      "    background: #eef3ff; border-radius: 8px; }",
      "  .overlay { position: absolute; inset: 0; border-radius: 8px;",
      "    background: rgb(0 0 0 / 50%); color: white; padding: 12px; }",
      "  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 8px; background: #1d4ed8; }",
      "  .centre { position: absolute; inset: 0; margin: auto; width: 80px; height: 32px;",
      "    background: gold; }",
      "</style>",
      '<div class="card"><div class="overlay">Covered with inset: 0</div></div>',
      '<div class="card"><div class="bar"></div></div>',
      '<div class="card"><div class="centre"></div></div>',
    ]),
  ),

  part(
    "fixed",
    "position: fixed",
    explain(
      "`position: fixed` places the box relative to the **window**, so it stays in the same spot while the page scrolls underneath: a floating “new note” button, a cookie banner. Like `absolute`, it leaves the flow. Content can end up hidden behind it, so leave room for it with padding on the page.",
    ),
    playground("A button that stays put (scroll the preview)", [
      "<style>",
      "  body { padding-bottom: 80px; font-family: system-ui, sans-serif; }",
      "  p { height: 60px; margin: 0; border-bottom: 1px solid #d0d7de; }",
      "  .add { position: fixed; right: 16px; bottom: 16px; width: 56px; height: 56px;",
      "    border: none; border-radius: 50%; background: #1d4ed8; color: white; font-size: 1.5rem; }",
      "</style>",
      "<p>Note 1</p><p>Note 2</p><p>Note 3</p><p>Note 4</p><p>Note 5</p><p>Note 6</p>",
      '<button class="add" aria-label="New note">+</button>',
    ]),
    keyPoints(
      "`fixed` boxes don't scroll, so keep them small, especially on phones.",
      "An ancestor with `transform` or `filter` traps a fixed box inside itself.",
      "Give fixed buttons an `aria-label` if they only show an icon.",
    ),
  ),

  part(
    "sticky",
    "position: sticky",
    explain(
      "`position: sticky` is a mix: the box scrolls with the page in the normal flow until it reaches an edge you set, such as `top: 0`, then sticks there. It only sticks while its **parent** is on screen, so a list's headings can each stick in turn. It needs an offset, and an ancestor with `overflow: hidden` or `auto` stops it working.",
    ),
    playground("Headings that stick in turn (scroll the preview)", [
      "<style>",
      "  body { margin: 0; font-family: system-ui, sans-serif; }",
      "  h2 { position: sticky; top: 0; margin: 0; padding: 6px 12px;",
      "    background: #1d4ed8; color: white; font-size: 1rem; }",
      "  p { margin: 0; padding: 16px 12px; border-bottom: 1px solid #d0d7de; }",
      "</style>",
      "<section><h2>Shopping</h2><p>Milk</p><p>Bread</p><p>Eggs</p><p>Butter</p></section>",
      "<section><h2>Work</h2><p>Report</p><p>Email Sam</p><p>Book room</p></section>",
      "<section><h2>Home</h2><p>Plants</p><p>Bins</p><p>Laundry</p></section>",
    ]),
    quickCheck(
      "A header has `position: sticky` but scrolls away like normal. What's the most likely cause?",
      [
        "It has no `top` (or other offset)",
        "It needs `position: relative` too",
        "Its `z-index` is too low",
      ],
      0,
      "Sticky needs an edge to stick to, such as `top: 0`. The other usual cause is an ancestor with `overflow` set to `hidden` or `auto`.",
    ),
  ),

  part(
    "z-index",
    "What's drawn on top",
    explain(
      "When boxes overlap, the browser paints them in layers. Positioned boxes are drawn above ordinary ones, and among equals, the one **later in the HTML** is on top. [[z-index|`z-index`]] changes that: a higher number comes forward. It works on positioned elements and on flex and grid items; on a static box it does nothing.",
    ),
    playground("Source order, then z-index", [
      "<style>",
      "  .box { position: absolute; width: 90px; height: 90px; padding: 6px; color: white; }",
      "  .a { top: 10px; left: 10px; background: #1d4ed8; }",
      "  .b { top: 40px; left: 60px; background: crimson; }",
      "  .c { top: 70px; left: 110px; background: teal; }",
      "  .a { z-index: 1; }",
      "</style>",
      '<div class="box a">A, z 1</div>',
      '<div class="box b">B</div>',
      '<div class="box c">C</div>',
    ]),
    keyPoints(
      "Without z-index, later in the HTML is on top.",
      "Positioned boxes paint above static ones.",
      "Use a small scale, like 1, 10, 100, not 99999.",
    ),
  ),

  part(
    "stacking-contexts",
    "Stacking contexts",
    explain(
      "A box with `position` and a `z-index`, or with `opacity` below 1, a `transform`, or `isolation: isolate`, starts a **stacking context**: a group whose children are layered among themselves, then drawn together at the group's level. A child can't escape its group, so `z-index: 9999` inside a group at `z-index: 1` still sits under a sibling group at 2.",
    ),
    playground("9999 that still loses", [
      "<style>",
      "  .group { position: relative; padding: 8px; color: white; }",
      "  .main { z-index: 1; background: #1d4ed8; height: 60px; }",
      "  .menu { position: absolute; top: 30px; left: 20px; z-index: 9999;",
      "    background: crimson; padding: 8px; width: 140px; height: 70px; }",
      "  .footer { z-index: 2; background: teal; }",
      "</style>",
      '<div class="group main">Main, z 1',
      '  <div class="menu">Menu, z 9999</div>',
      "</div>",
      '<div class="group footer">Footer, z 2: on top of the menu</div>',
    ]),
    quickCheck(
      "A dropdown with `z-index: 1000` shows under the page's footer. Raising it to 99999 changes nothing. Why?",
      [
        "z-index can't go above 9999",
        "Its parent starts a stacking context that's below the footer",
        "The footer must be fixed",
      ],
      1,
      "The dropdown is layered only inside its parent's group. Raise the **parent's** `z-index` above the footer's, or remove what created the group.",
    ),
  ),

  part(
    "when-to-position",
    "Positioning or layout?",
    explain(
      "Positioning is for things that **overlap** or float above the page: badges, overlays, dropdowns, tooltips, sticky headers, dialogs. For putting boxes side by side or in columns, use flexbox and grid: they keep every box in the flow, so nothing overlaps by accident and the layout adapts to the content.",
    ),
    keyPoints(
      "Overlap or float above? Positioning.",
      "Side by side, rows or columns? Flexbox or grid.",
      "Centring? Flexbox, grid, or `margin: auto`, not `top: 50%`.",
    ),
    inTheNotesApp(
      "The Notes App positions nothing: the navbar and forms are flexbox and the notes are a grid. It has nothing that floats above the page, so it doesn't need to.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "An absolute child with no positioned parent",
      language: "css",
      wrong: [".badge { position: absolute; top: 8px; right: 8px; }"],
      problem:
        "The card isn't positioned, so the badge is placed in the corner of the page, not the card.",
      right: [
        ".card { position: relative; }",
        ".badge { position: absolute; top: 8px; right: 8px; }",
      ],
      why: "`position: relative` with no offsets makes the card the badge's containing block without moving it.",
    }),
    mistake({
      title: "Laying out a page with position: absolute",
      language: "css",
      wrong: [
        ".sidebar { position: absolute; left: 0; width: 200px; }",
        ".main { position: absolute; left: 200px; }",
      ],
      problem:
        "Neither box takes space, so the footer slides up under them, and on a phone the 200px sidebar covers the content.",
      right: [".layout { display: grid; grid-template-columns: 200px 1fr; }"],
      why: "Grid keeps both boxes in the flow, so the page grows with them, and a media query can stack them on phones.",
    }),
    mistake({
      title: "A sticky header inside overflow: hidden",
      language: "css",
      wrong: [
        ".page { overflow-x: hidden; }",
        "header { position: sticky; top: 0; }",
      ],
      problem:
        "`.page` becomes the box the header sticks within, and the page itself doesn't scroll, so the header never sticks.",
      right: [
        ".page { overflow-x: clip; }",
        "header { position: sticky; top: 0; }",
      ],
      why: "`clip` cuts off the overflow without making a scroll container, so sticky keeps working.",
    }),
    mistake({
      title: "Ever bigger z-index numbers",
      language: "css",
      wrong: [".dropdown { z-index: 999999; }"],
      problem:
        "If the dropdown's parent starts a stacking context below the footer, no number inside it can win.",
      right: [".header { position: relative; z-index: 10; }"],
      why: "Find which group the element is in (DevTools' Layers panel helps) and raise that group instead.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A badge in the corner",
      task: "Make `.card` the anchor with `position: relative`, then place `.badge` `absolute`ly, `8px` from the card's top and `8px` from its right.",
      starter: [
        "<style>",
        "  .card { padding: 24px; background: #eef3ff; }",
        "  .badge { background: crimson; color: white; padding: 2px 8px; }",
        "</style>",
        '<div class="card">Buy milk <span class="badge">New</span></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "The card is positioned",
          selector: ".card",
          property: "position",
          value: "relative",
        },
        {
          kind: "style",
          label: "The badge is absolute",
          selector: ".badge",
          property: "position",
          value: "absolute",
        },
        {
          kind: "style",
          label: "The badge is 8px from the top",
          selector: ".badge",
          property: "top",
          value: "8px",
        },
        {
          kind: "style",
          label: "The badge is 8px from the right",
          selector: ".badge",
          property: "right",
          value: "8px",
        },
      ],
      hint: "`.card { position: relative; }` and `.badge { position: absolute; top: 8px; right: 8px; }`.",
      solution: [
        "<style>",
        "  .card { position: relative; padding: 24px; background: #eef3ff; }",
        "  .badge { position: absolute; top: 8px; right: 8px;",
        "    background: crimson; color: white; padding: 2px 8px; }",
        "</style>",
        '<div class="card">Buy milk <span class="badge">New</span></div>',
      ],
    }),
    pageYourTurn({
      title: "A header that sticks",
      task: "Make the `header` stick to the top of the window as the page scrolls (`sticky`, `top: 0`), and give it `z-index: 10` so it stays above the notes.",
      starter: [
        "<style>",
        "  header { background: #1d4ed8; color: white; padding: 12px; }",
        "  p { height: 80px; }",
        "</style>",
        "<header>Notes</header>",
        "<p>Milk</p><p>Bread</p><p>Eggs</p><p>Butter</p>",
      ],
      checks: [
        {
          kind: "style",
          label: "The header is sticky",
          selector: "header",
          property: "position",
          value: "sticky",
        },
        {
          kind: "style",
          label: "It sticks at the very top",
          selector: "header",
          property: "top",
          value: "0px",
        },
        {
          kind: "style",
          label: "It's layered above the notes",
          selector: "header",
          property: "z-index",
          value: "10",
        },
      ],
      hint: "`header { position: sticky; top: 0; z-index: 10; }`.",
      solution: [
        "<style>",
        "  header { position: sticky; top: 0; z-index: 10;",
        "    background: #1d4ed8; color: white; padding: 12px; }",
        "  p { height: 80px; }",
        "</style>",
        "<header>Notes</header>",
        "<p>Milk</p><p>Bread</p><p>Eggs</p><p>Butter</p>",
      ],
    }),
    pageYourTurn({
      title: "Cover the card",
      task: "Stretch `.overlay` over the whole card: make it `absolute` with all four edges at `0`, and make the card its anchor.",
      starter: [
        "<style>",
        "  .card { height: 120px; background: #eef3ff; }",
        "  .overlay { background: rgb(0 0 0 / 50%); color: white; }",
        "</style>",
        '<div class="card"><div class="overlay">Saving…</div></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "The card is positioned",
          selector: ".card",
          property: "position",
          value: "relative",
        },
        {
          kind: "style",
          label: "The overlay is absolute",
          selector: ".overlay",
          property: "position",
          value: "absolute",
        },
        {
          kind: "style",
          label: "Its top edge is on the card's",
          selector: ".overlay",
          property: "top",
          value: "0px",
        },
        {
          kind: "style",
          label: "Its bottom edge is on the card's",
          selector: ".overlay",
          property: "bottom",
          value: "0px",
        },
      ],
      hint: "`.card { position: relative; }` and `.overlay { position: absolute; inset: 0; }` (or `top`, `right`, `bottom` and `left` all `0`).",
      solution: [
        "<style>",
        "  .card { position: relative; height: 120px; background: #eef3ff; }",
        "  .overlay { position: absolute; top: 0; right: 0; bottom: 0; left: 0;",
        "    background: rgb(0 0 0 / 50%); color: white; }",
        "</style>",
        '<div class="card"><div class="overlay">Saving…</div></div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Positioning cheat sheet", [
      ["static", "Default; offsets ignored.", "position: static;"],
      [
        "relative",
        "Nudge; anchor for absolute.",
        ".card { position: relative; }",
      ],
      [
        "absolute",
        "Out of flow; nearest positioned ancestor.",
        "top: 8px; right: 8px;",
      ],
      ["fixed", "To the window; doesn't scroll.", "bottom: 16px; right: 16px;"],
      ["sticky", "Scrolls, then sticks; needs an offset.", "top: 0;"],
      ["inset", "top, right, bottom, left at once.", "inset: 0;"],
      [
        "z-index",
        "Higher comes forward; positioned or flex/grid items.",
        "z-index: 10;",
      ],
      [
        "stacking context",
        "A group children can't escape.",
        "isolation: isolate;",
      ],
    ]),
    quickCheck(
      "Which one keeps the element's original space in the layout?",
      ["`absolute`", "`fixed`", "`relative`"],
      2,
      "A `relative` box stays in the flow, and its space stays where it was even when it's shifted. `absolute` and `fixed` leave the flow.",
    ),
  ),
);
