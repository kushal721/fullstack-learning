import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Validation: why the server checks every request, what to check,
// noteValidation.js taken apart, where it runs and the 400 it causes, trimming
// step by step, allowlisting fields, params and query, schema libraries,
// sharing limits with the front end, mistakes, practice and a recap.
export const validationModule = moduleLesson(
  "validation",
  "Validation: checking every request",
  45,
  [
    "Explain why the server checks every request, whatever the browser checked.",
    "Check presence, type, length, format and allowed values, and answer 400 when they fail.",
    "Trim input before checking it, and save the cleaned value.",
    "Build saved objects from allowed fields only, never from the whole req.body.",
    "Validate URL params and query strings, and describe a schema with a library like zod.",
  ],

  part(
    "why",
    "Check every request on the server",
    explain(
      "The note form has `maxLength={100}` and `required`, so why check again? Because the browser is on the other side of the [[trust-boundary|trust boundary]]. Anyone can open DevTools, change the page, or skip the browser and send a request with curl. Whatever the form allowed, the server must check every request itself.",
    ),
    diagram([
      ["Browser", "checks for comfort"],
      ["Trust boundary", "anyone can send anything"],
      ["Server", "checks for real"],
      ["Database", "only clean data"],
    ]),
    keyPoints(
      "Browser checks are for quick feedback, not protection.",
      "The server can't tell a browser from curl.",
      "Bad data that reaches the database stays there.",
    ),
  ),

  part(
    "what-to-check",
    "What to check",
    explain(
      "Validation means comparing the [[request-body|request body]] (and the URL) against your rules before you use it. Most rules fall into five kinds. Start with presence and type: if a field that should be text is a number or missing, every other check on it is meaningless.",
    ),
    reference("Five kinds of check", [
      ["Presence", "Is the field there and not empty?", "title is required"],
      [
        "Type",
        "Is it the kind of value you expect?",
        'typeof title === "string"',
      ],
      [
        "Length / range",
        "Not too long, short, big or small.",
        "title ≤ 100 characters",
      ],
      ["Format", "Does it match a pattern?", "an email has an @"],
      ["Allowed values", "Is it one of a fixed set?", '"asc" or "desc"'],
    ]),
  ),

  part(
    "note-validation",
    "noteValidation.js taken apart",
    explain(
      "The Notes App keeps its rules in one small function. It returns an error message for the first problem it finds, or nothing (`undefined`) when the note is fine. It has no `req` or `res`, so tests can call it directly and any controller can use it.",
    ),
    code(
      "js",
      "validateNote (rewrapped)",
      [
        "export function validateNote(body) {",
        "  const title =",
        '    typeof body?.title === "string"',
        "      ? body.title.trim()",
        '      : "";',
        '  const content = body?.content ?? "";',
        '  if (!title) return "Title is required";',
        "  if (title.length > MAX_TITLE_LENGTH)",
        '    return "Title must be at most …";',
        '  if (typeof content !== "string")',
        '    return "Content must be text";',
        "  if (content.length > MAX_CONTENT_LENGTH)",
        '    return "Content must be at most …";',
        "}",
      ],
      {
        3: "type: not a string counts as missing",
        4: "trim first, so spaces alone aren't a title",
        6: "?. and ?? survive a missing body",
        7: "presence",
        8: "length: 100 characters",
        14: "no return: undefined means valid",
      },
    ),
    inTheNotesApp(
      "`validateNote` and the two limits, `MAX_TITLE_LENGTH` and `MAX_CONTENT_LENGTH`, live in their own file.",
      { fileId: "backend/src/validation/noteValidation.js" },
    ),
  ),

  part(
    "where",
    "Where it runs, and the 400",
    explain(
      "Validation runs in the [[controller]], before anything touches the database. If it fails, the controller answers 400 with the message and stops. That's a [[validation-error|validation error]]: the client sent something the server won't accept, and the message says what to fix.",
    ),
    anatomy(
      "The first lines of createNote",
      [
        "const error = validateNote(req.body);",
        "if (error) {",
        "  return res.status(400).json({ error });",
        "}",
      ],
      [
        ["validateNote(req.body)", "check", "Runs before any query."],
        ["if (error)", "failed?", "A message means the note is invalid."],
        ["return", "stop here", "Without it, the code goes on to save."],
        ["400", "Bad Request", "The client must change the request."],
        ["{ error }", "the reason", 'e.g. { "error": "Title is required" }.'],
      ],
    ),
    code(
      "http",
      "What the client sees",
      [
        "POST /api/notes HTTP/1.1",
        "Content-Type: application/json",
        "",
        '{ "title": "   " }',
        "",
        "HTTP/1.1 400 Bad Request",
        '{ "error": "Title is required" }',
      ],
      {
        4: "only spaces: empty once trimmed",
        6: "nothing was saved",
      },
    ),
  ),

  part(
    "trim",
    "Clean it, then check it",
    explain(
      'Normalising means tidying input before you check it: trimming spaces, for example. Check the cleaned value, then save the same cleaned value. The Notes App trims inside `validateNote` and again when it saves (`title.trim()`), so `"  Milk "` is stored as `"Milk"`. Step through a body with a bad `content`.',
    ),
    trace(
      'Validating { title: " Milk ", content: 5 }',
      [
        "function validateNote(body) {",
        "  const title =",
        '    typeof body?.title === "string"',
        '      ? body.title.trim() : "";',
        '  const content = body?.content ?? "";',
        '  if (!title) return "Title is required";',
        "  if (title.length > 100)",
        '    return "Title is too long";',
        '  if (typeof content !== "string")',
        '    return "Content must be text";',
        "}",
        'validateNote({ title: " Milk ", content: 5 });',
      ],
      [
        {
          line: 12,
          note: "A request arrives whose title has spaces around it and whose content is a number.",
        },
        {
          line: 2,
          note: "The title is a string, so it's trimmed: the spaces are gone.",
          vars: [
            ["body", '{ title: " Milk ", content: 5 }'],
            ["title", '"Milk"'],
          ],
          stack: ["validateNote"],
        },
        {
          line: 5,
          note: "`content` is 5. `??` only replaces null or undefined, so 5 stays.",
          vars: [
            ["body", '{ title: " Milk ", content: 5 }'],
            ["title", '"Milk"'],
            ["content", "5"],
          ],
          stack: ["validateNote"],
        },
        {
          line: 6,
          note: '`"Milk"` isn\'t empty, so the presence check passes.',
          vars: [
            ["body", '{ title: " Milk ", content: 5 }'],
            ["title", '"Milk"'],
            ["content", "5"],
          ],
          stack: ["validateNote"],
        },
        {
          line: 7,
          note: "4 characters, well under 100: the length check passes.",
          vars: [
            ["body", '{ title: " Milk ", content: 5 }'],
            ["title", '"Milk"'],
            ["content", "5"],
          ],
          stack: ["validateNote"],
        },
        {
          line: 9,
          note: '`typeof 5` is `"number"`, not `"string"`, so the function returns a message. The controller answers 400.',
          vars: [
            ["body", '{ title: " Milk ", content: 5 }'],
            ["title", '"Milk"'],
            ["content", "5"],
          ],
          stack: ["validateNote"],
          output: '"Content must be text"',
        },
      ],
    ),
  ),

  part(
    "allowlist",
    "Save only the fields you expect",
    explain(
      "Never save `req.body` as it is. A request can carry fields your form never had, such as `user_id: 1`, to put a note in someone else's account, or `isAdmin: true`. Copying a whole body into the database is called mass assignment. Use an [[allowlist]] instead: pick the fields you expect by name, and set the rest, like the owner, from trusted values.",
    ),
    code(
      "js",
      "Spreading the body vs picking fields",
      [
        '// req.body: { title: "Hi", user_id: 1 }',
        "",
        "// ✗ the client chooses the owner",
        "await saveNote({ ...req.body });",
        "",
        "// ✓ only title and content, owner from",
        "// the login cookie",
        'const { title, content = "" } = req.body;',
        "await saveNote({",
        "  title: title.trim(),",
        "  content,",
        "  userId: req.user.id,",
        "});",
      ],
      {
        4: "user_id: 1 goes straight into the row",
        8: "everything else in the body is ignored",
        12: "set by requireAuth, not by the client",
      },
    ),
    inTheNotesApp(
      "`createNote` reads only `title` and `content` from the body; the owner always comes from `req.user.id`.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    quickCheck(
      'A client sends `{ "title": "Hi", "user_id": 1 }` to `POST /api/notes`. What should happen to `user_id`?',
      [
        "Save it: the client knows its own id",
        "Ignore it: the owner comes from the logged-in user",
        "Answer 500",
      ],
      1,
      "The owner is decided by the server from the login, never by the body. Picking only title and content means extra fields are simply dropped.",
    ),
  ),

  part(
    "params-query",
    "Params and query strings too",
    explain(
      "The body isn't the only input. [[path-parameter|Path parameters]] and [[query-parameter|query parameters]] are text too, and anyone can type anything into a URL. `/api/notes/abc` or `?limit=-5` must be caught before they reach a query. The Notes App's `noteId` turns the id into a number and answers 404 when it can't be a note.",
    ),
    code(
      "js",
      "noteId and a checked query",
      [
        "function noteId(req) {",
        "  const id = Number(req.params.id);",
        "  return Number.isInteger(id) && id > 0",
        "    ? id",
        "    : null;",
        "}",
        "",
        "// GET /api/notes?sort=asc",
        'const sort = req.query.sort ?? "desc";',
        'if (!["asc", "desc"].includes(sort)) {',
        "  return res.status(400)",
        '    .json({ error: "Bad sort" });',
        "}",
      ],
      {
        2: '"abc" becomes NaN, "1.5" becomes 1.5',
        3: "only whole numbers above 0",
        10: "allowed values (not in the Notes App)",
      },
    ),
    inTheNotesApp(
      "`noteId(req)` makes `/api/notes/abc` a 404 instead of a database error.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "schemas",
    "Schema libraries such as zod",
    explain(
      "Hand-written ifs get long as data grows. [[schema-validation|Schema validation]] describes the shape once and checks any value against it. zod is a popular choice: it reports every problem with the field it belongs to, trims, applies defaults, and drops unknown fields, so it allowlists for you. The Notes App doesn't use it; this is how it could.",
    ),
    code(
      "js",
      "A note schema in zod (not in the Notes App)",
      [
        'import { z } from "zod";',
        "",
        "const NoteInput = z.object({",
        "  title: z.string().trim().min(1).max(100),",
        '  content: z.string().max(10000).default(""),',
        "});",
        "",
        "const result = NoteInput.safeParse(req.body);",
        "if (!result.success) {",
        "  return res.status(400)",
        "    .json({ errors: result.error.issues });",
        "}",
        "const { title, content } = result.data;",
      ],
      {
        4: "type, trim, presence and length in one line",
        8: "safeParse returns a result instead of throwing",
        11: "every problem, each with its field (path)",
        13: "clean data: trimmed, defaulted, no extra fields",
      },
    ),
    keyPoints(
      "One schema replaces a page of ifs.",
      "Unknown fields such as user_id are stripped by default.",
      "result.data is the cleaned value: save that, not req.body.",
    ),
  ),

  part(
    "shared-limits",
    "Sharing limits with the front end",
    explain(
      "The browser checks for speed and the server checks for real, so the same rule exists twice. If the server's limit becomes 200 but the form still says 100, they disagree. The backend exports `MAX_TITLE_LENGTH`, but the Notes App's form writes `maxLength={100}` by hand. A shared module, or one zod schema used on both sides, keeps them in step.",
    ),
    inTheNotesApp(
      "The title input has `maxLength={100}` written out, a copy of the server's `MAX_TITLE_LENGTH`.",
      { fileId: "frontend/src/components/NoteForm.jsx" },
    ),
    quickCheck(
      "The form already blocks titles over 100 characters. Does the server still need its length check?",
      [
        "No: the form makes it impossible",
        "Yes: requests can be sent without the form",
        "Only in production",
      ],
      1,
      "curl, a script or an edited page can send any title. The form's check is for convenience; only the server's check protects the data.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Trusting the browser's checks",
      wrong: [
        "// the form has maxLength, so:",
        "await saveNote(req.body.title);",
      ],
      problem:
        "A request sent with curl skips the form, so a million-character title or a number goes straight into the database.",
      right: [
        "const error = validateNote(req.body);",
        "if (error) {",
        "  return res.status(400).json({ error });",
        "}",
      ],
      why: "Only checks on the server count. The browser's are a convenience.",
    }),
    mistake({
      title: "Checking one value, saving another",
      wrong: [
        "if (!req.body.title.trim()) { … }",
        "await saveNote(req.body.title);",
      ],
      problem:
        '`"  Milk  "` passes and is saved with its spaces, so it looks different from `"Milk"` in lists and searches.',
      right: [
        "const title = req.body.title.trim();",
        "if (!title) { … }",
        "await saveNote(title);",
      ],
      why: "Clean the value once, then check and save that same value.",
    }),
    mistake({
      title: "Crashing on a missing body",
      wrong: ["if (!req.body.title) { … }"],
      problem:
        "A request with no JSON body leaves `req.body` undefined, so reading `.title` throws and the user gets a 500 instead of a 400.",
      right: ["if (!req.body?.title) { … }"],
      why: "Expect anything, including nothing. `?.` turns a missing body into a validation error.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Errors by field",
      task: 'Write `validateNote(body)` that returns an object of field → message. `title` must be a non-empty string after trimming (`"Title is required"`) of at most 100 characters (`"Title is too long"`). `content` is optional but, if given, must be a string (`"Content must be text"`). A valid note gives `{}`.',
      starter: [
        "function validateNote(body) {",
        "  const errors = {};",
        "  return errors;",
        "}",
      ],
      tests: [
        ['validateNote({ title: "Milk" })', "{}"],
        ['validateNote({ title: "  " })', '{ title: "Title is required" }'],
        ["validateNote({})", '{ title: "Title is required" }'],
        [
          'validateNote({ title: "x".repeat(101), content: 5 })',
          '{ title: "Title is too long", content: "Content must be text" }',
        ],
      ],
      hint: 'Trim only if `typeof body.title === "string"`. Check content with `body.content !== undefined`.',
      solution: [
        "function validateNote(body) {",
        "  const errors = {};",
        "  const t = body.title;",
        '  const title = typeof t === "string" ? t.trim() : "";',
        '  if (!title) errors.title = "Title is required";',
        "  else if (title.length > 100)",
        '    errors.title = "Title is too long";',
        "  const c = body.content;",
        '  if (c !== undefined && typeof c !== "string")',
        '    errors.content = "Content must be text";',
        "  return errors;",
        "}",
      ],
    }),
    yourTurn({
      title: "Pick allowed fields",
      task: "Write `pick(body, allowed)`: a new object with only the keys in the `allowed` array that `body` actually has. Everything else, such as `user_id`, is dropped.",
      starter: ["function pick(body, allowed) {", "  return { ...body };", "}"],
      tests: [
        [
          'pick({ title: "Hi", user_id: 1 }, ["title", "content"])',
          '{ title: "Hi" }',
        ],
        [
          'pick({ title: "Hi", content: "x" }, ["title", "content"])',
          '{ title: "Hi", content: "x" }',
        ],
        ['pick({ isAdmin: true }, ["title"])', "{}"],
      ],
      hint: "Loop over `allowed` and copy `body[key]` when `key in body`.",
      solution: [
        "function pick(body, allowed) {",
        "  const out = {};",
        "  for (const key of allowed) {",
        "    if (key in body) out[key] = body[key];",
        "  }",
        "  return out;",
        "}",
      ],
    }),
    yourTurn({
      title: "A note id from the URL",
      task: "Write `parseId(text)`: the id as a number when `text` is a whole number above 0, otherwise `null`.",
      starter: ["function parseId(text) {", "  return Number(text);", "}"],
      tests: [
        ['parseId("7")', "7"],
        ['parseId("abc")', "null"],
        ['parseId("-1")', "null"],
        ['parseId("1.5")', "null"],
      ],
      hint: "`Number.isInteger(id) && id > 0`.",
      solution: [
        "function parseId(text) {",
        "  const id = Number(text);",
        "  return Number.isInteger(id) && id > 0",
        "    ? id",
        "    : null;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Validation cheat sheet", [
      [
        "Where",
        "On the server, in the controller, before the database.",
        "validateNote(req.body)",
      ],
      [
        "What",
        "Presence, type, length, format, allowed values.",
        'typeof title === "string"',
      ],
      [
        "When it fails",
        "400 with a message saying what to fix.",
        '{ "error": "Title is required" }',
      ],
      [
        "Normalise",
        "Clean first, then check and save that value.",
        "title.trim()",
      ],
      [
        "Allowlist",
        "Pick named fields; never save req.body as is.",
        "const { title, content } = req.body",
      ],
      [
        "Params, query",
        "Text from the URL: convert and check it too.",
        "Number(req.params.id)",
      ],
      [
        "Schema library",
        "Describe the shape once, check, get clean data.",
        "NoteInput.safeParse(req.body)",
      ],
      [
        "Shared limits",
        "One constant or schema for client and server.",
        "MAX_TITLE_LENGTH",
      ],
    ]),
    quickCheck(
      "Which of these does the server have to check itself?",
      [
        "Only fields the form doesn't check",
        "Everything in the request: body, params and query",
        "Nothing, if the front end validates",
      ],
      1,
      "Every part of a request can be changed by whoever sends it. The server checks it all, whatever the browser did.",
    ),
  ),
);
