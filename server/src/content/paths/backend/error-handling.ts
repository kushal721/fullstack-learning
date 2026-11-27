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

// Error handling: what can go wrong, expected errors vs bugs, try/catch in
// async code, what Express 5 catches for you, the error middleware taken
// apart, an HttpError class and next(err), a failed request step by step,
// crashes outside requests, hiding stack traces, mistakes, practice and a
// recap.
export const errorHandlingModule = moduleLesson(
  "error-handling",
  "Error handling",
  45,
  [
    "Tell expected errors (bad input, not found) from bugs and outages, and answer each properly.",
    "Use try/catch with await, and know which errors Express 5 catches for you.",
    "Write error-handling middleware that logs the details and sends a safe response.",
    "Throw an HttpError with a status, or pass errors on with next(err).",
    "Explain why unhandled rejections crash the process, and never send stack traces to users.",
  ],

  part(
    "what-goes-wrong",
    "What can go wrong",
    explain(
      "A server that only handles the happy path breaks on the first bad day. Requests arrive with missing fields, ask for notes that don't exist, come from people who aren't logged in. The database can be down. And your own code has bugs. Each needs a response: the right status code, a message that helps, and nothing that helps an attacker.",
    ),
    reference("Errors and their answers", [
      ["Bad input", "The client must fix it.", '400 "Title is required"'],
      ["Not logged in", "Log in first.", '401 "Please log in"'],
      ["Not found", "No such note (or not yours).", '404 "Note not found"'],
      [
        "Database down",
        "Not the client's fault; may pass.",
        '500 or 503 "Something went wrong"',
      ],
      [
        "A bug",
        "Your code threw. Log it, fix it.",
        '500 "Something went wrong"',
      ],
    ]),
  ),

  part(
    "expected-vs-bugs",
    "Expected errors and bugs",
    explain(
      "Expected errors are part of normal use: bad input, a missing note. You know they'll happen, so you answer with a 4xx and a clear message. Bugs and outages are the rest: a `TypeError`, a lost database connection. The user can't fix those, so they get a 500 and a plain message, while the full details go to the logs for you.",
    ),
    keyPoints(
      "Expected: 4xx, a specific message the user can act on.",
      "Unexpected: 500, a generic message, full details in the logs.",
      "Both get exactly one response; the server keeps running.",
    ),
  ),

  part(
    "try-catch",
    "try/catch in async code",
    explain(
      "A failed `await` throws, so `try/catch` catches it like any other error. The `await` must be inside the `try`: a promise you don't await fails later, after the `try` has finished. Catch an error only when you can do something useful with it, such as turning a database's duplicate error into a 409. Otherwise let it go up.",
    ),
    code(
      "js",
      "Catching what you can handle",
      [
        "try {",
        "  await pool.query(insertUser, [email]);",
        "} catch (err) {",
        '  if (err.code === "23505") {',
        "    return res.status(409)",
        '      .json({ error: "Email taken" });',
        "  }",
        "  throw err;",
        "}",
      ],
      {
        2: "await inside try: its failure lands in catch",
        4: "PostgreSQL's code for a duplicate value",
        5: "expected: a clear 409",
        8: "anything else: not ours to handle, pass it on",
      },
    ),
  ),

  part(
    "express-5",
    "What Express 5 catches for you",
    explain(
      "If a handler throws, or an async handler's promise rejects, Express 5 catches it and sends it to the error handler. Express 4 only caught errors thrown synchronously: a rejected promise was missed, the request hung and Node.js could crash. That's why old code wraps every handler or calls `next(err)` by hand.",
    ),
    code(
      "js",
      "No try/catch needed in Express 5",
      [
        "export async function listNotes(req, res) {",
        "  const result = await pool.query(",
        "    sql, [req.user.id],",
        "  );",
        "  res.json(result.rows);",
        "}",
        "// database down → query rejects →",
        "// Express 5 → the error handler → 500",
      ],
      {
        2: "if this rejects, the line below never runs",
        8: "Express 4 would have missed it",
      },
    ),
    inTheNotesApp(
      "The controllers have no try/catch: Express 5 hands any failed query to the error handler in app.js.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "middleware",
    "The error handler taken apart",
    explain(
      "[[error-middleware|Error-handling middleware]] is ordinary [[express-middleware|middleware]] with four parameters. Express knows it by that count, and only calls it when something failed. Register it last, after every route, so errors from all of them reach it. Here are the first lines of the Notes App's.",
    ),
    anatomy(
      "The start of app.js's error handler",
      [
        "app.use((err, req, res, next) => {",
        "  console.error(err);",
        "  if (res.headersSent) return next(err);",
        "  if (err.status === 400) { /* … */ }",
      ],
      [
        [
          "(err, req, res, next)",
          "four params",
          "All four, even if unused: that's how Express tells.",
        ],
        [
          "console.error(err)",
          "log it all",
          "The message and stack, for you, in the logs.",
        ],
        [
          "res.headersSent",
          "too late?",
          "A response already started can't be replaced.",
        ],
        [
          "next(err)",
          "give up",
          "Express's own handler closes the connection.",
        ],
        [
          "err.status === 400",
          "bad JSON",
          "express.json() marks unreadable bodies 400.",
        ],
      ],
    ),
    code(
      "js",
      "The rest: tell the user less",
      [
        "if (err.status === 400) {",
        "  return res.status(400)",
        '    .json({ error: "Invalid JSON" });',
        "}",
        "res.status(500)",
        '  .json({ error: "Something went wrong" });',
      ],
      {
        3: "the client's fault: say so",
        6: "everything else: no details at all",
      },
    ),
    inTheNotesApp(
      "The error handler is the last `app.use` in `createApp`, after all the routes.",
      { fileId: "backend/src/app.js" },
    ),
  ),

  part(
    "http-error",
    "An HttpError class, and next(err)",
    explain(
      'An [[http-error|HTTP error class]] carries a status, so any code can `throw new HttpError(404, "Note not found")` and the handler sends it. Errors without a status stay 500. The Notes App doesn\'t have one: its controllers call `res.status(404)` themselves. In callback code, where a `throw` would escape Express, call `next(err)` instead.',
    ),
    code(
      "js",
      "HttpError (not in the Notes App)",
      [
        "class HttpError extends Error {",
        "  constructor(status, message) {",
        "    super(message);",
        "    this.status = status;",
        "  }",
        "}",
        "",
        'throw new HttpError(404, "Note not found");',
        "",
        "// in callback code: hand it to Express",
        "fs.readFile(path, (err, data) => {",
        "  if (err) return next(err);",
        "});",
      ],
      {
        3: "message, name and stack, like any Error",
        4: "the status the handler will send",
        12: "next with an argument skips to the error handler",
      },
    ),
    quickCheck(
      "Which errors should reach the user with their own message?",
      [
        "All of them: honesty is best",
        "Expected ones with a 4xx status, such as an HttpError(404)",
        "Only database errors",
      ],
      1,
      "Messages you wrote for the user, like Note not found, are safe and helpful. An unexpected error's message may reveal SQL, file paths or worse, so it becomes Something went wrong.",
    ),
  ),

  part(
    "step-by-step",
    "A missing note, step by step",
    explain(
      "Follow `GET /api/notes/99` for a note that doesn't exist, in a version that throws an HttpError. Watch the error leave the handler and arrive in the error middleware, which picks the status and the message.",
    ),
    trace(
      "GET /api/notes/99",
      [
        "async function getNote(req, res) {",
        "  const note = await findNote(req.params.id);",
        "  if (!note) {",
        "    throw new HttpError(",
        '      404, "Note not found");',
        "  }",
        "  res.json(note);",
        "}",
        "app.use((err, req, res, next) => {",
        "  console.error(err);",
        "  const status = err.status ?? 500;",
        "  const error = status < 500",
        '    ? err.message : "Something went wrong";',
        "  res.status(status).json({ error });",
        "});",
      ],
      [
        {
          line: 2,
          note: "The database finds no note 99, so `note` is null.",
          vars: [
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
            ["note", "null"],
          ],
          stack: ["getNote"],
        },
        {
          line: 4,
          note: "An expected error: throw it with its status. `res.json` on line 7 never runs.",
          vars: [
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
            ["note", "null"],
          ],
          stack: ["getNote"],
        },
        {
          line: 9,
          note: "The async function's promise rejects. Express 5 catches it and calls the four-parameter middleware.",
          vars: [
            ["err", "HttpError: Note not found"],
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
          ],
          stack: ["error handler"],
        },
        {
          line: 10,
          note: "The full error, with its stack, goes to the server's logs.",
          vars: [
            ["err", "HttpError: Note not found"],
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
          ],
          stack: ["error handler"],
          output: "HttpError: Note not found (and its stack)",
        },
        {
          line: 11,
          note: "The error has a status, so it's 404 rather than 500.",
          vars: [
            ["err", "HttpError: Note not found"],
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
            ["status", "404"],
          ],
          stack: ["error handler"],
        },
        {
          line: 12,
          note: "Under 500: the message was written for the user, so it can be sent.",
          vars: [
            ["err", "HttpError: Note not found"],
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
            ["status", "404"],
            ["error", '"Note not found"'],
          ],
          stack: ["error handler"],
        },
        {
          line: 14,
          note: "One response goes back. A TypeError instead would have given 500 and Something went wrong.",
          vars: [
            ["err", "HttpError: Note not found"],
            ["req", '{ params: { id: "99" } }'],
            ["res", "{ … }"],
            ["status", "404"],
            ["error", '"Note not found"'],
          ],
          stack: ["error handler"],
          output: '404 { "error": "Note not found" }',
        },
      ],
    ),
  ),

  part(
    "crashes",
    "Errors outside requests crash the process",
    explain(
      "Express only catches errors in handlers. A promise that rejects anywhere else with no `catch`, in a timer or at startup, is an [[unhandled-rejection|unhandled rejection]], and a `throw` nobody catches is an uncaught exception. Either way Node.js stops the process. Don't try to keep running: log it, exit, and let the platform restart a clean process.",
    ),
    code(
      "js",
      "Last-chance logging (not in the Notes App)",
      [
        "setInterval(() => {",
        "  deleteOldNotes(); // rejects: crash",
        "}, 60_000);",
        "",
        'process.on("unhandledRejection", (err) => {',
        '  console.error("Unhandled rejection", err);',
        "  process.exit(1);",
        "});",
      ],
      {
        2: "no await, no catch: nobody handles it",
        6: "make sure it's in the logs",
        7: "the app may be in a bad state: restart it",
      },
    ),
    keyPoints(
      "Code outside requests needs its own try/catch or .catch().",
      "A crash is better than running in an unknown state.",
      "Docker or the platform restarts a crashed server.",
    ),
  ),

  part(
    "no-stack-traces",
    "Never send stack traces",
    explain(
      "A stack trace shows file paths, package versions and sometimes SQL or data. Useful to an attacker, useless to a user. Log it, and send a short message. Express's built-in handler includes the stack in development and hides it when `NODE_ENV=production`, but your own handler must hide it everywhere.",
    ),
    code(
      "http",
      "What a 500 should and shouldn't say",
      [
        "HTTP/1.1 500 Internal Server Error",
        '{ "error": "error: relation \\"notez\\"',
        '  does not exist at /app/src/…" }',
        "",
        "HTTP/1.1 500 Internal Server Error",
        '{ "error": "Something went wrong" }',
      ],
      {
        2: "✗ reveals a table name and file paths",
        6: "✓ the details are in the logs instead",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "An error handler with three parameters",
      wrong: [
        "app.use((err, req, res) => {",
        "  res.status(500).json({ … });",
        "});",
      ],
      problem:
        "Express counts the parameters. With three, it treats this as normal middleware: `err` is really `req`, and errors skip it.",
      right: [
        "app.use((err, req, res, next) => {",
        "  res.status(500).json({ … });",
        "});",
      ],
      why: "Four parameters, even if `next` is unused, marks error-handling middleware.",
    }),
    mistake({
      title: "Registering it before the routes",
      wrong: ["app.use(errorHandler);", 'app.use("/api/notes", notesRoutes);'],
      problem:
        "Errors from routes added after it never reach it, so Express's default handler answers instead.",
      right: ['app.use("/api/notes", notesRoutes);', "app.use(errorHandler);"],
      why: "Middleware runs in order. The error handler goes last.",
    }),
    mistake({
      title: "Swallowing the error",
      wrong: [
        "try {",
        "  await saveNote(note);",
        "} catch {}",
        "res.status(201).json(note);",
      ],
      problem:
        "The save failed, the user is told it worked, and nothing is logged, so nobody ever finds out.",
      right: ["await saveNote(note);", "res.status(201).json(note);"],
      why: "Catch only what you can handle. Let the rest reach the error handler.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "HttpError and toResponse",
      task: 'Write a class `HttpError` that extends `Error` and stores a `status`. Then write `toResponse(err)`: for an HttpError, return `{ status: err.status, body: { error: err.message } }`; for any other error, `{ status: 500, body: { error: "Something went wrong" } }`.',
      starter: [
        "class HttpError extends Error {}",
        "",
        "function toResponse(err) {",
        "  return { status: 500, body: { error: err.message } };",
        "}",
      ],
      tests: [
        [
          'toResponse(new HttpError(404, "Note not found"))',
          '{ status: 404, body: { error: "Note not found" } }',
        ],
        [
          'toResponse(new TypeError("x is undefined"))',
          '{ status: 500, body: { error: "Something went wrong" } }',
        ],
        ['new HttpError(400, "Bad").message', '"Bad"'],
        ['new HttpError(401, "No") instanceof Error', "true"],
      ],
      hint: "In the constructor call `super(message)`, then set `this.status`. Use `instanceof HttpError` in toResponse.",
      solution: [
        "class HttpError extends Error {",
        "  constructor(status, message) {",
        "    super(message);",
        "    this.status = status;",
        "  }",
        "}",
        "function toResponse(err) {",
        "  if (err instanceof HttpError) {",
        "    const body = { error: err.message };",
        "    return { status: err.status, body };",
        "  }",
        '  const body = { error: "Something went wrong" };',
        "  return { status: 500, body };",
        "}",
      ],
    }),
    yourTurn({
      title: "Catch async errors (Express 4 style)",
      task: "Express 4 misses rejected promises. Write `wrap(handler)`: it returns a function `(req, res, next)` that runs the async `handler` and, if it throws or rejects, calls `next(err)`. If it succeeds, `next` must not be called.",
      starter: ["function wrap(handler) {", "  return handler;", "}"],
      tests: [
        [
          '(async () => { let got = "none"; const h = wrap(async () => { throw new Error("boom"); }); await h({}, {}, (e) => { got = e.message; }); return got; })()',
          '"boom"',
        ],
        [
          '(async () => { let got = "none"; const h = wrap(async (req, res) => { res.sent = true; }); const res = {}; await h({}, res, () => { got = "called"; }); return [got, res.sent]; })()',
          '["none", true]',
        ],
      ],
      hint: "Return an `async (req, res, next) => { … }` with `await handler(req, res, next)` inside a try, and `next(err)` in the catch.",
      solution: [
        "function wrap(handler) {",
        "  return async (req, res, next) => {",
        "    try {",
        "      await handler(req, res, next);",
        "    } catch (err) {",
        "      next(err);",
        "    }",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Error handling cheat sheet", [
      [
        "Expected error",
        "4xx with a message the user can act on.",
        '404 "Note not found"',
      ],
      [
        "Unexpected",
        "500, generic message; details in the logs.",
        '"Something went wrong"',
      ],
      [
        "try/catch",
        "Await inside try; catch only what you handle.",
        'if (err.code === "23505") …',
      ],
      [
        "Express 5",
        "Catches throws and rejected promises in handlers.",
        "async (req, res) => { … }",
      ],
      [
        "Error middleware",
        "Four params, registered last.",
        "app.use((err, req, res, next) => …)",
      ],
      [
        "headersSent",
        "Too late to answer: pass to next(err).",
        "if (res.headersSent) return next(err)",
      ],
      [
        "HttpError",
        "An Error with a status, thrown anywhere.",
        'throw new HttpError(404, "Not found")',
      ],
      [
        "next(err)",
        "Hand an error to Express from callback code.",
        "if (err) return next(err)",
      ],
      [
        "Unhandled rejection",
        "Outside requests: log, exit, restart.",
        'process.on("unhandledRejection", …)',
      ],
    ]),
    quickCheck(
      "In Express 5, an async controller's `pool.query` rejects because the database is down. What does the user get?",
      [
        "Nothing: the request hangs",
        "The error handler's 500 Something went wrong",
        "The database error message",
      ],
      1,
      "Express 5 catches the rejected promise and calls the error middleware, which logs the details and sends a generic 500.",
    ),
  ),
);
