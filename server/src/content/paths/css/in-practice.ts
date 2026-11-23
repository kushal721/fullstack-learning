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

// CSS in practice: form controls and their fonts, form layout, form states,
// button variants, organising a stylesheet, a tour of the Notes App's,
// a note card rule by rule, utility-first CSS, reading Tailwind classes,
// Tailwind on this platform, choosing between them, mistakes, practice and
// a recap.
export const inPracticeModule = moduleLesson(
  "css-in-practice",
  "CSS in practice",
  45,
  [
    "Style forms and buttons that match the page and are easy to use.",
    "Organise a stylesheet into base styles, layout and components.",
    "Read the Notes App's stylesheet and follow which rule styles what.",
    "Read Tailwind utility classes and translate them to plain CSS.",
    "Choose between component classes and utility classes for a project.",
  ],

  part(
    "form-fonts",
    "Form controls start out different",
    explain(
      "Inputs, buttons, selects and textareas don't inherit the page's font: the browser gives them their own, often a smaller size, and a monospace font in textareas. `font: inherit` makes them use the font, size and line height around them, so a form matches its page. It's one of the first rules in most stylesheets.",
    ),
    playground("Before and after font: inherit", [
      "<style>",
      "  body { font-family: Georgia, serif; font-size: 18px; }",
      "  .fixed input, .fixed button, .fixed textarea { font: inherit; }",
      "</style>",
      "<p>Browser defaults:</p>",
      '<p><input value="Shopping"> <button>Save</button></p>',
      "<textarea>Milk</textarea>",
      '<div class="fixed">',
      "  <p>With font: inherit:</p>",
      '  <p><input value="Shopping"> <button>Save</button></p>',
      "  <textarea>Milk</textarea>",
      "</div>",
    ]),
    quickCheck(
      "Why add `input, button, textarea { font: inherit; }`?",
      [
        "Form controls don't use the page's font by default",
        "It makes them bold",
        "Browsers require it for forms to submit",
      ],
      0,
      "Form controls get the browser's own font and size, not the page's. `font: inherit` hands them the font from their parent.",
    ),
  ),

  part(
    "form-layout",
    "A form that's easy to fill in",
    explain(
      "Forms are read top to bottom, so put each label **above** its field and stack them with even gaps. Make fields wide enough for what's typed, with padding so the text isn't cramped, and a border with clear contrast. A small flex column per field, like the Notes App's `.form-field`, keeps every gap the same.",
    ),
    playground("Label above field, even gaps", [
      "<style>",
      "  body { font-family: system-ui, sans-serif; }",
      "  input, textarea, button { font: inherit; }",
      "  .form-field { display: flex; flex-direction: column; gap: 0.25rem;",
      "    margin-bottom: 1rem; max-width: 24rem; }",
      "  .form-field input, .form-field textarea { padding: 0.5rem;",
      "    border: 1px solid #8c959f; border-radius: 0.375rem; }",
      "</style>",
      '<div class="form-field"><label for="t">Title</label><input id="t"></div>',
      '<div class="form-field"><label for="c">Note</label><textarea id="c" rows="3"></textarea></div>',
      "<button>Save</button>",
    ]),
    keyPoints(
      "Every field needs a `<label>`; a placeholder isn't one.",
      "Field borders need 3:1 contrast against the background.",
      "Make tap targets at least 44px tall on phones.",
    ),
  ),

  part(
    "form-states",
    "Focus, errors and disabled",
    explain(
      "A form talks back through its states. Keep a clear `:focus-visible` ring on every field. Show errors with `:user-invalid` (after the person has typed) and always in **words** as well as colour. `accent-color` tints checkboxes, radios and range sliders in one line, and `:disabled` should look unavailable.",
    ),
    playground("Tab through, type a bad email, tick the box", [
      "<style>",
      "  body { font-family: system-ui, sans-serif; accent-color: #1d4ed8; }",
      "  input, button { font: inherit; padding: 6px 8px; }",
      "  :focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }",
      "  input:user-invalid { border: 2px solid #b42318; }",
      "  .hint { display: none; color: #b42318; margin: 4px 0; }",
      "  input:user-invalid + .hint { display: block; }",
      "  button:disabled { opacity: 0.6; cursor: not-allowed; }",
      "</style>",
      '<label for="email">Email</label> <input id="email" type="email" required>',
      '<p class="hint">Enter an email like sam@example.com.</p>',
      '<p><label><input type="checkbox"> Remember me</label></p>',
      "<button disabled>Saving…</button>",
    ]),
    quickCheck(
      "An invalid field turns red. What else should happen?",
      [
        "Nothing; red is enough",
        "A message in words saying what's wrong",
        "The page should shake",
      ],
      1,
      "Some people can't tell red from other colours, and screen readers don't announce colours. Say what's wrong in text, near the field.",
    ),
  ),

  part(
    "buttons",
    "Buttons and their variants",
    explain(
      "Most apps have a few kinds of button: a **primary** one for the main action, a quieter **secondary** one, and a red **danger** one for deleting. Put what they share in one `.button` class, and only the differences in a variant class. Change `.button` and every button in the app follows.",
    ),
    playground("One base class, three variants", [
      "<style>",
      "  .button { padding: 0.5rem 1rem; font: inherit; border: 1px solid transparent;",
      "    border-radius: 0.375rem; cursor: pointer; }",
      "  .button-primary { color: white; background: #1d4ed8; }",
      "  .button-secondary { color: #1f2328; background: white; border-color: #d0d7de; }",
      "  .button-danger { color: white; background: #b42318; }",
      "  .button:disabled { opacity: 0.6; cursor: not-allowed; }",
      "</style>",
      '<button class="button button-primary">Save</button>',
      '<button class="button button-secondary">Edit</button>',
      '<button class="button button-danger">Delete</button>',
      '<button class="button button-primary" disabled>Saving…</button>',
    ]),
    quickCheck(
      "Why does the secondary button have `border: 1px solid transparent` in `.button`?",
      [
        "So every variant is the same size, bordered or not",
        "Transparent borders are required on buttons",
        "To hide the focus ring",
      ],
      0,
      "A border adds to the size. Giving every button a transparent 1px border means the secondary button's visible border doesn't make it bigger.",
    ),
  ),

  part(
    "organising",
    "Organising a stylesheet",
    explain(
      "A stylesheet grows, so give it an order that tells you where things go: **base** rules for elements (`*`, `body`, form fonts), then **layout** (the page's main boxes), then **components**, one block per thing on screen, then rare **utilities**. Name classes after the component, like `.note-card` and `.note-card-title`, and add a comment above each block.",
    ),
    code(
      "css",
      "an order that scales",
      [
        "/* 1. Base: variables and elements */",
        ":root { --color-text: #1f2328; }",
        "*, *::before, *::after { box-sizing: border-box; }",
        "body { margin: 0; font-family: system-ui, sans-serif; }",
        "",
        "/* 2. Layout: the page's big boxes */",
        ".dashboard { max-width: 60rem; margin: 0 auto; }",
        "",
        "/* 3. Components: one block each */",
        ".note-card { padding: 1rem; background: white; }",
        "",
        "/* 4. Utilities: tiny helpers, used rarely */",
        ".visually-hidden { position: absolute; clip-path: inset(50%); }",
      ],
      {
        1: "few, low-specificity rules everything builds on",
        6: "widths and centring, not colours",
        9: "named after what it is, not how it looks",
        12: "last, so they win over components",
      },
    ),
    keyPoints(
      "Keep specificity low: one class per selector where you can.",
      "Name by meaning (`.note-card`), not looks (`.white-box`).",
      "`@layer base, layout, components, utilities` can enforce the order.",
    ),
  ),

  part(
    "notes-app-tour",
    "A tour of the Notes App's stylesheet",
    explain(
      "The Notes App's whole look is one file, `index.css`, written in that order: `box-sizing` and the six colour variables, then `body`, then a commented block per component: navbar, page widths, form fields, buttons, the notes grid and note cards. React components just add the class names, like the shared `Button` component does.",
    ),
    code(
      "jsx",
      "the Notes App's Button.jsx",
      [
        "// One button for the whole app: change the style here",
        "// and every form, card and menu follows.",
        'export default function Button({ children, variant = "primary", ...props }) {',
        "  return (",
        "    <button className={`button button-${variant}`} {...props}>",
        "      {children}",
        "    </button>",
        "  );",
        "}",
      ],
      {
        3: "primary unless the caller asks for another",
        5: "the base class plus one variant class from index.css",
      },
    ),
    inTheNotesApp(
      '`<Button variant="danger">Delete</Button>` renders `class="button button-danger"`, and `index.css` has `.button` and `.button-danger` blocks waiting for it.',
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "rule-by-rule",
    "A note card, rule by rule",
    explain(
      "Every element ends up styled by several rules at once: the browser's defaults, what it inherits, and the rules that match it. Step through the heading of a Notes App note card, using the app's real rules (colours written out):",
    ),
    trace(
      "Styling the note card's heading",
      [
        "<style>",
        "  body { font-family: system-ui, sans-serif;",
        "         line-height: 1.5; color: #1f2328; }",
        "  .note-card { padding: 1rem; background: white;",
        "    border: 1px solid #d0d7de; border-radius: 0.5rem; }",
        "  .note-card h2 { margin: 0 0 0.5rem; font-size: 1.125rem; }",
        "</style>",
        '<article class="note-card">',
        "  <h2>Shopping</h2>",
        "  <p>Milk and bread.</p>",
        "</article>",
      ],
      [
        {
          line: 9,
          note: "The browser's own stylesheet gives every `h2` a size of 1.5em (24px), bold text and margins of about 20px above and below.",
          vars: [
            ["font-size", "24px (browser)"],
            ["font-weight", "bold (browser)"],
            ["margin", "≈20px 0 (browser)"],
          ],
        },
        {
          line: 2,
          note: "No rule sets the heading's font, line height or colour, so it inherits them from `body`, through the article.",
          vars: [
            ["font-size", "24px (browser)"],
            ["font-family", "system-ui (inherited)"],
            ["color", "#1f2328 (inherited)"],
          ],
        },
        {
          line: 4,
          note: "`.note-card` styles the **article**: 16px of padding inside a white, rounded, bordered box. Padding and borders aren't inherited, so the heading just sits 16px inside the edge.",
          vars: [
            ["card padding", "16px"],
            ["font-size", "24px (browser)"],
            ["color", "#1f2328 (inherited)"],
          ],
        },
        {
          line: 6,
          note: "`.note-card h2` matches the heading. It scores 0-1-1, beating the browser's `h2`, so the margin and size are replaced. It doesn't set the weight, so that stays bold.",
          vars: [
            ["font-size", "18px (.note-card h2)"],
            ["margin", "0 0 8px (.note-card h2)"],
            ["font-weight", "bold (browser)"],
            ["color", "#1f2328 (inherited)"],
          ],
          output: "18px bold system-ui, 8px above the text",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "utility-css",
    "Utility-first CSS",
    explain(
      "[[utility-css|Utility CSS]] turns this round: instead of naming components and writing their rules, you style in the HTML with many tiny classes, each setting one thing: `p-4` is padding, `rounded-lg` the corners. A build step writes CSS only for the classes you use. **Tailwind** is the best known, and this platform is built with it.",
    ),
    code(
      "html",
      "the same card, two ways",
      [
        "<!-- component class: the CSS lives in a stylesheet -->",
        '<article class="note-card">…</article>',
        "",
        "<!-- Tailwind: the styles are in the HTML -->",
        '<article class="rounded-lg border border-gray-300 bg-white p-4">…</article>',
      ],
      {
        2: "one name; its rule is written elsewhere",
        5: "corners, border, its colour, background and padding",
      },
    ),
    quickCheck(
      "What does `p-4` usually mean in Tailwind?",
      ["Paragraph style 4", "Padding of 1rem on every side", "Position 4"],
      1,
      "Tailwind's spacing scale is steps of 0.25rem, so `p-4` is `padding: 1rem`. `px-` is left and right, `py-` top and bottom.",
    ),
  ),

  part(
    "reading-tailwind",
    "Reading Tailwind classes",
    explain(
      "Tailwind names follow a pattern: a **property** abbreviation, then a **value** from a scale, like `px-3` or `text-sm`. A prefix and a colon add a **condition**: `hover:` for a state, `md:` for a screen width, `dark:` for dark mode. This button comes from this platform's own code:",
    ),
    anatomy(
      "A button from this platform",
      [
        'class="rounded-md',
        "  border border-border",
        "  px-3 py-1.5 font-medium",
        '  hover:bg-foreground/5"',
      ],
      [
        ["rounded-md", "corners", "border-radius: 0.375rem."],
        ["border", "border", "A 1px solid border."],
        [
          "border-border",
          "border colour",
          "The theme colour named border, from a CSS variable.",
        ],
        ["px-3", "padding x", "Left and right: 3 × 0.25rem = 0.75rem."],
        ["py-1.5", "padding y", "Top and bottom: 0.375rem."],
        ["font-medium", "weight", "font-weight: 500."],
        ["hover:", "condition", "Only while the pointer is over it…"],
        [
          "bg-foreground/5",
          "background",
          "…the text colour at 5% opacity, a faint tint.",
        ],
      ],
    ),
    reference("Common Tailwind classes", [
      [
        "p-4 / px-3 / mt-2",
        "Padding and margin; 1 = 0.25rem.",
        "p-4 → padding: 1rem",
      ],
      [
        "flex / grid / gap-4",
        "Layout.",
        "flex gap-4 → display: flex; gap: 1rem",
      ],
      [
        "text-sm / font-bold",
        "Size and weight.",
        "text-sm → font-size: 0.875rem",
      ],
      [
        "bg-white / text-gray-600",
        "Colours from the palette.",
        "bg-white → background-color: white",
      ],
      [
        "rounded-lg / border",
        "Corners and borders.",
        "rounded-lg → border-radius: 0.5rem",
      ],
      [
        "md:flex",
        "From 48rem wide up.",
        "@media (width >= 48rem) { display: flex }",
      ],
      ["hover: / focus-visible:", "In that state.", "hover:underline"],
      ["dark:", "When dark mode is on.", "dark:bg-gray-900"],
    ]),
  ),

  part(
    "tailwind-here",
    "Tailwind on this platform",
    explain(
      "This platform's stylesheet is short. It imports Tailwind, defines its colours as variables (light, then dark), and tells Tailwind's theme about them with `@theme`. A class like `bg-background` then reads `var(--background)`, so every component switches to dark mode without a single `dark:` class.",
    ),
    code(
      "css",
      "client/src/index.css (trimmed)",
      [
        '@import "tailwindcss";',
        "",
        ":root { --background: #ffffff; --border: #d4d4d4; }",
        "@media (prefers-color-scheme: dark) {",
        "  :root { --background: #0a0a0a; --border: #404040; }",
        "}",
        "",
        "@theme inline {",
        "  --color-background: var(--background);",
        "  --color-border: var(--border);",
        "}",
      ],
      {
        1: "Tailwind's base styles and every utility",
        4: "dark mode swaps the variables, as in Modern CSS",
        9: "makes bg-background, text-background… exist",
        10: "and border-border, as in the button above",
      },
    ),
    keyPoints(
      "Tailwind puts its rules in cascade layers, so plain CSS outside them wins.",
      "Arbitrary values in brackets: `h-[28rem]`, `[overflow-wrap:anywhere]`.",
      "Long class lists are normal; components keep them in one place.",
    ),
  ),

  part(
    "choosing",
    "Component classes or utilities?",
    explain(
      "Both work, and both need CSS knowledge: Tailwind is plain CSS with short names. **Component classes** keep HTML tidy and read well in small projects, like the Notes App. **Utilities** keep styles next to the markup, avoid naming things, and never grow a stylesheet nobody dares to delete from. Many teams mix them.",
    ),
    keyPoints(
      "Small app, few components: one stylesheet of component classes.",
      "Big app or team, a component framework: utilities shine.",
      "Either way: variables for colours, a spacing scale, focus styles.",
      "Repeating the same 10 utilities? Make it a component.",
    ),
    quickCheck(
      "In a React app using Tailwind, five buttons repeat the same twelve classes. What's the usual fix?",
      [
        "Copy them into every new button too",
        "A `Button` component that holds the classes once",
        "Switch the whole app to plain CSS",
      ],
      1,
      "The component is where the repetition lives, once, like the Notes App's `Button` holds `button button-${variant}`.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A placeholder instead of a label",
      language: "html",
      wrong: ['<input placeholder="Email">'],
      problem:
        "The hint vanishes as soon as someone types, its grey text is often too faint, and screen readers may not announce it.",
      right: [
        '<label for="email">Email</label>',
        '<input id="email" type="email">',
      ],
      why: "A visible label stays put and is announced when the field gets focus.",
    }),
    mistake({
      title: "Removing the focus ring from fields",
      language: "css",
      wrong: ["input:focus { outline: none; }"],
      problem: "Keyboard users can't see which field they're typing into.",
      right: [
        "input:focus-visible { outline: 2px solid #1d4ed8; outline-offset: 2px; }",
      ],
      why: "Restyle the ring to match the design; never remove it without a replacement.",
    }),
    mistake({
      title: "Copying a button's styles for each variant",
      language: "css",
      wrong: [
        ".save { padding: 8px 16px; border-radius: 6px; background: #1d4ed8; }",
        ".delete { padding: 8px 16px; border-radius: 6px; background: #b42318; }",
      ],
      problem:
        "Change the padding and you must find every copy; they drift apart over time.",
      right: [
        ".button { padding: 8px 16px; border-radius: 6px; }",
        ".button-primary { background: #1d4ed8; }",
        ".button-danger { background: #b42318; }",
      ],
      why: "Shared styles once in a base class; variants hold only what differs.",
    }),
    mistake({
      title: "Building Tailwind class names from pieces",
      language: "js",
      wrong: ["const cls = `bg-${color}-600`;"],
      problem:
        "Tailwind finds classes by scanning your files for whole names. `bg-red-600` never appears, so its CSS is never generated.",
      right: [
        'const colours = { red: "bg-red-600", blue: "bg-blue-600" };',
        "const cls = colours[color];",
      ],
      why: "Write every class name out in full somewhere in the code so the build step finds it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "A form that matches the page",
      task: "Give `body` the font `Georgia, serif` at `18px`, then make `input` and `button` use it with `font: inherit`.",
      starter: [
        "<style>",
        "</style>",
        '<label for="t">Title</label>',
        '<input id="t" value="Shopping">',
        "<button>Save</button>",
      ],
      checks: [
        {
          kind: "style",
          label: "The input uses Georgia",
          selector: "input",
          property: "font-family",
          value: "Georgia, serif",
        },
        {
          kind: "style",
          label: "The input is 18px",
          selector: "input",
          property: "font-size",
          value: "18px",
        },
        {
          kind: "style",
          label: "The button is 18px",
          selector: "button",
          property: "font-size",
          value: "18px",
        },
      ],
      hint: "`body { font-family: Georgia, serif; font-size: 18px; }` and `input, button { font: inherit; }`.",
      solution: [
        "<style>",
        "  body { font-family: Georgia, serif; font-size: 18px; }",
        "  input, button { font: inherit; }",
        "</style>",
        '<label for="t">Title</label>',
        '<input id="t" value="Shopping">',
        "<button>Save</button>",
      ],
    }),
    pageYourTurn({
      title: "Button variants",
      task: "`.button` holds the shared styles. Add `.button-primary` (background `#1d4ed8`, white text) and `.button-danger` (background `#b42318`, white text).",
      starter: [
        "<style>",
        "  .button { padding: 8px 16px; border: 0; border-radius: 6px; font: inherit; }",
        "</style>",
        '<button class="button button-primary">Save</button>',
        '<button class="button button-danger">Delete</button>',
      ],
      checks: [
        {
          kind: "style",
          label: "Primary is blue",
          selector: ".button-primary",
          property: "background-color",
          value: "rgb(29, 78, 216)",
        },
        {
          kind: "style",
          label: "Primary has white text",
          selector: ".button-primary",
          property: "color",
          value: "rgb(255, 255, 255)",
        },
        {
          kind: "style",
          label: "Danger is red",
          selector: ".button-danger",
          property: "background-color",
          value: "rgb(180, 35, 24)",
        },
        {
          kind: "style",
          label: "Danger has white text",
          selector: ".button-danger",
          property: "color",
          value: "rgb(255, 255, 255)",
        },
      ],
      hint: "`.button-primary { background: #1d4ed8; color: white; }` and `.button-danger { background: #b42318; color: white; }`.",
      solution: [
        "<style>",
        "  .button { padding: 8px 16px; border: 0; border-radius: 6px; font: inherit; }",
        "  .button-primary { background: #1d4ed8; color: white; }",
        "  .button-danger { background: #b42318; color: white; }",
        "</style>",
        '<button class="button button-primary">Save</button>',
        '<button class="button button-danger">Delete</button>',
      ],
    }),
    pageYourTurn({
      title: "Tailwind to plain CSS",
      task: 'A teammate wrote `<div class="p-4 font-bold text-center bg-white">`. Write the same styles as plain CSS in `.banner`: `p-4` is `1rem` (16px) of padding.',
      starter: [
        "<style>",
        "  .banner { }",
        "</style>",
        '<div class="banner">Welcome back</div>',
      ],
      checks: [
        {
          kind: "style",
          label: "p-4: 16px of padding",
          selector: ".banner",
          property: "padding-top",
          value: "16px",
        },
        {
          kind: "style",
          label: "font-bold: weight 700",
          selector: ".banner",
          property: "font-weight",
          value: "700",
        },
        {
          kind: "style",
          label: "text-center",
          selector: ".banner",
          property: "text-align",
          value: "center",
        },
        {
          kind: "style",
          label: "bg-white",
          selector: ".banner",
          property: "background-color",
          value: "rgb(255, 255, 255)",
        },
      ],
      hint: "`.banner { padding: 1rem; font-weight: 700; text-align: center; background-color: white; }`.",
      solution: [
        "<style>",
        "  .banner { padding: 1rem; font-weight: 700; text-align: center;",
        "    background-color: white; }",
        "</style>",
        '<div class="banner">Welcome back</div>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("CSS in practice cheat sheet", [
      [
        "font: inherit",
        "Form controls use the page's font.",
        "input, button { font: inherit; }",
      ],
      [
        "labels",
        "Above the field; never just a placeholder.",
        '<label for="t">Title</label>',
      ],
      [
        ":user-invalid",
        "Errors after typing, in words too.",
        "input:user-invalid { … }",
      ],
      ["accent-color", "Tint checkboxes and radios.", "accent-color: #1d4ed8;"],
      [
        ".button + variant",
        "Shared base, small variants.",
        ".button.button-danger",
      ],
      [
        "order",
        "Base, layout, components, utilities.",
        "@layer base, layout, components;",
      ],
      ["Tailwind spacing", "1 = 0.25rem.", "p-4 → padding: 1rem"],
      ["prefixes", "A condition before the colon.", "hover:, md:, dark:"],
      [
        "@theme",
        "Teach Tailwind your variables.",
        "--color-border: var(--border);",
      ],
      [
        "full class names",
        "So Tailwind's build finds them.",
        '"bg-red-600", not `bg-${c}-600`',
      ],
    ]),
    quickCheck(
      "What does `md:px-6` do in Tailwind?",
      [
        "1.5rem of left and right padding, from 48rem wide up",
        "Medium padding everywhere",
        "6px of padding on phones",
      ],
      0,
      "`md:` is the condition (at least 48rem wide), `px` is left and right padding, and 6 × 0.25rem is 1.5rem.",
    ),
  ),
);
