import {
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

// Grid in depth: why grid, tracks, lines and cells, columns with fr,
// repeat() and minmax(), a step-through of how fr columns are sized,
// rows and gaps, placing items on lines and spans, named areas, auto-fit
// cards with no media query, grid or flexbox, the Notes App's notes grid,
// mistakes, practice and a recap.
export const gridModule = moduleLesson(
  "grid",
  "Grid",
  45,
  [
    "Make a grid container and describe its tracks, lines and cells.",
    "Size columns with `px`, `fr`, `repeat()` and `minmax()`, and work out how wide each one is.",
    "Place items on grid lines, span several tracks, and lay out a page with named areas.",
    "Build a card wall that changes its number of columns with no media query.",
    "Choose between grid and flexbox for a layout.",
  ],

  part(
    "why",
    "Rows and columns at once",
    explain(
      "[[css-flexbox|Flexbox]] lines things up in **one** direction. Many layouts need two: a page with a header across the top, a sidebar and the content; a wall of cards whose columns line up row after row. [[css-grid|CSS grid]] lays out in rows **and** columns at once. You describe the columns on the parent, and the children fill the cells in order.",
    ),
    playground("Three equal columns, filled in order", [
      "<style>",
      "  .grid { display: grid; grid-template-columns: repeat(3, 1fr);",
      "    gap: 12px; }",
      "  .grid div { padding: 12px; background: #eef3ff; border-radius: 8px; }",
      "</style>",
      '<div class="grid">',
      "  <div>One</div><div>Two</div><div>Three</div>",
      "  <div>Four</div><div>Five</div>",
      "</div>",
      "<p>Change 3 to 2 or 4. The items flow into the new columns.</p>",
    ]),
  ),

  part(
    "tracks-lines-cells",
    "Tracks, lines and cells",
    explain(
      "Grid has its own words. A [[grid-track|track]] is a column or a row. The **lines** are the edges between tracks, numbered from 1: three columns have four column lines, 1 at the left edge to 4 at the right. A **cell** is where a row and a column cross, and an **area** is any rectangle of cells. You place items by naming lines, so the numbering matters.",
    ),
    diagram([
      ["Line 1", "left edge"],
      ["Column 1", "a track"],
      ["Line 2", "between"],
      ["Column 2", "a track"],
      ["Line 3", "right edge"],
    ]),
    keyPoints(
      "Track: one column or one row.",
      "Lines are numbered from 1; n columns have n + 1 lines.",
      "Line −1 is always the last line.",
      "Cell: one row × one column. Area: a rectangle of cells.",
    ),
  ),

  part(
    "columns",
    "Describing the columns",
    explain(
      "`grid-template-columns` lists one size per column. Fixed sizes like `200px` stay fixed. The [[fr-unit|`fr` unit]] is a share of the space left over, so `1fr 2fr` makes the second column twice as wide as the first. `repeat(4, 1fr)` saves writing `1fr` four times, and `minmax(12rem, 1fr)` gives a column a smallest and largest size.",
    ),
    anatomy(
      "A layout's columns",
      [
        ".layout { display: grid;",
        "  grid-template-columns: 200px 1fr 2fr;",
        "  gap: 20px; }",
      ],
      [
        [
          "display: grid",
          "the switch",
          "Makes `.layout` a grid container; its direct children become grid items.",
        ],
        [
          "200px",
          "column 1",
          "A fixed width: always 200px, whatever the screen.",
        ],
        [
          "1fr",
          "column 2",
          "One share of the space left after fixed columns and gaps.",
        ],
        ["2fr", "column 3", "Two shares: twice as wide as column 2."],
        ["gap: 20px", "the gutters", "Space between columns and between rows."],
      ],
    ),
    reference("Column sizes", [
      ["px / rem", "A fixed width.", "grid-template-columns: 200px 1fr;"],
      ["fr", "A share of the free space.", "grid-template-columns: 1fr 2fr;"],
      ["repeat(n, size)", "The same size n times.", "repeat(3, 1fr)"],
      ["minmax(min, max)", "At least min, at most max.", "minmax(12rem, 1fr)"],
      [
        "auto",
        "As wide as the content needs.",
        "grid-template-columns: auto 1fr;",
      ],
    ]),
  ),

  part(
    "sizing-fr",
    "How wide is each column, move by move",
    explain(
      "The browser sizes `fr` columns **last**: first the fixed columns, then the gaps, and whatever is left is shared out. Step through a 600px grid with `200px 1fr 2fr` and a 20px gap:",
    ),
    trace(
      "Sharing 600px between three columns",
      [
        "<style>",
        "  .layout {",
        "    display: grid;",
        "    width: 600px;",
        "    grid-template-columns: 200px 1fr 2fr;",
        "    gap: 20px;",
        "  }",
        "</style>",
      ],
      [
        {
          line: 4,
          note: "The container is 600px wide. That's the whole budget.",
          vars: [["container", "600px"]],
        },
        {
          line: 5,
          note: "Fixed columns first: column 1 takes 200px.",
          vars: [
            ["container", "600px"],
            ["column 1", "200px"],
            ["left", "400px"],
          ],
        },
        {
          line: 6,
          note: "Three columns have two gaps between them: 2 × 20px.",
          vars: [
            ["column 1", "200px"],
            ["gaps", "2 × 20px = 40px"],
            ["free space", "600 − 200 − 40 = 360px"],
          ],
        },
        {
          line: 5,
          note: "Now the `fr` columns: 1fr + 2fr is 3 shares, so one share is 360 ÷ 3 = 120px.",
          vars: [
            ["free space", "360px"],
            ["shares", "1 + 2 = 3"],
            ["1fr", "120px"],
          ],
        },
        {
          line: 5,
          note: "Column 2 gets one share and column 3 two. Everything adds up to 600px.",
          vars: [
            ["column 1", "200px"],
            ["column 2", "120px"],
            ["column 3", "240px"],
            ["total", "200 + 120 + 240 + 40 = 600px"],
          ],
          output: "200px | 120px | 240px",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "A 500px grid has `grid-template-columns: 100px 1fr 1fr` and no gap. How wide is each `1fr` column?",
      ["100px", "200px", "250px"],
      1,
      "500 − 100 = 400px is free, shared between 2 shares: 200px each.",
    ),
  ),

  part(
    "rows-and-gaps",
    "Rows and gaps",
    explain(
      "You don't have to describe the rows: extra items start new rows on their own, as tall as their content. `grid-template-rows` sizes them when you need to, and `grid-auto-rows` sets the size of every row grid makes for itself. `gap` spaces both directions; `row-gap` and `column-gap` set one.",
    ),
    reference("Rows and spacing", [
      [
        "grid-template-rows",
        "Sizes for the rows you list.",
        "grid-template-rows: auto 1fr auto;",
      ],
      [
        "grid-auto-rows",
        "Size of rows grid adds for extra items.",
        "grid-auto-rows: 8rem;",
      ],
      ["gap", "Between rows and columns.", "gap: 1rem;"],
      ["row-gap / column-gap", "One direction only.", "row-gap: 2rem;"],
    ]),
    playground("A header, content that fills, and a footer", [
      "<style>",
      "  .page { display: grid; grid-template-rows: auto 1fr auto;",
      "    height: 220px; gap: 8px; }",
      "  .page > * { padding: 8px; background: #eef3ff; }",
      "</style>",
      '<div class="page">',
      "  <header>Header: as tall as its text</header>",
      "  <main>Main: 1fr takes all the height left</main>",
      "  <footer>Footer</footer>",
      "</div>",
    ]),
  ),

  part(
    "placing-items",
    "Placing items on lines",
    explain(
      "Items fill the cells in order unless you place them. `grid-column: 1 / 3` puts an item from line 1 to line 3, across two columns. `span 2` means “two tracks from wherever you land”. `1 / -1` stretches from the first line to the last, the whole width, however many columns there are. `grid-row` does the same for rows.",
    ),
    reference("Placing an item", [
      [
        "grid-column: 1 / 3",
        "From column line 1 to line 3: two columns.",
        "grid-column: 1 / 3;",
      ],
      [
        "grid-column: span 2",
        "Two columns, wherever it lands.",
        "grid-column: span 2;",
      ],
      [
        "grid-column: 1 / -1",
        "First line to last: full width.",
        "grid-column: 1 / -1;",
      ],
      ["grid-row: span 2", "Two rows tall.", "grid-row: span 2;"],
    ]),
    playground("Spanning columns and rows", [
      "<style>",
      "  .grid { display: grid; grid-template-columns: repeat(3, 1fr);",
      "    grid-auto-rows: 60px; gap: 8px; }",
      "  .grid div { padding: 8px; background: #eef3ff; border-radius: 6px; }",
      "  .grid .banner { grid-column: 1 / -1; background: #ffe8b3; }",
      "  .tall { grid-row: span 2; }",
      "  .wide { grid-column: span 2; }",
      "</style>",
      '<div class="grid">',
      '  <div class="banner">1 / -1: full width</div>',
      '  <div class="tall">span 2 rows</div><div class="wide">span 2 columns</div>',
      "  <div>A</div><div>B</div>",
      "</div>",
    ]),
    quickCheck(
      "A grid has 4 columns. Which `grid-column` makes an item full width?",
      ["`1 / 4`", "`1 / -1`", "`span 1`"],
      1,
      "4 columns have 5 lines, so `1 / 4` stops one short. `1 / -1` always runs to the last line.",
    ),
  ),

  part(
    "areas",
    "Naming areas",
    explain(
      "For page layouts, [[grid-area|named areas]] read like a picture. `grid-template-areas` draws the layout as strings, one per row, one name per column; repeat a name to span. Then each item says which area it fills with `grid-area`. A `.` is an empty cell. Every area must be a rectangle.",
    ),
    code(
      "css",
      "a page drawn with names",
      [
        ".page {",
        "  display: grid;",
        "  grid-template-columns: 12rem 1fr;",
        "  grid-template-areas:",
        '    "head head"',
        '    "side main";',
        "}",
        ".page > header { grid-area: head; }",
        ".page > nav { grid-area: side; }",
        ".page > main { grid-area: main; }",
      ],
      {
        5: "row 1: head spans both columns",
        6: "row 2: sidebar, then main",
        8: "each item names its area",
      },
    ),
    playground("Change the picture, change the layout", [
      "<style>",
      "  .page { display: grid; gap: 8px; grid-template-columns: 8rem 1fr;",
      '    grid-template-areas: "head head" "side main" "foot foot"; }',
      "  .page > * { padding: 8px; background: #eef3ff; }",
      "  header { grid-area: head; } nav { grid-area: side; }",
      "  main { grid-area: main; } footer { grid-area: foot; }",
      "</style>",
      '<div class="page">',
      "  <header>head</header><nav>side</nav>",
      "  <main>main</main><footer>foot</footer>",
      "</div>",
      '<p>Try <code>"side head" "side main" "side foot"</code>.</p>',
    ]),
  ),

  part(
    "auto-fit",
    "Responsive cards with no media query",
    explain(
      "One line makes a card wall that fits any screen: `repeat(auto-fit, minmax(12rem, 1fr))`. It means: as many columns as fit, each at least 12rem, then stretch them to fill the row. A phone gets one column, a laptop three or four, with no [[media-query]]. `auto-fill` is the same but keeps empty columns when there are few items, so they don't stretch.",
    ),
    playground("Resize the window and watch the columns", [
      "<style>",
      "  .cards { display: grid; gap: 8px;",
      "    grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr)); }",
      "  .cards div { padding: 12px; background: #eef3ff; border-radius: 8px; }",
      "</style>",
      '<div class="cards">',
      "  <div>Milk</div><div>Work</div><div>Ideas</div>",
      "  <div>Trips</div><div>Books</div>",
      "</div>",
      "<p>Change auto-fit to auto-fill and delete three cards.</p>",
    ]),
    quickCheck(
      "What does `repeat(auto-fit, minmax(10rem, 1fr))` do on a screen 25rem wide?",
      [
        "Two columns of 12.5rem",
        "Three columns of 10rem",
        "One column of 25rem",
      ],
      0,
      "Two 10rem columns fit (three would need 30rem), then `1fr` stretches them to share the 25rem.",
    ),
  ),

  part(
    "grid-or-flex",
    "Grid or flexbox?",
    explain(
      "Both lay out children, and both use `gap` and the same alignment properties. The difference is direction. **Flexbox is one-dimensional**: a row or a column, sized by the content. **Grid is two-dimensional**: rows and columns that line up, sized by the layout. They nest happily: a grid of cards, each with a flex row of buttons.",
    ),
    reference("Which one", [
      [
        "A navbar, a row of buttons",
        "Flexbox: one row, content-sized.",
        "display: flex;",
      ],
      [
        "A card wall, a photo gallery",
        "Grid: columns that line up.",
        "display: grid;",
      ],
      ["A whole page layout", "Grid with named areas.", "grid-template-areas"],
      [
        "Centre one thing",
        "Either; grid is shortest.",
        "display: grid; place-items: center;",
      ],
      ["Items that wrap unevenly", "Flexbox with wrap.", "flex-wrap: wrap;"],
    ]),
    quickCheck(
      "Product cards must line up in neat columns on every row. Which?",
      ["Flexbox", "Grid", "Neither"],
      1,
      "Lining up in both rows and columns is two-dimensional: grid.",
    ),
  ),

  part(
    "notes-app",
    "The notes grid in the Notes App",
    explain(
      "The Notes App's dashboard shows notes in a grid that grows with the screen: one column on a phone, two from 40rem, three from 64rem. It's written mobile-first: the one-column grid is the default, and media queries only change `grid-template-columns`.",
    ),
    code(
      "css",
      "the notes grid, from the Notes App's stylesheet",
      [
        ".notes-grid {",
        "  display: grid;",
        "  grid-template-columns: 1fr;",
        "  gap: 1rem;",
        "}",
        "",
        "@media (min-width: 40rem) {",
        "  .notes-grid { grid-template-columns: repeat(2, 1fr); }",
        "}",
        "",
        "@media (min-width: 64rem) {",
        "  .notes-grid { grid-template-columns: repeat(3, 1fr); }",
        "}",
      ],
      {
        3: "phones: one column",
        8: "tablets: two equal columns",
        12: "wide screens: three",
      },
    ),
    inTheNotesApp(
      '`Dashboard` renders the notes in a `<section class="notes-grid">`, one `NoteCard` per cell.',
      { symbolId: "component:Dashboard" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Percent columns plus a gap",
      language: "css",
      wrong: [
        ".grid {",
        "  display: grid;",
        "  grid-template-columns: 50% 50%;",
        "  gap: 16px;",
        "}",
      ],
      problem:
        "100% of columns plus a 16px gap is wider than the container, so the grid overflows sideways.",
      right: [
        ".grid {",
        "  display: grid;",
        "  grid-template-columns: 1fr 1fr;",
        "  gap: 16px;",
        "}",
      ],
      why: "`fr` shares what's left **after** the gaps, so it always fits.",
    }),
    mistake({
      title: "Counting columns instead of lines",
      language: "css",
      wrong: [
        "/* 3 columns: make it full width */",
        ".banner { grid-column: 1 / 3; }",
      ],
      problem:
        "Line 3 is the start of the third column, so the banner covers only two.",
      right: [".banner { grid-column: 1 / -1; }"],
      why: "n columns have n + 1 lines; `-1` is always the last one.",
    }),
    mistake({
      title: "An area that isn't a rectangle",
      language: "css",
      wrong: [
        "grid-template-areas:",
        '  "head head"',
        '  "head main"',
        '  "side main";',
      ],
      problem:
        "`head` is L-shaped. The whole `grid-template-areas` declaration is invalid and ignored, so nothing is laid out.",
      right: [
        "grid-template-areas:",
        '  "head head"',
        '  "side main"',
        '  "side main";',
      ],
      why: "Every named area must form a rectangle.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Lay out a page with areas",
      task: 'Make `.page` a grid with a `16px` gap and the areas `"head head"` and `"side main"`, and columns `10rem 1fr`. Give `header`, `nav` and `main` the areas `head`, `side` and `main`.',
      starter: [
        "<style>",
        "  .page > * { padding: 8px; background: #eef3ff; }",
        "</style>",
        '<div class="page">',
        "  <header>Notes</header>",
        "  <nav>Folders</nav>",
        "  <main>Today's notes</main>",
        "</div>",
      ],
      checks: [
        {
          kind: "style",
          label: "A grid container",
          selector: ".page",
          property: "display",
          value: "grid",
        },
        {
          kind: "style",
          label: "Head across the top, side and main below",
          selector: ".page",
          property: "grid-template-areas",
          value: '"head head" "side main"',
        },
        {
          kind: "style",
          label: "A 16px gap",
          selector: ".page",
          property: "gap",
          value: "16px",
        },
      ],
      hint: 'In `.page`: `display: grid; gap: 16px; grid-template-columns: 10rem 1fr; grid-template-areas: "head head" "side main";`. Then `header { grid-area: head; }` and the same for `nav` and `main`.',
      solution: [
        "<style>",
        "  .page { display: grid; gap: 16px;",
        "    grid-template-columns: 10rem 1fr;",
        '    grid-template-areas: "head head" "side main"; }',
        "  .page > * { padding: 8px; background: #eef3ff; }",
        "  header { grid-area: head; }",
        "  nav { grid-area: side; }",
        "  main { grid-area: main; }",
        "</style>",
        '<div class="page">',
        "  <header>Notes</header>",
        "  <nav>Folders</nav>",
        "  <main>Today's notes</main>",
        "</div>",
      ],
    }),
    pageYourTurn({
      title: "Centre a box with grid",
      task: "Make `.stage` a grid at least `200px` tall, and centre the card in it both ways with `justify-items: center` and `align-items: center`.",
      starter: [
        "<style>",
        "  .stage { background: #f4f4f4; }",
        "  .card { padding: 16px; background: white; border: 1px solid #ccc; }",
        "</style>",
        '<div class="stage"><div class="card">Saved!</div></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "A grid container",
          selector: ".stage",
          property: "display",
          value: "grid",
        },
        {
          kind: "style",
          label: "At least 200px tall",
          selector: ".stage",
          property: "min-height",
          value: "200px",
        },
        {
          kind: "style",
          label: "Centred left to right",
          selector: ".stage",
          property: "justify-items",
          value: "center",
        },
        {
          kind: "style",
          label: "Centred top to bottom",
          selector: ".stage",
          property: "align-items",
          value: "center",
        },
      ],
      hint: "`.stage { display: grid; min-height: 200px; justify-items: center; align-items: center; }`. Together the last two are `place-items: center`.",
      solution: [
        "<style>",
        "  .stage { background: #f4f4f4; display: grid; min-height: 200px;",
        "    justify-items: center; align-items: center; }",
        "  .card { padding: 16px; background: white; border: 1px solid #ccc; }",
        "</style>",
        '<div class="stage"><div class="card">Saved!</div></div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Grid cheat sheet", [
      [
        "display: grid",
        "On the parent; children become items.",
        ".grid { display: grid; }",
      ],
      [
        "grid-template-columns",
        "One size per column.",
        "grid-template-columns: 200px 1fr;",
      ],
      ["fr", "A share of the space after fixed sizes and gaps.", "1fr 2fr"],
      [
        "repeat() / minmax()",
        "Repeat a size / a size range.",
        "repeat(3, minmax(10rem, 1fr))",
      ],
      [
        "auto-fit",
        "As many columns as fit.",
        "repeat(auto-fit, minmax(12rem, 1fr))",
      ],
      ["gap", "Between rows and columns.", "gap: 1rem;"],
      ["grid-column", "Place on lines, or span.", "grid-column: 1 / -1;"],
      [
        "grid-template-areas",
        "Draw the layout with names.",
        'grid-template-areas: "head head" "side main";',
      ],
      ["grid-area", "(item) Fill a named area.", "grid-area: main;"],
      [
        "place-items: center",
        "Centre every item both ways.",
        "place-items: center;",
      ],
    ]),
    quickCheck(
      "An 800px grid has `grid-template-columns: 200px 1fr 1fr 1fr` and `gap: 20px`. How wide is each `1fr` column?",
      ["180px", "200px", "250px"],
      0,
      "Four columns have three gaps (60px). 800 − 200 − 60 = 540px free, in 3 shares: 180px each.",
    ),
  ),
);
