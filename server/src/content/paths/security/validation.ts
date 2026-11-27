import {
  anatomy,
  code,
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

// Validation as a security layer: what it stops and what it can't, allowlists
// vs denylists, repairing input step by step, allowlists for every kind of
// field, types JSON can carry, mass assignment, body size limits, the 413 in
// the Notes App, mistakes, practice and a recap.
export const validationModule = moduleLesson(
  "validation",
  "Validating input on the server",
  40,
  [
    "Explain what server-side validation stops, and what it can't stop on its own.",
    "Prefer allowlists (what's allowed) to denylists (what's banned), and say why.",
    "Refuse bad input instead of trying to repair it.",
    "Prevent mass assignment by picking fields by name and refusing unknown ones.",
    "Limit the size of request bodies and fields, and answer 413 or 400.",
  ],

  part(
    "why",
    "Validation as a security layer",
    explain(
      "You met [[input-validation|input validation]] in Backend: presence, type, length, format and allowed values, checked on the server, with a 400 when they fail. For security, it's the first layer. It stops wrong types, huge values and fields you never asked for before they reach your code. But a title can be valid and still hold a script, so it's never the only layer.",
    ),
    keyPoints(
      "Validation checks shape: type, size, format, allowed values.",
      "It stops whole classes of attack before any other code runs.",
      "Valid text can still be dangerous in SQL or HTML. Later layers handle that.",
    ),
    inTheNotesApp(
      "`validateNote` checks type and length; every note route runs it before touching the database.",
      { fileId: "backend/src/validation/noteValidation.js" },
    ),
  ),

  part(
    "allow-vs-deny",
    "Allowlists beat denylists",
    explain(
      "A [[denylist]] lists bad values and lets everything else through: 'refuse titles containing <script>'. Attackers just use something you didn't list: capitals, another tag, an encoding. An allowlist says what is allowed and refuses the rest. When you can describe what's good, do that. You only have to be right about the good values, not guess every bad one.",
    ),
    code(
      "js",
      "Banning the bad vs allowing the good",
      [
        "// ✗ denylist: guess every bad value",
        'if (colour.includes("<script>")) {',
        '  return "Not allowed";',
        "}",
        "",
        "// ✓ allowlist: name the good ones",
        'const COLOURS = ["yellow", "blue", "green"];',
        "if (!COLOURS.includes(colour)) {",
        '  return "Unknown colour";',
        "}",
      ],
      {
        2: '"<SCRIPT>" or "<img onerror>" get through',
        7: "a fixed set, written in your code",
        8: "anything else is refused, even new tricks",
      },
    ),
  ),

  part(
    "repair",
    "Refuse, don't repair",
    explain(
      "A tempting idea is to clean bad input: strip out `<script>` and save the rest. It fails, because the attacker can plan for your cleaning. Step through a title built so that removing `<script>` once creates a new one. When input is wrong, refuse it with a 400; for text that may contain anything, make it safe where it's used instead (the next steps).",
    ),
    trace(
      "Stripping <script> once",
      [
        "function clean(title) {",
        '  return title.replace("<script>", "");',
        "}",
        'const sent = "<scr<script>ipt>alert(1)";',
        "const saved = clean(sent);",
        "console.log(saved);",
      ],
      [
        {
          line: 4,
          note: "The attacker hides a `<script>` inside another `<script>`.",
          vars: [["sent", '"<scr<script>ipt>alert(1)"']],
        },
        {
          line: 2,
          note: "`replace` finds the inner `<script>` and removes it, joining the pieces around it.",
          vars: [
            ["sent", '"<scr<script>ipt>alert(1)"'],
            ["title", '"<scr<script>ipt>alert(1)"'],
          ],
          stack: ["clean"],
        },
        {
          line: 5,
          note: "What's left is a brand new `<script>` tag: the cleaning made it.",
          vars: [
            ["sent", '"<scr<script>ipt>alert(1)"'],
            ["saved", '"<script>alert(1)"'],
          ],
        },
        {
          line: 6,
          note: "This is what would be saved. Cleaning by deleting bad words can't win.",
          vars: [
            ["sent", '"<scr<script>ipt>alert(1)"'],
            ["saved", '"<script>alert(1)"'],
          ],
          output: "<script>alert(1)",
        },
      ],
    ),
  ),

  part(
    "allowlist-kinds",
    "An allowlist for each kind of field",
    explain(
      "Most fields can be described exactly. Ids are whole numbers, a sort is one of two words, a colour is one of a few. Free text, like a note's title, can't: people may write anything, including `<` and quotes. For free text, the allowlist is its type and length, and safety comes later: placeholders in SQL, text not HTML on the page.",
    ),
    reference("Describe the good values", [
      ["Id", "A whole number above 0.", "Number.isInteger(id) && id > 0"],
      ["Choice", "One of a fixed list.", '["asc", "desc"].includes(sort)'],
      ["Boolean", "true or false, nothing else.", 'typeof done === "boolean"'],
      [
        "Email",
        "A string with a simple format check, and a length limit.",
        'email.includes("@")',
      ],
      [
        "Free text",
        "A string, trimmed, within a length limit. Any characters.",
        "title.length <= 100",
      ],
    ]),
    quickCheck(
      "A note's title may contain any characters. How do you keep it safe?",
      [
        "Ban the characters < > and ' in titles",
        "Check type and length, then use it only as a value: placeholders and text",
        "Strip any HTML tags before saving",
      ],
      1,
      "Banning characters breaks real titles (\"Tom's list\") and misses tricks. Check the shape, then keep the text as data wherever it's used.",
    ),
  ),

  part(
    "types",
    "JSON can carry any type",
    explain(
      'JSON fields aren\'t always strings. `{ "title": ["a"] }` or `{ "email": { "$ne": "" } }` are valid JSON, and code that assumes a string can behave strangely: `.length` works on arrays, and some databases read objects as query operators. Check the type first, before any other rule.',
    ),
    anatomy(
      "The first line of validateNote",
      [
        "const title =",
        '  typeof body?.title === "string"',
        "    ? body.title.trim()",
        '    : "";',
      ],
      [
        [
          "typeof",
          "type first",
          "Numbers, arrays, objects and null fail here.",
        ],
        ["body?.title", "no body?", "?. survives a request with no JSON."],
        [".trim()", "only on strings", "Safe now: it's known to be a string."],
        ['""', "otherwise empty", "Then the presence check answers 400."],
      ],
    ),
  ),

  part(
    "mass-assignment",
    "Mass assignment",
    explain(
      '[[mass-assignment|Mass assignment]] is saving every field a request sends. If an update copies `req.body` onto a user, an attacker adds `"role": "admin"` and becomes one. Pick fields by name, as in Backend. For extra safety, refuse requests with fields you don\'t know, so mistakes in the client show up as a clear 400.',
    ),
    code(
      "js",
      "Copying the body vs picking fields",
      [
        '// body: { email: "a@b.c", role: "admin" }',
        "",
        "// ✗ every field lands on the user",
        "Object.assign(user, req.body);",
        "",
        "// ✓ only the fields this route changes",
        "const { email } = req.body;",
        "user.email = email;",
      ],
      {
        4: "role: admin is copied too",
        7: "anything else in the body is ignored",
      },
    ),
    inTheNotesApp(
      "`createNote` and `updateNote` read only `title` and `content`; the owner is always `req.user.id`.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "body-size",
    "Limit the size",
    explain(
      "A [[body-size-limit|body size limit]] is the most the server will read from one request. Without one, a single 500 MB body could use up the server's memory. `express.json()` refuses bodies over 100 kB by default with a 413. Field limits, like 100 characters for a title, do the same job for single values.",
    ),
    code(
      "js",
      "Setting the limit yourself",
      [
        "// default: 100 kB",
        "app.use(express.json());",
        "",
        "// smaller, if notes never need more",
        'app.use(express.json({ limit: "20kb" }));',
      ],
      {
        2: "what the Notes App uses",
        5: "bigger bodies are refused before parsing",
      },
    ),
    code(
      "http",
      "A body that's too big",
      [
        "POST /api/notes HTTP/1.1",
        "Content-Length: 5000000",
        "",
        "HTTP/1.1 413 Payload Too Large",
      ],
      {
        2: "5 MB",
        4: "refused: nothing was read or saved",
      },
    ),
  ),

  part(
    "notes-app-413",
    "The 413 in the Notes App",
    explain(
      'In the Notes App, the error from `express.json()` reaches the error handler. It turns status 400 (bad JSON) into "Invalid JSON", but anything else becomes 500 "Something went wrong", including a 413. The request is still refused and nothing leaks, but the client gets the wrong status. Passing 413 on would fix it.',
    ),
    code(
      "js",
      "A possible addition to the error handler",
      [
        "if (err.status === 413) {",
        "  return res.status(413)",
        '    .json({ error: "Request too large" });',
        "}",
      ],
      { 1: "not in the Notes App: there it becomes a 500" },
    ),
    inTheNotesApp(
      "The error handler at the end of `createApp` special-cases only 400.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Banning bad words",
      wrong: [
        'const BAD = ["<script>", "DROP TABLE"];',
        "if (BAD.some((w) => title.includes(w)))",
        "  return 400;",
      ],
      problem:
        "`<ScRiPt>`, `<img onerror>` and `drop table` all get through, and a real note about SQL is refused.",
      right: [
        'if (typeof title !== "string" ||',
        "    title.length > 100) return 400;",
        "// then: placeholders, and text not HTML",
      ],
      why: "Describe what's allowed, and keep the text as data where it's used.",
    }),
    mistake({
      title: "Copying the body onto a row",
      wrong: ["await saveUser({ ...user, ...req.body });"],
      problem:
        "Any field in the body overwrites the user's, including `role`, `id` or `password_hash`.",
      right: [
        "const { email } = req.body;",
        "await saveUser({ ...user, email });",
      ],
      why: "Only fields you name by hand are saved. That's an allowlist of fields.",
    }),
    mistake({
      title: "Raising the size limit for everything",
      wrong: ['app.use(express.json({ limit: "50mb" }));'],
      problem:
        "Every route, including login, now reads up to 50 MB per request. A few requests can use up the server's memory.",
      right: [
        "app.use(express.json());",
        "// a bigger limit only on the route",
        "// that needs it, e.g. uploads",
      ],
      why: "Keep the limit small by default and raise it only where it's needed.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Refuse unknown fields",
      task: "Write `unknownFields(body, allowed)`: an array of the keys in `body` that aren't in the `allowed` array, in the order they appear. A route can answer 400 when it isn't empty.",
      starter: ["function unknownFields(body, allowed) {", "  return [];", "}"],
      tests: [
        [
          'unknownFields({ title: "Hi", user_id: 1 }, ["title", "content"])',
          '["user_id"]',
        ],
        [
          'unknownFields({ title: "Hi", content: "x" }, ["title", "content"])',
          "[]",
        ],
        [
          'unknownFields({ isAdmin: true, role: "admin" }, ["title"])',
          '["isAdmin", "role"]',
        ],
      ],
      hint: "`Object.keys(body).filter((key) => …)` with `allowed.includes(key)`.",
      solution: [
        "function unknownFields(body, allowed) {",
        "  return Object.keys(body)",
        "    .filter((key) => !allowed.includes(key));",
        "}",
      ],
    }),
    yourTurn({
      title: "An allowlist, not a denylist",
      task: 'Notes can have a colour. The starter only bans values with `<`. Rewrite `isAllowedColour(value)` so it returns `true` only for `"yellow"`, `"blue"` or `"green"`, and `false` for anything else, whatever its type.',
      starter: [
        "function isAllowedColour(value) {",
        '  return !String(value).includes("<");',
        "}",
      ],
      tests: [
        ['isAllowedColour("blue")', "true"],
        ['isAllowedColour("red")', "false"],
        ['isAllowedColour("javascript:alert(1)")', "false"],
        ['isAllowedColour(["blue"])', "false"],
      ],
      hint: 'Keep a list `["yellow", "blue", "green"]` and use `includes(value)`.',
      solution: [
        'const COLOURS = ["yellow", "blue", "green"];',
        "function isAllowedColour(value) {",
        "  return COLOURS.includes(value);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Validation for security: cheat sheet", [
      [
        "Server side",
        "Every request, every part, before anything else.",
        "validateNote(req.body)",
      ],
      ["Type first", "JSON can carry any type.", 'typeof title === "string"'],
      [
        "Allowlist",
        "Name the good values; refuse the rest.",
        '["asc", "desc"].includes(sort)',
      ],
      [
        "Denylist",
        "Banning bad values. Easy to get around: avoid.",
        '✗ title.includes("<script>")',
      ],
      [
        "Refuse, don't repair",
        "Wrong input gets a 400, not a clean-up.",
        "400",
      ],
      [
        "Mass assignment",
        "Pick fields by name; never save the whole body.",
        "const { title } = req.body",
      ],
      [
        "Size limits",
        "Bodies (413) and each field (400).",
        'express.json({ limit: "20kb" })',
      ],
    ]),
    quickCheck(
      "Which check is an allowlist?",
      [
        'Refuse a sort that contains "DROP"',
        'Accept a sort only if it is "asc" or "desc"',
        "Remove <script> from every title",
      ],
      1,
      "An allowlist names the values that are allowed and refuses everything else. The other two try to guess bad values or repair them, which attackers get around.",
    ),
  ),
);
