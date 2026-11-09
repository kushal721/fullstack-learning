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

// Accessible HTML and ARIA in depth: who it's for, the accessibility tree,
// keyboard focus (with a playground), accessible names, icon buttons and
// hidden labels, a step-through of a screen reader on a form, ARIA and its
// first rule, announcing changes, seeing and reading, mistakes, practice
// and a recap.
export const accessibleModule = moduleLesson(
  "accessible-html",
  "Accessible HTML and ARIA",
  50,
  [
    "Explain who accessibility is for, and why good HTML does most of the work.",
    "Describe the role, name and state a screen reader reads for each element.",
    "Make every control reachable and usable with the keyboard alone.",
    "Give every control an accessible name, including icon-only buttons.",
    "Use ARIA only where HTML can't say it: states, relationships and live updates.",
  ],

  part(
    "why",
    "Pages for everyone",
    explain(
      "[[accessibility|Accessibility]] means people can use the page however they use a computer: with a [[screen-reader]] because they can't see the screen, with only a keyboard because a mouse is hard for them, zoomed to 200%, or with captions. That's a lot of people, and everyone has days with a broken arm or bright sunshine on the screen. The good news: plain, meaningful HTML does most of the work.",
    ),
    diagram([
      ["your HTML", "what each thing is"],
      ["the browser", "builds an accessibility tree from it"],
      ["a screen reader", "reads that tree aloud"],
      ["a person", "uses the page"],
    ]),
    keyPoints(
      "Real buttons and links work with the keyboard for free.",
      "Labels, alt text and headings are what people hear.",
      "Try it: use a page with only Tab, Enter and Space.",
    ),
  ),

  part(
    "accessibility-tree",
    "Role, name and state",
    explain(
      "From your HTML, the browser builds an **accessibility tree**: for every element that matters, what it **is** (its role), what it's **called** (its name) and what **state** it's in. A screen reader reads that, not your CSS. Most of it comes free from choosing the right element:",
    ),
    reference("What the browser works out from HTML", [
      ["<button>Save</button>", "role: button · name: Save", "“Save, button”"],
      [
        '<a href="/notes">Notes</a>',
        "role: link · name: Notes",
        "“Notes, link”",
      ],
      [
        '<input type="checkbox" checked>',
        "role: checkbox · state: checked",
        "“checkbox, checked”",
      ],
      ["<h2>Today</h2>", "role: heading · level 2", "“Today, heading level 2”"],
      ['<img alt="A cat">', "role: image · name: A cat", "“A cat, image”"],
      [
        '<div class="btn">Save</div>',
        "role: none · just text",
        "“Save”: not a button",
      ],
    ]),
  ),

  part(
    "keyboard",
    "The keyboard and focus",
    explain(
      "Keyboard users move with Tab (and Shift+Tab back). The element that keys go to has [[keyboard-focus|focus]], shown by an outline. Links, buttons and form fields can all get focus, in the order they appear in the HTML; Enter follows a link and Enter or Space presses a button. A `<div>` can't get focus at all, so a clickable div can't be reached. Try it: click inside the preview, then press Tab a few times.",
    ),
    playground("Tab through the page", [
      "<style>",
      "  :focus-visible { outline: 3px solid orange; }",
      "  .btn { display: inline-block; padding: 4px 8px; border: 1px solid #999; }",
      "</style>",
      '<a href="#">A link</a>',
      '<button type="button">A real button</button>',
      '<div class="btn">A div styled as a button</div>',
      '<input aria-label="Search" placeholder="Search…">',
    ]),
    quickCheck(
      "You press Tab through the preview. Which one is skipped?",
      ["The link", "The div styled as a button", "The search box"],
      1,
      "A `<div>` isn't focusable, so the keyboard can't reach it, however much it looks like a button.",
    ),
  ),

  part(
    "focus-rules",
    "Rules for focus",
    explain(
      'Keep the focus outline: if you don\'t like the default, style `:focus-visible` instead of removing it. Keep the HTML in a sensible order, because Tab follows the HTML, not where CSS places things. `tabindex="0"` adds an element to the Tab order (only for custom widgets); `tabindex="-1"` lets code focus it, for example a dialog\'s heading. Never use a positive `tabindex`: it scrambles the order.',
    ),
    code(
      "html",
      "focus, done right",
      [
        "<style>",
        "  button:focus-visible { outline: 3px solid orange; }",
        "</style>",
        '<h2 tabindex="-1" id="results">Results</h2>',
      ],
      {
        2: "restyled, not removed",
        4: "code can move focus here; Tab skips it",
      },
    ),
  ),

  part(
    "names",
    "A name for everything",
    explain(
      "Every control needs an [[accessible-name]]: what a screen reader calls it. Usually it comes from something you already wrote: a button's text, a field's [[label]], an image's alt. When there's no visible text, ARIA can supply one. Here's where names come from, best first:",
    ),
    reference("Where a name comes from", [
      ["Content", "A button's or link's own text.", "<button>Save</button>"],
      [
        "<label>",
        "Linked to a field by for and id.",
        '<label for="t">Title</label>',
      ],
      ["alt", "An image's description.", '<img alt="Home">'],
      [
        "aria-labelledby",
        "Visible text elsewhere, by its id.",
        'aria-labelledby="heading-id"',
      ],
      ["aria-label", "Text only screen readers hear.", 'aria-label="Close"'],
    ]),
    inTheNotesApp(
      "The Notes App's `Input` component always renders a `<label htmlFor={id}>` next to its field, with the same id on the input. So every field has a name, and clicking the label focuses the field.",
      { symbolId: "component:Input" },
    ),
    quickCheck(
      "A search box has a placeholder “Search…” but no label. What's the problem?",
      [
        "None",
        "Placeholders vanish when typing and aren't a reliable name",
        "Placeholders make the page slow",
      ],
      1,
      "Use a real [[label]] (it can be visually hidden); a placeholder is only a hint.",
    ),
  ),

  part(
    "icon-buttons",
    "Icon buttons and hidden labels",
    explain(
      "A button that shows only an icon has no text, so it has no name, or the wrong one: a screen reader reads the ✕ character as “multiplication sign”. Give it an `aria-label`. When a design has no room for a visible label, a `visually-hidden` class keeps the text in the page for screen readers while hiding it from view. `display: none` would hide it from everyone.",
    ),
    code(
      "html",
      "naming what has no text",
      [
        '<button type="button">✕</button>',
        '<button type="button" aria-label="Close">✕</button>',
        "",
        '<label for="q" class="visually-hidden">Search notes</label>',
        '<input id="q" type="search">',
      ],
      {
        1: "announced as “multiplication sign, button”",
        2: "announced as “Close, button”",
        4: "hidden by CSS, still read aloud",
      },
    ),
  ),

  part(
    "how-a-screen-reader-reads-a-form",
    "How a screen reader reads a form",
    explain(
      "Step through what someone hears when they Tab through this form. Each time, the screen reader reads the name, the role and the state from the accessibility tree:",
    ),
    trace(
      "Tabbing through a form, move by move",
      [
        "<form>",
        '  <label for="title">Title</label>',
        '  <input id="title" required>',
        '  <input type="checkbox" id="star" checked>',
        '  <label for="star">Starred</label>',
        '  <button type="button" aria-label="Close">✕</button>',
        "  <button>Save</button>",
        "</form>",
      ],
      [
        {
          line: 3,
          note: "Tab: the text field. Its name comes from the label linked by `for` and `id`, and `required` is announced as a state.",
          vars: [
            ["focus", "the title field"],
            ["hears", "Title, edit text, required"],
          ],
          output: "Title, edit text, required",
        },
        {
          line: 4,
          note: "Tab: the checkbox. Its label comes after it in the HTML, but `for` still links them.",
          vars: [
            ["focus", "the checkbox"],
            ["hears", "Starred, checkbox, checked"],
          ],
          output: "Starred, checkbox, checked",
        },
        {
          line: 4,
          note: "Space toggles it, and the new state is read straight away.",
          vars: [
            ["focus", "the checkbox"],
            ["hears", "not checked"],
          ],
          output: "not checked",
        },
        {
          line: 6,
          note: "Tab: the icon button. Without `aria-label` it would say “multiplication sign, button”.",
          vars: [
            ["focus", "the close button"],
            ["hears", "Close, button"],
          ],
          output: "Close, button",
        },
        {
          line: 7,
          note: "Tab: the save button, named by its own text. Every stop had a name, a role and a state: nothing left to guess.",
          vars: [
            ["focus", "the save button"],
            ["hears", "Save, button"],
          ],
          output: "Save, button",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "aria",
    "ARIA: when HTML isn't enough",
    explain(
      "[[aria|ARIA]] attributes add to the accessibility tree what HTML alone can't say: that a menu is open, which page link is the current one, which text describes a field. They change only what's **announced**: no behaviour, no looks. Your code must still open the menu.",
    ),
    reference("ARIA you'll actually use", [
      [
        "aria-expanded",
        "Whether what this controls is open.",
        'aria-expanded="false"',
      ],
      [
        "aria-controls",
        "Which element it opens, by id.",
        'aria-controls="menu"',
      ],
      [
        "aria-current",
        "The current page in a set of links.",
        'aria-current="page"',
      ],
      [
        "aria-describedby",
        "Extra help text, by its id.",
        'aria-describedby="pw-hint"',
      ],
      [
        "aria-hidden",
        "Hide decoration from screen readers.",
        '<span aria-hidden="true">★</span>',
      ],
    ]),
    anatomy(
      "A menu button, attribute by attribute",
      [
        "<button",
        '  aria-expanded="false"',
        '  aria-controls="menu">',
        "  Menu</button>",
      ],
      [
        [
          "<button",
          "the role",
          "A real button: focus, keys and the role “button” for free.",
        ],
        [
          'aria-expanded="false"',
          "a state",
          "Says the menu is closed. Your code sets it to true when it opens.",
        ],
        [
          'aria-controls="menu"',
          "a relationship",
          'Which element it opens: the one with id="menu".',
        ],
        ["Menu", "the name", "Its text is what a screen reader calls it."],
      ],
    ),
    quickCheck(
      "What does `aria-expanded` change?",
      [
        "Whether the menu opens",
        "What a screen reader announces",
        "The button's colour",
      ],
      1,
      "[[aria]] adds no behaviour; your code must still open and close the menu.",
    ),
  ),

  part(
    "first-rule",
    "The first rule of ARIA",
    explain(
      'If a real HTML element does the job, use it. A `<div>` with `role="button"` is announced as a button, but it still needs `tabindex`, Enter and Space handling and a name: everything a `<button>` has already. Wrong ARIA is worse than none, because it makes promises the page doesn\'t keep.',
    ),
    code(
      "html",
      "the same button, twice",
      [
        '<div role="button" tabindex="0" onclick="save()">Save</div>',
        '<button type="button" onclick="save()">Save</button>',
      ],
      {
        1: "still no Enter or Space key",
        2: "keyboard, focus and name for free",
      },
    ),
    keyPoints(
      "No ARIA is better than wrong ARIA.",
      "Use ARIA for states (expanded, current, selected) and live updates.",
      "Test with a keyboard and a screen reader.",
    ),
  ),

  part(
    "announcing-changes",
    "Announcing changes",
    explain(
      'When something changes without the page reloading (an error appears, a note is saved) a screen reader user won\'t notice unless it\'s announced. A [[live-region|live region]] does that. `role="alert"` interrupts right away, for errors. `role="status"` waits for a pause, for news like “Saved”. The element should be on the page before its text changes.',
    ),
    inTheNotesApp(
      'Every error message in the Notes App, on `Login`, `Register`, the note form and the dashboard, is a `<p className="form-error" role="alert">`. So when “Wrong email or password” appears, it\'s read out straight away.',
      { symbolId: "component:Login" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A clickable div",
      language: "html",
      wrong: ['<div class="btn" onclick="save()">Save</div>'],
      problem:
        "It can't get focus, Enter and Space do nothing, and a screen reader reads plain text, not a button.",
      right: [
        '<button type="button" class="btn" onclick="save()">Save</button>',
      ],
      why: "A real `<button>` brings focus, keys and its role for free; style it however you like.",
    }),
    mistake({
      title: "Removing the focus outline",
      language: "css",
      wrong: ["*:focus { outline: none; }"],
      problem: "Keyboard users can no longer see where they are on the page.",
      right: [":focus-visible { outline: 3px solid orange; }"],
      why: "Restyle focus with `:focus-visible`; never just remove it.",
    }),
    mistake({
      title: "A placeholder as the only label",
      language: "html",
      wrong: ['<input placeholder="Email">'],
      problem:
        "The hint disappears as soon as someone types, and it isn't a reliable name for screen readers.",
      right: [
        '<label for="email">Email</label>',
        '<input id="email" type="email">',
      ],
      why: "Every field needs a real label; a placeholder can add an example.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Name the icon buttons",
      task: "These buttons show only icons. Give the first the name `Close` and the second the name `Delete note`, with `aria-label`.",
      starter: [
        '<button type="button">✕</button>',
        '<button type="button">🗑</button>',
      ],
      checks: [
        {
          kind: "attr",
          label: "The close button's name",
          selector: "button:first-of-type",
          name: "aria-label",
          value: "Close",
        },
        {
          kind: "attr",
          label: "The delete button's name",
          selector: "button:last-of-type",
          name: "aria-label",
          value: "Delete note",
        },
      ],
      hint: '`<button type="button" aria-label="Close">✕</button>`, and the same for the other.',
      solution: [
        '<button type="button" aria-label="Close">✕</button>',
        '<button type="button" aria-label="Delete note">🗑</button>',
      ],
    }),
    pageYourTurn({
      title: "Label the field",
      task: "The search box has only a placeholder. Give it the id `search` and a `<label>` reading `Search notes`, linked with `for`.",
      starter: ['<input type="search" placeholder="e.g. milk">'],
      checks: [
        {
          kind: "exists",
          label: "The field has the id",
          selector: "input#search",
        },
        {
          kind: "text",
          label: "A linked label",
          selector: 'label[for="search"]',
          text: "Search notes",
        },
      ],
      hint: '`<label for="search">Search notes</label>`, then `id="search"` on the input.',
      solution: [
        '<label for="search">Search notes</label>',
        '<input id="search" type="search" placeholder="e.g. milk">',
      ],
    }),
    pageYourTurn({
      title: "A real menu button",
      task: 'The menu opens from a `<div>`. Make it a `<button type="button">` that says `Menu`, with `aria-expanded="false"` and `aria-controls="menu"`.',
      starter: [
        '<div class="menu-toggle">Menu</div>',
        '<ul id="menu" hidden>',
        "  <li>Settings</li>",
        "</ul>",
      ],
      checks: [
        {
          kind: "text",
          label: "A real button",
          selector: 'button[type="button"]',
          text: "Menu",
        },
        {
          kind: "attr",
          label: "Says it's closed",
          selector: "button",
          name: "aria-expanded",
          value: "false",
        },
        {
          kind: "attr",
          label: "Points at the menu",
          selector: "button",
          name: "aria-controls",
          value: "menu",
        },
        { kind: "missing", label: "No div left", selector: "div.menu-toggle" },
      ],
      hint: '`<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="menu">Menu</button>`',
      solution: [
        '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="menu">Menu</button>',
        '<ul id="menu" hidden>',
        "  <li>Settings</li>",
        "</ul>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Accessibility cheat sheet", [
      [
        "Real elements",
        "button, a, input, label: focus and role free.",
        "<button>Save</button>",
      ],
      ["Role, name, state", "What a screen reader reads.", "“Save, button”"],
      ["Focus", "Tab order follows HTML; keep the outline.", ":focus-visible"],
      ["Names", "Text, label, alt, aria-label.", 'aria-label="Close"'],
      [
        "ARIA states",
        "expanded, current, describedby.",
        'aria-expanded="true"',
      ],
      ["Live regions", "Announce changes.", 'role="alert"'],
      ["First rule", "Use HTML before ARIA.", 'not <div role="button">'],
    ]),
    quickCheck(
      'A `<div role="button">Save</div>` is announced as a button. What is still missing?',
      ["Nothing", "Focus and Enter/Space handling", "A colour"],
      1,
      "ARIA only changes what's announced. A real `<button>` brings focus and keyboard handling with it.",
    ),
  ),
);
