import {
  anatomy,
  analogy,
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

// A fake res for the exercises: records the status and the body.
const fakeRes =
  "const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; } };";

// Safe error messages: what an error can give away, two readers, the Notes
// App's error handler taken apart, an error step by step, 4xx messages that
// help and 5xx ones that don't leak, the same answer whoever asks, leaks
// beyond errors, mistakes, practice and a recap.
export const safeErrorsModule = moduleLesson(
  "safe-errors",
  "Safe error messages",
  35,
  [
    "Name what an error response can give away: SQL, file paths, versions and stack traces.",
    "Log full details on the server and send users a short message they can act on.",
    "Read the Notes App's error handler and follow an error through it.",
    "Give the same answer whether an email or a note exists or not.",
    "Spot information disclosure outside errors: extra fields and revealing headers.",
  ],

  part(
    "leak",
    "What an error can give away",
    explain(
      "When code fails, the error knows a lot: the SQL that failed, the table names, the file and line, the library versions. Sending that to the browser is [[information-disclosure|information disclosure]]. The user can't fix a broken query, but an attacker learns your table names and which versions to look up known bugs for.",
    ),
    code(
      "http",
      "A response that says far too much",
      [
        "HTTP/1.1 500 Internal Server Error",
        "",
        '{ "error": "relation \\"notez\\" does',
        '  not exist", "stack": "error: …',
        "  at notesController.js:18:23",
        '  at /app/node_modules/pg/lib/…" }',
      ],
      {
        2: "the table name and the database",
        5: "your file names and lines",
        6: "where the app lives, which libraries",
      },
    ),
  ),

  part(
    "two-readers",
    "Two readers: the user and you",
    explain(
      "Every error has two readers. You, the developer, need everything: the message, the [[stack-trace|stack trace]], the request. The user needs one thing: what happened and whether they can do anything. [[safe-error-messages|Safe error messages]] give each reader their part: full details in the server's logs, a short plain message in the response.",
    ),
    diagram([
      ["Error", "message, stack, SQL"],
      ["Server log", "everything, for you"],
      ["Response", "“Something went wrong”"],
    ]),
    analogy(
      "A waiter tells you “Sorry, the soup is off tonight.” The kitchen notes which pot burned and why. You never see the kitchen's notebook.",
    ),
  ),

  part(
    "handler",
    "The Notes App's error handler",
    explain(
      "The Notes App has one error-handling [[express-middleware|middleware]], last in `app.js`. Any error thrown in a route ends up there. It logs the whole error with `console.error`, so you see it in the terminal. Bad JSON becomes `400 Invalid JSON`. Everything else gets `500` and the same plain message, whatever went wrong.",
    ),
    anatomy(
      "The last middleware in app.js",
      [
        "app.use((err, req, res, next) => {",
        "  console.error(err);",
        "  res.status(500)",
        '    .json({ error: "Something went wrong" });',
      ],
      [
        [
          "(err, req, res, next)",
          "four parameters",
          "Express calls it only when something failed.",
        ],
        [
          "console.error(err)",
          "for you",
          "The message and the stack trace, in the server's log.",
        ],
        [
          "500",
          "server's fault",
          "The user can't fix it by changing the request.",
        ],
        [
          '"Something went wrong"',
          "for the user",
          "The same text for every 500: nothing to learn from it.",
        ],
      ],
    ),
    inTheNotesApp(
      "app.js: “Log the details, tell the user less.” The handler is registered after every route, and the 400 for bad JSON comes before the 500.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "step-by-step",
    "An error, step by step",
    explain(
      "Here is the handler as a plain function. `log` stands for `console.error`, and the fake `res` prints what the user would get. Follow two errors: a database error with a table name in it, and the 400 that `express.json()` reports for bad JSON.",
    ),
    trace(
      "Two errors through the handler",
      [
        "function handle(err, res) {",
        "  log(err.message);",
        "  if (err.status === 400) {",
        "    return res.status(400)",
        '      .json({ error: "Invalid JSON" });',
        "  }",
        "  res.status(500)",
        '    .json({ error: "Something went wrong" });',
        "}",
        "const dbErr = new Error(",
        '  "relation \\"notez\\" does not exist");',
        "handle(dbErr, res);",
        "const jsonErr = { status: 400 };",
        "handle(jsonErr, res);",
      ],
      [
        {
          line: 10,
          note: "A typo in a table name: the kind of bug that slips out.",
          vars: [
            ["handle", "ƒ handle(err, res)"],
            ["log", "ƒ log(text)"],
            ["res", "{ status, json }"],
            ["dbErr", 'Error: relation "notez" does not exist'],
          ],
        },
        {
          line: 2,
          note: "The full message goes to the log, where only you can read it.",
          vars: [
            ["err", 'Error: relation "notez" does not exist'],
            ["res", "{ status, json }"],
          ],
          stack: ["handle"],
          output: 'log: relation "notez" does not exist',
        },
        {
          line: 3,
          note: "No status on a database error, so this is not the bad-JSON case.",
          vars: [
            ["err", 'Error: relation "notez" does not exist'],
            ["res", "{ status, json }"],
          ],
          stack: ["handle"],
        },
        {
          line: 7,
          note: "The user gets the plain message. The table name stays in the log.",
          vars: [
            ["err", 'Error: relation "notez" does not exist'],
            ["res", "{ status, json }"],
          ],
          stack: ["handle"],
          output: '500 { "error": "Something went wrong" }',
        },
        {
          line: 14,
          note: "Now the error express.json() reports for a broken body.",
          vars: [
            ["handle", "ƒ handle(err, res)"],
            ["log", "ƒ log(text)"],
            ["res", "{ status, json }"],
            ["dbErr", 'Error: relation "notez" does not exist'],
            ["jsonErr", "{ status: 400 }"],
          ],
        },
        {
          line: 4,
          note: "A 400 is the client's mistake, so it gets a message that says what to fix.",
          vars: [
            ["err", "{ status: 400 }"],
            ["res", "{ status, json }"],
          ],
          stack: ["handle"],
          output: '400 { "error": "Invalid JSON" }',
        },
      ],
    ),
  ),

  part(
    "which-message",
    "Messages that help, messages that leak",
    explain(
      "Not every error should be vague. A 4xx means the user can fix the request, so say exactly what's wrong: “Title is required”. A 5xx means your code or your database failed, and the user can do nothing but try later, so the message is plain and always the same. The rule: say what the user can act on, nothing about your internals.",
    ),
    reference("What to say for each kind of error", [
      [
        "400 validation",
        "Exactly what to fix.",
        '{ "error": "Title is required" }',
      ],
      ["401 not logged in", "Log in first.", '{ "error": "Please log in" }'],
      [
        "404 not found",
        "Missing, or not yours: same text.",
        '{ "error": "Note not found" }',
      ],
      [
        "500 anything else",
        "Plain and always the same.",
        '{ "error": "Something went wrong" }',
      ],
    ]),
    quickCheck(
      "A query fails because the database is down. What should the user see?",
      [
        '"connect ECONNREFUSED 10.0.0.5:5432"',
        '"Something went wrong"',
        '"Title is required"',
      ],
      1,
      "The user can't fix a database outage, and the address and port help only an attacker. Log the real error and answer 500 with the plain message.",
    ),
  ),

  part(
    "same-answer",
    "The same answer, whoever asks",
    explain(
      "A message can leak even with no stack trace, just by being different. If login said “No such email” for one case and “Wrong password” for the other, anyone could test which emails have accounts: [[user-enumeration|user enumeration]]. The Notes App answers “Invalid email or password” for both, and “Note not found” both for notes that don't exist and for other people's.",
    ),
    code(
      "js",
      "authController.js: one message for both",
      [
        "if (!passwordMatches) {",
        "  return res.status(401)",
        "    .json({",
        '      error: "Invalid email or password",',
        "    });",
        "}",
      ],
      { 1: "no user, or the wrong password" },
    ),
    keyPoints(
      "Different answers for different cases leak which case it was.",
      "Status codes leak too: 403 says “it exists”, 404 doesn't.",
      "The Notes App's sign-up still answers “Email already registered”.",
      "That is a trade-off many apps accept; others email the address instead.",
    ),
    inTheNotesApp(
      "login gives one message for a missing user and a wrong password. register's 409 does reveal that an email has an account.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "beyond-errors",
    "Leaks beyond errors",
    explain(
      "Errors aren't the only leak. A `SELECT *` on users sends the password hash to the browser. Express adds an `X-Powered-By: Express` header to every response, telling everyone what you run. The Notes App picks the columns it returns (`id, email`), but it does still send `X-Powered-By`. One line turns it off.",
    ),
    code(
      "js",
      "Only what the user needs",
      [
        "// Notes App: named columns, no hash",
        'pool.query("SELECT id, email" +',
        '  " FROM users WHERE id = $1", [id]);',
        "",
        "// Not in the Notes App: hide the header",
        'app.disable("x-powered-by");',
      ],
      {
        2: "never SELECT * into a response",
        6: "one less clue about your stack",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Sending err.message to everyone",
      wrong: ["res.status(500)", "  .json({ error: err.message });"],
      problem:
        "Database and library messages go straight to the browser: table names, columns, addresses.",
      right: [
        "console.error(err);",
        "res.status(500)",
        '  .json({ error: "Something went wrong" });',
      ],
      why: "Log the details for yourself; the user gets the plain message.",
    }),
    mistake({
      title: "The stack trace in the response",
      wrong: [
        "res.status(500).json({",
        "  error: err.message,",
        "  stack: err.stack });",
      ],
      problem:
        "File paths, line numbers and library versions: a map of your server for anyone who triggers an error.",
      right: [
        "console.error(err.stack);",
        "res.status(500)",
        '  .json({ error: "Something went wrong" });',
      ],
      why: "A stack trace is for debugging, so it belongs in the log. Hide it everywhere, not only in production.",
    }),
    mistake({
      title: "Two different login messages",
      wrong: [
        'if (!user) return fail("No such email");',
        "if (!match)",
        '  return fail("Wrong password");',
      ],
      problem: "Anyone can try emails and see which ones have accounts.",
      right: [
        "if (!user || !match)",
        '  return fail("Invalid email or password");',
      ],
      why: "One answer for both cases, so the response says nothing about who is registered.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A safe error handler",
      task: 'Write `makeErrorHandler(log)`, returning `(err, req, res, next)`. Always call `log(err)` first. If `err.status` is from 400 to 499, answer that status with `{ error: err.message }`. Otherwise answer `500` with `{ error: "Something went wrong" }`.',
      starter: [
        "function makeErrorHandler(log) {",
        "  return (err, req, res, next) => {",
        "    res.status(500)",
        "      .json({ error: err.message });",
        "  };",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeRes} const logged = []; makeErrorHandler((e) => logged.push(e.message))(new Error("relation notez does not exist"), {}, res, () => {}); return [logged, res.statusCode, res.body]; })()`,
          '[["relation notez does not exist"], 500, { error: "Something went wrong" }]',
        ],
        [
          `(() => { ${fakeRes} const err = new Error("Title is required"); err.status = 400; makeErrorHandler(() => {})(err, {}, res, () => {}); return [res.statusCode, res.body]; })()`,
          '[400, { error: "Title is required" }]',
        ],
        [
          `(() => { ${fakeRes} const err = new Error("pool exhausted"); err.status = 503; makeErrorHandler(() => {})(err, {}, res, () => {}); return [res.statusCode, res.body]; })()`,
          '[500, { error: "Something went wrong" }]',
        ],
      ],
      hint: "Check `err.status >= 400 && err.status < 500` before you decide which message to send.",
      solution: [
        "function makeErrorHandler(log) {",
        "  return (err, req, res, next) => {",
        "    log(err);",
        "    if (err.status >= 400 && err.status < 500) {",
        "      return res.status(err.status)",
        "        .json({ error: err.message });",
        "    }",
        "    res.status(500)",
        '      .json({ error: "Something went wrong" });',
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Only the public fields",
      task: "Write `publicUser(row)`. It gets a user row from the database and returns a new object with only `id` and `email`. Nothing else, such as `password_hash`, may leave.",
      starter: ["function publicUser(row) {", "  return row;", "}"],
      tests: [
        [
          'publicUser({ id: 3, email: "ana@example.com", password_hash: "$2b$12$abc" })',
          '{ id: 3, email: "ana@example.com" }',
        ],
        [
          'publicUser({ id: 5, email: "bo@example.com", password_hash: "x", is_admin: false })',
          '{ id: 5, email: "bo@example.com" }',
        ],
      ],
      hint: "Build a new object from the two fields you want, instead of deleting the ones you don't.",
      solution: [
        "function publicUser(row) {",
        "  return { id: row.id, email: row.email };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Safe error messages cheat sheet", [
      [
        "Two readers",
        "Full details in the log, a short message in the response.",
        "console.error(err)",
      ],
      [
        "500",
        "Always the same plain message.",
        '{ "error": "Something went wrong" }',
      ],
      [
        "4xx",
        "Say exactly what the user can fix.",
        '{ "error": "Title is required" }',
      ],
      ["Stack trace", "Log it, never send it.", "console.error(err.stack)"],
      [
        "Same answer",
        "One message for “no such user” and “wrong password”.",
        '"Invalid email or password"',
      ],
      ["Not yours", "404, the same as not there.", '"Note not found"'],
      [
        "Pick fields",
        "Return named columns, never SELECT * on users.",
        "SELECT id, email",
      ],
      [
        "Headers",
        "Don't announce what you run.",
        'app.disable("x-powered-by")',
      ],
    ]),
    quickCheck(
      "Which response is safe for a failed database query?",
      [
        '500 { "error": "Something went wrong" }',
        '500 { "error": err.message }',
        '500 { "error": "...", "stack": err.stack }',
      ],
      0,
      "The message and the stack can reveal tables, files and versions. Log them on the server, and send every 500 the same plain message.",
    ),
  ),
);
