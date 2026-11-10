import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pagePlayground,
  pageYourTurn,
  part,
  playground,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Built-in interactive elements in depth: why use them, the anatomy of
// details/summary, opening, styling and exclusive accordions, dialog basics,
// a step-through of a modal dialog's life, a live confirm dialog with
// method="dialog", popovers with no JavaScript, choosing between them,
// progress, meter and output, the Notes App, mistakes, practice and a recap.
export const interactiveModule = moduleLesson(
  "details-and-dialog",
  "Built-in interactive elements",
  40,
  [
    "Build sections that open and close with `<details>` and `<summary>`, including an accordion.",
    "Open a modal `<dialog>` with `showModal()`, and say what the browser does for focus, Escape and the rest of the page.",
    'Read a dialog\'s answer with `<form method="dialog">` and `returnValue`.',
    "Show a popover with the `popover` attribute and `popovertarget`, with no JavaScript.",
    "Choose between details, dialog, popover and a custom widget, and use `<progress>`, `<meter>` and `<output>`.",
  ],

  part(
    "why",
    "Behaviour that comes with the element",
    explain(
      "Opening sections, pop-up boxes and menus are on almost every site. Built by hand from `<div>`s, each needs JavaScript for clicks, keys, focus and screen readers, and most get something wrong. HTML has [[details-dialog|elements that do it for you]]: the browser handles the keyboard, focus and announcements, the same in every page.",
    ),
    diagram([
      ["<details>", "a section that opens and closes"],
      ["<dialog>", "a box on top, modal or not"],
      ["popover", "a light layer that closes when you click away"],
      ["you write", "the content; the browser does the behaviour"],
    ]),
    keyPoints(
      "Built-in widgets work with the keyboard and screen readers already.",
      "They need little or no JavaScript.",
      "Reach for them before building a widget from divs.",
    ),
  ),

  part(
    "details-anatomy",
    "Anatomy of details",
    explain(
      "`<details>` is a section that opens and closes. Its first child, `<summary>`, is the always-visible label you click (or press Enter or Space on). Everything else is hidden until it's open. Details that share a `name` form an **exclusive accordion**: opening one closes the others.",
    ),
    anatomy(
      "One question in an FAQ",
      [
        '<details name="faq" open>',
        "  <summary>What is HTML?</summary>",
        "  <p>The language web pages are written in.</p>",
        "</details>",
      ],
      [
        ["<details", "the widget", "Holds the label and the hidden content."],
        [
          'name="faq"',
          "the group",
          "Details with the same name: only one is open at a time.",
        ],
        ["open", "its state", "Present while it's open; add it to start open."],
        [
          "<summary>",
          "the label",
          "Always shown; a button that toggles it, focusable with Tab.",
        ],
        [
          "<p>",
          "the content",
          "Hidden while closed; can be anything, even forms.",
        ],
      ],
    ),
    playground("An accordion: open one, the other closes", [
      '<details name="faq" open>',
      "  <summary>What is HTML?</summary>",
      "  <p>The language web pages are written in.</p>",
      "</details>",
      '<details name="faq">',
      "  <summary>What is CSS?</summary>",
      "  <p>The language that says how the page looks.</p>",
      "</details>",
      '<details name="faq">',
      "  <summary>What is JavaScript?</summary>",
      "  <p>The language that makes the page do things.</p>",
      "</details>",
    ]),
  ),

  part(
    "details-more",
    "Styling and listening to details",
    explain(
      "The `open` attribute is the state, so CSS can use `details[open]` and scripts can read or set `details.open`. The triangle is `summary::marker`, which you can restyle or hide. A `toggle` event fires after it opens or closes. And the browser's find-in-page opens a closed details when the text it's looking for is inside.",
    ),
    reference("details, more closely", [
      [
        "details[open]",
        "Style the open state.",
        "details[open] summary { font-weight: bold; }",
      ],
      [
        "summary::marker",
        "The triangle; change or hide it.",
        "summary::marker { color: seagreen; }",
      ],
      ["details.open", "Read or set it from a script.", "faq.open = true;"],
      [
        "toggle event",
        "Fires after it opens or closes.",
        'faq.addEventListener("toggle", …)',
      ],
      ["name", "Same name: an exclusive accordion.", '<details name="faq">'],
    ]),
    quickCheck(
      "Why use `<details>` for an FAQ instead of `<div>`s and a click handler?",
      [
        "It loads faster",
        "It opens with a click, Enter or Space, is announced as expandable, and needs no JavaScript",
        "Search engines can't read divs",
      ],
      1,
      "The browser gives `<summary>` focus, keys and its expanded or collapsed state for free.",
    ),
  ),

  part(
    "dialog",
    "dialog: a box on top",
    explain(
      "`<dialog>` is a box shown above the page. `showModal()` opens it as a **modal**: it goes on the top layer with a `::backdrop` behind it, the rest of the page becomes inert (no clicks, no Tab), focus moves inside, and Escape closes it. `show()` opens it without any of that. `close()` closes it, and focus goes back where it was.",
    ),
    code(
      "html",
      "a modal dialog",
      [
        '<dialog id="help">',
        "  <h2>Shortcuts</h2>",
        "  <p>Press N for a new note.</p>",
        '  <button type="button" onclick="help.close()">Close</button>',
        "</dialog>",
        '<button type="button" onclick="help.showModal()">Help</button>',
      ],
      {
        1: "hidden until it's opened",
        4: "close() hides it; focus goes back to the Help button",
        6: "showModal(): backdrop, inert page, Escape closes it",
      },
    ),
  ),

  part(
    "dialog-life",
    "A modal dialog, move by move",
    explain(
      "Step through a confirm dialog being opened, answered and closed. Watch where focus goes and what the rest of the page can do.",
    ),
    trace(
      "Opening and answering a dialog",
      [
        '<button id="delete">Delete note</button>',
        '<dialog id="confirm">',
        '  <form method="dialog">',
        "    <p>Delete this note?</p>",
        '    <button value="cancel">Cancel</button>',
        '    <button value="delete">Delete</button>',
        "  </form>",
        "</dialog>",
      ],
      [
        {
          line: 1,
          note: "The user clicks Delete note, and a script calls `confirm.showModal()`.",
          vars: [
            ["dialog", "closed"],
            ["focus", "Delete note button"],
          ],
        },
        {
          line: 2,
          note: "The dialog opens on the top layer, with a backdrop behind it. Everything outside it is now inert: it can't be clicked or reached with Tab.",
          vars: [
            ["dialog", "open, modal"],
            ["page", "inert"],
          ],
        },
        {
          line: 5,
          note: "Focus moves into the dialog, to the first thing that can take it: the Cancel button. A screen reader announces the dialog and its text.",
          vars: [
            ["dialog", "open, modal"],
            ["focus", "Cancel"],
          ],
        },
        {
          line: 6,
          note: 'The user Tabs to Delete and presses Enter. It\'s a submit button in a `method="dialog"` form, so instead of sending a request, the form closes the dialog.',
          vars: [
            ["dialog", "closing"],
            ["returnValue", '"delete"'],
          ],
        },
        {
          line: 2,
          note: "The dialog closes, its `returnValue` is the button's value, and a `close` event fires. The page is usable again and focus goes back to Delete note.",
          vars: [
            ["dialog", "closed"],
            ["returnValue", '"delete"'],
            ["focus", "Delete note button"],
          ],
          output: 'close event: returnValue = "delete"',
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "confirm",
    "Getting an answer back",
    explain(
      'A `<form method="dialog">` inside a dialog closes it when submitted, and the dialog\'s `returnValue` becomes the `value` of the button that was pressed. Listen for the `close` event to act on the answer. Escape closes it too, without changing `returnValue`, so reset it before opening. Try all three: Cancel, Delete and Escape.',
    ),
    pagePlayground("A confirm dialog that reports its answer", [
      '<button type="button" id="open">Delete note</button>',
      '<p id="answer" role="status"></p>',
      '<dialog id="confirm">',
      '  <form method="dialog">',
      "    <p>Delete this note? This can't be undone.</p>",
      '    <button value="cancel">Cancel</button>',
      '    <button value="delete">Delete</button>',
      "  </form>",
      "</dialog>",
      "<script>",
      '  const dialog = document.querySelector("#confirm");',
      '  document.querySelector("#open").addEventListener("click", () => {',
      '    dialog.returnValue = "";',
      "    dialog.showModal();",
      "  });",
      '  dialog.addEventListener("close", () => {',
      '    document.querySelector("#answer").textContent =',
      '      "The answer was: " + (dialog.returnValue || "(Escape)");',
      "  });",
      "</script>",
    ]),
  ),

  part(
    "popover",
    "Popovers with no JavaScript",
    explain(
      "Add the `popover` attribute to any element and it's hidden until a button with a matching `popovertarget` shows it. It appears on the top layer, and with the default `popover` (auto) it closes when you click outside or press Escape: **light dismiss**. Unlike a modal dialog, the page stays usable.",
    ),
    playground("Click the button, then click anywhere else", [
      '<button type="button" popovertarget="tips">Tips</button>',
      "",
      '<div id="tips" popover>',
      "  <p>Press N to start a new note.</p>",
      '  <button type="button" popovertarget="tips" popovertargetaction="hide">Got it</button>',
      "</div>",
    ]),
    keyPoints(
      "`popover` hides an element until it's shown.",
      "`popovertarget` on a button opens and closes it, with no script.",
      "Auto popovers close on Escape or a click outside.",
      "The page stays usable: a popover isn't modal.",
    ),
  ),

  part(
    "choosing",
    "Which one to use",
    explain(
      "They overlap, so pick by what the user should be able to do while it's open. Content that's part of the page and can stay open: details. A question the user must answer first: a modal dialog. A small extra layer they can ignore: a popover. Only build your own when none fits, and then copy their keyboard behaviour.",
    ),
    reference("Choosing", [
      [
        "FAQ, more options",
        "Part of the page; opens in place.",
        "<details><summary>…</summary>…</details>",
      ],
      [
        "confirm, sign in",
        "Must be answered; blocks the page.",
        "dialog.showModal()",
      ],
      [
        "tips, menus, pickers",
        "On top, but the page stays usable.",
        '<div popover id="menu">',
      ],
      [
        "tabs, combobox",
        "No built-in yet: build it with ARIA.",
        'role="tablist"',
      ],
    ]),
  ),

  part(
    "small-widgets",
    "progress, meter and output",
    explain(
      "Three small elements show values with meaning a screen reader understands. `<progress>` is how far a task has got (no `value` means “working on it”). `<meter>` is a measurement in a known range, like storage used. `<output>` is the result of a calculation, and is announced when it changes.",
    ),
    pagePlayground("Three ways to show a value", [
      '<p><label>Uploading <progress value="70" max="100">70%</progress></label></p>',
      "<p><label>Saving <progress></progress></label></p>",
      '<p><label>Storage used <meter value="0.8" low="0.5" high="0.75" max="1">80%</meter></label></p>',
      '<form id="sum">',
      '  <input id="a" type="number" value="2" aria-label="First number"> +',
      '  <input id="b" type="number" value="3" aria-label="Second number"> =',
      '  <output id="total" for="a b">5</output>',
      "</form>",
      "<script>",
      '  document.querySelector("#sum").addEventListener("input", () => {',
      '    const a = Number(document.querySelector("#a").value);',
      '    const b = Number(document.querySelector("#b").value);',
      '    document.querySelector("#total").value = a + b;',
      "  });",
      "</script>",
    ]),
  ),

  part(
    "where-used",
    "Where they'd fit in the Notes App",
    explain(
      'The Notes App\'s note cards have a Delete button that deletes at once, with no “are you sure?”. A `<dialog>` with a `method="dialog"` form is the built-in way to add that step: the browser handles the focus, the Escape key and the inert page, and React would only call `showModal()` and read `returnValue`.',
    ),
    inTheNotesApp(
      '`NoteCard`\'s Delete button calls `onDelete(note.id)` straight away. A confirm step would open a `<dialog>` first and only call `onDelete` when `returnValue` is `"delete"`.',
      { symbolId: "component:NoteCard" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A modal built from a div",
      language: "html",
      wrong: [
        '<div class="modal" role="dialog">',
        "  <p>Delete this note?</p>",
        "</div>",
      ],
      problem:
        "Focus stays behind it, Tab wanders into the page underneath, and Escape does nothing unless you code it all.",
      right: [
        '<dialog id="confirm">',
        "  <p>Delete this note?</p>",
        "</dialog>",
        "<!-- opened with confirm.showModal() -->",
      ],
      why: "`showModal()` moves focus, makes the page inert and closes on Escape for you.",
    }),
    mistake({
      title: "show() when you meant showModal()",
      language: "js",
      wrong: ['document.querySelector("#confirm").show();'],
      problem:
        "It opens in the page's flow: no backdrop, the page stays clickable and Escape doesn't close it.",
      right: ['document.querySelector("#confirm").showModal();'],
      why: "Use `show()` only for a box that shouldn't block the page; questions need `showModal()`.",
    }),
    mistake({
      title: "An accordion made of divs",
      language: "html",
      wrong: [
        '<div class="question" onclick="toggle(this)">What is HTML?</div>',
        '<div class="answer" hidden>The language of web pages.</div>',
      ],
      problem:
        "The question can't be reached with Tab or opened with Enter, and nothing says it can expand.",
      right: [
        "<details>",
        "  <summary>What is HTML?</summary>",
        "  <p>The language of web pages.</p>",
        "</details>",
      ],
      why: "`<summary>` is focusable, works with Enter and Space, and announces whether it's open.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "An FAQ accordion",
      task: 'Turn both questions into `<details>` with a `<summary>`, give them the same `name="faq"` so only one opens at a time, and make the first one start `open`.',
      starter: [
        "<h3>What is HTML?</h3>",
        "<p>The language web pages are written in.</p>",
        "<h3>What is CSS?</h3>",
        "<p>The language that says how the page looks.</p>",
      ],
      checks: [
        {
          kind: "count",
          label: "Two questions with a summary",
          selector: "details > summary",
          count: 2,
        },
        {
          kind: "count",
          label: 'Both in the "faq" group',
          selector: 'details[name="faq"]',
          count: 2,
        },
        {
          kind: "text",
          label: "The first starts open",
          selector: "details[open] > summary",
          text: "What is HTML?",
        },
      ],
      hint: 'Wrap each pair in `<details name="faq">`, turn each `<h3>` into a `<summary>`, and add `open` to the first `<details>`.',
      solution: [
        '<details name="faq" open>',
        "  <summary>What is HTML?</summary>",
        "  <p>The language web pages are written in.</p>",
        "</details>",
        '<details name="faq">',
        "  <summary>What is CSS?</summary>",
        "  <p>The language that says how the page looks.</p>",
        "</details>",
      ],
    }),
    pageYourTurn({
      title: "A real confirm dialog",
      task: 'Replace the div with a `<dialog id="confirm">` holding a `<form method="dialog">`, with two buttons whose values are "cancel" and "delete".',
      starter: [
        '<div class="modal">',
        "  <p>Delete this note?</p>",
        "  <button>Cancel</button>",
        "  <button>Delete</button>",
        "</div>",
      ],
      checks: [
        {
          kind: "exists",
          label: 'A dialog with a method="dialog" form',
          selector: 'dialog#confirm form[method="dialog"]',
        },
        {
          kind: "text",
          label: "A Cancel button with the value cancel",
          selector: 'dialog button[value="cancel"]',
          text: "Cancel",
        },
        {
          kind: "text",
          label: "A Delete button with the value delete",
          selector: 'dialog button[value="delete"]',
          text: "Delete",
        },
        { kind: "missing", label: "No div modal left", selector: ".modal" },
      ],
      hint: 'Use `<dialog id="confirm"><form method="dialog">…</form></dialog>` and give the buttons `value="cancel"` and `value="delete"`.',
      solution: [
        '<dialog id="confirm">',
        '  <form method="dialog">',
        "    <p>Delete this note?</p>",
        '    <button value="cancel">Cancel</button>',
        '    <button value="delete">Delete</button>',
        "  </form>",
        "</dialog>",
      ],
    }),
    pageYourTurn({
      title: "A popover with no script",
      task: 'Make the tips box a popover (`popover` attribute) and make the button show it with `popovertarget="tips"`.',
      starter: [
        '<button type="button">Tips</button>',
        '<div id="tips">',
        "  <p>Press N to start a new note.</p>",
        "</div>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The tips box is a popover",
          selector: "#tips",
          name: "popover",
        },
        {
          kind: "attr",
          label: "The button opens it",
          selector: "button",
          name: "popovertarget",
          value: "tips",
        },
      ],
      hint: 'Add `popover` to the `<div id="tips">` and `popovertarget="tips"` to the button.',
      solution: [
        '<button type="button" popovertarget="tips">Tips</button>',
        '<div id="tips" popover>',
        "  <p>Press N to start a new note.</p>",
        "</div>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Built-in widgets cheat sheet", [
      [
        "<details>",
        "Opens and closes; summary is the label.",
        "<details><summary>…</summary>…</details>",
      ],
      ["open", "Starts open; the current state.", "<details open>"],
      ["name", "Only one open in the group.", '<details name="faq">'],
      [
        "showModal()",
        "Modal: backdrop, inert page, Escape.",
        "dialog.showModal()",
      ],
      ["close()", "Closes; focus goes back.", "dialog.close()"],
      [
        'method="dialog"',
        "Submitting closes the dialog.",
        '<form method="dialog">',
      ],
      ["returnValue", "The pressed button's value.", "dialog.returnValue"],
      [
        "popover",
        "Hidden until shown; light dismiss.",
        '<div popover id="tips">',
      ],
      [
        "popovertarget",
        "A button that toggles it.",
        '<button popovertarget="tips">',
      ],
      [
        "<progress>, <meter>, <output>",
        "A task's progress, a measurement, a result.",
        '<progress value="70" max="100">',
      ],
    ]),
    quickCheck(
      "A sign-in box must be answered before the user can do anything else. Which is right?",
      [
        "A popover",
        "A `<dialog>` opened with `showModal()`",
        "A `<details>` that starts open",
      ],
      1,
      "A modal dialog makes the rest of the page inert and moves focus inside. A popover leaves the page usable.",
    ),
  ),
);
