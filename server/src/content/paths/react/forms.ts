import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Forms: controlled inputs, a controlled input taken apart, the submit
// handler, a save step by step, many fields in one object, checkboxes and
// selects, validation and errors, uncontrolled forms, the Notes App,
// mistakes, practice and a recap.
export const formsModule = moduleLesson(
  "forms",
  "Forms",
  50,
  [
    "Write controlled inputs whose value lives in state.",
    "Handle a submit: stop the reload, send the data, then clear or show an error.",
    "Keep several fields in one state object, including checkboxes and selects.",
    "Validate input and show errors people can see and hear.",
    "Choose between controlled inputs and reading the form with FormData.",
  ],

  part(
    "controlled",
    "Inputs whose value lives in state",
    explain(
      "An input normally keeps its own text. In React you usually keep it in state instead: the input shows the state, and every key press updates the state. That's a [[react-controlled-form|controlled form]]. Your code always knows what's typed, so it can check it, clear it or use it elsewhere on the page.",
    ),
    anatomy(
      "A controlled input",
      [
        "<input",
        "  value={title}",
        "  onChange={(e) => setTitle(e.target.value)}",
        "/>",
      ],
      [
        [
          "value={title}",
          "shows state",
          "The input always displays the state.",
        ],
        [
          "onChange",
          "every key",
          "Runs on each change, not just when you leave.",
        ],
        [
          "setTitle",
          "stores it",
          "New state, a re-render, and the input shows it.",
        ],
        ["e.target.value", "the new text", "What the input would now contain."],
      ],
    ),
  ),

  part(
    "submit",
    "Handling the submit",
    explain(
      "Put the handler on the form's `onSubmit`, not on the button's `onClick`: then pressing Enter in a field submits too. Its first job is `event.preventDefault()`, so the browser doesn't reload the page. Then send the data, and clear the fields only once it's saved.",
    ),
    code(
      "jsx",
      "A form that saves",
      [
        "async function handleSave(event) {",
        "  event.preventDefault();",
        "  setIsSaving(true);",
        "  try {",
        "    const note = await createNote({ title, content });",
        "    onSaved(note);",
        '    setTitle("");',
        "  } catch (err) {",
        "    setError(err.message);",
        "  } finally {",
        "    setIsSaving(false);",
        "  }",
        "}",
        "<form onSubmit={handleSave}>…</form>",
      ],
      {
        2: "no page reload: we send it ourselves",
        5: "wait for the server",
        7: "clear only after it worked",
        9: "on failure, keep the text and say why",
      },
    ),
  ),

  part(
    "step-by-step",
    "A save, step by step",
    explain(
      "Step through saving a note, including what the screen shows while it waits. Watch the button: it says “Saving…” and is disabled, so a double click can't send the note twice.",
    ),
    trace(
      "Saving “Milk”",
      [
        "async function handleSave(event) {",
        "  event.preventDefault();",
        "  setIsSaving(true);",
        "  try {",
        "    const note = await createNote({ title });",
        "    onSaved(note);",
        '    setTitle("");',
        "  } catch (err) {",
        "    setError(err.message);",
        "  }",
        "  setIsSaving(false);",
        "}",
        "<button disabled={isSaving}>",
        '  {isSaving ? "Saving…" : "Save"}',
        "</button>",
      ],
      [
        {
          line: 2,
          note: "You type Milk and press Enter. The form submits; the page would reload, but `preventDefault` stops it.",
          vars: [["title", '"Milk"']],
        },
        {
          line: 14,
          note: "`isSaving` is now true, so the button re-renders disabled, saying Saving….",
          vars: [["isSaving", "true"]],
          output: "[Saving…] (disabled)",
        },
        {
          line: 5,
          note: "The request goes to the server. The function pauses here until the answer comes back.",
          vars: [["title", '"Milk"']],
        },
        {
          line: 6,
          note: "Saved. The parent is told about the new note, so it can add it to the list.",
          vars: [["note", '{ id: 7, title: "Milk" }']],
        },
        {
          line: 7,
          note: "Only now is the input cleared, ready for the next note.",
          vars: [["title", '""']],
        },
        {
          line: 11,
          note: "Success or failure, saving is over: the button is enabled again. Had it failed, line 9 would show the error and the text would stay.",
          vars: [["isSaving", "false"]],
          output: "[Save]",
        },
      ],
    ),
  ),

  part(
    "many-fields",
    "Many fields, one object",
    explain(
      "A form with many fields can keep them in one object. Give each input a `name` matching its key, and one handler copies the object and replaces the field that changed. The `[name]` in brackets is a *computed* key: the key is whatever `name` holds.",
    ),
    code(
      "jsx",
      "One handler for every field",
      [
        'const [form, setForm] = useState({ email: "", password: "" });',
        "",
        "function handleChange(e) {",
        "  setForm({ ...form, [e.target.name]: e.target.value });",
        "}",
        "",
        '<input name="email" value={form.email} onChange={handleChange} />',
      ],
      {
        4: "a new object: copy, then override one field",
        7: "name says which field this input is",
      },
    ),
  ),

  part(
    "other-inputs",
    "Checkboxes, selects and text areas",
    explain(
      "Most inputs work the same way, with one exception: a checkbox's state is `checked`, not `value`. In React a `<textarea>` and a `<select>` take a `value` prop too, instead of text between the tags or a `selected` option.",
    ),
    reference("Controlled inputs", [
      ["Text", "value and e.target.value.", "<input value={title} />"],
      ["Textarea", "Same as text, with value.", "<textarea value={content} />"],
      [
        "Checkbox",
        "checked and e.target.checked.",
        '<input type="checkbox" checked={done} />',
      ],
      ["Select", "value on the select.", "<select value={sort}>…</select>"],
      ["Number", "The value is still text.", "Number(e.target.value)"],
    ]),
  ),

  part(
    "validation",
    "Validating and showing errors",
    explain(
      'Check input in two places. HTML attributes like `required` and `maxLength` give instant [[form-validation|browser checks]]. Your submit handler checks again and sets an error. Show it next to the form with `role="alert"`, so screen readers announce it. And the server must check again: anyone can skip your form.',
    ),
    code(
      "jsx",
      "An error everyone notices",
      [
        "if (!title.trim()) {",
        '  setError("Give the note a title.");',
        "  return;",
        "}",
        "",
        "{error && (",
        '  <p className="form-error" role="alert">{error}</p>',
        ")}",
      ],
      {
        1: "spaces only counts as empty",
        3: "stop: don't send it",
        7: "role=alert: read out as soon as it appears",
      },
    ),
    quickCheck(
      "The form checks that the title isn't empty. Does the server still need to check?",
      [
        "No, the form already checked",
        "Yes: requests can be sent without the form",
        "Only for long titles",
      ],
      1,
      "Form checks are for a quick, helpful message. Anyone can send a request directly, so the server must validate everything too.",
    ),
  ),

  part(
    "uncontrolled",
    "Reading the form when it's sent",
    explain(
      "For a simple form you don't need to check as people type, you can skip the state. Leave the inputs [[uncontrolled-input|uncontrolled]], and read them all on submit with `FormData`, using each input's `name`.",
    ),
    code(
      "jsx",
      "No state at all",
      [
        "function handleSubmit(event) {",
        "  event.preventDefault();",
        "  const data = new FormData(event.currentTarget);",
        '  search(data.get("query"));',
        "}",
        "",
        "<form onSubmit={handleSubmit}>",
        '  <input name="query" />',
        "</form>",
      ],
      {
        3: "every named field in the form",
        4: "read by name",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App's form",
    explain(
      '`NoteForm` is a controlled form: `title` and `content` in state, `onSubmit` calling `handleSave`, “Saving…” on a disabled button while it waits, and an error with `role="alert"`. It clears the fields only after the note is saved, and passes the new note up with `onSaved`.',
    ),
    inTheNotesApp(
      "`NoteForm` is a complete controlled form: state, a submit handler, a saving state and an error.",
      { fileId: "frontend/src/components/NoteForm.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A value with no onChange",
      language: "jsx",
      wrong: ["<input value={title} />"],
      problem:
        "The input always shows `title`, and nothing updates it, so typing does nothing. React warns.",
      right: [
        "<input value={title}",
        "  onChange={(e) => setTitle(e.target.value)} />",
      ],
      why: "A controlled input needs both: the value, and a handler that updates it.",
    }),
    mistake({
      title: "Saving on the button's click",
      language: "jsx",
      wrong: ["<button onClick={handleSave}>Save</button>"],
      problem:
        "Enter doesn't save, and without `preventDefault` on the submit the page reloads.",
      right: [
        "<form onSubmit={handleSave}>",
        "  …",
        '  <button type="submit">Save</button>',
        "</form>",
      ],
      why: "Handle the form's submit event, and prevent the default.",
    }),
    mistake({
      title: "Clearing too early",
      language: "jsx",
      wrong: ['setTitle("");', "await createNote({ title });"],
      problem:
        "If saving fails, the text is already gone, and the request may even send an empty title.",
      right: ["await createNote({ title });", 'setTitle("");'],
      why: "Clear the form only after the save succeeds.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Check before sending",
      task: 'Write `validateNote({ title })`. Return `"Title is required"` when the title is empty or only spaces, `"Title is too long"` when it has more than 100 characters, and `null` when it\'s fine.',
      starter: ["function validateNote({ title }) {", "", "}"],
      tests: [
        ['validateNote({ title: "Milk" })', "null"],
        ['validateNote({ title: "   " })', '"Title is required"'],
        ['validateNote({ title: "x".repeat(101) })', '"Title is too long"'],
      ],
      hint: 'Use `title.trim() === ""` for the first check and `title.length > 100` for the second.',
      solution: [
        "function validateNote({ title }) {",
        '  if (title.trim() === "") return "Title is required";',
        '  if (title.length > 100) return "Title is too long";',
        "  return null;",
        "}",
      ],
    }),
    pageYourTurn({
      title: "Add from a form",
      task: "The starter already stops the reload. On submit, if the input is empty, show `Write something first` in `#error`. Otherwise add an `<li>` with the text to `#notes`, empty `#error` and clear the input.",
      starter: [
        '<form><input id="title" aria-label="Title"> <button>Add</button></form>',
        '<p id="error" role="alert"></p>',
        '<ul id="notes"></ul>',
        "<script>",
        '  const input = document.querySelector("#title");',
        '  const error = document.querySelector("#error");',
        '  document.querySelector("form").addEventListener("submit", (event) => {',
        "    event.preventDefault();",
        "",
        "  });",
        "</script>",
      ],
      checks: [
        { kind: "submit", label: "Send it empty", selector: "form" },
        {
          kind: "text",
          label: "An error",
          selector: "#error",
          text: "Write something first",
        },
        { kind: "type", label: "Type Milk", selector: "#title", value: "Milk" },
        { kind: "submit", label: "Send it", selector: "form" },
        {
          kind: "text",
          label: "Milk is added",
          selector: "#notes li",
          text: "Milk",
        },
        {
          kind: "text",
          label: "The error is gone",
          selector: "#error",
          text: "",
        },
        {
          kind: "submit",
          label: "Send again: the input was cleared",
          selector: "form",
        },
        {
          kind: "count",
          label: "Still one note",
          selector: "#notes li",
          count: 1,
        },
      ],
      hint: 'Check `input.value.trim()`. To add: create an `li`, set its `textContent`, `append` it, then `input.value = ""`.',
      solution: [
        '<form><input id="title" aria-label="Title"> <button>Add</button></form>',
        '<p id="error" role="alert"></p>',
        '<ul id="notes"></ul>',
        "<script>",
        '  const input = document.querySelector("#title");',
        '  const error = document.querySelector("#error");',
        '  document.querySelector("form").addEventListener("submit", (event) => {',
        "    event.preventDefault();",
        "    if (!input.value.trim()) {",
        '      error.textContent = "Write something first";',
        "      return;",
        "    }",
        '    const li = document.createElement("li");',
        "    li.textContent = input.value;",
        '    document.querySelector("#notes").append(li);',
        '    error.textContent = "";',
        '    input.value = "";',
        "  });",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Forms cheat sheet", [
      [
        "Controlled",
        "value from state, onChange sets it.",
        "value={t} onChange={…}",
      ],
      ["Submit", "On the form, prevent the reload.", "<form onSubmit={save}>"],
      ["Saving state", "Disable while waiting.", "disabled={isSaving}"],
      ["Clear", "Only after success.", 'setTitle("")'],
      ["Errors", "In state, shown with role=alert.", '<p role="alert">'],
      [
        "Many fields",
        "One object, computed keys.",
        "{ ...form, [name]: value }",
      ],
      ["Checkbox", "checked, not value.", "e.target.checked"],
      ["FormData", "Read an uncontrolled form on submit.", 'data.get("query")'],
    ]),
    quickCheck(
      "Why put the save handler on the form's `onSubmit` rather than the button's `onClick`?",
      [
        "onClick doesn't work on buttons",
        "Pressing Enter in a field submits the form too",
        "onSubmit runs faster",
      ],
      1,
      "The submit event fires for the button and for Enter in any field. Handling it in one place covers both, and it's where you prevent the reload.",
    ),
  ),
);
