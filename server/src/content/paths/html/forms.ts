import {
  anatomy,
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

// Forms in depth: why forms, the anatomy of form/label/input/button, labels
// and for/id, name and value (what gets sent, live), a step-through of a
// submit, input types, textarea/select/radio, button types, a preview of
// built-in validation, where it's used, mistakes, practice and a recap.
export const formsModule = moduleLesson(
  "forms",
  "Forms: labels, inputs and buttons",
  45,
  [
    "Build a form from `<form>`, `<label>`, `<input>` and `<button>`, and say what each does.",
    "Connect every field to its label with `for` and `id`, and explain who that helps.",
    "Say what a form sends: each field's `name` with its value.",
    "Pick the right control: input types, `<textarea>`, `<select>`, checkboxes and radio buttons.",
    "Use the right button type, and switch on the browser's own checks with `required`.",
  ],

  part(
    "why",
    "Why forms",
    explain(
      "Almost everything a user tells a website goes through a [[html-form|form]]: logging in, searching, writing a note, paying. A form groups **fields** (what you type or pick) with a **button**, so everything can be sent together in one request. HTML gives you all of this, including keyboard use and screen-reader support, for free.",
    ),
    diagram([
      ["fields", "what the user types, picks or ticks"],
      ["labels", "say what each field is for"],
      ["a button", "sends the form"],
      ["a request", "each field's name and value, to the server"],
    ]),
    keyPoints(
      "A form collects fields and sends them together.",
      "Every field has a label.",
      "Every field that should be sent has a `name`.",
    ),
  ),

  part(
    "anatomy",
    "Anatomy of a form",
    explain(
      "Four elements make a working form. `<form>` wraps it all. Each [[html-input|`<input>`]] gets a [[label|`<label>`]], tied together by `for` and `id`. The `name` is the key its value is sent under. A [[html-button|`<button>`]] inside a form sends it.",
    ),
    anatomy(
      "A one-field form",
      [
        "<form>",
        '  <label for="title">Title</label>',
        '  <input id="title" name="title">',
        "  <button>Save</button>",
      ],
      [
        ["<form>", "the form", "Groups the fields; submitting it sends them."],
        [
          'for="title"',
          "the label's target",
          "Points at the input with that `id`.",
        ],
        [
          'id="title"',
          "the input's id",
          "Unique on the page; the label finds it by this.",
        ],
        [
          'name="title"',
          "the key",
          "What the value is sent under: `title=Milk`.",
        ],
        [
          "<button>",
          "the button",
          "Inside a form, clicking it submits the form.",
        ],
      ],
    ),
    playground("Type, then click the label", [
      "<form>",
      '  <label for="title">Title</label>',
      '  <input id="title" name="title">',
      "  <button>Save</button>",
      "</form>",
    ]),
  ),

  part(
    "labels",
    "Labels: for and id",
    explain(
      "A label isn't just text next to a box. Because `for` matches the input's `id`, clicking the label puts the cursor in the field (a bigger target on a phone), and a screen reader announces “Title, edit text” when the field is focused. Without it, a blind user hears just “edit text”. You can also wrap the input **inside** the label instead.",
    ),
    playground("Two ways to label, and one that doesn't", [
      '<p><label for="email">Email</label> <input id="email" type="email"></p>',
      "",
      "<p><label>Name <input></label></p>",
      "",
      '<p>Phone <input type="tel"></p> <!-- no label: click "Phone" and nothing happens -->',
    ]),
    quickCheck(
      'A field has `placeholder="Your email"` but no label. What\'s the problem?',
      [
        "Nothing: the placeholder says what to type",
        "The placeholder disappears as soon as you type, and many screen readers skip it",
        "Placeholders aren't allowed in forms",
      ],
      1,
      "A placeholder is a hint, not a label. Once you start typing it's gone, and you can no longer check which field you're in.",
    ),
  ),

  part(
    "what-gets-sent",
    "name and value: what gets sent",
    explain(
      "When a form is submitted, the browser makes a list of **name = value** pairs from its fields: `title=Milk&tag=food`. A field **without a `name` isn't sent at all**, however much the user typed. This page shows exactly what a submit would send. Change the values, then remove a `name` and see it vanish.",
    ),
    pagePlayground("See what a submit sends", [
      "<form>",
      '  <label for="title">Title</label>',
      '  <input id="title" name="title" value="Milk">',
      '  <label for="tag">Tag</label>',
      '  <select id="tag" name="tag">',
      "    <option>food</option>",
      "    <option>home</option>",
      "  </select>",
      '  <label for="note">No name</label>',
      '  <input id="note" value="never sent">',
      "  <button>Save</button>",
      "</form>",
      '<p>Sent: <output id="sent">(click Save)</output></p>',
      "<script>",
      '  document.querySelector("form").addEventListener("submit", (event) => {',
      "    event.preventDefault(); // stay on this page and show the data instead",
      "    const data = new URLSearchParams(new FormData(event.target));",
      '    document.querySelector("#sent").textContent = data.toString();',
      "  });",
      "</script>",
    ]),
    keyPoints(
      "Only fields with a `name` are sent.",
      "A text field sends what's typed; a select sends the chosen option.",
      "An unticked checkbox sends nothing at all.",
    ),
  ),

  part(
    "how-submit-works",
    "What happens when you submit",
    explain(
      "Step through what the browser does between the click and the request. Watch the data it collects: only named fields, and only a checkbox that's ticked.",
    ),
    trace(
      "Submitting a form, move by move",
      [
        '<form action="/api/notes" method="post">',
        '  <label for="title">Title</label>',
        '  <input id="title" name="title" required>',
        '  <label for="done">Done</label>',
        '  <input id="done" name="done" type="checkbox">',
        "  <button>Save</button>",
        "</form>",
      ],
      [
        {
          line: 3,
          note: "The user clicks the label (line 2), so the cursor goes into this field, and types Milk.",
          vars: [
            ["title field", '"Milk"'],
            ["done box", "not ticked"],
          ],
        },
        {
          line: 6,
          note: "They click Save. A `<button>` in a form is a **submit** button unless it says otherwise, so the form is submitted.",
          vars: [
            ["title field", '"Milk"'],
            ["done box", "not ticked"],
          ],
        },
        {
          line: 3,
          note: "First the browser checks the rules: `required` means the title can't be empty. It isn't, so carry on.",
          vars: [
            ["title field", '"Milk"'],
            ["done box", "not ticked"],
            ["checks", "passed"],
          ],
        },
        {
          line: 3,
          note: "It collects each named field: `title` with its value.",
          vars: [
            ["title field", '"Milk"'],
            ["done box", "not ticked"],
            ["to send", "title=Milk"],
          ],
        },
        {
          line: 5,
          note: "The checkbox isn't ticked, so it sends nothing. (Ticked, it would add `done=on`.)",
          vars: [
            ["title field", '"Milk"'],
            ["done box", "not ticked"],
            ["to send", "title=Milk"],
          ],
        },
        {
          line: 1,
          note: "`action` and `method` say where and how: a POST request to `/api/notes`, with the data as its body. (Apps like the Notes App usually stop this and send JSON with `fetch` instead.)",
          vars: [["to send", "title=Milk"]],
          output: "POST /api/notes  title=Milk",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "input-types",
    "Input types",
    explain(
      "The `type` attribute turns one `<input>` into many controls. Each type brings the right keyboard on a phone, its own built-in check and often a picker. Choosing well costs nothing and helps everyone. Leave it out and you get `text`.",
    ),
    reference("Common input types", [
      ["text", "One line of text (the default).", '<input name="title">'],
      ["email", "An email address; checked for an @.", '<input type="email">'],
      ["password", "Hidden as you type.", '<input type="password">'],
      [
        "number",
        "A number, with arrows; min and max.",
        '<input type="number" min="1">',
      ],
      ["date", "A date, with a calendar picker.", '<input type="date">'],
      ["checkbox", "Ticked or not.", '<input type="checkbox">'],
      [
        "radio",
        "One of a group with the same name.",
        '<input type="radio" name="size">',
      ],
      [
        "search, tel, url",
        "Text, with the right keyboard.",
        '<input type="tel">',
      ],
      ["file", "Pick a file to upload.", '<input type="file">'],
    ]),
    playground("Try each control", [
      '<p><label>Email <input type="email" name="email"></label></p>',
      '<p><label>Password <input type="password" name="password"></label></p>',
      '<p><label>How many <input type="number" name="count" min="1" max="10"></label></p>',
      '<p><label>Due <input type="date" name="due"></label></p>',
      '<p><label><input type="checkbox" name="done"> Done</label></p>',
    ]),
  ),

  part(
    "more-controls",
    "Longer text and choices",
    explain(
      "For more than one line, use `<textarea>`. For one choice out of many, `<select>` with `<option>`s. For one out of a few, **radio buttons** sharing a `name`, so only one can be picked. Group related controls in a `<fieldset>` whose `<legend>` says what they're about.",
    ),
    playground("textarea, select and radio buttons", [
      '<p><label for="content">Note</label></p>',
      '<textarea id="content" name="content" rows="3"></textarea>',
      "",
      '<p><label for="colour">Colour</label>',
      '<select id="colour" name="colour">',
      '  <option value="yellow">Yellow</option>',
      '  <option value="blue">Blue</option>',
      "</select></p>",
      "",
      "<fieldset>",
      "  <legend>Priority</legend>",
      '  <label><input type="radio" name="priority" value="low"> Low</label>',
      '  <label><input type="radio" name="priority" value="high"> High</label>',
      "</fieldset>",
    ]),
    keyPoints(
      "`<textarea>` for several lines; its text goes between the tags.",
      "An `<option>`'s `value` is what's sent; its text is what's shown.",
      "Radio buttons are one group when they share a `name`.",
    ),
  ),

  part(
    "buttons",
    "Buttons",
    explain(
      'A `<button>` inside a form is `type="submit"` unless you say otherwise. Any other button in a form, like “Cancel” or “Show password”, needs `type="button"`, or clicking it will submit the form. And remember: **buttons do things, links go places.** Navigation is an `<a>`.',
    ),
    reference("Button types", [
      [
        "submit",
        "Sends the form (the default in a form).",
        '<button type="submit">Save</button>',
      ],
      [
        "button",
        "Does nothing until code listens to it.",
        '<button type="button">Cancel</button>',
      ],
      [
        "reset",
        "Puts every field back; rarely useful.",
        '<button type="reset">',
      ],
      [
        "<a href>",
        "Not a button: goes to another page.",
        '<a href="/notes">Back</a>',
      ],
    ]),
    quickCheck(
      "A form has a “Cancel” button written `<button>Cancel</button>`. What happens when it's clicked?",
      ["Nothing", "The form is submitted", "The fields are cleared"],
      1,
      'Inside a form, a button without a type submits it. Write `type="button"` for buttons that should only run code.',
    ),
  ),

  part(
    "validation",
    "Built-in checks",
    explain(
      "Before a form is sent, the browser checks its fields' rules, and blocks the submit with a message if one fails. `required` means it can't be empty; `type=\"email\"` needs an @; `minlength`, `maxlength`, `min` and `max` set limits. You'll go deeper in [[form-validation|form validation]] later. Check this form, empty and then filled in:",
    ),
    pagePlayground("Ask the browser: would this form send?", [
      "<form>",
      '  <p><label>Title <input name="title" required maxlength="20"></label></p>',
      '  <p><label>Email <input name="email" type="email" required></label></p>',
      '  <button type="button">Check</button>',
      "</form>",
      '<p id="result" role="status"></p>',
      "<script>",
      '  const form = document.querySelector("form");',
      '  document.querySelector("button").addEventListener("click", () => {',
      '    const bad = form.querySelector(":invalid");',
      '    document.querySelector("#result").textContent = bad',
      '      ? bad.name + ": " + bad.validationMessage',
      '      : "All good: the form would be sent.";',
      "  });",
      "</script>",
    ]),
    keyPoints(
      "`required`, `type`, `minlength`/`maxlength` and `min`/`max` are checked for free.",
      "The browser shows its own message and stops the submit.",
      "The server must check again: browser checks can be skipped.",
    ),
  ),

  part(
    "where-used",
    "Forms in the Notes App",
    explain(
      "The Notes App's new-note form is exactly this: a `<form>`, a labelled title field that's `required` with a `maxLength`, a labelled `<textarea>` for the note, and a submit button. Its `Input` component always renders a `<label htmlFor={id}>` with the field (in React, `for` is written `htmlFor`).",
    ),
    inTheNotesApp(
      '`NoteForm` renders `<form onSubmit={handleSave}>` with two `Input`s (Title, `required`, `maxLength={100}`; Note, as a textarea) and `<Button type="submit">Save</Button>`. `handleSave` stops the browser\'s own submit and sends the note as JSON instead.',
      { symbolId: "component:NoteForm" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A placeholder instead of a label",
      language: "html",
      wrong: ['<input id="email" placeholder="Email">'],
      problem:
        "The hint vanishes when you type, screen readers may skip it, and clicking near it does nothing.",
      right: [
        '<label for="email">Email</label>',
        '<input id="email" name="email">',
      ],
      why: "Every field needs a real label; a placeholder can add an example.",
    }),
    mistake({
      title: "A field without a name",
      language: "html",
      wrong: ['<input id="title">'],
      problem: "It works on screen, but its value is never sent.",
      right: ['<input id="title" name="title">'],
      why: "`id` is for the label and the page; `name` is what's sent.",
    }),
    mistake({
      title: "A div pretending to be a button",
      language: "html",
      wrong: ['<div class="btn" onclick="save()">Save</div>'],
      problem:
        "You can't reach it with Tab or press it with Enter, and screen readers don't call it a button.",
      right: ["<button>Save</button>"],
      why: "A real `<button>` gets the keyboard, focus and screen-reader support for free.",
    }),
    mistake({
      title: "A Cancel button that submits",
      language: "html",
      wrong: [
        "<form>",
        "  <button>Cancel</button>",
        "  <button>Save</button>",
        "</form>",
      ],
      problem: "Both buttons submit the form, so Cancel saves.",
      right: [
        "<form>",
        '  <button type="button">Cancel</button>',
        "  <button>Save</button>",
        "</form>",
      ],
      why: 'In a form, buttons that shouldn\'t submit need `type="button"`.',
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Label the fields",
      task: "Give both fields a `<label>` that points at it with `for`, and a `name` (`title` and `content`) so they're sent.",
      starter: [
        "<form>",
        '  Title <input id="title">',
        '  Note <textarea id="content"></textarea>',
        "  <button>Save</button>",
        "</form>",
      ],
      checks: [
        {
          kind: "exists",
          label: 'A label for "title"',
          selector: 'label[for="title"]',
        },
        {
          kind: "exists",
          label: 'A label for "content"',
          selector: 'label[for="content"]',
        },
        {
          kind: "attr",
          label: 'The title is sent as "title"',
          selector: "#title",
          name: "name",
          value: "title",
        },
        {
          kind: "attr",
          label: 'The note is sent as "content"',
          selector: "#content",
          name: "name",
          value: "content",
        },
      ],
      hint: 'Replace `Title` with `<label for="title">Title</label>`, and add `name="title"` to the input. The same for the note.',
      solution: [
        "<form>",
        '  <label for="title">Title</label>',
        '  <input id="title" name="title">',
        '  <label for="content">Note</label>',
        '  <textarea id="content" name="content"></textarea>',
        "  <button>Save</button>",
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "A sign-up form",
      task: 'Build a form with a labelled **email** field (`id` and `name` "email", `type="email"`, `required`), a labelled **password** field (`id` and `name` "password", `type="password"`) and a submit button saying "Sign up".',
      starter: ["<form>", "", "</form>"],
      checks: [
        {
          kind: "attr",
          label: "An email field",
          selector: "input#email",
          name: "type",
          value: "email",
        },
        {
          kind: "attr",
          label: "The email is required",
          selector: "#email",
          name: "required",
        },
        {
          kind: "exists",
          label: "The email has a label",
          selector: 'label[for="email"]',
        },
        {
          kind: "attr",
          label: "A password field",
          selector: "input#password",
          name: "type",
          value: "password",
        },
        {
          kind: "exists",
          label: "The password has a label",
          selector: 'label[for="password"]',
        },
        {
          kind: "text",
          label: "A Sign up button",
          selector: "form button",
          text: "Sign up",
        },
      ],
      hint: 'Two label and input pairs, like `<label for="email">Email</label> <input id="email" name="email" type="email" required>`, then `<button>Sign up</button>`.',
      solution: [
        "<form>",
        '  <label for="email">Email</label>',
        '  <input id="email" name="email" type="email" required>',
        '  <label for="password">Password</label>',
        '  <input id="password" name="password" type="password">',
        "  <button>Sign up</button>",
        "</form>",
      ],
    }),
    pageYourTurn({
      title: "Pick a colour",
      task: 'Add a labelled `<select>` with `id` and `name` "colour" and three options: yellow, blue and green (each `value` in lower case). Make the Cancel button not submit the form.',
      starter: [
        "<form>",
        "",
        "  <button>Cancel</button>",
        "  <button>Save</button>",
        "</form>",
      ],
      checks: [
        {
          kind: "exists",
          label: "A label for the select",
          selector: 'label[for="colour"]',
        },
        {
          kind: "count",
          label: "Three options",
          selector: 'select#colour[name="colour"] option',
          count: 3,
        },
        {
          kind: "exists",
          label: "A green option",
          selector: 'option[value="green"]',
        },
        {
          kind: "attr",
          label: "Cancel doesn't submit",
          selector: "form button:first-of-type",
          name: "type",
          value: "button",
        },
      ],
      hint: '`<label for="colour">Colour</label>`, then `<select id="colour" name="colour">` with three `<option value="…">`s. Add `type="button"` to Cancel.',
      solution: [
        "<form>",
        '  <label for="colour">Colour</label>',
        '  <select id="colour" name="colour">',
        '    <option value="yellow">Yellow</option>',
        '    <option value="blue">Blue</option>',
        '    <option value="green">Green</option>',
        "  </select>",
        '  <button type="button">Cancel</button>',
        "  <button>Save</button>",
        "</form>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Forms cheat sheet", [
      [
        "<form>",
        "Groups fields; submitting sends them.",
        '<form action="/api/notes" method="post">',
      ],
      [
        "<label for>",
        "Names a field; matches its id.",
        '<label for="title">Title</label>',
      ],
      [
        "<input>",
        "A field; type picks the control.",
        '<input id="title" name="title">',
      ],
      ["name", "The key the value is sent under.", "title=Milk"],
      [
        "<textarea>",
        "Several lines of text.",
        '<textarea name="content"></textarea>',
      ],
      [
        "<select>",
        "One choice of many.",
        "<select><option>…</option></select>",
      ],
      ["radio", "One of a few; same name.", '<input type="radio" name="size">'],
      [
        "<button>",
        'Submits, unless type="button".',
        '<button type="button">Cancel</button>',
      ],
      ["required", "Can't be sent empty.", "<input required>"],
    ]),
    quickCheck(
      "A user fills in a field, submits, and the server gets nothing for it. What's the most likely cause?",
      [
        "The field has no label",
        "The field has no `name`",
        "The button has no type",
      ],
      1,
      "Only fields with a `name` are sent. A missing label is a problem too, but it doesn't stop the value being sent.",
    ),
  ),
);
