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

// States and transitions: hover, active and touch screens, focus you can
// see, form states, position in a list, pseudo-elements, transitions, the
// shorthand, easing, a hover frame by frame, what to animate, the Notes
// App's states, mistakes, practice and a recap.
export const statesAndTransitionsModule = moduleLesson(
  "states-and-transitions",
  "States and transitions",
  40,
  [
    "Style hover, active, focus and form states with pseudo-classes.",
    "Keep keyboard focus visible with `:focus-visible` and `outline`.",
    "Select by position with `:first-child` and `:nth-child()`, and add content with `::before`.",
    "Animate a change with `transition`: property, duration, easing and delay.",
    "Pick properties that animate smoothly, and design for touch screens too.",
  ],

  part(
    "hover-active",
    "Hover, active and touch screens",
    explain(
      "A [[pseudo-class]] is a part of a selector, after a colon, that matches an element **while** it's in some state. `:hover` matches while the pointer is over it and `:active` while it's being pressed. The browser adds and removes them as things happen, so you need no extra classes or JavaScript.",
    ),
    playground("Hover, then press and hold", [
      "<style>",
      "  button { padding: 8px 16px; border: 0; border-radius: 8px;",
      "    background: #1d4ed8; color: white; font: inherit; }",
      "  button:hover { background: #1e3a8a; }",
      "  button:active { background: #172554; }",
      "  a:hover { text-decoration-thickness: 3px; }",
      "</style>",
      "<button>Save</button>",
      '<p>A <a href="#">link with a thicker underline</a> on hover.</p>',
    ]),
    quickCheck(
      "A button should look pressed while the mouse button is held down on it. Which pseudo-class?",
      ["`:hover`", "`:active`", "`:focus`"],
      1,
      "`:active` matches while it's being pressed. `:hover` is just the pointer resting on it, and `:focus` means it will receive the keyboard.",
    ),
    explain(
      "Phones have no pointer that rests over things, so `:hover` never happens or sticks after a tap. Anything people need, like a delete button, must work without hover. `@media (hover: hover)` keeps hover effects for devices with a mouse or trackpad, and `:focus-within` lets keyboard users in too.",
    ),
    code(
      "css",
      "hover only where there is a pointer",
      [
        ".note-actions { opacity: 1; }",
        "",
        "@media (hover: hover) {",
        "  .note-actions { opacity: 0; }",
        "  .note:hover .note-actions,",
        "  .note:focus-within .note-actions { opacity: 1; }",
        "}",
      ],
      {
        1: "phones: the buttons are always visible",
        3: "only devices whose main pointer can hover",
        6: "and keyboard users reach them with Tab",
      },
    ),
  ),

  part(
    "focus",
    "Focus you can see",
    explain(
      "People who use a keyboard press Tab to move between links, buttons and fields, and the **focus ring** shows where they are. `:focus-visible` matches when the browser decides a ring should show: for buttons and links only after a key press, and for text fields always. Style it with `outline`, which takes no space; `outline-offset` moves it out from the edge.",
    ),
    playground("Press Tab to move through these", [
      "<style>",
      "  button, input { font: inherit; padding: 6px 10px; margin: 4px; }",
      "  :focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }",
      "  .field:focus-within { background: #eef3ff; }",
      "</style>",
      "<button>Save</button> <button>Cancel</button>",
      '<div class="field"><label>Title <input></label></div>',
    ]),
    keyPoints(
      "Never remove the outline without putting a visible style back.",
      "`:focus-visible` skips the ring when a button is clicked.",
      "`:focus-within` matches a parent while something inside has focus.",
    ),
  ),

  part(
    "form-states",
    "Form states",
    explain(
      "Fields and buttons have states of their own. `:disabled` matches a control that can't be used, `:checked` a ticked checkbox or radio, and `:invalid` a field that breaks its own rules, like a `required` field that's empty. `:invalid` matches before anyone has typed, so `:user-invalid` waits until the person has changed the field.",
    ),
    reference("Form pseudo-classes", [
      [
        ":disabled",
        "Can't be used right now.",
        "button:disabled { opacity: 0.5; }",
      ],
      [
        ":checked",
        "A ticked checkbox or radio.",
        "input:checked + label { font-weight: 700; }",
      ],
      [
        ":invalid",
        "Breaks its rules (even before typing).",
        "input:invalid { border-color: #b42318; }",
      ],
      [
        ":user-invalid",
        "Invalid after the person has changed it.",
        "input:user-invalid { border-color: #b42318; }",
      ],
      [
        ":required",
        "Has the required attribute.",
        "input:required { border-left-width: 3px; }",
      ],
      [
        ":placeholder-shown",
        "Empty, showing its placeholder.",
        "input:placeholder-shown { font-style: italic; }",
      ],
    ]),
    playground("Tick it, and type an email", [
      "<style>",
      "  input:checked + label { text-decoration: line-through; color: #59636e; }",
      "  input[type=email]:user-invalid { outline: 2px solid #b42318; }",
      "  button:disabled { opacity: 0.5; cursor: not-allowed; }",
      "</style>",
      '<input type="checkbox" id="milk"><label for="milk">Buy milk</label>',
      '<p><input type="email" placeholder="you@example.com"></p>',
      "<button disabled>Save</button>",
    ]),
    quickCheck(
      "An empty `required` field has a red border the moment the page opens, before anyone has typed. Which selector fixes that?",
      ["`input:invalid`", "`input:user-invalid`", "`input:required`"],
      1,
      "`:invalid` matches straight away. `:user-invalid` only matches once the person has interacted with the field.",
    ),
  ),

  part(
    "structural",
    "Position in a list",
    explain(
      "Some pseudo-classes match by **position** among siblings. `:first-child` and `:last-child` are the ends; `:nth-child(odd)` stripes every other row. `:nth-child(3n + 1)` reads “every third, starting at the first”: the browser tries n = 0, 1, 2… and matches positions 1, 4, 7. Positions count from 1.",
    ),
    anatomy(
      "Every third item, from the first",
      ["li:nth-child(3n + 1) { }"],
      [
        ["li", "element", "Only list items are matched."],
        [
          ":nth-child(",
          "position",
          "Counts the element's place among all its siblings, from 1.",
        ],
        ["3n", "step", "Every third: n goes 0, 1, 2, 3…"],
        ["+ 1", "start", "Offset: 3×0+1 = 1, then 4, 7, 10."],
      ],
    ),
    playground("Ends, stripes and every third", [
      "<style>",
      "  li { padding: 4px 8px; }",
      "  li:first-child { font-weight: 700; }",
      "  li:last-child { color: #b42318; }",
      "  li:nth-child(odd) { background: #eef3ff; }",
      "  li:nth-child(3n + 1) { border-left: 4px solid #1d4ed8; }",
      "</style>",
      "<ul>",
      "  <li>1</li><li>2</li><li>3</li><li>4</li>",
      "  <li>5</li><li>6</li><li>7</li><li>8</li>",
      "</ul>",
    ]),
    quickCheck(
      "Which items does `li:nth-child(2n)` match?",
      ["1, 3, 5…", "2, 4, 6…", "Only the second"],
      1,
      "2n is 0, 2, 4, 6… and there's no item 0, so it matches the even items, the same as `:nth-child(even)`.",
    ),
  ),

  part(
    "pseudo-elements",
    "::before, ::after and friends",
    explain(
      'A **pseudo-element**, with two colons, styles a part of an element, or adds one. `::before` and `::after` insert a box at the start or end of the element\'s content, but only if you give them a `content` value, even an empty `""`. Use them for decoration; anything people must read belongs in the HTML, where screen readers and search engines find it.',
    ),
    reference("Pseudo-elements", [
      [
        "::before / ::after",
        "A box before or after the content.",
        '.done::before { content: "✓ "; }',
      ],
      [
        "::placeholder",
        "A field's placeholder text.",
        "input::placeholder { color: #59636e; }",
      ],
      [
        "::marker",
        "A list item's bullet or number.",
        "li::marker { color: #1d4ed8; }",
      ],
      [
        "::selection",
        "Text the person has selected.",
        "::selection { background: gold; }",
      ],
      [
        "::first-line",
        "The first line of a paragraph.",
        "p::first-line { font-weight: 600; }",
      ],
    ]),
    playground("Ticks, bullets and a quote mark", [
      "<style>",
      '  .done::before { content: "✓ "; color: #16a34a; }',
      "  li::marker { color: #1d4ed8; }",
      "  blockquote { position: relative; padding-left: 28px; font-style: italic; }",
      '  blockquote::before { content: "“"; position: absolute; left: 0; top: -12px;',
      "    font-size: 3rem; color: #93c5fd; }",
      "</style>",
      '<ul><li class="done">Milk</li><li>Bread</li></ul>',
      "<blockquote>Select some of this text, too.</blockquote>",
    ]),
    quickCheck(
      "`.card::before { width: 20px; height: 20px; background: gold; }` shows nothing. Why?",
      [
        "It has no `content`",
        "`::before` only works on links",
        "It needs `:hover`",
      ],
      0,
      'Without a `content` value the pseudo-element isn\'t created at all. Add `content: ""` (and `display: block` or `inline-block` so it takes the size).',
    ),
  ),

  part(
    "transitions",
    "Transitions: smooth changes",
    explain(
      "When a state changes a property, the new value normally appears instantly. A [[transition]] makes the browser animate from the old value to the new one over a short time. Put it on the element's **normal** rule, not in `:hover`: then both the change in and the change back are smooth.",
    ),
    playground("Instant versus smooth", [
      "<style>",
      "  button { padding: 8px 16px; margin: 4px; border: 0; border-radius: 8px;",
      "    background: #1d4ed8; color: white; font: inherit; }",
      "  button:hover { background: #b42318; }",
      "  .smooth { transition: background-color 300ms ease; }",
      "</style>",
      "<button>Instant</button>",
      '<button class="smooth">Smooth</button>',
    ]),
    quickCheck(
      "`transition` is only in `button:hover`. What happens?",
      [
        "It's smooth both ways",
        "It's smooth on the way in, instant on the way back",
        "Nothing is smooth",
      ],
      1,
      "Leaving hover drops the `:hover` rule, and its `transition` with it, so the change back is instant. Put the transition on `button` itself.",
    ),
  ),

  part(
    "shorthand",
    "The transition shorthand",
    explain(
      "`transition` takes up to four values: **which** property, **how long**, **how** it speeds up and slows down, and an optional **delay**. The first time value is the duration and the second the delay. Separate several transitions with commas, each with its own timing.",
    ),
    anatomy(
      "One transition",
      ["transition:", "  background-color", "  200ms ease-out 50ms;"],
      [
        [
          "background-color",
          "property",
          "Which property animates. Name it; avoid `all`.",
        ],
        [
          "200ms",
          "duration",
          "How long: 150–300ms feels quick but visible. `0.2s` is the same.",
        ],
        ["ease-out", "timing function", "Starts fast and slows into place."],
        [
          "50ms",
          "delay",
          "Optional: wait before starting. Good for menus that shouldn't flicker.",
        ],
      ],
    ),
    reference("Transition properties", [
      [
        "transition-property",
        "What animates; comma list.",
        "transition-property: opacity, transform;",
      ],
      [
        "transition-duration",
        "How long, in s or ms.",
        "transition-duration: 200ms;",
      ],
      [
        "transition-timing-function",
        "The easing curve.",
        "transition-timing-function: ease-out;",
      ],
      ["transition-delay", "Wait before starting.", "transition-delay: 50ms;"],
      [
        "several",
        "Comma-separated, each its own timing.",
        "transition: opacity 200ms, transform 300ms ease-out;",
      ],
    ]),
  ),

  part(
    "easing",
    "Easing: how it moves",
    explain(
      "A [[easing|timing function]] shapes the change. `linear` is the same speed throughout and looks mechanical. `ease` (the default) speeds up then slows down. `ease-out` starts fast and settles, good for things arriving or responding to a click; `ease-in` starts slow, good for things leaving. `cubic-bezier()` draws your own curve.",
    ),
    playground("Hover the track: same time, different curves", [
      "<style>",
      "  .track { padding: 6px; border: 1px solid #d0d7de; font: 0.8rem system-ui; }",
      "  .dot { width: 70px; margin: 4px 0; padding: 4px; background: #1d4ed8; color: white;",
      "    transition: transform 1s; }",
      "  .track:hover .dot { transform: translateX(200px); }",
      "  .linear { transition-timing-function: linear; }",
      "  .ease-in { transition-timing-function: ease-in; }",
      "  .ease-out { transition-timing-function: ease-out; }",
      "</style>",
      '<div class="track">',
      '  <div class="dot linear">linear</div>',
      '  <div class="dot ease-in">ease-in</div>',
      '  <div class="dot ease-out">ease-out</div>',
      "</div>",
    ]),
    quickCheck(
      "A dropdown should appear quickly when clicked, settling gently into place. Which easing?",
      ["`linear`", "`ease-in`", "`ease-out`"],
      2,
      "`ease-out` moves fastest at the start, so the response feels instant, and slows as it arrives. `ease-in` would feel sluggish to start.",
    ),
  ),

  part(
    "frame-by-frame",
    "A hover, frame by frame",
    explain(
      "Behind a transition, the browser works out an in-between value for every frame it draws. Step through a card that fades and lifts on hover, with `linear` timing so the numbers are easy, then see what happens when the pointer leaves halfway:",
    ),
    trace(
      "Fading and lifting a card",
      [
        "<style>",
        "  .card {",
        "    opacity: 1;",
        "    transform: translateY(0);",
        "    transition: opacity 200ms linear,",
        "                transform 200ms linear;",
        "  }",
        "  .card:hover {",
        "    opacity: 0.5;",
        "    transform: translateY(-4px);",
        "  }",
        "</style>",
        '<div class="card">Buy milk</div>',
      ],
      [
        {
          line: 3,
          note: "No hover yet: the card is fully opaque and in its place.",
          vars: [
            ["time", "—"],
            ["opacity", "1"],
            ["translateY", "0px"],
          ],
        },
        {
          line: 8,
          note: "The pointer arrives. `:hover` now matches, so the targets are 0.5 and -4px. The transition on `.card` says: take 200ms to get there.",
          vars: [
            ["time", "0ms"],
            ["opacity", "1 → 0.5"],
            ["translateY", "0px → -4px"],
          ],
        },
        {
          line: 5,
          note: "At 100ms it's halfway: with `linear`, half the time means half the change.",
          vars: [
            ["time", "100ms"],
            ["opacity", "0.75"],
            ["translateY", "-2px"],
          ],
        },
        {
          line: 9,
          note: "At 200ms it has arrived, and stays there while the pointer does.",
          vars: [
            ["time", "200ms"],
            ["opacity", "0.5"],
            ["translateY", "-4px"],
          ],
        },
        {
          line: 3,
          note: "Had the pointer left at 100ms, the card would turn back from where it was, 0.75 and -2px, not jump to the end first. Going back only half the way, it also takes only about half the time.",
          vars: [
            ["time", "left at 100ms"],
            ["opacity", "0.75 → 1"],
            ["translateY", "-2px → 0px"],
          ],
          output: "0ms: 1 · 100ms: 0.75 · 200ms: 0.5",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "what-to-animate",
    "What to animate",
    explain(
      "Not every property animates well. `opacity` and `transform` are cheap: the browser just redraws the same pixels, so they stay smooth even on slow phones. Changing `width`, `height`, `margin` or `top` makes it lay out the page again on every frame, which can stutter. Some values can't animate at all, such as `display` and `height: auto`.",
    ),
    keyPoints(
      "Smooth: `opacity`, `transform`, colours.",
      "Can stutter: `width`, `height`, `margin`, `top`, `left`.",
      "Can't animate: `display`, `height: auto`, `font-family`.",
      "To move something, `transform` it (more in Advanced).",
      "Some people turn motion off: respect [[reduced-motion]].",
    ),
    quickCheck(
      "A card should rise 4px on hover. Which is smoothest?",
      [
        "`margin-top: -4px`",
        "`top: -4px` with `position: relative`",
        "`transform: translateY(-4px)`",
      ],
      2,
      "`transform` doesn't affect layout, so the browser can animate it without working out the page again on every frame.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's states",
    explain(
      "The Notes App styles two states, and both are about **feedback**. While a note is saving, the form disables its button, and `:disabled` fades it and changes the cursor. When a keyboard user reaches a button, `:focus-visible` draws a ring in the app's blue. It has no transitions: every change is instant.",
    ),
    code(
      "css",
      "states in the Notes App's index.css",
      [
        ".button:disabled {",
        "  opacity: 0.6;",
        "  cursor: not-allowed;",
        "}",
        "",
        ".button:focus-visible {",
        "  outline: 2px solid var(--color-primary);",
        "  outline-offset: 2px;",
        "}",
      ],
      {
        1: "while saving, NoteForm sets disabled on the button",
        3: "the pointer shows it can't be clicked",
        6: "keyboard focus only, not mouse clicks",
        8: "a 2px gap so the ring doesn't touch the button",
      },
    ),
    inTheNotesApp(
      '`NoteForm` renders `<Button type="submit" disabled={isSaving}>`, so the CSS state follows the app\'s own state with no extra class.',
      { fileId: "frontend/src/index.css" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Removing the focus ring",
      language: "css",
      wrong: ["button:focus { outline: none; }"],
      problem:
        "Keyboard users can no longer see which button they're on, so they can't use the page.",
      right: [
        "button:focus-visible {",
        "  outline: 2px solid #1d4ed8;",
        "  outline-offset: 2px;",
        "}",
      ],
      why: "`:focus-visible` shows a ring for keyboard focus and hides it for mouse clicks, which is usually what people were trying to fix.",
    }),
    mistake({
      title: "transition: all",
      language: "css",
      wrong: [".card { transition: all 300ms; }"],
      problem:
        "Every property that ever changes animates, including ones you didn't mean to, like `width` when the window resizes.",
      right: [".card { transition: transform 300ms, box-shadow 300ms; }"],
      why: "Name the properties you mean to animate; it's clearer and cheaper.",
    }),
    mistake({
      title: "Information only on hover",
      language: "css",
      wrong: [
        ".delete { display: none; }",
        ".note:hover .delete { display: block; }",
      ],
      problem:
        "On a phone there's no hover, so the delete button can never be reached; keyboard users can't reach it either.",
      right: [
        "@media (hover: hover) {",
        "  .delete { opacity: 0; }",
        "  .note:is(:hover, :focus-within) .delete { opacity: 1; }",
        "}",
      ],
      why: "It's always visible on touch screens, and with `opacity` it can still be reached with Tab on a computer.",
    }),
    mistake({
      title: "A ::before with no content",
      language: "css",
      wrong: [".new::before { background: crimson; width: 8px; height: 8px; }"],
      problem:
        "Nothing appears: a pseudo-element without `content` isn't created.",
      right: [
        ".new::before {",
        '  content: "";',
        "  display: inline-block; width: 8px; height: 8px; background: crimson;",
        "}",
      ],
      why: '`content: ""` creates an empty box; `inline-block` lets it take the size.',
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "First, and every other",
      task: "Make the first `li` bold (`font-weight: 700`), and give every **even** item the background `#eef3ff`, using pseudo-classes, no extra classes.",
      starter: [
        "<style>",
        "</style>",
        "<ul>",
        "  <li>Shopping</li><li>Milk</li><li>Bread</li><li>Eggs</li>",
        "</ul>",
      ],
      checks: [
        {
          kind: "style",
          label: "The first item is bold",
          selector: "li:nth-child(1)",
          property: "font-weight",
          value: "700",
        },
        {
          kind: "style",
          label: "The second item is striped",
          selector: "li:nth-child(2)",
          property: "background-color",
          value: "rgb(238, 243, 255)",
        },
        {
          kind: "style",
          label: "The fourth item is striped",
          selector: "li:nth-child(4)",
          property: "background-color",
          value: "rgb(238, 243, 255)",
        },
        {
          kind: "style",
          label: "The third item isn't striped",
          selector: "li:nth-child(3)",
          property: "background-color",
          value: "rgba(0, 0, 0, 0)",
        },
      ],
      hint: "`li:first-child { font-weight: 700; }` and `li:nth-child(even) { background: #eef3ff; }`.",
      solution: [
        "<style>",
        "  li:first-child { font-weight: 700; }",
        "  li:nth-child(even) { background: #eef3ff; }",
        "</style>",
        "<ul>",
        "  <li>Shopping</li><li>Milk</li><li>Bread</li><li>Eggs</li>",
        "</ul>",
      ],
    }),
    pageYourTurn({
      title: "Disabled and done",
      task: "Fade a disabled button to `opacity: 0.5` with a `not-allowed` cursor. Then make the label after a checked checkbox bold (`font-weight: 700`).",
      starter: [
        "<style>",
        "</style>",
        '<input type="checkbox" id="milk" checked><label for="milk">Buy milk</label>',
        '<input type="checkbox" id="bread"><label for="bread">Buy bread</label>',
        "<p><button disabled>Save</button></p>",
      ],
      checks: [
        {
          kind: "style",
          label: "The disabled button is faded",
          selector: "button:disabled",
          property: "opacity",
          value: "0.5",
        },
        {
          kind: "style",
          label: "Its cursor says it can't be clicked",
          selector: "button:disabled",
          property: "cursor",
          value: "not-allowed",
        },
        {
          kind: "style",
          label: "The checked item's label is bold",
          selector: "input:checked + label",
          property: "font-weight",
          value: "700",
        },
        {
          kind: "style",
          label: "The unchecked item's label isn't",
          selector: "#bread + label",
          property: "font-weight",
          value: "400",
        },
      ],
      hint: "`button:disabled { opacity: 0.5; cursor: not-allowed; }` and `input:checked + label { font-weight: 700; }` (`+` is the next sibling).",
      solution: [
        "<style>",
        "  button:disabled { opacity: 0.5; cursor: not-allowed; }",
        "  input:checked + label { font-weight: 700; }",
        "</style>",
        '<input type="checkbox" id="milk" checked><label for="milk">Buy milk</label>',
        '<input type="checkbox" id="bread"><label for="bread">Buy bread</label>',
        "<p><button disabled>Save</button></p>",
      ],
    }),
    pageYourTurn({
      title: "A smooth hover",
      task: "The button changes colour on hover, instantly. Make the `background-color` change take `0.2s` with `ease-out`, on the button's normal rule.",
      starter: [
        "<style>",
        "  .button { padding: 8px 16px; border: 0; background: #1d4ed8; color: white; }",
        "  .button:hover { background: #1e3a8a; }",
        "</style>",
        '<button class="button">Save</button>',
      ],
      checks: [
        {
          kind: "style",
          label: "background-color is transitioned",
          selector: ".button",
          property: "transition-property",
          value: "background-color",
        },
        {
          kind: "style",
          label: "It takes 0.2s",
          selector: ".button",
          property: "transition-duration",
          value: "0.2s",
        },
        {
          kind: "style",
          label: "It eases out",
          selector: ".button",
          property: "transition-timing-function",
          value: "ease-out",
        },
      ],
      hint: "In `.button`: `transition: background-color 0.2s ease-out;` (or the three `transition-` properties one by one).",
      solution: [
        "<style>",
        "  .button { padding: 8px 16px; border: 0; background: #1d4ed8; color: white;",
        "    transition-property: background-color;",
        "    transition-duration: 0.2s;",
        "    transition-timing-function: ease-out; }",
        "  .button:hover { background: #1e3a8a; }",
        "</style>",
        '<button class="button">Save</button>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("States and transitions cheat sheet", [
      [
        ":hover / :active",
        "Pointer over / being pressed.",
        "button:hover { … }",
      ],
      [
        ":focus-visible",
        "Keyboard focus: style, never hide.",
        "outline: 2px solid; outline-offset: 2px;",
      ],
      [
        ":disabled / :checked",
        "Form control states.",
        "input:checked + label { … }",
      ],
      [
        ":user-invalid",
        "Invalid after the person edits it.",
        "input:user-invalid { … }",
      ],
      [":nth-child()", "By position, from 1.", "li:nth-child(even) { … }"],
      [
        "::before / ::after",
        "Added boxes; need content.",
        '.done::before { content: "✓ "; }',
      ],
      [
        "@media (hover: hover)",
        "Hover effects for pointer devices only.",
        "@media (hover: hover) { … }",
      ],
      [
        "transition",
        "property duration easing delay.",
        "transition: opacity 200ms ease-out;",
      ],
      [
        "easing",
        "ease-out to arrive, ease-in to leave.",
        "transition-timing-function: ease-out;",
      ],
      [
        "cheap to animate",
        "opacity and transform.",
        "transform: translateY(-4px);",
      ],
    ]),
    quickCheck(
      "A card has `transition: opacity 400ms linear`. It's hovered for 100ms, going from 1 towards 0.2. What's its opacity then?",
      ["0.8", "0.6", "0.2"],
      0,
      "100ms is a quarter of 400ms, so with `linear` it's a quarter of the way: 1 − 0.25 × 0.8 = 0.8.",
    ),
  ),
);
