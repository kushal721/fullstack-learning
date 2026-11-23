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

// The cascade and specificity in depth: why rules conflict, the order the
// cascade checks things in, browser defaults, scoring a selector
// (anatomy and a calculator table), a step-through of one property being
// decided, :is(), :where() and :not(), inheritance, !important, finding
// the winner in DevTools, the Notes App's buttons, mistakes, practice and
// a recap. Keeps the first old lesson's id, "cascade".
export const cascadeModule = moduleLesson(
  "cascade",
  "The cascade and specificity",
  45,
  [
    "Explain why several rules can set the same property, and how the cascade picks one.",
    "List the cascade's checks in order: importance and origin, specificity, then order.",
    "Score any selector's specificity, including `:is()`, `:where()` and `:not()`.",
    "Tell inherited values from cascaded ones, and use `inherit` and `initial`.",
    "Find the winning rule in DevTools and fix conflicts without `!important`.",
  ],

  part(
    "why",
    "When rules disagree",
    explain(
      "A real stylesheet has hundreds of rules, and many of them match the same element. A paragraph inside a note card might match `p`, `.note-card p` and `.urgent` at once, and all three set `color`. The element can only have one colour, so CSS needs a way to decide. That decision process is [[cascade|the cascade]], and it's behind most “why isn't my CSS working?” moments.",
    ),
    playground("Three rules, one paragraph: which colour wins?", [
      "<style>",
      "  .urgent { color: crimson; }",
      "  .note-card p { color: navy; }",
      "  p { color: gray; }",
      "</style>",
      '<div class="note-card">',
      '  <p class="urgent">Pay the rent</p>',
      "  <p>Buy milk</p>",
      "</div>",
      "<p>Outside the card</p>",
      "<p>Try deleting each rule in turn and predict the result first.</p>",
    ]),
  ),

  part(
    "order",
    "The cascade, step by step",
    explain(
      "The cascade compares the rules that set the same property on the same element, and goes down a list of tie-breakers. It stops at the first one that gives a winner. In everyday code it's almost always decided by the last two: [[specificity]], then which rule comes later.",
    ),
    diagram([
      ["1. Importance and origin", "!important, then yours over the browser's"],
      ["2. Inline style", "a style attribute"],
      ["3. Specificity", "id > class > element"],
      ["4. Order", "the later rule wins"],
    ]),
    reference("What each step compares", [
      [
        "importance",
        "`!important` declarations beat normal ones.",
        "color: red !important;",
      ],
      [
        "origin",
        "Your stylesheet beats the browser's defaults.",
        "h1 { margin: 0; }",
      ],
      [
        "inline style",
        "A `style` attribute beats any selector.",
        '<p style="color: red">',
      ],
      [
        "specificity",
        "The more specific selector wins.",
        "#title beats .title",
      ],
      [
        "order",
        "Equal so far? The rule written later wins.",
        "p { color: navy; } p { color: green; }",
      ],
    ]),
    quickCheck(
      "Two rules have selectors that are exactly as specific. Which wins?",
      [
        "The first one",
        "The one written later",
        "Neither: the browser default",
      ],
      1,
      "When everything else is equal, order decides: the later rule wins. Linked stylesheets count in the order they're linked.",
    ),
  ),

  part(
    "browser-defaults",
    "The browser's own stylesheet",
    explain(
      "Before your CSS, the browser applies its own [[user-agent-stylesheet|default stylesheet]]: headings are big and bold with margins, links are blue and underlined, lists have bullets and padding, `body` has an 8px margin. Your rules beat these whatever their specificity, because they come from a stronger origin. That's why one line like `body { margin: 0; }` removes a default.",
    ),
    playground("Defaults, then your rules on top", [
      "<style>",
      "  /* Delete these rules to see the browser's defaults. */",
      "  body { margin: 0; }",
      "  h1 { margin: 0 0 8px; font-size: 1.25rem; }",
      "  ul { padding: 0; list-style: none; }",
      "  a { color: inherit; }",
      "</style>",
      "<h1>My notes</h1>",
      "<ul><li>Milk</li><li>Bread</li></ul>",
      '<p>A <a href="#">link</a> in the text colour.</p>',
    ]),
    quickCheck(
      "Your stylesheet has `h1 { margin-top: 0; }`. The browser's default sets a top margin on `h1`. Which applies?",
      [
        "The browser's: it came first",
        "Yours: author styles beat the browser's",
        "Both add together",
      ],
      1,
      "Your styles come from a stronger origin than the browser's defaults, so they win.",
    ),
  ),

  part(
    "scoring",
    "Scoring a selector",
    explain(
      "Specificity is three numbers, written like `1-2-1`: **ids**, then **classes** (with attributes and pseudo-classes like `:hover`), then **elements** (with pseudo-elements like `::before`). Count each part of the selector into its column. Compare from the left: any id beats any number of classes, and any class beats any number of elements. `*` and combinators like `>` count nothing.",
    ),
    anatomy(
      "Scoring #notes .card p:hover",
      ["#notes .card p:hover { color: crimson; }"],
      [
        ["#notes", "id", "An id: 1 in the first column."],
        [".card", "class", "A class: 1 in the middle column."],
        ["p", "element", "An element name: 1 in the last column."],
        [
          ":hover",
          "pseudo-class",
          "Counts like a class: the middle column goes to 2. Total: 1-2-1.",
        ],
      ],
    ),
    keyPoints(
      "Columns: ids – classes – elements.",
      "Compare left to right; the first bigger column wins.",
      "11 classes never beat 1 id: there's no carrying over.",
      "Spaces, `>`, `+` and `*` count nothing.",
    ),
  ),

  part(
    "calculator",
    "A specificity calculator",
    explain(
      "Here are selectors you'll meet, scored. Cover the right-hand column and try scoring each one yourself first.",
    ),
    reference("Selectors and their scores (ids – classes – elements)", [
      ["*", "Nothing counts.", "0-0-0"],
      ["p", "One element.", "0-0-1"],
      ["ul li", "Two elements.", "0-0-2"],
      [".note", "One class.", "0-1-0"],
      ["a:hover", "An element and a pseudo-class.", "0-1-1"],
      ['input[type="email"]', "An element and an attribute.", "0-1-1"],
      [".card .title", "Two classes.", "0-2-0"],
      [".card > h2::before", "A class, an element, a pseudo-element.", "0-1-2"],
      ["#title", "One id.", "1-0-0"],
      ["#nav .link.active", "An id and two classes.", "1-2-0"],
    ]),
    quickCheck(
      "Which is more specific: `.nav .menu .item a` or `#nav a`?",
      [
        "`.nav .menu .item a` (0-3-1): more parts",
        "`#nav a` (1-0-1): the id wins",
        "They're equal",
      ],
      1,
      "Compare the first column first: 1 id beats 0, whatever the class count.",
    ),
  ),

  part(
    "deciding",
    "One property, decided move by move",
    explain(
      'Watch the cascade settle the colour of one element, `<p id="intro" class="lead">` inside `<main>`. Every rule below matches it:',
    ),
    trace(
      "Which colour does #intro get?",
      [
        "<style>",
        "  p { color: gray; }",
        "  main p { color: navy; }",
        "  .lead { color: teal; }",
        "  #intro { color: crimson; }",
        "  .lead { color: green; }",
        "</style>",
      ],
      [
        {
          line: 2,
          note: "`p` matches, score 0-0-1. It's the only candidate so far.",
          vars: [
            ["candidates", "p (0-0-1)"],
            ["winning", "gray"],
          ],
        },
        {
          line: 3,
          note: "`main p` matches too, 0-0-2. Two elements beat one.",
          vars: [
            ["candidates", "p, main p"],
            ["winning", "navy (0-0-2)"],
          ],
        },
        {
          line: 4,
          note: "`.lead` is 0-1-0. A class beats any number of elements.",
          vars: [
            ["candidates", "p, main p, .lead"],
            ["winning", "teal (0-1-0)"],
          ],
        },
        {
          line: 5,
          note: "`#intro` is 1-0-0. An id beats every class.",
          vars: [
            ["candidates", "p, main p, .lead, #intro"],
            ["winning", "crimson (1-0-0)"],
          ],
        },
        {
          line: 6,
          note: "Another `.lead`, later. Later only breaks a **tie**, and 0-1-0 is weaker than 1-0-0, so crimson stays. It does beat the first `.lead`.",
          vars: [
            ["candidates", "5 rules"],
            ["winning", "crimson (1-0-0)"],
          ],
          output: "color: crimson",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "Delete the `#intro` rule. Which colour wins now?",
      ["teal", "green", "navy"],
      1,
      "Both `.lead` rules tie at 0-1-0, so the later one wins: green.",
    ),
  ),

  part(
    "is-where-not",
    ":is(), :where() and :not()",
    explain(
      "Three [[pseudo-class|pseudo-classes]] take a list of selectors. `:is()` and `:not()` score as their **most specific** argument. `:where()` always scores **zero**, which makes it perfect for defaults that anything can override. They also shorten long selector lists: `:is(h1, h2, h3) a` instead of three selectors.",
    ),
    reference("Grouping selectors", [
      [
        ":is(a, b)",
        "Matches either; scores as the strongest.",
        ":is(#a, .b) p → 1-0-1",
      ],
      [
        ":where(a, b)",
        "Matches either; scores 0-0-0.",
        ":where(.card) p → 0-0-1",
      ],
      [
        ":not(a)",
        "Matches if not; scores as its argument.",
        "li:not(.done) → 0-1-1",
      ],
    ]),
    playground(":where() makes a default anyone can override", [
      "<style>",
      "  :where(.card) p { color: navy; } /* 0-0-1 */",
      "  p { color: crimson; }           /* 0-0-1, later: wins */",
      "  li:not(.done) { font-weight: bold; }",
      "</style>",
      '<div class="card"><p>Inside the card</p></div>',
      '<ul><li>Open task</li><li class="done">Done task</li></ul>',
      "<p>Change :where to :is and the card's paragraph turns navy.</p>",
    ]),
  ),

  part(
    "inheritance",
    "Inheritance: when no rule matches",
    explain(
      "The cascade only picks between rules that **match the element**. When none sets a property, text properties like `color` and `font-family` are [[inheritance|inherited]] from the parent, while box properties like `margin` and `border` fall back to their initial value. An inherited value always loses to any rule that targets the element itself, however weak, even the browser's default for links.",
    ),
    reference("Keywords that work on any property", [
      ["inherit", "Take the parent's value.", "a { color: inherit; }"],
      [
        "initial",
        "The property's built-in starting value.",
        "margin: initial;",
      ],
      [
        "unset",
        "inherit if it normally inherits, else initial.",
        "all: unset;",
      ],
      ["revert", "Back to the browser's default.", "display: revert;"],
    ]),
    quickCheck(
      "`#main { color: crimson; }` and `p { color: gray; }`. What colour is a `<p>` inside `#main`?",
      ["Crimson: the id is stronger", "Gray: it targets the p itself", "Black"],
      1,
      "`#main` matches the parent, not the `<p>`. Inheritance only fills in when no rule matches the element; `p` does, so it's gray.",
    ),
  ),

  part(
    "important",
    "!important, and why to avoid it",
    explain(
      "`!important` after a value jumps the declaration to the front of the queue: it beats every normal declaration, whatever the specificity. It feels like a fix, but the only way to beat it later is another `!important`, and a stylesheet full of them can't be reasoned about. Use it only for rare utility classes that must always win, and for user accessibility overrides.",
    ),
    code(
      "css",
      "how !important takes over",
      [
        ".button { background: navy !important; }",
        "",
        "/* Later, a red delete button. It doesn't work: */",
        "#delete.button { background: crimson; }",
      ],
      {
        1: "important: beats every normal declaration",
        4: "1-1-0 is stronger, but it's not important, so it loses",
      },
    ),
    keyPoints(
      "`!important` beats any specificity among normal rules.",
      "Two important rules fall back to specificity and order.",
      "Fix the selector or the order instead.",
      "OK for small utilities like `.visually-hidden`.",
    ),
  ),

  part(
    "devtools",
    "Finding the winner in DevTools",
    explain(
      "Inspect an element and the **Styles** pane lists every rule that matches it, most specific first. Declarations that lost are **struck through**, so you can see what was overridden and by what. The **Computed** tab shows the final value of each property; expand one to see every rule that tried to set it. Hover a selector to see its specificity.",
    ),
    keyPoints(
      "Struck-through: a declaration that lost.",
      "Styles pane: matching rules, strongest first.",
      "Computed tab: final values and where they came from.",
      "“Inherited from…”: values coming from a parent.",
    ),
    quickCheck(
      "In the Styles pane, `color: navy` is struck through. What does that mean?",
      [
        "The value is invalid",
        "Another rule's `color` won the cascade",
        "The rule doesn't match",
      ],
      1,
      "A struck-through declaration matched but lost to a stronger or later one. Invalid values show a warning icon instead.",
    ),
  ),

  part(
    "notes-app",
    "The cascade in the Notes App",
    explain(
      "The Notes App's buttons lean on the last tie-breaker. Every button has the `button` class plus a variant. `.button` gives padding; `.button-link`, written **later** and just as specific (0-1-0), sets `padding: 0` to look like a link. No ids, no `!important`. `font: inherit` also borrows inheritance, because buttons don't inherit the page's font by default.",
    ),
    code(
      "css",
      "from the Notes App's stylesheet",
      [
        ".button {",
        "  padding: 0.5rem 1rem;",
        "  font: inherit;",
        "}",
        "",
        ".button-link {",
        "  padding: 0;",
        "  background: none;",
        "  text-decoration: underline;",
        "}",
      ],
      {
        2: "every button's padding…",
        3: "use the page's font, not the browser's button font",
        7: "…except link-style buttons: same specificity, written later",
      },
    ),
    inTheNotesApp(
      "The stylesheet has `.button` first, then the `.button-primary`, `.button-secondary`, `.button-danger` and `.button-link` variants, each a single class.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Escalating specificity",
      language: "css",
      wrong: [
        "#app .main .notes .card p { color: navy; }",
        "/* later, to change one note: */",
        "#app .main .notes .card p.urgent { color: crimson; }",
      ],
      problem:
        "Each fix has to be longer than the last. Soon nothing can be changed without copying the whole chain.",
      right: [
        ".card-text { color: navy; }",
        ".card-text.urgent { color: crimson; }",
      ],
      why: "Keep selectors short and mostly single classes, so specificity stays low and order does the work.",
    }),
    mistake({
      title: "Styling with ids",
      language: "css",
      wrong: [
        "#save { background: navy; }",
        ".button-danger { background: crimson; }",
      ],
      problem:
        'The Save button can never become a danger button: `class="button-danger"` loses to the id.',
      right: [
        ".button-primary { background: navy; }",
        ".button-danger { background: crimson; }",
      ],
      why: "Classes are reusable and easy to override; save ids for links and JavaScript.",
    }),
    mistake({
      title: "Expecting inheritance to beat a rule",
      language: "css",
      wrong: [
        ".footer { color: white; }",
        "/* the footer's links are still blue */",
      ],
      problem:
        "The browser's default sets a colour on `a` itself, and any rule for the element beats an inherited value.",
      right: [".footer, .footer a { color: white; }"],
      why: "Target the element, or set `a { color: inherit; }` once.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Make the urgent note red",
      task: "`.urgent` should make a note `crimson`, but `#notes p` beats it. Without `!important` and without changing the HTML, write a selector for urgent notes that's stronger than `#notes p`. The other note must stay gray.",
      starter: [
        "<style>",
        "  #notes p { color: gray; }",
        "  .urgent { color: crimson; }",
        "</style>",
        '<div id="notes">',
        '  <p class="urgent">Pay the rent</p>',
        "  <p>Buy milk</p>",
        "</div>",
      ],
      checks: [
        {
          kind: "style",
          label: "The urgent note is crimson",
          selector: ".urgent",
          property: "color",
          value: "rgb(220, 20, 60)",
        },
        {
          kind: "style",
          label: "The other note stays gray",
          selector: "#notes p:not(.urgent)",
          property: "color",
          value: "rgb(128, 128, 128)",
        },
      ],
      hint: "`#notes p` is 1-0-1. `#notes .urgent` is 1-1-0, which is stronger: `#notes .urgent { color: crimson; }`.",
      solution: [
        "<style>",
        "  #notes p { color: gray; }",
        "  #notes .urgent { color: crimson; }",
        "</style>",
        '<div id="notes">',
        '  <p class="urgent">Pay the rent</p>',
        "  <p>Buy milk</p>",
        "</div>",
      ],
    }),
    pageYourTurn({
      title: "Take out the !important",
      task: "The Delete button should be crimson, but `!important` on `.button` keeps it navy. Remove the `!important` so `.button-danger`, written later and just as specific, wins.",
      starter: [
        "<style>",
        "  .button { background: navy !important; color: white; }",
        "  .button-danger { background: crimson; }",
        "</style>",
        '<button class="button">Save</button>',
        '<button class="button button-danger">Delete</button>',
      ],
      checks: [
        {
          kind: "style",
          label: "Delete is crimson",
          selector: ".button-danger",
          property: "background-color",
          value: "rgb(220, 20, 60)",
        },
        {
          kind: "style",
          label: "Save is still navy",
          selector: ".button:not(.button-danger)",
          property: "background-color",
          value: "rgb(0, 0, 128)",
        },
      ],
      hint: "Change `background: navy !important;` to `background: navy;`. Both selectors are 0-1-0, so the later one wins.",
      solution: [
        "<style>",
        "  .button { background: navy; color: white; }",
        "  .button-danger { background: crimson; }",
        "</style>",
        '<button class="button">Save</button>',
        '<button class="button button-danger">Delete</button>',
      ],
    }),
    pageYourTurn({
      title: "Links that follow the text",
      task: "The footer's text is white, but its link stays the browser's blue. Make links take their parent's colour with `color: inherit`.",
      starter: [
        "<style>",
        "  footer { background: #222; color: white; padding: 12px; }",
        "</style>",
        '<footer>© Notes · <a href="#">Privacy</a></footer>',
      ],
      checks: [
        {
          kind: "style",
          label: "The footer text is white",
          selector: "footer",
          property: "color",
          value: "rgb(255, 255, 255)",
        },
        {
          kind: "style",
          label: "The link is white too",
          selector: "footer a",
          property: "color",
          value: "rgb(255, 255, 255)",
        },
      ],
      hint: "Add `a { color: inherit; }`: a rule that targets the link itself, telling it to use its parent's colour.",
      solution: [
        "<style>",
        "  footer { background: #222; color: white; padding: 12px; }",
        "  a { color: inherit; }",
        "</style>",
        '<footer>© Notes · <a href="#">Privacy</a></footer>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Cascade cheat sheet", [
      [
        "the cascade",
        "Picks one value when rules disagree.",
        "importance → specificity → order",
      ],
      [
        "!important",
        "Beats normal declarations; avoid.",
        "color: red !important;",
      ],
      ["browser defaults", "Lose to any of your rules.", "body { margin: 0; }"],
      ["inline style", "Beats any selector.", '<p style="…">'],
      ["specificity", "ids – classes – elements.", "#a .b p → 1-1-1"],
      ["order", "Breaks ties: later wins.", "p {…} p {…}"],
      [":where()", "Scores zero: easy to override.", ":where(.card) p → 0-0-1"],
      [
        "inheritance",
        "Only when no rule targets the element.",
        "a { color: inherit; }",
      ],
      [
        "DevTools",
        "Struck-through declarations lost.",
        "Styles and Computed panes",
      ],
    ]),
    quickCheck(
      'Rules: `ul li { color: navy }` (first), then `li { color: teal }`, then `.done { color: gray }`. What colour is `<li class="done">` in a `<ul>`?',
      ["navy", "teal", "gray"],
      2,
      "`.done` is 0-1-0, stronger than `ul li` (0-0-2) and `li` (0-0-1), so it wins regardless of order.",
    ),
  ),
);
