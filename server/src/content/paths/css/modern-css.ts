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

// Modern CSS: custom properties, their scope and fallbacks, how var() finds
// a value (step by step), maths with variables, dark mode, :has(),
// attribute selectors, container queries, cascade layers, this platform's
// own variables and dark mode, mistakes, practice and a recap.
export const modernCssModule = moduleLesson(
  "modern-css",
  "Modern CSS",
  50,
  [
    "Name values with custom properties, override them per component, and give `var()` a fallback.",
    "Build light and dark themes by swapping variables in `prefers-color-scheme`.",
    "Style a parent by what it contains with `:has()`, and elements by their attributes.",
    "Make a component adapt to its container with `@container`.",
    "Order whole groups of rules with `@layer`, so specificity fights don't happen.",
  ],

  part(
    "custom-properties",
    "Custom properties",
    explain(
      "A [[custom-property]] (often called a CSS variable) is a property you name yourself, starting with `--`. Set it once, usually on `:root` so the whole page can see it, and read it anywhere with `var()`. Change the value in one place and every rule that uses it follows.",
    ),
    playground("Change --brand and everything follows", [
      "<style>",
      "  :root { --brand: #1d4ed8; --radius: 8px; --space: 12px; }",
      "  h1 { color: var(--brand); }",
      "  .card { border: 2px solid var(--brand); border-radius: var(--radius);",
      "    padding: var(--space); }",
      "  button { background: var(--brand); color: white; border: 0;",
      "    padding: 6px 12px; border-radius: var(--radius); }",
      "</style>",
      "<h1>Theme</h1>",
      '<div class="card">A card <button>Save</button></div>',
    ]),
    quickCheck(
      "Where do you usually define colour variables that the whole page uses?",
      ["On `:root`", "On `button`", "Inside `@media print`"],
      0,
      "`:root` is the `<html>` element. Custom properties are inherited, so every element on the page can read what's set there.",
    ),
  ),

  part(
    "scope-and-fallbacks",
    "Scope and fallbacks",
    explain(
      "Custom properties are **inherited**, like `color`. Set one again on a component and everything inside it gets the new value, while the rest of the page keeps the old one. `var()` takes an optional second value, a **fallback**, used when the variable isn't set at all.",
    ),
    anatomy(
      "Reading a variable",
      ["background:", "  var(--accent,", "    #1d4ed8);"],
      [
        [
          "background",
          "property",
          "Any property can use a variable for its value.",
        ],
        [
          "var(",
          "read",
          "Look up a custom property on this element, inherited from above.",
        ],
        [
          "--accent",
          "name",
          "Two dashes, then any name. Case matters: --Accent is different.",
        ],
        [
          "#1d4ed8",
          "fallback",
          "Used only if --accent isn't set on this element or any ancestor.",
        ],
      ],
    ),
    playground("One button rule, two colours", [
      "<style>",
      "  :root { --accent: #1d4ed8; }",
      "  .danger { --accent: #b42318; }",
      "  button { background: var(--accent); color: white; border: 0; padding: 6px 12px; }",
      "</style>",
      "<button>Save</button>",
      '<div class="danger"><button>Delete</button></div>',
    ]),
  ),

  part(
    "resolving",
    "Which value does var() get? Move by move",
    explain(
      "When a rule uses `var(--name)`, the browser looks for `--name` on the element itself, which it may have **inherited** from any ancestor, then falls back if there's none. Step through two buttons that share one rule:",
    ),
    trace(
      "Resolving --accent and --pad",
      [
        "<style>",
        "  :root { --accent: #1d4ed8; }",
        "  .danger { --accent: #b42318; }",
        "  button {",
        "    background: var(--accent, gray);",
        "    padding: var(--pad, 8px);",
        "  }",
        "</style>",
        "<button>Save</button>",
        '<div class="danger">',
        "  <button>Delete</button>",
        "</div>",
      ],
      [
        {
          line: 2,
          note: "`:root` sets `--accent`. It's inherited, so every element on the page now has it, unless something inside sets it again.",
          vars: [[":root --accent", "#1d4ed8"]],
        },
        {
          line: 9,
          note: "Save sets no `--accent` itself, so it has the inherited one from `:root`.",
          vars: [
            [":root --accent", "#1d4ed8"],
            ["Save --accent", "#1d4ed8 (inherited)"],
          ],
        },
        {
          line: 5,
          note: "`var(--accent, gray)` finds the value, so the fallback isn't used: Save is blue.",
          vars: [["Save background", "#1d4ed8"]],
        },
        {
          line: 6,
          note: "Nothing anywhere sets `--pad`, so `var(--pad, 8px)` uses its fallback.",
          vars: [
            ["Save background", "#1d4ed8"],
            ["Save padding", "8px (fallback)"],
          ],
        },
        {
          line: 11,
          note: "Delete is inside `.danger`, which set `--accent` again on line 3. The nearer value is the one inherited, so the same rule makes Delete red.",
          vars: [
            ["Save background", "#1d4ed8"],
            [".danger --accent", "#b42318"],
            ["Delete background", "#b42318"],
          ],
          output: "Save: blue · Delete: red · both padding 8px",
        },
      ],
      { language: "html" },
    ),
    quickCheck(
      "`--gap` is set to `2rem` on `.grid` only. A `<p>` **outside** `.grid` uses `margin: var(--gap, 1rem)`. What margin does it get?",
      ["2rem", "1rem", "0"],
      1,
      "Variables pass down, not sideways. The paragraph isn't inside `.grid`, so `--gap` isn't set on it and the fallback is used.",
    ),
  ),

  part(
    "maths",
    "Maths with variables",
    explain(
      "A variable holds its value as written, and `calc()` can do arithmetic with it. Keep a spacing unit in one variable and multiply it, so the whole page's spacing scales together. A unitless number becomes a length by multiplying by one unit: `calc(var(--n) * 1rem)`. `min()` and `clamp()` from the responsive module work with variables too.",
    ),
    playground("A spacing scale from one variable", [
      "<style>",
      "  :root { --space: 8px; }",
      "  .box { background: #eef3ff; margin-bottom: var(--space); }",
      "  .s1 { padding: var(--space); }",
      "  .s2 { padding: calc(var(--space) * 2); }",
      "  .s3 { padding: calc(var(--space) * 3); }",
      "</style>",
      '<div class="box s1">× 1</div>',
      '<div class="box s2">× 2</div>',
      '<div class="box s3">× 3: change --space to 12px</div>',
    ]),
    keyPoints(
      "Put spaces around `+` and `-` in `calc()`.",
      "Mix units freely: `calc(100% - 2rem)`.",
      "Name values by purpose (`--space`, `--brand`), not by look (`--blue`).",
    ),
  ),

  part(
    "dark-mode",
    "Dark mode",
    explain(
      "[[prefers-color-scheme|`prefers-color-scheme`]] tells you whether the person's system is set to light or dark. Put every colour in a variable, then change **only the variables** inside `@media (prefers-color-scheme: dark)`: no rule has to be written twice. `color-scheme: light dark` also switches the browser's own parts, like scrollbars and form fields.",
    ),
    code(
      "css",
      "one set of rules, two themes",
      [
        ":root {",
        "  color-scheme: light dark;",
        "  --bg: #ffffff; --text: #171717; --accent: #1d4ed8;",
        "}",
        "",
        "@media (prefers-color-scheme: dark) {",
        "  :root { --bg: #0a0a0a; --text: #ededed; --accent: #60a5fa; }",
        "}",
        "",
        "body { background: var(--bg); color: var(--text); }",
        "a { color: var(--accent); }",
      ],
      {
        2: "scrollbars, inputs and buttons follow the theme too",
        6: "only when the system is set to dark",
        7: "a lighter blue: dark blue is hard to read on black",
        10: "every rule just reads the variables",
      },
    ),
    keyPoints(
      "Use a very dark grey, not pure black, and off-white text.",
      "Re-check contrast: colours that work on white may not on black.",
      "DevTools can switch the scheme to test without changing your system.",
    ),
    quickCheck(
      "Why put colours in custom properties for dark mode?",
      [
        "Only the variables change; no rule is repeated",
        "Variables load faster",
        "Browsers require it",
      ],
      0,
      "Swap a handful of values in one media query and the whole site follows.",
    ),
  ),

  part(
    "has",
    "The parent selector: :has()",
    explain(
      "Selectors used to go only downwards: `.card img` picks the image, never the card. [[modern-selectors|`:has()`]] turns that round: `.card:has(img)` picks cards that **contain** an image. It can test anything a selector can, like a checked box or an invalid field inside a form, which used to need JavaScript.",
    ),
    playground("Cards with images, ticked rows, invalid forms", [
      "<style>",
      "  .card { padding: 12px; margin: 6px 0; border: 1px solid #d0d7de; }",
      "  .card:has(img) { padding: 0; border-color: #1d4ed8; }",
      "  label:has(input:checked) { text-decoration: line-through; color: #59636e; }",
      "  form:has(input:user-invalid) button { opacity: 0.5; }",
      "</style>",
      '<div class="card">Text only</div>',
      '<div class="card"><img alt="" width="80" height="40" style="vertical-align: middle"',
      '  src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 80 40%27%3E%3Crect width=%2780%27 height=%2740%27 fill=%27%2393c5fd%27/%3E%3C/svg%3E"> With an image</div>',
      '<label><input type="checkbox"> Buy milk</label>',
      '<form><input type="email" placeholder="Type a bad email"> <button>Send</button></form>',
    ]),
    quickCheck(
      "Which selector styles only the cards that contain an image?",
      ["`.card img`", "`.card:has(img)`", "`img .card`"],
      1,
      "`:has()` selects the element before it, the card, when the inside matches. `.card img` selects the image itself.",
    ),
  ),

  part(
    "attributes",
    "Attribute selectors",
    explain(
      'Square brackets select by an HTML **attribute**, so you can style elements by what they are without adding classes. `[disabled]` matches any element with that attribute; `[type="email"]` one value exactly. `^=`, `$=` and `*=` match the start, the end, or any part of the value. They score like a class.',
    ),
    reference("Attribute selectors", [
      [
        "[attr]",
        "Has the attribute at all.",
        "button[disabled] { opacity: 0.5; }",
      ],
      ['[attr="v"]', "Exactly this value.", 'input[type="email"] { … }'],
      ['[attr^="v"]', "Starts with.", 'a[href^="https"] { … }'],
      [
        '[attr$="v"]',
        "Ends with.",
        'a[href$=".pdf"]::after { content: " (PDF)"; }',
      ],
      ['[attr*="v"]', "Contains, anywhere.", 'a[href*="example"] { … }'],
      [
        "[aria-…]",
        "Style the accessible state.",
        'button[aria-pressed="true"] { … }',
      ],
    ]),
    playground("Links that say where they go", [
      "<style>",
      '  a[target="_blank"]::after { content: " ↗"; }',
      '  a[href$=".pdf"]::after { content: " (PDF)"; }',
      '  a[href^="mailto:"] { font-weight: 700; }',
      "</style>",
      '<p><a href="https://example.com" target="_blank">A new tab</a></p>',
      '<p><a href="/notes.pdf">My notes</a></p>',
      '<p><a href="mailto:hi@example.com">Email us</a></p>',
    ]),
  ),

  part(
    "container-queries",
    "Container queries",
    explain(
      "A media query asks how wide the **window** is. A [[container-query]] asks how wide the component's **container** is, so the same card can be stacked in a narrow sidebar and side by side in a wide column. Mark the container with `container-type: inline-size`, then write `@container (min-width: …)` rules for what's inside it.",
    ),
    playground("The same card in two containers", [
      "<style>",
      "  .holder { container-type: inline-size; border: 1px dashed #888;",
      "    margin-bottom: 8px; padding: 6px; }",
      "  .narrow { width: 180px; }",
      "  .card { display: grid; gap: 8px; }",
      "  .pic { background: #93c5fd; height: 50px; }",
      "  @container (min-width: 250px) {",
      "    .card { grid-template-columns: 80px 1fr; }",
      "  }",
      "</style>",
      '<div class="holder narrow"><div class="card"><div class="pic"></div><p>Stacked: 180px</p></div></div>',
      '<div class="holder"><div class="card"><div class="pic"></div><p>Side by side: wide</p></div></div>',
    ]),
    keyPoints(
      "A container can't query itself, only what's inside it.",
      "`cqi` is 1% of the container's width: `font-size: 5cqi`.",
      "`container-name: sidebar` and `@container sidebar (…)` pick one.",
    ),
    quickCheck(
      "A card should change layout when **its column** is wide, wherever it's placed. Which tool?",
      ["A media query", "A container query", "`:has()`"],
      1,
      "Media queries only know the window. A container query follows whatever box the card sits in.",
    ),
  ),

  part(
    "layers",
    "Cascade layers",
    explain(
      "[[cascade-layer|`@layer`]] puts rules into named groups, and the order of the groups is decided **before** specificity. A later layer beats an earlier one even with a weaker selector, so a reset or a library can never out-score your components. Styles in no layer beat every layer.",
    ),
    code(
      "css",
      "layers decide before specificity",
      [
        "@layer reset, base, components;",
        "",
        "@layer base {",
        "  #save { background: gray; }",
        "}",
        "@layer components {",
        "  .button { background: #1d4ed8; }",
        "}",
      ],
      {
        1: "the order, once, at the top: last is strongest",
        4: "an id, but in an earlier layer",
        7: "wins: components comes after base",
      },
    ),
    playground("A class beating an id", [
      "<style>",
      "  @layer base, components;",
      "  @layer base { #save { background: gray; color: white; } }",
      "  @layer components { .button { background: #1d4ed8; color: white; } }",
      "  button { border: 0; padding: 6px 12px; }",
      "</style>",
      '<button id="save" class="button">Save</button>',
      "<p>Swap the order on the first line and it turns grey.</p>",
    ]),
    quickCheck(
      "A rule in `@layer components` and a rule outside any layer both set `color` on a button. Which wins?",
      ["The layered one", "The one outside any layer", "The more specific one"],
      1,
      "Unlayered styles come after every layer. Specificity only matters between rules in the same layer.",
    ),
  ),

  part(
    "for-real",
    "Variables and dark mode, for real",
    explain(
      "The Notes App names its six colours on `:root` and uses them everywhere, but has no dark mode. This platform has one, built exactly as this module shows: colour variables on `:root`, swapped in one media query. Every component uses names like `--background` and never a colour directly.",
    ),
    code(
      "css",
      "this platform's own client/src/index.css (trimmed)",
      [
        ":root {",
        "  --background: #ffffff;",
        "  --foreground: #171717;",
        "  --accent: #1d4ed8;",
        "}",
        "",
        "@media (prefers-color-scheme: dark) {",
        "  :root {",
        "    --background: #0a0a0a;",
        "    --foreground: #ededed;",
        "    --accent: #60a5fa;",
        "  }",
        "}",
      ],
      {
        2: "named by purpose, not by colour",
        9: "near-black, not pure black",
        11: "a lighter blue that reads on the dark background",
      },
    ),
    inTheNotesApp(
      "Six colours on `:root`, from `--color-text` to `--color-danger`. A dark mode would be one `@media (prefers-color-scheme: dark)` block redefining those six.",
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A variable without var()",
      language: "css",
      wrong: [":root { --brand: #1d4ed8; }", "h1 { color: --brand; }"],
      problem:
        "`--brand` on its own isn't a colour, so the declaration is invalid and dropped.",
      right: ["h1 { color: var(--brand); }"],
      why: "Read a custom property with `var()` every time.",
    }),
    mistake({
      title: "Units glued on afterwards",
      language: "css",
      wrong: [":root { --gap: 16; }", ".grid { gap: var(--gap)px; }"],
      problem:
        "`var()` doesn't join text: this becomes `16 px`, which isn't a length, so `gap` is ignored.",
      right: [".grid { gap: calc(var(--gap) * 1px); }"],
      why: "Multiply by one unit in `calc()`, or store the unit in the variable: `--gap: 16px`.",
    }),
    mistake({
      title: "Dark mode by rewriting every rule",
      language: "css",
      wrong: [
        "@media (prefers-color-scheme: dark) {",
        "  body { background: #0a0a0a; }",
        "  .card { background: #171717; border-color: #404040; }",
        "  /* …and every other rule again */",
        "}",
      ],
      problem:
        "Every new component needs a second rule, and some always get forgotten.",
      right: [
        "@media (prefers-color-scheme: dark) {",
        "  :root { --bg: #0a0a0a; --surface: #171717; --border: #404040; }",
        "}",
      ],
      why: "Components read variables, so swapping the variables themes everything.",
    }),
    mistake({
      title: "A container that queries itself",
      language: "css",
      wrong: [
        ".card { container-type: inline-size; }",
        "@container (min-width: 30rem) { .card { display: flex; } }",
      ],
      problem:
        "The rule never applies: a container query styles what's **inside** the container.",
      right: [
        ".card-holder { container-type: inline-size; }",
        "@container (min-width: 30rem) { .card { display: flex; } }",
      ],
      why: "Make the parent the container, and query it from the card.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A theme with an override",
      task: "Define `--brand: #1d4ed8` on `:root`, and set `--brand` to `#b42318` on `.danger`. The button rule already uses `var(--brand)`.",
      starter: [
        "<style>",
        "  button { background: var(--brand, gray); color: white; border: 0; padding: 6px 12px; }",
        "</style>",
        "<button>Save</button>",
        '<div class="danger"><button>Delete</button></div>',
      ],
      checks: [
        {
          kind: "style",
          label: "--brand is blue on :root",
          selector: ":root",
          property: "--brand",
          value: "#1d4ed8",
        },
        {
          kind: "style",
          label: ".danger sets --brand to red",
          selector: ".danger",
          property: "--brand",
          value: "#b42318",
        },
      ],
      hint: "`:root { --brand: #1d4ed8; }` and `.danger { --brand: #b42318; }`.",
      solution: [
        "<style>",
        "  :root { --brand: #1d4ed8; }",
        "  .danger { --brand: #b42318; }",
        "  button { background: var(--brand, gray); color: white; border: 0; padding: 6px 12px; }",
        "</style>",
        "<button>Save</button>",
        '<div class="danger"><button>Delete</button></div>',
      ],
    }),
    pageYourTurn({
      title: "Select by contents and attributes",
      task: 'Give cards that contain an `img` the background `#eef3ff` with `:has()`, and make links with `target="_blank"` bold (`font-weight: 700`).',
      starter: [
        "<style>",
        "</style>",
        '<div class="card" id="plain">Text only</div>',
        '<div class="card" id="pic"><img alt="" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E"></div>',
        '<a href="/notes">Notes</a> <a href="https://example.com" target="_blank">Docs</a>',
      ],
      checks: [
        {
          kind: "style",
          label: "The card with an image is tinted",
          selector: "#pic",
          property: "background-color",
          value: "rgb(238, 243, 255)",
        },
        {
          kind: "style",
          label: "The card without one isn't",
          selector: "#plain",
          property: "background-color",
          value: "rgba(0, 0, 0, 0)",
        },
        {
          kind: "style",
          label: "The new-tab link is bold",
          selector: 'a[target="_blank"]',
          property: "font-weight",
          value: "700",
        },
      ],
      hint: '`.card:has(img) { background: #eef3ff; }` and `a[target="_blank"] { font-weight: 700; }`.',
      solution: [
        "<style>",
        "  .card:has(img) { background: #eef3ff; }",
        '  a[target="_blank"] { font-weight: 700; }',
        "</style>",
        '<div class="card" id="plain">Text only</div>',
        '<div class="card" id="pic"><img alt="" src="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27/%3E"></div>',
        '<a href="/notes">Notes</a> <a href="https://example.com" target="_blank">Docs</a>',
      ],
    }),
    pageYourTurn({
      title: "Ready for themes and containers",
      task: "Let the browser's own parts follow light and dark mode with `color-scheme: light dark` on `:root`, and make `.sidebar` a container with `container-type: inline-size`.",
      starter: [
        "<style>",
        "</style>",
        '<aside class="sidebar"><div class="card">A card</div></aside>',
      ],
      checks: [
        {
          kind: "style",
          label: "The page supports both schemes",
          selector: ":root",
          property: "color-scheme",
          value: "light dark",
        },
        {
          kind: "style",
          label: "The sidebar is a container",
          selector: ".sidebar",
          property: "container-type",
          value: "inline-size",
        },
      ],
      hint: "`:root { color-scheme: light dark; }` and `.sidebar { container-type: inline-size; }`.",
      solution: [
        "<style>",
        "  :root { color-scheme: light dark; }",
        "  .sidebar { container-type: inline-size; }",
        "</style>",
        '<aside class="sidebar"><div class="card">A card</div></aside>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Modern CSS cheat sheet", [
      [
        "--name / var()",
        "Define, then read; inherited.",
        "color: var(--brand);",
      ],
      ["fallback", "Used if the variable isn't set.", "var(--pad, 8px)"],
      [
        "override",
        "Set it again on a component.",
        ".danger { --brand: #b42318; }",
      ],
      ["calc()", "Maths, with spaces round + and -.", "calc(var(--space) * 2)"],
      [
        "prefers-color-scheme",
        "Swap the variables for dark.",
        "@media (prefers-color-scheme: dark)",
      ],
      [
        "color-scheme",
        "Browser parts follow the theme.",
        "color-scheme: light dark;",
      ],
      [":has()", "A parent by its contents.", ".card:has(img)"],
      ["[attr]", "By attribute; scores like a class.", 'a[href$=".pdf"]'],
      [
        "@container",
        "By the container's size.",
        "@container (min-width: 30rem)",
      ],
      [
        "@layer",
        "Groups ordered before specificity.",
        "@layer base, components;",
      ],
    ]),
    quickCheck(
      "`:root { --brand: blue; }`, `.card { --brand: green; }`, and `a { color: var(--brand, red); }`. What colour is a link inside a `.card`?",
      ["Blue", "Green", "Red"],
      1,
      "The link inherits `--brand` from its nearest ancestor that sets it, the card. The fallback is only for when it's not set at all.",
    ),
  ),
);
