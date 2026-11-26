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
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Validation errors: never trust the client, 400 or 422, every field's
// errors at once step by step, problem details taken apart, the client
// reading the error, errors next to their inputs, the Notes App, mistakes,
// practice and a recap.
export const validationErrorsModule = moduleLesson(
  "validation-errors",
  "Validation errors people can fix",
  45,
  [
    "Explain why the server validates every request, whatever the browser already checked.",
    "Choose between 400 and 422 for bad input, and use the same rule everywhere.",
    "Return every field's error at once, in one consistent shape such as problem details.",
    "Read an error body on the client and show each message next to its input, for everyone.",
  ],

  part(
    "never-trust",
    "Never trust the client",
    explain(
      "Your form checks the title, but the API can't rely on that. Anyone can send a request with curl, an old version of your app or a script. So the server checks every request itself. When the data breaks a rule, it answers with a [[validation-error|validation error]]: a 4xx status and a body saying what's wrong, so the person can fix it and try again.",
    ),
    analogy(
      "A bank checks every form handed in at the counter, even though the form had boxes telling you what to write. The boxes help honest people; the check stops mistakes.",
    ),
    keyPoints(
      "Browser checks are for quick, helpful messages.",
      "Server checks are the real ones: every request, every field.",
      "Bad input is the client's problem: a 4xx, never a 500.",
      "Say exactly what to fix, field by field.",
    ),
  ),

  part(
    "status",
    "400 or 422?",
    explain(
      "`400 Bad Request` means the request itself can't be read: JSON that won't parse, or the wrong types. `422 Unprocessable Content` means it was read fine, but the data breaks a rule, like an empty title. Many APIs use 400 for both, and that's fine too. Pick one rule, write it down and use it everywhere.",
    ),
    reference("Which status for which problem", [
      [
        "400 Bad Request",
        "The request can't be read: broken JSON, wrong types.",
        '{"title": ',
      ],
      [
        "422 Unprocessable",
        "Readable, but the data breaks a rule.",
        '{"title": ""}',
      ],
      [
        "409 Conflict",
        "Clashes with what's already stored.",
        "That email is already registered",
      ],
      [
        "401 / 403",
        "Who you are, or what you may do: not validation.",
        "No login cookie",
      ],
    ]),
    quickCheck(
      'A client sends `{"title": ""}`: valid JSON, but an empty title. Which answer fits best?',
      [
        "422, or 400 if that's the API's rule",
        "500 Internal Server Error",
        "404 Not Found",
      ],
      0,
      "The request was understood; the data breaks a rule. That's a 4xx the person can fix: 422, or 400 in APIs that use it for all bad input.",
    ),
  ),

  part(
    "every-field",
    "Every problem at once, step by step",
    explain(
      "If the server stops at the first problem, the person fixes the title, sends again, and only then learns the content is wrong too. Check every field and collect the messages in an object keyed by field name, so a form can put each one next to its input. Step through a note with two problems.",
    ),
    trace(
      "A note with two problems",
      [
        "function validateNote(note) {",
        "  const errors = {};",
        '  const title = (note.title ?? "").trim();',
        "  if (!title) {",
        '    errors.title = "Title is required";',
        "  } else if (title.length > 100) {",
        '    errors.title = "At most 100 characters";',
        "  }",
        '  if (typeof note.content !== "string") {',
        '    errors.content = "Content must be text";',
        "  }",
        "  return errors;",
        "}",
        'validateNote({ title: "  ", content: 42 });',
      ],
      [
        {
          line: 14,
          note: "The request body arrives: a title of only spaces, and a number as content.",
        },
        {
          line: 2,
          note: "An empty object will collect one message per broken field.",
          vars: [
            ["note", '{ title: "  ", content: 42 }'],
            ["errors", "{}"],
          ],
          stack: ["validateNote"],
        },
        {
          line: 3,
          note: "Trimming leaves nothing: spaces only counts as empty.",
          vars: [
            ["note", '{ title: "  ", content: 42 }'],
            ["errors", "{}"],
            ["title", '""'],
          ],
          stack: ["validateNote"],
        },
        {
          line: 5,
          note: "The first problem is recorded, and the function carries on.",
          vars: [
            ["note", '{ title: "  ", content: 42 }'],
            ["errors", '{ title: "Title is required" }'],
            ["title", '""'],
          ],
          stack: ["validateNote"],
        },
        {
          line: 10,
          note: "42 isn't a string, so content gets its own message.",
          vars: [
            ["note", '{ title: "  ", content: 42 }'],
            [
              "errors",
              '{ title: "Title is required", content: "Content must be text" }',
            ],
            ["title", '""'],
          ],
          stack: ["validateNote"],
        },
        {
          line: 12,
          note: "Both problems go back in one answer. An empty object would mean the note is valid.",
          vars: [
            ["note", '{ title: "  ", content: 42 }'],
            [
              "errors",
              '{ title: "Title is required", content: "Content must be text" }',
            ],
            ["title", '""'],
          ],
          stack: ["validateNote"],
          output: "{ title: …, content: … }",
        },
      ],
    ),
  ),

  part(
    "problem-details",
    "One shape for every error",
    explain(
      "Clients are simpler when every error looks the same, whether it's a bad field, a missing note or a crash: one function reads them all. You can invent a shape, but there's a standard one, [[problem-details|problem details]], sent with `Content-Type: application/problem+json`. You may add your own fields, such as `errors` for field messages.",
    ),
    anatomy(
      "A validation problem",
      [
        '{ "type": "/problems/validation",',
        '  "title": "The note has errors",',
        '  "status": 422, "detail": "Fix 1 field.",',
        '  "errors": {"title": "Title is required"}}',
      ],
      [
        [
          '"type"',
          "which problem",
          "A URL naming the kind of problem. Clients can check it instead of the wording.",
        ],
        [
          '"title"',
          "short summary",
          "The same for every problem of this type.",
        ],
        ['"status"', "the status", "Repeats the HTTP status: handy in logs."],
        ['"detail"', "this time", "What went wrong in this request."],
        [
          '"errors"',
          "your extension",
          "Extra fields are allowed. Here: one message per field.",
        ],
      ],
    ),
    code(
      "js",
      "Sending it from the server",
      [
        "const errors = validateNote(req.body);",
        "if (Object.keys(errors).length > 0) {",
        "  return res",
        "    .status(422)",
        '    .type("application/problem+json")',
        "    .json({",
        '      type: "/problems/validation",',
        '      title: "The note has errors",',
        "      status: 422,",
        "      errors,",
        "    });",
        "}",
      ],
      {
        2: "an empty object means no problems",
        5: "says the body is problem details",
        10: "every field's message",
      },
    ),
  ),

  part(
    "client",
    "The client reads the error",
    explain(
      "A failed response is still a response. Check [[response-ok|response.ok]], read the JSON body, and throw an error that carries the field messages as well as the general one. Then the form can show each message where it belongs, and anything that isn't about one field still gets shown.",
    ),
    code(
      "js",
      "Turning an error body into an Error",
      [
        "if (!response.ok) {",
        "  const problem = await response",
        "    .json().catch(() => ({}));",
        "  const error = new Error(",
        '    problem.title ?? "Something went wrong",',
        "  );",
        "  error.fields = problem.errors ?? {};",
        "  throw error;",
        "}",
      ],
      {
        3: "some errors have no JSON body",
        5: "the general message",
        7: "field → message, for the form",
      },
    ),
  ),

  part(
    "form",
    "Errors next to their inputs",
    explain(
      'Keep the field errors in state as an object. Under each input, show its message, link the two with `aria-describedby` and set `aria-invalid`, so a screen reader reads the error along with the field. A general message with `role="alert"` is announced as soon as it appears.',
    ),
    code(
      "jsx",
      "Field errors from the server, in the form",
      [
        "try {",
        "  await createNote({ title, content });",
        "} catch (err) {",
        "  setErrors(err.fields ?? {});",
        "  setMessage(err.message);",
        "}",
        "",
        '<input id="title" value={title} …',
        "  aria-invalid={Boolean(errors.title)}",
        '  aria-describedby="title-error" />',
        '<p id="title-error">{errors.title}</p>',
        '<p role="alert">{message}</p>',
      ],
      {
        4: "field → message, straight into state",
        10: "read out with the input",
        12: "announced when it changes",
      },
    ),
  ),

  part(
    "notes-app",
    "The Notes App: one message",
    explain(
      "The Notes App does the simple version. `validateNote` returns only the first problem it finds, as a string, and `createNote` answers `400 { error }`. It uses 400 for every broken rule and doesn't send problem details. In the browser, `request.js` throws `new Error(data.error)`, and `NoteForm` shows that one message in its alert.",
    ),
    inTheNotesApp(
      "`validateNote` returns one message, or nothing when the note is valid.",
      { fileId: "backend/src/validation/noteValidation.js" },
    ),
    inTheNotesApp(
      "`request.js` throws the server's `error` message for any response that isn't ok.",
      { fileId: "frontend/src/services/request.js" },
    ),
    code(
      "js",
      "Per-field errors, if the app had them (not in the app)",
      [
        "// notesController.js: keep error, add errors",
        "return res.status(400).json({",
        '  error: "The note has errors",',
        '  errors, // { title: "Title is required" }',
        "});",
        "",
        "// request.js: keep both",
        "const err = new Error(data?.error);",
        "err.fields = data?.errors ?? {};",
        "throw err;",
      ],
      {
        3: "old code reading error still works",
        4: "new: one message per field",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Checking only in the browser",
      wrong: [
        "// the form already checks the title",
        "await saveNote(req.body);",
      ],
      problem:
        "A request sent with curl or a script skips the form, and empty or huge titles go straight into the database.",
      right: [
        "const errors = validateNote(req.body);",
        "if (Object.keys(errors).length > 0) {",
        "  return res.status(422).json({ errors });",
        "}",
      ],
      why: "The server is the only place every request passes through.",
    }),
    mistake({
      title: "Throwing on bad input",
      wrong: ['if (!title) throw new Error("No title");'],
      problem:
        "The error handler turns it into `500 Something went wrong`: the person can't tell what to fix, and your logs fill with false alarms.",
      right: [
        "if (!title) {",
        "  return res.status(422)",
        '    .json({ errors: { title: "Required" } });',
        "}",
      ],
      why: "Bad input is a 4xx with a message. Save 5xx for the server's own failures.",
    }),
    mistake({
      title: "A message the form can't place",
      language: "json",
      wrong: ['{ "error": "Invalid input" }'],
      problem: "Which field? The person has to guess what to change.",
      right: ['{ "errors": { "title": "Title is required" } }'],
      why: "Key each message by its field, so it can sit next to that input.",
    }),
    mistake({
      title: "An error shown only in red",
      language: "jsx",
      wrong: ['<p className="red">{errors.title}</p>'],
      problem:
        "Colour isn't announced, and someone tabbing to the input with a screen reader never hears the message.",
      right: [
        '<input aria-describedby="title-error" />',
        '<p id="title-error">{errors.title}</p>',
      ],
      why: "`aria-describedby` makes the message part of the input's description.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Every field's error",
      task: 'Write `validateNote(note)`, returning an object of field → message. Title: `"Title is required"` when missing or only spaces, `"Title is too long"` over 100 characters. Content: if it\'s there, it must be a string, else `"Content must be text"`. Return `{}` for a valid note.',
      starter: [
        "function validateNote(note) {",
        "  const errors = {};",
        "",
        "  return errors;",
        "}",
      ],
      tests: [
        ['validateNote({ title: "Milk", content: "2 l" })', "{}"],
        ['validateNote({ title: "   " })', '{ title: "Title is required" }'],
        ["validateNote({})", '{ title: "Title is required" }'],
        [
          'validateNote({ title: "x".repeat(101), content: 5 })',
          '{ title: "Title is too long", content: "Content must be text" }',
        ],
      ],
      hint: 'Use `(note.title ?? "").trim()` for the title. Check content only when `note.content !== undefined`.',
      solution: [
        "function validateNote(note) {",
        "  const errors = {};",
        '  const title = (note.title ?? "").trim();',
        '  if (!title) errors.title = "Title is required";',
        '  else if (title.length > 100) errors.title = "Title is too long";',
        "  const { content } = note;",
        '  if (content !== undefined && typeof content !== "string") {',
        '    errors.content = "Content must be text";',
        "  }",
        "  return errors;",
        "}",
      ],
    }),
    yourTurn({
      title: "Build problem details",
      task: 'Write `validationProblem(errors)`, which wraps a field → message object in problem details: `type` `"/problems/validation"`, `title` `"Your request has errors"`, `status` 422, `detail` `"2 fields need fixing."` (or `"1 field needs fixing."` for one), and `errors` itself.',
      starter: [
        "function validationProblem(errors) {",
        "  return { status: 400, errors };",
        "}",
      ],
      tests: [
        [
          'validationProblem({ title: "Title is required" })',
          '{ type: "/problems/validation", title: "Your request has errors", status: 422, detail: "1 field needs fixing.", errors: { title: "Title is required" } }',
        ],
        [
          'validationProblem({ title: "Too long", content: "Must be text" }).detail',
          '"2 fields need fixing."',
        ],
        ["validationProblem({ a: 1, b: 2, c: 3 }).status", "422"],
      ],
      hint: "Count the fields with `Object.keys(errors).length`, then pick the wording with `n === 1 ? … : …`.",
      solution: [
        "function validationProblem(errors) {",
        "  const n = Object.keys(errors).length;",
        "  return {",
        '    type: "/problems/validation",',
        '    title: "Your request has errors",',
        "    status: 422,",
        '    detail: n === 1 ? "1 field needs fixing." : `${n} fields need fixing.`,',
        "    errors,",
        "  };",
        "}",
      ],
    }),
    pageYourTurn({
      title: "Show the server's field error",
      task: 'The starter already stops the reload and calls a fake API that answers at once. On submit, put `res.body.errors.title` (or nothing) in `#title-error`, set the input\'s `aria-invalid` to `"true"` or `"false"`, and show `Saved` (status 201) or `Fix the errors below` in `#status`.',
      starter: [
        '<form><label>Title <input id="title" aria-describedby="title-error"></label>',
        '  <p id="title-error"></p> <button>Save</button></form>',
        '<p id="status" role="alert"></p>',
        "<script>",
        "  const fakeCreate = (note) => note.title.trim()",
        "    ? { status: 201, body: { id: 7 } }",
        '    : { status: 422, body: { errors: { title: "Title is required" } } };',
        '  const input = document.querySelector("#title");',
        '  document.querySelector("form").addEventListener("submit", (event) => {',
        "    event.preventDefault();",
        "    const res = fakeCreate({ title: input.value });",
        "",
        "  });",
        "</script>",
      ],
      checks: [
        { kind: "submit", label: "Save it empty", selector: "form" },
        {
          kind: "text",
          label: "The title's error",
          selector: "#title-error",
          text: "Title is required",
        },
        {
          kind: "attr",
          label: "The input is marked invalid",
          selector: "#title",
          name: "aria-invalid",
          value: "true",
        },
        {
          kind: "text",
          label: "A general message",
          selector: "#status",
          text: "Fix the errors below",
        },
        { kind: "type", label: "Type Milk", selector: "#title", value: "Milk" },
        { kind: "submit", label: "Save again", selector: "form" },
        {
          kind: "text",
          label: "The error is gone",
          selector: "#title-error",
          text: "",
        },
        { kind: "text", label: "Saved", selector: "#status", text: "Saved" },
      ],
      hint: 'Read `const errors = res.body.errors ?? {}`. Set `textContent` to `errors.title ?? ""`, and `input.setAttribute("aria-invalid", String(Boolean(errors.title)))`.',
      solution: [
        '<form><label>Title <input id="title" aria-describedby="title-error"></label>',
        '  <p id="title-error"></p> <button>Save</button></form>',
        '<p id="status" role="alert"></p>',
        "<script>",
        "  const fakeCreate = (note) => note.title.trim()",
        "    ? { status: 201, body: { id: 7 } }",
        '    : { status: 422, body: { errors: { title: "Title is required" } } };',
        '  const input = document.querySelector("#title");',
        '  document.querySelector("form").addEventListener("submit", (event) => {',
        "    event.preventDefault();",
        "    const res = fakeCreate({ title: input.value });",
        "    const errors = res.body.errors ?? {};",
        '    document.querySelector("#title-error").textContent = errors.title ?? "";',
        '    input.setAttribute("aria-invalid", String(Boolean(errors.title)));',
        '    document.querySelector("#status").textContent =',
        '      res.status === 201 ? "Saved" : "Fix the errors below";',
        "  });",
        "</script>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Validation errors cheat sheet", [
      ["Server checks", "Every request, whatever the browser checked."],
      [
        "400",
        "The request can't be read: bad JSON, wrong types.",
        '{"title": ',
      ],
      ["422", "Readable, but breaks a rule.", '{"title": ""}'],
      [
        "Field errors",
        "Every problem at once, keyed by field.",
        '{ "title": "Title is required" }',
      ],
      [
        "Problem details",
        "One standard shape for every error.",
        "type, title, status, detail",
      ],
      [
        "Content-Type",
        "Says the body is problem details.",
        "application/problem+json",
      ],
      ["Extension", "Your own extra fields.", '"errors": { … }'],
      [
        "Client",
        "Check ok, read the body, keep the fields.",
        "error.fields = problem.errors",
      ],
      [
        "aria-describedby",
        "Ties a message to its input.",
        '<input aria-describedby="title-error">',
      ],
      [
        "role=alert",
        "Announces a message when it appears.",
        '<p role="alert">',
      ],
    ]),
    quickCheck(
      "Why send every field's error at once instead of stopping at the first?",
      [
        "It's faster for the server",
        "The person can fix everything in one go, each message next to its field",
        "HTTP only allows one request per form",
      ],
      1,
      "Stopping at the first problem means fix, resend, discover the next problem. A map of field → message lets the form show them all, each where it belongs.",
    ),
  ),
);
