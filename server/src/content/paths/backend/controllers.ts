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

// A fake res for the exercises: records the status, the body and end().
const fakeRes =
  "const res = { statusCode: 200, status(c) { this.statusCode = c; return this; }, json(b) { this.body = b; return this; }, end() { this.ended = true; return this; } };";

// Controllers: what a controller is, thin routes, a controller taken apart,
// createNote, update and delete with noteId(), one answer per path, a
// create step by step, async controllers and Express 5, naming and
// organising, mistakes, practice and a recap.
export const controllersModule = moduleLesson(
  "controllers",
  "Controllers: handling a request",
  50,
  [
    "Explain what a controller does and why routes stay one line each.",
    "Follow a controller's steps: read input, validate, ask the database, answer.",
    "Choose the right status for each outcome and send exactly one answer.",
    "Write async controllers and know how Express 5 handles their errors.",
    "Name and organise controllers in one file per resource.",
  ],

  part(
    "what-it-is",
    "The function that does the work",
    explain(
      "A route says which URL runs which function. That function is the [[controller]]: it reads the request, checks the input, asks the database for what it needs and sends the answer with the right status. In the Notes App every route in `routes/notes.js` is one line, and all the work lives in `controllers/notesController.js`.",
    ),
    diagram([
      ["Route", "PUT /:id"],
      ["Middleware", "requireAuth"],
      ["Controller", "updateNote"],
      ["Database", "asks for the row"],
      ["Response", "200 + the note"],
    ]),
    inTheNotesApp(
      "`notesController.js` exports four controllers: `listNotes`, `createNote`, `updateNote` and `deleteNote`.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "thin-routes",
    "Why routes stay thin",
    explain(
      "You could write the whole handler inline in the route. It works for one route, but a routes file with fifty-line functions is hard to scan, and the logic can't be reused or tested on its own. Keeping each file to one job is called [[separation-of-concerns|separation of concerns]]: routes map URLs, middleware checks the login, validation checks data, controllers handle a request.",
    ),
    code(
      "js",
      "The routes file reads like a table",
      [
        'notesRoutes.get("/", listNotes);',
        'notesRoutes.post("/", createNote);',
        'notesRoutes.put("/:id", updateNote);',
        'notesRoutes.delete("/:id", deleteNote);',
      ],
      {
        1: "which URL → which function, nothing more",
      },
    ),
    keyPoints(
      "routes/: which method and path call which controller.",
      "middleware/: jobs shared by many routes, like requireAuth.",
      "validation/: is this data allowed? validateNote.",
      "controllers/: one request, from input to answer.",
    ),
  ),

  part(
    "anatomy",
    "A controller taken apart",
    explain(
      "`listNotes` is the smallest controller in the Notes App. It has the shape they all share: Express calls it with `req` and `res`, it waits for the database, and it answers once. `pool.query` asks the database a question; the Databases topic covers what goes inside it.",
    ),
    anatomy(
      "listNotes, shortened",
      [
        "export async function listNotes(req, res) {",
        "  const result = await pool.query(sql,",
        "    [req.user.id]);",
        "  res.json(result.rows);",
      ],
      [
        ["export", "used by the routes", "routes/notes.js imports it."],
        [
          "async",
          "it waits",
          "Asking the database takes time, so it uses await.",
        ],
        [
          "(req, res)",
          "same as any handler",
          "A controller is just the route's handler, in its own file.",
        ],
        [
          "await pool.query",
          "ask the database",
          "Find this user's notes. The question itself is SQL.",
        ],
        [
          "req.user.id",
          "whose notes",
          "Set by requireAuth, never taken from the body.",
        ],
        ["res.json", "the answer", "200 with the array of notes."],
      ],
    ),
  ),

  part(
    "create",
    "createNote, step by step in the code",
    explain(
      "Most controllers follow the same five steps: read the input, validate it, ask the database using the user's id, pick a status, and respond. `createNote` shows all five. A bad body gets a 400 before the database is ever asked.",
    ),
    code(
      "js",
      "createNote (the query shortened)",
      [
        "export async function createNote(req, res) {",
        "  const error = validateNote(req.body);",
        "  if (error) {",
        "    return res.status(400).json({ error });",
        "  }",
        '  const { title, content = "" } = req.body;',
        "  const result = await pool.query(insert,",
        "    [req.user.id, title.trim(), content]);",
        "  res.status(201).json(result.rows[0]);",
        "}",
      ],
      {
        2: "validate: an error message, or nothing",
        4: "400 and stop: return ends the function",
        6: "read the input (content is optional)",
        8: "the owner is the logged-in user",
        9: "201 Created, with the saved note",
      },
    ),
    quickCheck(
      'A client POSTs `{ "title": "" }`. What does `createNote` do?',
      [
        "Saves a note with an empty title",
        "Answers 400 with the error, and never asks the database",
        "Throws, and the error handler answers 500",
      ],
      1,
      'validateNote returns "Title is required", so the controller answers 400 and the return stops it before the insert.',
    ),
  ),

  part(
    "update-delete",
    "updateNote, deleteNote and noteId()",
    explain(
      "Update and delete start from `req.params.id`, which is text. The `noteId()` helper turns it into a positive whole number, or `null` for anything else, so `/api/notes/abc` is a plain 404. Then the database is asked to change the note with that id *and* this user's id. No row changed means not found, or not yours: both get the same 404.",
    ),
    code(
      "js",
      "noteId and deleteNote (shortened)",
      [
        "function noteId(req) {",
        "  const id = Number(req.params.id);",
        "  return Number.isInteger(id) && id > 0",
        "    ? id : null;",
        "}",
        "export async function deleteNote(req, res) {",
        "  const id = noteId(req);",
        "  if (!id) return res.status(404).json(gone);",
        "  const result = await pool.query(del,",
        "    [id, req.user.id]);",
        "  if (result.rowCount === 0) {",
        "    return res.status(404).json(gone);",
        "  }",
        "  res.status(204).end();",
        "}",
      ],
      {
        3: '"7" → 7; "abc", "0", "2.5" → null',
        8: 'gone = { error: "Note not found" }',
        10: "this id, and only if it's this user's",
        11: "nothing deleted: missing, or someone else's",
        14: "204 No Content: done, nothing to send",
      },
    ),
    keyPoints(
      "noteId() is a plain helper, not exported: only controllers use it.",
      "Every query includes req.user.id, so users only touch their notes.",
      "updateNote answers 200 with the changed note.",
    ),
  ),

  part(
    "one-answer",
    "One answer on every path",
    explain(
      "A controller has several ways out: 404, 400, 201. Each way must send exactly one answer. The Notes App writes `return res.status(…).json(…)` for every early exit, so nothing after it runs. The last answer, at the bottom, needs no return. Read a controller by asking, for each `if`: does this path answer once and stop?",
    ),
    reference("updateNote's ways out", [
      ["id isn't a number", "404, return.", '{ "error": "Note not found" }'],
      ["Body is invalid", "400, return.", '{ "error": "Title is required" }'],
      ["No row changed", "404, return.", '{ "error": "Note not found" }'],
      ["Database fails", "Throws: the error handler sends 500.", "500"],
      ["Otherwise", "200 with the note, at the end.", '{ "id": 7, … }'],
    ]),
  ),

  part(
    "step-by-step",
    "A create, step by step",
    explain(
      'Here is `createNote` made testable: the database is replaced by `repo`, a fake object with an `add` method, and `res` is a fake that records its status. Follow a request with the title `" Milk "`.',
    ),
    trace(
      "createNote with a fake repo",
      [
        "function createNote(req, res, repo) {",
        "  const title = req.body.title?.trim();",
        "  if (!title) {",
        '    const error = "Title is required";',
        "    return res.status(400).json({ error });",
        "  }",
        "  const note = repo.add(req.user.id, title);",
        "  res.status(201).json(note);",
        "}",
        "const req = {",
        '  body: { title: " Milk " },',
        "  user: { id: 3 },",
        "};",
        "createNote(req, res, repo);",
      ],
      [
        {
          line: 10,
          note: "The request after the middleware: express.json() filled body, requireAuth filled user.",
          vars: [
            ["res", "{ statusCode: 200 }"],
            ["repo", "{ add }"],
            ["req", '{ body: { title: " Milk " }, user: { id: 3 } }'],
          ],
        },
        {
          line: 14,
          note: "The route calls the controller.",
          vars: [
            ["res", "{ statusCode: 200 }"],
            ["repo", "{ add }"],
            ["req", "{ body, user }"],
          ],
        },
        {
          line: 2,
          note: "Read the input. trim() removes the spaces around it.",
          vars: [
            ["req", "{ body, user }"],
            ["res", "{ statusCode: 200 }"],
            ["repo", "{ add }"],
            ["title", '"Milk"'],
          ],
          stack: ["createNote"],
        },
        {
          line: 3,
          note: '"Milk" isn\'t empty, so the 400 path is skipped.',
          vars: [
            ["req", "{ body, user }"],
            ["res", "{ statusCode: 200 }"],
            ["repo", "{ add }"],
            ["title", '"Milk"'],
          ],
          stack: ["createNote"],
        },
        {
          line: 7,
          note: "Save it for user 3, the logged-in user. The repo gives back the new note with its id.",
          vars: [
            ["req", "{ body, user }"],
            ["res", "{ statusCode: 200 }"],
            ["repo", "{ add }"],
            ["title", '"Milk"'],
            ["note", '{ id: 1, title: "Milk" }'],
          ],
          stack: ["createNote"],
        },
        {
          line: 8,
          note: "201 Created, with the note as JSON. That's the one answer.",
          vars: [
            ["req", "{ body, user }"],
            ["res", "{ statusCode: 201, body: { id: 1, … } }"],
            ["repo", "{ add }"],
            ["title", '"Milk"'],
            ["note", '{ id: 1, title: "Milk" }'],
          ],
          stack: ["createNote"],
          output: '201 { "id": 1, "title": "Milk" }',
        },
      ],
    ),
  ),

  part(
    "async",
    "Async controllers and Express 5",
    explain(
      "Asking the database returns a promise, so controllers are `async` and use `await`. If the database is down, `await` throws and the async function's promise rejects. Express 5 catches that rejection and passes the error to the error handler in `app.js`, which logs it and answers 500. Express 4 did not: the request just hung unless you wrapped it in try/catch.",
    ),
    code(
      "js",
      "No try/catch needed in Express 5",
      [
        "export async function listNotes(req, res) {",
        "  const result = await pool.query(sql,",
        "    [req.user.id]);",
        "  res.json(result.rows);",
        "}",
        "",
        "// app.js, after every route",
        "app.use((err, req, res, next) => {",
        "  console.error(err);",
        '  res.status(500).json({ error: "…" });',
        "});",
      ],
      {
        2: "if this throws, the promise rejects…",
        8: "…and Express 5 sends the error here",
      },
    ),
    keyPoints(
      "The Notes App uses Express 5 (package.json: ^5.3.0).",
      "Controllers only catch errors they can answer better themselves.",
      "Error handling gets its own module later in this level.",
    ),
  ),

  part(
    "organising",
    "Naming and organising controllers",
    explain(
      "One file per resource: `notesController.js`, `authController.js`. Name each function with a verb and the thing: `listNotes`, `getNote`, `createNote`. The routes file imports them all with `import * as notesController`. The SQL still sits inside each controller; moving it out into its own layer is for the Advanced module on layers.",
    ),
    reference("Usual names", [
      ["listNotes", "GET /api/notes", "200 + an array"],
      ["getNote", "GET /api/notes/:id (not in the Notes App)", "200 or 404"],
      ["createNote", "POST /api/notes", "201, or 400"],
      ["updateNote", "PUT /api/notes/:id", "200, 400 or 404"],
      ["deleteNote", "DELETE /api/notes/:id", "204 or 404"],
    ]),
    inTheNotesApp(
      "`authController.js` follows the same pattern for register, login, logout and currentUser.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "No return after an early answer",
      wrong: [
        "if (error) res.status(400).json({ error });",
        "const result = await pool.query(insert, …);",
        "res.status(201).json(result.rows[0]);",
      ],
      problem:
        "The 400 is sent, then the bad note is saved anyway and a second answer throws “Cannot set headers after they are sent”.",
      right: ["if (error) {", "  return res.status(400).json({ error });", "}"],
      why: "Every early answer needs return, so each path sends exactly one.",
    }),
    mistake({
      title: "Trusting the body for the owner",
      wrong: ["const { title, userId } = req.body;", "save(userId, title);"],
      problem:
        "Anyone can put any userId in the body, and save notes as someone else.",
      right: ["const { title } = req.body;", "save(req.user.id, title);"],
      why: "Who is asking comes from requireAuth, never from the request body.",
    }),
    mistake({
      title: "Forgetting await",
      wrong: [
        "const result = pool.query(sql, [req.user.id]);",
        "res.json(result.rows);",
      ],
      problem:
        "result is a promise, not the answer, so result.rows is undefined and the client gets an empty response.",
      right: [
        "const result = await pool.query(sql,",
        "  [req.user.id]);",
        "res.json(result.rows);",
      ],
      why: "await waits for the database before the answer is built.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "createNote with a fake repo",
      task: 'Write `createNote(req, res, repo)`. Trim `req.body.title`. If it\'s missing or empty, answer `400` with `{ error: "Title is required" }`. Otherwise call `repo.add(req.user.id, title)` and answer `201` with the note it returns.',
      starter: [
        "function createNote(req, res, repo) {",
        "  const note = repo.add(req.body.userId,",
        "    req.body.title);",
        "  res.json(note);",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeRes} const repo = { add: (userId, title) => ({ id: 1, userId, title }) }; createNote({ body: { title: " Milk " }, user: { id: 3 } }, res, repo); return [res.statusCode, res.body]; })()`,
          '[201, { id: 1, userId: 3, title: "Milk" }]',
        ],
        [
          `(() => { ${fakeRes} let called = false; const repo = { add: () => { called = true; } }; createNote({ body: { title: "  " }, user: { id: 3 } }, res, repo); return [res.statusCode, res.body, called]; })()`,
          '[400, { error: "Title is required" }, false]',
        ],
        [
          `(() => { ${fakeRes} const repo = { add: () => ({}) }; createNote({ body: {}, user: { id: 3 } }, res, repo); return res.statusCode; })()`,
          "400",
        ],
      ],
      hint: "`req.body.title?.trim()` is undefined or the trimmed text. Then `if (!title) return res.status(400)…`.",
      solution: [
        "function createNote(req, res, repo) {",
        "  const title = req.body.title?.trim();",
        "  if (!title) {",
        "    return res",
        "      .status(400)",
        '      .json({ error: "Title is required" });',
        "  }",
        "  const note = repo.add(req.user.id, title);",
        "  res.status(201).json(note);",
        "}",
      ],
    }),
    yourTurn({
      title: "noteId()",
      task: "Write `noteId(req)`: turn `req.params.id` into a number and return it if it's a whole number above 0. Return `null` for anything else.",
      starter: [
        "function noteId(req) {",
        "  return Number(req.params.id);",
        "}",
      ],
      tests: [
        ['noteId({ params: { id: "7" } })', "7"],
        ['noteId({ params: { id: "abc" } })', "null"],
        ['noteId({ params: { id: "0" } })', "null"],
        ['noteId({ params: { id: "2.5" } })', "null"],
      ],
      hint: "`Number.isInteger(id) && id > 0` tells you if it's usable.",
      solution: [
        "function noteId(req) {",
        "  const id = Number(req.params.id);",
        "  return Number.isInteger(id) && id > 0",
        "    ? id",
        "    : null;",
        "}",
      ],
    }),
    yourTurn({
      title: "An async deleteNote",
      task: 'Write `async deleteNote(req, res, repo)`. `await repo.remove(id, req.user.id)` resolves to `true` if a note was deleted. Answer `404` with `{ error: "Note not found" }` if the id isn\'t a positive whole number or nothing was deleted; otherwise `res.status(204).end()`.',
      starter: [
        "async function deleteNote(req, res, repo) {",
        "  const id = Number(req.params.id);",
        "  repo.remove(id, req.user.id);",
        "  res.status(204).end();",
        "}",
      ],
      tests: [
        [
          `(async () => { ${fakeRes} const repo = { remove: async (id, userId) => id === 7 && userId === 3 }; await deleteNote({ params: { id: "7" }, user: { id: 3 } }, res, repo); return [res.statusCode, res.ended]; })()`,
          "[204, true]",
        ],
        [
          `(async () => { ${fakeRes} const repo = { remove: async () => false }; await deleteNote({ params: { id: "8" }, user: { id: 3 } }, res, repo); return [res.statusCode, res.body]; })()`,
          '[404, { error: "Note not found" }]',
        ],
        [
          `(async () => { ${fakeRes} let called = false; const repo = { remove: async () => { called = true; return true; } }; await deleteNote({ params: { id: "abc" }, user: { id: 3 } }, res, repo); return [res.statusCode, called]; })()`,
          "[404, false]",
        ],
      ],
      hint: "Check the id first and return a 404. Then `const ok = await repo.remove(…)` and return a 404 if `!ok`.",
      solution: [
        "async function deleteNote(req, res, repo) {",
        '  const gone = { error: "Note not found" };',
        "  const id = Number(req.params.id);",
        "  if (!Number.isInteger(id) || id <= 0) {",
        "    return res.status(404).json(gone);",
        "  }",
        "  const ok = await repo.remove(id, req.user.id);",
        "  if (!ok) return res.status(404).json(gone);",
        "  res.status(204).end();",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Controllers cheat sheet", [
      [
        "Controller",
        "The function a route calls: input to answer.",
        "createNote(req, res)",
      ],
      [
        "Thin routes",
        "One line each: path → controller.",
        'notesRoutes.post("/", createNote)',
      ],
      ["Read input", "req.params, req.query, req.body.", "noteId(req)"],
      [
        "Validate",
        "Bad input: 400, before the database.",
        "validateNote(req.body)",
      ],
      ["Who's asking", "req.user.id from requireAuth.", "[req.user.id, title]"],
      [
        "Choose a status",
        "201 created, 204 deleted, 404 not found.",
        "res.status(201).json(note)",
      ],
      [
        "Early exits",
        "return res…, so only one answer is sent.",
        "return res.status(404).json(e)",
      ],
      [
        "async + Express 5",
        "A rejected promise goes to the error handler.",
        "await pool.query(…)",
      ],
    ]),
    quickCheck(
      "Where does `updateNote` get the id of the user who owns the note?",
      ["req.body.userId", "req.params.id", "req.user.id, set by requireAuth"],
      2,
      "req.params.id is the note's id from the URL, and anything in the body can be faked. requireAuth sets req.user from the login cookie, so that is the only id to trust.",
    ),
  ),
);
