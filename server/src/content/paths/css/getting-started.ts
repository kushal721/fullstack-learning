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
  scene,
  trace,
} from "../blocks.js";

// Getting started with CSS: what CSS does, how the browser uses it (the
// overview scene), the anatomy of a rule, values and what happens to
// mistakes, three ways to add CSS, selectors, combinators, attributes and
// pseudo-classes, a step-through of matching, classes over ids, the Notes
// App's stylesheet, mistakes, practice and a recap.
export const gettingStartedModule = moduleLesson(
  "getting-started",
  "Getting started with CSS",
  45,
  [
    "Explain what CSS does and how it works with HTML.",
    "Read and write a rule: selector, property, value and declaration.",
    "Add CSS to a page with a linked stylesheet, a `<style>` block or a `style` attribute.",
    "Pick elements with type, class, id, combinator, attribute and pseudo-class selectors.",
    "Choose classes over ids, and spot the small typos that silently break a rule.",
  ],

  part(
    "what-css-does",
    "What CSS does",
    explain(
      "[[css]] decides how a page looks: colours, fonts, sizes, spacing and where everything sits. The [[html]] says what each part **is**, a heading, a list, a button; CSS says how it **looks**. The two are kept apart on purpose: change the CSS and the same HTML can look completely different, on a phone or a wide screen.",
    ),
    analogy(
      "If HTML is the walls and rooms of a house, CSS is the paint, the furniture and where it all stands. You can redecorate without moving a wall.",
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

  part(
    "how-it-works",
    "How the browser uses CSS",
    explain(
      "The browser reads the HTML and builds the page's elements. Then it reads every CSS rule, finds which elements each one matches, settles any disagreements, works out every box's size and place, and paints. Step through it:",
    ),
    scene("rules"),
  ),

  part(
    "anatomy",
    "Anatomy of a rule",
    explain(
      "CSS is a list of [[css-rule|rules]]. A rule has a [[css-selector|selector]], which says which elements, and a block of declarations in `{ }`, which say how they look. Each declaration is a [[css-property|property]], a colon, a [[css-value|value]] and a semicolon.",
    ),
    anatomy(
      "One rule",
      ["p {", "  color: navy;", "  font-size: 18px;", "}"],
      [
        ["p", "selector", "Which elements: every `<p>` on the page."],
        ["color", "property", "What to change: here, the text colour."],
        ["navy", "value", "What to set it to."],
        [
          "font-size: 18px;",
          "declaration",
          "A property and value together, ended by a semicolon. A rule can have many.",
        ],
        ["}", "end of the block", "Every `{` needs its `}`."],
      ],
    ),
    quickCheck(
      "In `h1 { color: red; }`, what is `color`?",
      ["The selector", "The property", "The value"],
      1,
      "`h1` is the selector, `color` the [[css-property|property]] and `red` its [[css-value|value]].",
    ),
  ),

  part(
    "values-and-errors",
    "Values, comments and mistakes",
    explain(
      "Each property accepts certain values: colours, lengths like `16px`, keywords like `bold`. When the browser meets something it doesn't understand, a misspelt property or an impossible value, it **skips that one declaration** and carries on, with no error message. That's forgiving, but it means typos fail silently. `/* … */` is a comment: the browser ignores it.",
    ),
    code(
      "css",
      "what the browser keeps and skips",
      [
        "/* Note cards */",
        ".note {",
        "  colour: navy;",
        "  font-size: big;",
        "  padding: 12px;",
        "}",
      ],
      {
        1: "a comment: ignored",
        3: "skipped: the property is spelt `color`",
        4: "skipped: `big` isn't a size",
        5: "kept: valid, so it still applies",
      },
    ),
    quickCheck(
      "A rule has one misspelt property and two correct ones. What happens?",
      [
        "The whole stylesheet stops working",
        "The whole rule is ignored",
        "Only the misspelt declaration is ignored",
      ],
      2,
      "The browser skips just the declaration it can't understand and keeps the rest.",
    ),
  ),

  part(
    "adding-css",
    "Three ways to add CSS",
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
      "A [[stylesheet]] file is shared by every page and downloaded once, then cached, so it's the default. A `<style>` block suits a single page or a demo; the playgrounds here use one so everything fits in one box. A `style` attribute styles one element only, can't use selectors like `:hover`, and beats almost everything, so save it for values set by JavaScript.",
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

  part(
    "selectors",
    "Selectors: picking elements",
    explain(
      "A selector is a pattern, and every element that matches gets the rule's styles. Four kinds do most of the work: an element's **type** (`p`), a **class** (`.note`), an **id** (`#title`), and everything (`*`). A comma groups selectors that share the same styles.",
    ),
    reference("The selectors you'll use most", [
      ["p", "Every element of that type.", "p { … }"],
      [".note", 'Every element with `class="note"`.', ".note { … }"],
      ["#title", 'The one element with `id="title"`.', "#title { … }"],
      ["*", "Every element.", "* { box-sizing: border-box; }"],
      ["h1, h2", "Both: a comma groups selectors.", "h1, h2 { … }"],
      [
        "p.note",
        "A `<p>` that has the class `note` (no space).",
        "p.note { … }",
      ],
    ]),
    playground("Try different selectors", [
      "<style>",
      "  .note { background: lightyellow; padding: 8px; }",
      "  #first { border: 2px solid orange; }",
      "  h2, p { margin: 4px 0; }",
      "</style>",
      '<div class="note" id="first"><h2>Milk</h2><p>Buy two.</p></div>',
      '<div class="note"><h2>Bread</h2><p>Brown.</p></div>',
      "<p>Not a note.</p>",
    ]),
  ),

  part(
    "combinators",
    "Combinators: elements inside elements",
    explain(
      "A [[combinator]] joins two selectors by how the elements are related. A **space** means “anywhere inside”: `.card p` matches paragraphs at any depth in a card. `>` means “directly inside”, a child only. `+` is the very next sibling and `~` any later sibling. Read selectors from right to left: the last part is the element being styled.",
    ),
    reference("Combinators", [
      [".card p", "A `p` anywhere inside a `.card`.", ".card p { … }"],
      [
        ".menu > li",
        "An `li` that's a direct child of `.menu`.",
        ".menu > li { … }",
      ],
      ["h2 + p", "The `p` right after an `h2`.", "h2 + p { … }"],
      ["h2 ~ p", "Every `p` after an `h2`, same parent.", "h2 ~ p { … }"],
    ]),
    playground("Space versus >", [
      "<style>",
      "  .menu li { color: navy; }",
      "  .menu > li { font-weight: bold; }",
      "  h2 + p { color: crimson; }",
      "</style>",
      '<ul class="menu">',
      "  <li>Notes",
      "    <ul><li>Today</li><li>Archive</li></ul>",
      "  </li>",
      "</ul>",
      "<h2>Heading</h2><p>Right after: crimson</p><p>Not right after</p>",
    ]),
  ),

  part(
    "attributes-and-states",
    "Attributes and states",
    explain(
      "Selectors can also look at attributes and at an element's state or position. Square brackets match an [[attribute]]. A [[pseudo-class]], written with a colon, matches a state like `:hover` or a position like `:first-child`. The full set of states comes later; these few are worth knowing from day one.",
    ),
    reference("Attribute and pseudo-class selectors", [
      [
        '[type="email"]',
        "An attribute with that exact value.",
        'input[type="email"] { … }',
      ],
      ["[disabled]", "Has the attribute at all.", "button[disabled] { … }"],
      ["a:hover", "While the mouse is over it.", "a:hover { … }"],
      [
        ":focus-visible",
        "Focused from the keyboard.",
        "button:focus-visible { … }",
      ],
      [
        ":first-child",
        "The first child of its parent.",
        "li:first-child { … }",
      ],
      [
        ":nth-child(odd)",
        "Every other child: 1st, 3rd…",
        "tr:nth-child(odd) { … }",
      ],
    ]),
    playground("Hover, the first item, an attribute", [
      "<style>",
      "  li:first-child { font-weight: bold; }",
      "  li:nth-child(even) { background: #eef; }",
      "  a:hover { color: crimson; }",
      '  input[type="email"] { border: 2px solid teal; }',
      "</style>",
      "<ul><li>First</li><li>Second</li><li>Third</li><li>Fourth</li></ul>",
      '<p><a href="#">Hover me</a></p>',
      '<input type="email" placeholder="email"> <input placeholder="name">',
    ]),
  ),

  part(
    "matching",
    "Which elements match, move by move",
    explain(
      "The browser takes each rule and tests every element against its selector. Step through four rules against a small page and keep track of what each matches:",
    ),
    trace(
      "Matching four selectors",
      [
        '<div class="card">',
        "  <h2>Shopping</h2>",
        '  <p class="note">Milk</p>',
        "</div>",
        '<p class="note">Outside</p>',
        "<!-- .card p   .note   .card > h2   p.note -->",
      ],
      [
        {
          line: 6,
          note: "`.card p`: read right to left. Find every `p`, keep those with a `.card` somewhere above them.",
          vars: [["candidates", "both <p>s"]],
        },
        {
          line: 3,
          note: "The first `p` is inside the card, so it matches. The one on line 5 has no `.card` above it, so it doesn't.",
          vars: [[".card p", "line 3"]],
        },
        {
          line: 5,
          note: '`.note`: every element with `class="note"`, wherever it is: both paragraphs.',
          vars: [
            [".card p", "line 3"],
            [".note", "lines 3 and 5"],
          ],
        },
        {
          line: 2,
          note: "`.card > h2`: an `h2` that's a direct child of `.card`. The heading is, so it matches.",
          vars: [
            [".card p", "line 3"],
            [".note", "lines 3 and 5"],
            [".card > h2", "line 2"],
          ],
        },
        {
          line: 5,
          note: "`p.note` (no space): a `p` that itself has the class. Both paragraphs qualify; the `div` doesn't, it isn't a `p`.",
          vars: [
            [".card p", "line 3"],
            [".note", "lines 3 and 5"],
            [".card > h2", "line 2"],
            ["p.note", "lines 3 and 5"],
          ],
          output: "4 rules, 5 matches",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "Which does `.card .note` match on that page?",
      ["Only line 3", "Lines 3 and 5", "Only line 5"],
      0,
      "With a space it means “a `.note` inside a `.card`”, and only line 3 is inside the card.",
    ),
  ),

  part(
    "class-or-id",
    "Classes, not ids",
    explain(
      'Style with classes. A class can go on many elements, and one element can have several: `class="note done"`. An id must be unique on the page, and id selectors are so strong that other rules struggle to override them. Keep ids for links (`#today`), labels and JavaScript.',
    ),
    keyPoints(
      "Name classes by what something is: `.note-card`, not `.yellow-box`.",
      'Combine small classes: `class="button button-danger"`.',
      "Lowercase words with hyphens are the usual style.",
    ),
    quickCheck(
      "Ten note cards should look the same. What do you give them?",
      ["The same id", "The same class", "A style attribute each"],
      1,
      "Ids must be unique; a class is made for sharing a look.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's stylesheet",
    explain(
      "The Notes App keeps all its CSS in one file, `index.css`. A React app loads it with an `import` in `main.jsx`, and the build turns that into a `<link>` in the page. Inside, it's ordinary rules: one universal rule, a few element rules for `body`, and the rest single classes like `.navbar` and `.note-card`, with a comment above each group.",
    ),
    code(
      "css",
      "the start of the Notes App's index.css",
      [
        "*,",
        "*::before,",
        "*::after {",
        "  box-sizing: border-box;",
        "}",
        "",
        "body {",
        "  margin: 0;",
        "  font-family: system-ui, sans-serif;",
        "}",
        "",
        "/* Navbar: app name left, user right. */",
        ".navbar {",
        "  display: flex;",
        "}",
      ],
      {
        1: "a group: every element, plus ::before and ::after",
        7: "an element selector: the one <body>",
        12: "a comment explains the next rule",
        13: "a class selector, like almost every rule in the file",
      },
    ),
    inTheNotesApp(
      "`main.jsx` imports `./index.css` once, so every component's classes are styled by this one file.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting the dot",
      language: "css",
      wrong: ["note { background: lightyellow; }"],
      problem:
        "Without a dot it's a type selector for a `<note>` element, which doesn't exist, so nothing matches.",
      right: [".note { background: lightyellow; }"],
      why: "A class selector starts with `.`, an id selector with `#`.",
    }),
    mistake({
      title: "A space that changes the meaning",
      language: "css",
      wrong: [
        "/* meant: a .card that is also .featured */",
        ".card .featured { border-color: gold; }",
      ],
      problem:
        "With a space it means a `.featured` **inside** a `.card`, a different element.",
      right: [".card.featured { border-color: gold; }"],
      why: "No space: the same element has both classes. A space: one inside the other.",
    }),
    mistake({
      title: "A missing semicolon",
      language: "css",
      wrong: ["p {", "  color: navy", "  font-size: 18px;", "}"],
      problem:
        "Without the semicolon the browser reads `navy font-size: 18px` as one broken value and drops both declarations.",
      right: ["p {", "  color: navy;", "  font-size: 18px;", "}"],
      why: "End every declaration with `;`, even the last one, so adding a line can't break it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Your first rules",
      task: "Write two rules: make every `h1` `navy`, and every `p` `18px`.",
      starter: [
        "<style>",
        "</style>",
        "<h1>My notes</h1>",
        "<p>Buy milk.</p>",
        "<p>Call Sam.</p>",
      ],
      checks: [
        {
          kind: "style",
          label: "The heading is navy",
          selector: "h1",
          property: "color",
          value: "rgb(0, 0, 128)",
        },
        {
          kind: "style",
          label: "The first paragraph is 18px",
          selector: "p",
          property: "font-size",
          value: "18px",
        },
        {
          kind: "style",
          label: "The second one too",
          selector: "p:last-of-type",
          property: "font-size",
          value: "18px",
        },
      ],
      hint: "`h1 { color: navy; }` and `p { font-size: 18px; }`, inside the `<style>`.",
      solution: [
        "<style>",
        "  h1 { color: navy; }",
        "  p { font-size: 18px; }",
        "</style>",
        "<h1>My notes</h1>",
        "<p>Buy milk.</p>",
        "<p>Call Sam.</p>",
      ],
    }),
    pageYourTurn({
      title: "Style only the notes",
      task: "Give elements with the class `note` a `lightyellow` background, and make only the `h2`s **inside** notes `crimson`. The heading outside stays black, like the rest of the page.",
      starter: [
        "<style>",
        "  body { color: black; }",
        "</style>",
        '<div class="note"><h2>Milk</h2><p>Buy two.</p></div>',
        '<div class="note"><h2>Bread</h2><p>Brown.</p></div>',
        "<h2>Not a note</h2>",
      ],
      checks: [
        {
          kind: "style",
          label: "Notes are light yellow",
          selector: ".note",
          property: "background-color",
          value: "rgb(255, 255, 224)",
        },
        {
          kind: "style",
          label: "Headings in notes are crimson",
          selector: ".note h2",
          property: "color",
          value: "rgb(220, 20, 60)",
        },
        {
          kind: "style",
          label: "The other heading stays black",
          selector: "body > h2",
          property: "color",
          value: "rgb(0, 0, 0)",
        },
      ],
      hint: "`.note { background: lightyellow; }` and, with a space, `.note h2 { color: crimson; }`.",
      solution: [
        "<style>",
        "  body { color: black; }",
        "  .note { background: lightyellow; }",
        "  .note h2 { color: crimson; }",
        "</style>",
        '<div class="note"><h2>Milk</h2><p>Buy two.</p></div>',
        '<div class="note"><h2>Bread</h2><p>Brown.</p></div>',
        "<h2>Not a note</h2>",
      ],
    }),
    pageYourTurn({
      title: "Top-level menu items only",
      task: "Make only the **direct** children of `.menu` bold with `font-weight: bold`. The items in the inner list stay normal.",
      starter: [
        "<style>",
        "</style>",
        '<ul class="menu">',
        "  <li>Notes",
        "    <ul><li>Today</li></ul>",
        "  </li>",
        "  <li>Settings</li>",
        "</ul>",
      ],
      checks: [
        {
          kind: "style",
          label: "Top-level items are bold",
          selector: ".menu > li",
          property: "font-weight",
          value: "700",
        },
        {
          kind: "style",
          label: "Inner items are normal",
          selector: ".menu ul li",
          property: "font-weight",
          value: "400",
        },
      ],
      hint: "Use the child combinator, `>`: `.menu > li { font-weight: bold; }`. The inner `li` sets its own weight back with `.menu ul li { font-weight: normal; }`, because bold is inherited.",
      solution: [
        "<style>",
        "  .menu > li { font-weight: bold; }",
        "  .menu ul li { font-weight: normal; }",
        "</style>",
        '<ul class="menu">',
        "  <li>Notes",
        "    <ul><li>Today</li></ul>",
        "  </li>",
        "  <li>Settings</li>",
        "</ul>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Getting started cheat sheet", [
      ["rule", "Selector + { declarations }.", "p { color: navy; }"],
      ["declaration", "property: value;", "font-size: 18px;"],
      [
        "<link>",
        "The usual way to add CSS.",
        '<link rel="stylesheet" href="style.css">',
      ],
      ["p / .note / #id", "Type, class, id.", ".note { … }"],
      ["a, b", "Group selectors.", "h1, h2 { … }"],
      ["a b / a > b", "Inside / directly inside.", ".menu > li { … }"],
      ["a.b", "One element with both.", ".card.featured"],
      [
        "[attr] / :state",
        "Attributes and pseudo-classes.",
        "a:hover, [disabled]",
      ],
      ["/* … */", "A comment.", "/* Note cards */"],
      [
        "invalid",
        "That one declaration is skipped, silently.",
        "colour: navy;",
      ],
    ]),
    quickCheck(
      'Which selector matches `<p class="note done">` but not `<p class="note">`?',
      ["`.note .done`", "`.note.done`", "`p .done`"],
      1,
      "No space: the same element must have both classes. With a space, `.done` would have to be inside a `.note`.",
    ),
  ),
);
