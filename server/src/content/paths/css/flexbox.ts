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

// Flexbox in depth: why it exists, container and items, the main and
// cross axis, flex-direction, justify-content and align-items (every
// value, live), gap and wrap, a step-through of how free space is shared,
// flex-grow/shrink/basis, one item on its own (align-self, margin auto),
// common layouts, the Notes App, mistakes, practice and a recap.
export const flexboxModule = moduleLesson(
  "flexbox",
  "Flexbox",
  45,
  [
    "Turn a parent into a flex container and say which elements become flex items.",
    "Find the main and cross axis for a row or a column, and switch with `flex-direction`.",
    "Align items with `justify-content` and `align-items`, and space them with `gap`.",
    "Work out how `flex-grow`, `flex-shrink` and `flex-basis` share the free space.",
    "Build a navbar, a centred box and a wrapping row of cards.",
  ],

  part(
    "why",
    "Lining things up",
    explain(
      "Blocks stack top to bottom, and that's all normal flow does. But most layouts need things **side by side**: a logo on the left and buttons on the right, a row of cards, an icon next to its label. [[css-flexbox|Flexbox]] does exactly that: one line on the parent, `display: flex`, and its children line up in a row, with control over their spacing, alignment and size.",
    ),
    playground("One line turns a stack into a row", [
      "<style>",
      "  nav { display: flex; gap: 16px; padding: 12px;",
      "    background: #eef; }",
      "  nav a { color: navy; }",
      "</style>",
      "<nav>",
      '  <a href="#">Home</a>',
      '  <a href="#">Notes</a>',
      '  <a href="#">Settings</a>',
      "</nav>",
      "<p>Delete <code>display: flex;</code> and the links fall back into one line of text.</p>",
    ]),
  ),

  part(
    "container-and-items",
    "The container and its items",
    explain(
      "Flexbox has two roles. The element with `display: flex` is the [[flex-container|flex container]]; its **direct children** become flex items. Grandchildren aren't items: they lay out normally inside their item, unless that item is a flex container too. Most flex properties go on the container; a few, like `flex` and `align-self`, go on an item.",
    ),
    anatomy(
      "A flex container and its items",
      [
        ".bar { display: flex; gap: 8px; }",
        '<div class="bar">',
        "  <button>New</button> <button>Save</button>",
        "</div>",
      ],
      [
        [
          "display: flex",
          "the switch",
          "Makes `.bar` a flex container. Outside, it's still a block; inside, its children line up.",
        ],
        [
          "gap: 8px",
          "spacing",
          "Space between the items, never before the first or after the last.",
        ],
        [
          '<div class="bar">',
          "the container",
          "The parent: you write most flex properties here.",
        ],
        [
          "<button>New</button>",
          "an item",
          "A direct child, so a flex item. Each button is one.",
        ],
      ],
    ),
    quickCheck(
      "`<ul>` has `display: flex`. Each `<li>` holds an `<a>`. Which are flex items?",
      ["The `<a>`s", "The `<li>`s", "Both"],
      1,
      "Only direct children of the container are flex items: the `<li>`s. The links sit inside them as normal.",
    ),
  ),

  part(
    "axes",
    "The main axis and the cross axis",
    explain(
      "Every flex container has two directions. The [[main-axis|main axis]] is the way the items flow; the cross axis runs across it. `flex-direction` picks the main axis: `row` (the default) flows left to right, so the cross axis is vertical; `column` flows top to bottom, so the cross axis is horizontal. Every alignment property is about one axis or the other.",
    ),
    diagram([
      ["flex-direction: row", "main → across, cross ↓ down"],
      ["justify-content", "aligns along the main axis"],
      ["align-items", "aligns along the cross axis"],
    ]),
    reference("flex-direction", [
      ["row", "The default: left to right.", "flex-direction: row;"],
      ["column", "Top to bottom, like a stack.", "flex-direction: column;"],
      [
        "row-reverse",
        "Right to left. Screen readers still read in HTML order.",
        "flex-direction: row-reverse;",
      ],
      ["column-reverse", "Bottom to top.", "flex-direction: column-reverse;"],
    ]),
    playground("Switch row and column", [
      "<style>",
      "  .box { display: flex; flex-direction: row; gap: 8px;",
      "    padding: 8px; background: #eef; }",
      "  .box div { padding: 12px; background: steelblue; color: white; }",
      "</style>",
      '<div class="box"><div>1</div><div>2</div><div>3</div></div>',
      "<p>Change <code>row</code> to <code>column</code>.</p>",
    ]),
  ),

  part(
    "justify-content",
    "justify-content: along the main axis",
    explain(
      "`justify-content` decides where the items sit along the main axis and what happens to the leftover space. In a row, that's left, right and centre. The playground shows every value at once: change the widths or add an item and watch how each one shares the space.",
    ),
    reference("justify-content values", [
      [
        "flex-start",
        "The default: packed at the start.",
        "justify-content: flex-start;",
      ],
      ["center", "Packed in the middle.", "justify-content: center;"],
      ["flex-end", "Packed at the end.", "justify-content: flex-end;"],
      [
        "space-between",
        "First at the start, last at the end, equal gaps between.",
        "justify-content: space-between;",
      ],
      [
        "space-around",
        "Equal space around each item (half-size at the edges).",
        "justify-content: space-around;",
      ],
      [
        "space-evenly",
        "Exactly equal gaps, edges included.",
        "justify-content: space-evenly;",
      ],
    ]),
    playground("Every value of justify-content", [
      "<style>",
      "  .row { display: flex; background: #eef; margin: 2px 0 10px; }",
      "  .row span { padding: 4px 10px; background: steelblue; color: white; }",
      "  code { font-size: 12px; }",
      "</style>",
      "<code>flex-start</code>",
      '<div class="row" style="justify-content: flex-start"><span>a</span><span>b</span><span>c</span></div>',
      "<code>center</code>",
      '<div class="row" style="justify-content: center"><span>a</span><span>b</span><span>c</span></div>',
      "<code>flex-end</code>",
      '<div class="row" style="justify-content: flex-end"><span>a</span><span>b</span><span>c</span></div>',
      "<code>space-between</code>",
      '<div class="row" style="justify-content: space-between"><span>a</span><span>b</span><span>c</span></div>',
      "<code>space-around</code>",
      '<div class="row" style="justify-content: space-around"><span>a</span><span>b</span><span>c</span></div>',
      "<code>space-evenly</code>",
      '<div class="row" style="justify-content: space-evenly"><span>a</span><span>b</span><span>c</span></div>',
    ]),
    quickCheck(
      "A header has a logo and a Log out button. The logo goes far left, the button far right. Which value?",
      ["`center`", "`space-between`", "`flex-end`"],
      1,
      "`space-between` puts the first item at the start, the last at the end, and all the free space between them.",
    ),
  ),

  part(
    "align-items",
    "align-items: across it",
    explain(
      "`align-items` places the items along the cross axis: in a row, that's up and down. The default, `stretch`, makes every item as tall as the tallest, which is why flex cards line up so neatly. `center` is the famous one: vertical centring that used to take tricks is now one line.",
    ),
    reference("align-items values", [
      [
        "stretch",
        "The default: items fill the cross axis (same height in a row).",
        "align-items: stretch;",
      ],
      [
        "flex-start",
        "At the start of the cross axis: the top.",
        "align-items: flex-start;",
      ],
      ["center", "In the middle: vertically centred.", "align-items: center;"],
      ["flex-end", "At the end: the bottom.", "align-items: flex-end;"],
      [
        "baseline",
        "Lines up the first line of text in each item.",
        "align-items: baseline;",
      ],
    ]),
    playground("Items of different heights", [
      "<style>",
      "  .row { display: flex; gap: 8px; height: 120px;",
      "    align-items: stretch; background: #eef; }",
      "  .row div { padding: 8px; background: steelblue; color: white; }",
      "  .tall { font-size: 32px; }",
      "</style>",
      '<div class="row">',
      '  <div>short</div><div class="tall">tall</div><div>short</div>',
      "</div>",
      "<p>Try <code>center</code>, <code>flex-start</code> and <code>baseline</code>.</p>",
    ]),
    quickCheck(
      "Items are in a **column**. Which property centres them left-to-right?",
      ["`justify-content`", "`align-items`", "`text-align`"],
      1,
      "In a column the main axis is vertical, so left-to-right is the cross axis: `align-items`.",
    ),
  ),

  part(
    "gap-and-wrap",
    "gap and wrap",
    explain(
      "`gap` puts space **between** items only, so you never need margins on the items and then a fix for the last one. By default flex items stay on one line and shrink to fit, even when that squashes them. `flex-wrap: wrap` lets them move onto new lines instead, and `gap` spaces the lines too.",
    ),
    reference("Spacing and wrapping", [
      ["gap", "Between items and between lines.", "gap: 1rem;"],
      [
        "row-gap / column-gap",
        "Between lines / between items in a row.",
        "gap: 16px 8px;",
      ],
      [
        "flex-wrap: nowrap",
        "The default: one line, items shrink.",
        "flex-wrap: nowrap;",
      ],
      [
        "flex-wrap: wrap",
        "Items move to a new line when they don't fit.",
        "flex-wrap: wrap;",
      ],
    ]),
    playground("Make the window narrow, then add wrap", [
      "<style>",
      "  .tags { display: flex; gap: 8px; flex-wrap: nowrap; }",
      "  .tags span { padding: 4px 12px; border-radius: 99px;",
      "    background: #dde6ff; white-space: nowrap; }",
      "</style>",
      '<div class="tags">',
      "  <span>shopping</span><span>work</span><span>ideas</span>",
      "  <span>travel</span><span>reading list</span><span>recipes</span>",
      "  <span>birthdays</span><span>later</span>",
      "</div>",
    ]),
    quickCheck(
      "Eight tags don't fit on a phone and overflow the screen. What's the fix?",
      ["`flex-wrap: wrap`", "`justify-content: center`", "`gap: 0`"],
      0,
      "`flex-wrap: wrap` lets items start a new line when the row is full.",
    ),
  ),

  part(
    "sharing-space",
    "How free space is shared, move by move",
    explain(
      "When the items don't fill the container, there's **free space**, and `flex-grow` decides who gets it. Each item starts at its `flex-basis`, then the free space is split in proportion to the grow numbers. Step through a 500px row with three items:",
    ),
    trace(
      "Sharing 500px between three items",
      [
        "<style>",
        "  .row { display: flex; width: 500px; }",
        "  .a, .b, .c { flex-basis: 100px; }",
        "  .a { flex-grow: 1; }",
        "  .b { flex-grow: 1; }",
        "  .c { flex-grow: 2; }",
        "</style>",
      ],
      [
        {
          line: 2,
          note: "The container is a 500px flex row.",
          vars: [["container", "500px"]],
        },
        {
          line: 3,
          note: "Every item starts at its `flex-basis`: 100px each, 300px together.",
          vars: [
            ["container", "500px"],
            ["a, b, c", "100px, 100px, 100px"],
            ["free space", "500 − 300 = 200px"],
          ],
        },
        {
          line: 4,
          note: "Add up the grow numbers: 1 + 1 + 2 = 4 shares, so each share is 200 ÷ 4 = 50px.",
          vars: [
            ["free space", "200px"],
            ["shares", "1 + 1 + 2 = 4"],
            ["one share", "50px"],
          ],
        },
        {
          line: 5,
          note: "`a` and `b` get one share each: 100 + 50.",
          vars: [
            ["a", "150px"],
            ["b", "150px"],
          ],
        },
        {
          line: 6,
          note: "`c` gets two shares: 100 + 100. Together they fill the row exactly.",
          vars: [
            ["a", "150px"],
            ["b", "150px"],
            ["c", "200px"],
            ["total", "500px"],
          ],
          output: "150px | 150px | 200px",
        },
      ],
      { language: "html" },
    ),
    keyPoints(
      "Items start at `flex-basis` (or their content size).",
      "Free space = container − all the bases.",
      "`flex-grow` numbers are shares of the free space, not widths.",
    ),
  ),

  part(
    "flex-shorthand",
    "flex-grow, flex-shrink and flex-basis",
    explain(
      "The three [[flex-grow|item sizing properties]] are usually written together with `flex`. `flex-grow` takes a share of free space, `flex-shrink` gives some up when there isn't enough, and `flex-basis` is the starting size. `flex: 1` (grow 1, shrink 1, basis 0) is the everyday one: items with it split the space equally whatever their content.",
    ),
    reference("Item sizing", [
      [
        "flex-grow",
        "Share of the free space; 0 means don't grow.",
        "flex-grow: 1;",
      ],
      [
        "flex-shrink",
        "Share of the shrinking; 0 means never shrink.",
        "flex-shrink: 0;",
      ],
      [
        "flex-basis",
        "Starting size before growing or shrinking.",
        "flex-basis: 200px;",
      ],
      ["flex: 1", "Grow and shrink equally from 0: equal columns.", "flex: 1;"],
      [
        "flex: none",
        "Stay at the content size: icons, buttons.",
        "flex: none;",
      ],
      [
        "flex: 1 1 200px",
        "grow shrink basis, in that order.",
        "flex: 1 1 200px;",
      ],
    ]),
    playground("A search box that takes the rest of the row", [
      "<style>",
      "  form { display: flex; gap: 8px; }",
      "  input { flex: 1; padding: 6px; }",
      "  .equal { display: flex; gap: 8px; margin-top: 12px; }",
      "  .equal div { flex: 1; padding: 8px; background: #dde6ff; }",
      "</style>",
      '<form><input placeholder="Search notes"><button>Go</button></form>',
      '<div class="equal"><div>one</div><div>two, longer</div><div>3</div></div>',
    ]),
    quickCheck(
      "A logo should never be squashed when the row is tight. What do you give it?",
      ["`flex-grow: 0`", "`flex-shrink: 0`", "`flex-basis: 0`"],
      1,
      "`flex-shrink: 0` stops it giving up space; it keeps its size and the others shrink.",
    ),
  ),

  part(
    "one-item",
    "One item on its own",
    explain(
      "Sometimes one item needs to break ranks. `align-self` overrides `align-items` for just that item. And `margin-left: auto` on an item eats all the free space to its left, pushing it, and everything after it, to the far end: the classic way to put a single Log out button on the right of a nav.",
    ),
    reference("For one item", [
      ["align-self", "Its own cross-axis alignment.", "align-self: flex-end;"],
      [
        "margin-left: auto",
        "Pushes this item (and later ones) to the end.",
        "margin-left: auto;",
      ],
      [
        "order",
        "Moves it visually; screen readers keep HTML order.",
        "order: -1;",
      ],
    ]),
    playground("Push the last link to the right", [
      "<style>",
      "  nav { display: flex; gap: 16px; padding: 12px; background: #eef; }",
      "  .logout { margin-left: auto; }",
      "</style>",
      "<nav>",
      '  <a href="#">Home</a>',
      '  <a href="#">Notes</a>',
      '  <a class="logout" href="#">Log out</a>',
      "</nav>",
    ]),
  ),

  part(
    "layouts",
    "Three layouts you'll build again and again",
    explain(
      "Most flexbox in real sites is one of three patterns. A **navbar**: a row, `space-between` and `center`. A **centred box**: a container with `justify-content` and `align-items` both `center`. A **row of cards**: `wrap`, `gap`, and `flex: 1 1 8rem` so each card grows but starts a new line below 8rem.",
    ),
    playground("Navbar, centred box, wrapping cards", [
      "<style>",
      "  header { display: flex; justify-content: space-between;",
      "    align-items: center; padding: 8px; background: #eef; }",
      "  .stage { display: flex; justify-content: center;",
      "    align-items: center; height: 100px; background: #f4f4f4; }",
      "  .cards { display: flex; flex-wrap: wrap; gap: 8px; }",
      "  .cards div { flex: 1 1 8rem; padding: 12px;",
      "    border: 1px solid #ccc; border-radius: 8px; }",
      "</style>",
      "<header><strong>Notes</strong><button>Log out</button></header>",
      '<div class="stage"><p>Centred both ways</p></div>',
      '<div class="cards"><div>Milk</div><div>Work</div><div>Ideas</div><div>Trips</div></div>',
    ]),
  ),

  part(
    "notes-app",
    "Flexbox in the Notes App",
    explain(
      "The Notes App's navbar is the first pattern exactly: the app name on the left, the user and Log out on the right, centred vertically. The user area is a small flex row of its own, and every form field is a flex **column** with a gap, so labels sit above inputs with even spacing.",
    ),
    code(
      "css",
      "from the Notes App's stylesheet",
      [
        ".navbar {",
        "  display: flex;",
        "  align-items: center;",
        "  justify-content: space-between;",
        "  gap: 1rem;",
        "}",
        "",
        ".form-field {",
        "  display: flex;",
        "  flex-direction: column;",
        "  gap: 0.25rem;",
        "}",
      ],
      {
        3: "vertically centred",
        4: "name left, user right",
        5: "never touching, even on a phone",
        10: "a column: label above input",
      },
    ),
    inTheNotesApp(
      '`Navbar` renders a `<header class="navbar">` with the app name and a `<nav class="navbar-user">`, the two flex items this rule spreads apart.',
      { symbolId: "component:Navbar" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "display: flex on the items",
      language: "css",
      wrong: [".nav a { display: flex; }"],
      problem:
        "Each link only becomes a flex container for its own text. The links themselves are still not flex items, so `gap` and `justify-content` on them do nothing.",
      right: [".nav { display: flex; }"],
      why: "Put `display: flex` on the **parent** whose children you want to line up.",
    }),
    mistake({
      title: "Mixing up the axes in a column",
      language: "css",
      wrong: [
        ".stack {",
        "  display: flex;",
        "  flex-direction: column;",
        "  justify-content: center; /* meant: centre left-right */",
        "}",
      ],
      problem:
        "In a column the main axis is vertical, so `justify-content` moves things up and down, not sideways.",
      right: [
        ".stack {",
        "  display: flex;",
        "  flex-direction: column;",
        "  align-items: center;",
        "}",
      ],
      why: "`justify-content` follows the main axis; `align-items` the cross axis. Changing direction swaps them.",
    }),
    mistake({
      title: "Margins instead of gap",
      language: "css",
      wrong: [
        ".bar button { margin-right: 8px; }",
        ".bar button:last-child { margin-right: 0; }",
      ],
      problem:
        "Two rules and a special case, and wrapped lines get no space between them.",
      right: [".bar { display: flex; gap: 8px; }"],
      why: "`gap` spaces only between items, and between lines when they wrap.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A header with two ends",
      task: "Make `header` a flex container with the title on the far left and the button on the far right, both centred vertically, with a `12px` gap.",
      starter: [
        "<style>",
        "  header { padding: 8px; background: #eef; }",
        "</style>",
        "<header><strong>Notes</strong><button>Log out</button></header>",
      ],
      checks: [
        {
          kind: "style",
          label: "A flex container",
          selector: "header",
          property: "display",
          value: "flex",
        },
        {
          kind: "style",
          label: "Pushed to both ends",
          selector: "header",
          property: "justify-content",
          value: "space-between",
        },
        {
          kind: "style",
          label: "Centred vertically",
          selector: "header",
          property: "align-items",
          value: "center",
        },
        {
          kind: "style",
          label: "A 12px gap",
          selector: "header",
          property: "gap",
          value: "12px",
        },
      ],
      hint: "In `header`: `display: flex; justify-content: space-between; align-items: center; gap: 12px;`",
      solution: [
        "<style>",
        "  header { padding: 8px; background: #eef;",
        "    display: flex; justify-content: space-between;",
        "    align-items: center; gap: 12px; }",
        "</style>",
        "<header><strong>Notes</strong><button>Log out</button></header>",
      ],
    }),
    pageYourTurn({
      title: "A search bar",
      task: "Line the form up in a row with `display: flex`, and make the `input` take all the space the button doesn't need with `flex: 1`.",
      starter: [
        "<style>",
        "  form { gap: 8px; }",
        "</style>",
        "<form>",
        '  <input placeholder="Search notes">',
        "  <button>Search</button>",
        "</form>",
      ],
      checks: [
        {
          kind: "style",
          label: "The form is a flex row",
          selector: "form",
          property: "display",
          value: "flex",
        },
        {
          kind: "style",
          label: "The input grows",
          selector: "input",
          property: "flex-grow",
          value: "1",
        },
        {
          kind: "style",
          label: "The button doesn't",
          selector: "button",
          property: "flex-grow",
          value: "0",
        },
      ],
      hint: "`form { display: flex; gap: 8px; }` and `input { flex: 1; }`.",
      solution: [
        "<style>",
        "  form { display: flex; gap: 8px; }",
        "  input { flex: 1; }",
        "</style>",
        "<form>",
        '  <input placeholder="Search notes">',
        "  <button>Search</button>",
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "Cards that wrap",
      task: "Make `.cards` a flex container that wraps onto new lines, with a `16px` gap. Then make it a column instead with `flex-direction`.",
      starter: [
        "<style>",
        "  .cards div { padding: 12px; border: 1px solid #ccc; }",
        "</style>",
        '<div class="cards"><div>Milk</div><div>Work</div><div>Ideas</div></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "A flex container",
          selector: ".cards",
          property: "display",
          value: "flex",
        },
        {
          kind: "style",
          label: "Items wrap",
          selector: ".cards",
          property: "flex-wrap",
          value: "wrap",
        },
        {
          kind: "style",
          label: "A 16px gap",
          selector: ".cards",
          property: "gap",
          value: "16px",
        },
        {
          kind: "style",
          label: "A column",
          selector: ".cards",
          property: "flex-direction",
          value: "column",
        },
      ],
      hint: "`.cards { display: flex; flex-wrap: wrap; gap: 16px; flex-direction: column; }`",
      solution: [
        "<style>",
        "  .cards { display: flex; flex-wrap: wrap; gap: 16px;",
        "    flex-direction: column; }",
        "  .cards div { padding: 12px; border: 1px solid #ccc; }",
        "</style>",
        '<div class="cards"><div>Milk</div><div>Work</div><div>Ideas</div></div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Flexbox cheat sheet", [
      [
        "display: flex",
        "On the parent; direct children become items.",
        ".bar { display: flex; }",
      ],
      [
        "flex-direction",
        "row (main axis →) or column (↓).",
        "flex-direction: column;",
      ],
      [
        "justify-content",
        "Along the main axis.",
        "justify-content: space-between;",
      ],
      ["align-items", "Across it; stretch by default.", "align-items: center;"],
      ["gap", "Between items and lines.", "gap: 1rem;"],
      ["flex-wrap", "Allow new lines.", "flex-wrap: wrap;"],
      ["flex: 1", "Grow to share the free space.", "input { flex: 1; }"],
      [
        "flex-shrink: 0",
        "Never squash this item.",
        ".logo { flex-shrink: 0; }",
      ],
      [
        "align-self",
        "One item's own cross alignment.",
        "align-self: flex-end;",
      ],
      [
        "margin-left: auto",
        "Push an item to the end.",
        ".logout { margin-left: auto; }",
      ],
    ]),
    quickCheck(
      "A 400px row holds two items with `flex-basis: 100px`; one has `flex-grow: 1`, the other `flex-grow: 3`. How wide is the second?",
      ["150px", "250px", "300px"],
      1,
      "Free space is 400 − 200 = 200px, in 4 shares of 50px. The second gets 3 shares: 100 + 150 = 250px.",
    ),
  ),
);
