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

// Forms in depth: who checks what (browser and server), every built-in rule,
// the anatomy of a field with rules and help text, a step-through of a
// blocked submit, error messages people can see and hear, taking over with
// JavaScript, the less common input types, choice groups and what they send,
// the Notes App, mistakes, practice and a recap.
export const formsDepthModule = moduleLesson(
  "forms-in-depth",
  "Forms in depth: checks, input types and choices",
  45,
  [
    "Use the browser's built-in rules: `required`, lengths, `min`/`max`/`step`, `pattern` and the input types.",
    "Explain why the server must check again, whatever the browser does.",
    "Show error messages that sighted and screen-reader users both get, tied to their field.",
    "Take over the checks with `novalidate` and the validity API when the built-in bubbles aren't enough.",
    "Build checkbox groups, radio groups and selects, and predict exactly what they send.",
  ],

  part(
    "why",
    "Two places that check",
    explain(
      "The Basic forms step showed `required`. Real forms need more: a tag in lower case, a date that isn't in the past, a choice from a fixed list. The browser can check all of that before anything is sent, which saves the user a round trip. But [[form-validation]] in the browser is a courtesy: anyone can send a request without your form, so the server checks again.",
    ),
    diagram([
      ["user fills in", "types, picks, ticks"],
      ["browser checks", "fast, helpful, can be skipped"],
      ["request", "name=value pairs"],
      ["server checks", "the rules that protect the data"],
    ]),
    keyPoints(
      "Browser checks are for the user: quick feedback, no round trip.",
      "Server checks are for the data: they can't be skipped.",
      "Write the same rules in both places.",
    ),
  ),

  part(
    "rules",
    "Every built-in rule",
    explain(
      "Each rule is an [[attribute]] on the field. The browser checks them all when the form is submitted and stops at the first field that breaks one. The `type` adds its own rule too: `email` wants an @, `url` wants a full web address. Rules only apply to fields that have a value, except `required`.",
    ),
    reference("Validation attributes", [
      ["required", "Can't be empty (or unticked).", "<input required>"],
      [
        "minlength / maxlength",
        "Text length limits. maxlength also stops typing.",
        '<input minlength="3" maxlength="20">',
      ],
      [
        "min / max",
        "Limits for numbers, dates and times.",
        '<input type="date" min="2026-01-01">',
      ],
      [
        "step",
        "Allowed jumps: whole numbers, halves, every 15 minutes.",
        '<input type="number" step="0.5">',
      ],
      [
        "pattern",
        "The whole value must match a regular expression.",
        '<input pattern="[a-z]+">',
      ],
      [
        "type",
        "email, url, number, date… each has its own check.",
        '<input type="url">',
      ],
    ]),
    quickCheck(
      'A field has `pattern="[a-z]+"` and the user types `Milk`. Will the form send?',
      [
        "Yes: it contains lower-case letters",
        "No: the pattern must match the whole value, and M is a capital",
        "Yes: pattern only shows a hint",
      ],
      1,
      "`pattern` has to match all of the value, as if it started with ^ and ended with $. `Milk` starts with a capital, so it fails.",
    ),
  ),

  part(
    "anatomy",
    "Anatomy of a field with rules",
    explain(
      "A field with rules usually has three things: the rules themselves, help text that says them in words, and a link from the field to that text. `aria-describedby` points at the help's `id`, so a screen reader reads the label, then the help, when the field gets focus.",
    ),
    anatomy(
      "A tag field with rules and help",
      [
        '<label for="tag">Tag</label>',
        '<input id="tag" name="tag" required pattern="[a-z]+"',
        '  maxlength="20" aria-describedby="tag-help">',
        '<p id="tag-help">Lower-case letters, up to 20.</p>',
      ],
      [
        ["required", "can't be empty", "The form won't send with no tag."],
        [
          'pattern="[a-z]+"',
          "the shape",
          "One or more lower-case letters, and nothing else.",
        ],
        [
          'maxlength="20"',
          "the length",
          "The browser stops accepting letters after 20.",
        ],
        [
          'aria-describedby="tag-help"',
          "the link",
          "Points at the help text's id, so it's read with the field.",
        ],
        [
          'id="tag-help"',
          "the help",
          "Says the rules in words everyone can see before they type.",
        ],
      ],
    ),
    playground("Try the tag field: type Milk, then milk", [
      "<style>",
      "  input:user-invalid { outline: 2px solid crimson; }",
      "  input:user-valid { outline: 2px solid seagreen; }",
      "</style>",
      "<form>",
      '  <label for="tag">Tag</label>',
      '  <input id="tag" name="tag" required pattern="[a-z]+"',
      '    maxlength="20" aria-describedby="tag-help">',
      '  <p id="tag-help">Lower-case letters, up to 20.</p>',
      "  <button>Save</button>",
      "</form>",
    ]),
  ),

  part(
    "how-it-checks",
    "What happens when a rule fails",
    explain(
      "Step through a submit where one field breaks a rule. Watch the browser check each field in order, stop at the first problem, and never send the request.",
    ),
    trace(
      "A blocked submit, move by move",
      [
        "<form>",
        '  <input name="title" required maxlength="100">',
        '  <input name="tag" pattern="[a-z]+">',
        '  <input name="due" type="date" min="2026-01-01">',
        "  <button>Save</button>",
        "</form>",
      ],
      [
        {
          line: 5,
          note: "The user typed a title, `Food` as the tag and picked a date in 2027. They click Save, which submits the form.",
          vars: [
            ["title", '"Milk"'],
            ["tag", '"Food"'],
            ["due", "2027-03-01"],
          ],
        },
        {
          line: 2,
          note: "The browser checks every field before sending. The title isn't empty and is under 100 characters: valid.",
          vars: [
            ["title", "valid"],
            ["tag", '"Food"'],
            ["due", "2027-03-01"],
          ],
        },
        {
          line: 3,
          note: "`Food` starts with a capital, so it doesn't match `[a-z]+`. This field is invalid: its `validity.patternMismatch` is true.",
          vars: [
            ["title", "valid"],
            ["tag", "patternMismatch"],
            ["due", "2027-03-01"],
          ],
        },
        {
          line: 4,
          note: "The date is after `min`, so it's valid. One invalid field is enough to stop the submit.",
          vars: [
            ["title", "valid"],
            ["tag", "patternMismatch"],
            ["due", "valid"],
          ],
        },
        {
          line: 3,
          note: "The browser puts focus on the first invalid field and shows its message in a bubble. No request is sent.",
          vars: [
            ["tag", "patternMismatch"],
            ["sent", "nothing"],
          ],
          output: "Please match the requested format.",
        },
        {
          line: 5,
          note: "The user changes it to `food` and clicks Save again. Every field is valid now, so the form is sent.",
          vars: [
            ["tag", "valid"],
            ["sent", "title=Milk&tag=food&due=2027-03-01"],
          ],
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "messages",
    "Error messages everyone gets",
    explain(
      "The browser's bubble is generic (“Please match the requested format”), disappears quickly and can't be styled. Better: say the rule in help text up front, and when a check fails, put the message in the page next to the field. Link it with `aria-describedby` and mark the field `aria-invalid=\"true\"`, so a screen reader announces both.",
    ),
    code(
      "html",
      "a field showing its error",
      [
        '<label for="email">Email</label>',
        '<input id="email" name="email" type="email" required',
        '  aria-invalid="true" aria-describedby="email-error">',
        '<p id="email-error">Enter an email address, like sam@example.com.</p>',
      ],
      {
        3: "says the value is wrong, and where the message is",
        4: "says what to do, not just “invalid”",
      },
    ),
    keyPoints(
      "Say the rule before the user types, not only after they fail.",
      "Show the error as text next to its field, not just a red border.",
      'Link it with aria-describedby and mark the field aria-invalid="true".',
      "Write what to do: “Use lower-case letters”, not “Invalid input”.",
    ),
  ),

  part(
    "javascript",
    "Taking over with JavaScript",
    explain(
      'Add `novalidate` to the form and the browser stops blocking the submit and showing bubbles, but it still works out each field\'s validity. Your code calls `checkValidity()`, reads `validity` and `validationMessage`, and shows its own messages. `setCustomValidity("…")` adds a rule of your own; an empty string clears it. Submit this empty, then filled in:',
    ),
    pagePlayground("novalidate: your code shows the messages", [
      "<form novalidate>",
      '  <label for="tag">Tag</label>',
      '  <input id="tag" name="tag" required pattern="[a-z]+"',
      '    aria-describedby="tag-error">',
      '  <p id="tag-error"></p>',
      "  <button>Save</button>",
      "</form>",
      "<script>",
      '  const form = document.querySelector("form");',
      '  const tag = document.querySelector("#tag");',
      '  form.addEventListener("submit", (event) => {',
      "    event.preventDefault();",
      "    const ok = tag.checkValidity();",
      '    tag.setAttribute("aria-invalid", String(!ok));',
      '    document.querySelector("#tag-error").textContent = ok',
      '      ? "Saved." : tag.validity.valueMissing',
      '      ? "Enter a tag." : "Use lower-case letters only.";',
      "  });",
      "</script>",
    ]),
    quickCheck(
      "A form has `novalidate`. What changes?",
      [
        "The browser no longer works out whether fields are valid",
        "The browser still works out validity, but doesn't block the submit or show bubbles",
        "The server stops checking too",
      ],
      1,
      "`novalidate` only switches off the blocking and the bubbles. `checkValidity()` and `validity` still work, so your code decides what to show.",
    ),
  ),

  part(
    "more-types",
    "More input types and helpers",
    explain(
      "Beyond text and email, [[input-type|input types]] bring pickers and limits: `time`, `color`, `range`, and `file` with `accept`. Two attributes help on any field: `autocomplete` tells the browser what to fill in (a saved email, a new password), and `inputmode` picks the phone keyboard without adding rules. A `<datalist>` suggests values but still allows others.",
    ),
    reference("Types and helpers", [
      [
        "number + step",
        "A number with arrows; step sets the jumps.",
        '<input type="number" min="0" step="0.5">',
      ],
      ["time", "A time, with a picker.", '<input type="time" step="900">'],
      ["color", "A colour picker; sends #rrggbb.", '<input type="color">'],
      [
        "range",
        "A slider; fine when the exact number doesn't matter.",
        '<input type="range" min="1" max="5">',
      ],
      [
        "file + accept",
        "Pick files; accept limits the kinds.",
        '<input type="file" accept="image/*" multiple>',
      ],
      [
        "autocomplete",
        "What the browser may fill in.",
        '<input type="email" autocomplete="email">',
      ],
      [
        "inputmode",
        "The phone keyboard, without number rules.",
        '<input inputmode="numeric" autocomplete="one-time-code">',
      ],
      [
        "<datalist>",
        "Suggestions the user can ignore.",
        '<input list="tags"><datalist id="tags"><option value="food"></datalist>',
      ],
    ]),
    playground("Try the pickers and suggestions", [
      '<p><label>Remind me at <input type="time" step="900"></label></p>',
      '<p><label>Colour <input type="color" value="#ffd54f"></label></p>',
      '<p><label>Importance <input type="range" min="1" max="5"></label></p>',
      '<p><label>Photo <input type="file" accept="image/*"></label></p>',
      '<p><label>Tag <input list="tags"></label></p>',
      '<datalist id="tags">',
      '  <option value="food"></option>',
      '  <option value="work"></option>',
      '  <option value="ideas"></option>',
      "</datalist>",
    ]),
  ),

  part(
    "choices",
    "Choices and what they send",
    explain(
      "For [[choice-inputs|choices]], what's sent surprises people. A ticked checkbox sends its `value` (`on` if it has none); an unticked one sends nothing. Checkboxes sharing a `name` send one pair each. A radio group sends only the chosen one. `checked` and `selected` set the starting choice. Tick and pick, then press Show:",
    ),
    pagePlayground("What does this form send?", [
      "<form>",
      "  <fieldset>",
      "    <legend>Tags</legend>",
      '    <label><input type="checkbox" name="tag" value="food" checked> Food</label>',
      '    <label><input type="checkbox" name="tag" value="work"> Work</label>',
      "  </fieldset>",
      "  <fieldset>",
      "    <legend>Sort by</legend>",
      '    <label><input type="radio" name="sort" value="new" checked> Newest</label>',
      '    <label><input type="radio" name="sort" value="title"> Title</label>',
      "  </fieldset>",
      '  <label>Colour <select name="colour"><optgroup label="Light">',
      "    <option>yellow</option><option selected>blue</option></optgroup></select></label>",
      '  <button type="button">Show</button>',
      "</form>",
      '<p role="status"></p>',
      "<script>",
      '  document.querySelector("button").onclick = () => document.querySelector("p").textContent =',
      '    new URLSearchParams(new FormData(document.querySelector("form"))).toString();',
      "</script>",
    ]),
    keyPoints(
      "An unticked checkbox sends nothing at all.",
      "Checkboxes with the same name send one name=value pair each.",
      "Radio buttons with the same name: only the chosen one is sent.",
      "An option without a value sends its text.",
    ),
  ),

  part(
    "where-used",
    "Checks in the Notes App",
    explain(
      'The Notes App writes its title rule twice. In the browser, the new-note form\'s title field has `required` and `maxLength={100}`, so an empty or too-long title never leaves the page. On the server, `validateNote` checks the same rule again, because a request can come from anywhere, and sends back a message the form shows in a `role="alert"` paragraph.',
    ),
    inTheNotesApp(
      '`NoteForm` passes `required` and `maxLength={100}` to the title\'s `Input`. When saving fails, it shows the server\'s message in `<p className="form-error" role="alert">`.',
      { symbolId: "component:NoteForm" },
    ),
    inTheNotesApp(
      "`validateNote(body)` trims the title, then returns “Title is required” or “Title must be at most 100 characters”: the same rules as the form, enforced where they can't be skipped.",
      { symbolId: "fn:validateNote" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Radio buttons with different names",
      language: "html",
      wrong: [
        '<input type="radio" name="sort-new"> Newest',
        '<input type="radio" name="sort-title"> Title',
      ],
      problem:
        "They aren't one group, so both can be chosen and neither can be unchosen.",
      right: [
        '<input type="radio" name="sort" value="new"> Newest',
        '<input type="radio" name="sort" value="title"> Title',
      ],
      why: "Radio buttons are a group because they share a `name`; `value` says which was picked.",
    }),
    mistake({
      title: "An error only shown in red",
      language: "html",
      wrong: [
        '<input id="tag" class="error">',
        '<p class="error-text">Use lower-case letters.</p>',
      ],
      problem:
        "Colour alone misses people who can't see it, and the text isn't tied to the field, so screen readers don't read it.",
      right: [
        '<input id="tag" aria-invalid="true" aria-describedby="tag-error">',
        '<p id="tag-error">Use lower-case letters.</p>',
      ],
      why: "aria-invalid says it's wrong; aria-describedby reads the message with the field.",
    }),
    mistake({
      title: "type=number for a code",
      language: "html",
      wrong: ['<input type="number" name="pin">'],
      problem:
        "It shows arrows, can drop a leading zero and accepts 1e3. A PIN or postcode isn't a number you count with.",
      right: ['<input name="pin" inputmode="numeric" pattern="[0-9]{4}">'],
      why: "Use `number` for amounts. For codes, ask for digits with `inputmode` and `pattern`.",
    }),
    mistake({
      title: "Trusting the browser's checks",
      language: "html",
      wrong: [
        '<input name="title" required maxlength="100">',
        "<!-- the server saves whatever arrives -->",
      ],
      problem:
        "Anyone can send a request without the form, so an empty or huge title reaches the database.",
      right: [
        '<input name="title" required maxlength="100">',
        "<!-- the server checks the same rules again -->",
      ],
      why: "Browser checks help the user; only the server's checks protect the data.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Rules for a tag",
      task: 'Make the tag field `required`, allow only lower-case letters with `pattern="[a-z]+"`, and cap it at 20 characters with `maxlength`.',
      starter: [
        "<form>",
        '  <label for="tag">Tag</label>',
        '  <input id="tag" name="tag">',
        "  <button>Save</button>",
        "</form>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The tag is required",
          selector: "#tag",
          name: "required",
        },
        {
          kind: "attr",
          label: "Only lower-case letters",
          selector: "#tag",
          name: "pattern",
          value: "[a-z]+",
        },
        {
          kind: "attr",
          label: "At most 20 characters",
          selector: "#tag",
          name: "maxlength",
          value: "20",
        },
      ],
      hint: 'Add three attributes to the input: `required`, `pattern="[a-z]+"` and `maxlength="20"`.',
      solution: [
        "<form>",
        '  <label for="tag">Tag</label>',
        '  <input id="tag" name="tag" required pattern="[a-z]+" maxlength="20">',
        "  <button>Save</button>",
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "One radio group",
      task: 'Fix the sort choices: put them in a `<fieldset>` with the `<legend>` "Sort by", give all three radio buttons `name="sort"`, and make Newest `checked`.',
      starter: [
        "<form>",
        '  <label><input id="newest" type="radio" name="a" value="new"> Newest</label>',
        '  <label><input type="radio" name="b" value="old"> Oldest</label>',
        '  <label><input type="radio" name="c" value="title"> Title</label>',
        "</form>",
      ],
      checks: [
        {
          kind: "text",
          label: 'A legend saying "Sort by"',
          selector: "fieldset legend",
          text: "Sort by",
        },
        {
          kind: "count",
          label: "Three radio buttons in the sort group",
          selector: 'fieldset input[type="radio"][name="sort"]',
          count: 3,
        },
        {
          kind: "attr",
          label: "Newest is chosen to start with",
          selector: "#newest",
          name: "checked",
        },
      ],
      hint: "Wrap the labels in `<fieldset><legend>Sort by</legend> … </fieldset>`, change each `name` to `sort`, and add `checked` to the first input.",
      solution: [
        "<form>",
        "  <fieldset>",
        "    <legend>Sort by</legend>",
        '    <label><input id="newest" type="radio" name="sort" value="new" checked> Newest</label>',
        '    <label><input type="radio" name="sort" value="old"> Oldest</label>',
        '    <label><input type="radio" name="sort" value="title"> Title</label>',
        "  </fieldset>",
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "Tie the error to its field",
      task: 'The email field failed its check. Mark it `aria-invalid="true"`, give the message the `id` "email-error", and point the field at it with `aria-describedby`.',
      starter: [
        "<form>",
        '  <label for="email">Email</label>',
        '  <input id="email" name="email" type="email" required>',
        "  <p>Enter an email address, like sam@example.com.</p>",
        "</form>",
      ],
      checks: [
        {
          kind: "attr",
          label: "The field is marked invalid",
          selector: "#email",
          name: "aria-invalid",
          value: "true",
        },
        {
          kind: "text",
          label: "The message has the id email-error",
          selector: "#email-error",
          text: "Enter an email address, like sam@example.com.",
        },
        {
          kind: "attr",
          label: "The field points at the message",
          selector: "#email",
          name: "aria-describedby",
          value: "email-error",
        },
      ],
      hint: 'Add `aria-invalid="true" aria-describedby="email-error"` to the input and `id="email-error"` to the `<p>`.',
      solution: [
        "<form>",
        '  <label for="email">Email</label>',
        '  <input id="email" name="email" type="email" required',
        '    aria-invalid="true" aria-describedby="email-error">',
        '  <p id="email-error">Enter an email address, like sam@example.com.</p>',
        "</form>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Forms in depth cheat sheet", [
      ["required", "Can't be empty or unticked.", "<input required>"],
      ["pattern", "The whole value must match.", '<input pattern="[a-z]+">'],
      [
        "min / max / step",
        "Limits for numbers and dates.",
        '<input type="number" min="1" step="1">',
      ],
      [
        "aria-describedby",
        "Reads help or an error with the field.",
        '<input aria-describedby="tag-help">',
      ],
      [
        "aria-invalid",
        "Says the value is wrong.",
        '<input aria-invalid="true">',
      ],
      ["novalidate", "Your code shows the messages.", "<form novalidate>"],
      [
        "checkValidity()",
        "True when every rule passes.",
        "input.checkValidity()",
      ],
      [
        "checkbox group",
        "Same name; each ticked one is sent.",
        '<input type="checkbox" name="tag" value="food">',
      ],
      [
        "<fieldset>",
        "Groups choices; legend names them.",
        "<fieldset><legend>Sort by</legend>…",
      ],
      ["<datalist>", "Suggestions, not rules.", '<input list="tags">'],
    ]),
    quickCheck(
      "Two checkboxes named `tag` (values food and work) are both ticked. What's sent?",
      ["tag=work: the last one wins", "tag=food&tag=work", "tag=on"],
      1,
      "Each ticked checkbox adds its own name=value pair, so the server gets both.",
    ),
  ),
);
