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

// Layers and architecture: why structure matters as an app grows, the
// Notes App's shape today, three layers, createNote split into controller,
// service and repository, dependency injection, testing with a fake
// repository step by step, folders by layer or by feature, when not to add
// layers, mistakes, practice and a recap.
export const layersAndArchitectureModule = moduleLesson(
  "layers-and-architecture",
  "Layers and architecture",
  50,
  [
    "Explain why a growing backend needs a clear place for each kind of code.",
    "Split a route into controller, service and repository, each with one job.",
    "Pass a service its repository (dependency injection) and test it with a fake.",
    "Choose between folders by layer and folders by feature.",
    "Tell when extra layers help and when a small app is better without them.",
  ],

  part(
    "why",
    "Why structure matters as an app grows",
    explain(
      "A small API fits in a few files and you can hold it all in your head. Then it grows: twenty routes, a background job, a second way in. If every controller checks rules, builds SQL and shapes the response, the same rule ends up copied in five places, and changing the database means touching every route.",
    ),
    analogy(
      "A restaurant has waiters, cooks and a store room. The waiter doesn't cook, and the cook doesn't take orders. Each knows who to ask for what.",
    ),
    keyPoints(
      "Structure is about where code goes, so you know where to look.",
      "Each kind of work in one place: change it once.",
      "It builds on [[separation-of-concerns]], one step further.",
    ),
  ),

  part(
    "today",
    "The Notes App today",
    explain(
      "The Notes App already separates a few things: routes map URLs to [[controller|controllers]], `validateNote` lives in its own file and [[express-middleware|middleware]] checks the login. But each controller also talks to the database itself, calling `pool.query` with the SQL right there in the function.",
    ),
    diagram([
      ["routes/notes.js", "URL → function"],
      ["notesController.js", "req, rules, SQL, res"],
      ["db.js pool", "PostgreSQL"],
    ]),
    inTheNotesApp(
      "`createNote` validates the body, runs the INSERT with `pool.query` and sends the 201, all in one function.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    keyPoints(
      "For four routes this is fine, and easy to read.",
      "The rules and the SQL are tied to req and res.",
      "Testing them needs the whole app and a real database.",
    ),
  ),

  part(
    "layers",
    "Three layers",
    explain(
      "[[layered-architecture|Layered architecture]] gives each kind of work a layer. The HTTP layer (routes and controllers) reads the request and sends the response. The [[service-layer|service layer]] holds the rules: what a valid note is, who may change it. The [[repository-pattern|repository]] is the only code that knows how notes are stored. Each layer only calls the one below it.",
    ),
    diagram([
      ["HTTP layer", "routes, controllers"],
      ["Service", "the rules"],
      ["Repository", "data access"],
      ["Database", "PostgreSQL"],
    ]),
    reference("Who does what", [
      ["Controller", "Reads req, calls a service, sends res.", "req.body"],
      [
        "Service",
        "Checks rules, decides, calls the repository.",
        "Title is required",
      ],
      ["Repository", "Saves and finds data. No rules.", "insertNote(...)"],
    ]),
    quickCheck(
      "Where does the rule “a title is at most 100 characters” belong?",
      [
        "In the controller, next to req.body",
        "In the service",
        "In the repository, next to the SQL",
      ],
      1,
      "Rules live in the service. Then a route, a background job and a test all get the same check, and the controller and repository stay simple.",
    ),
  ),

  part(
    "refactor",
    "Splitting createNote",
    explain(
      "Here is `createNote` split into the three layers. This is not how the Notes App is written today; it shows what the same feature looks like with layers. The SQL moves unchanged into a repository, the validation into a service, and the controller shrinks to reading the request and sending the answer.",
    ),
    code(
      "js",
      "repositories/notesRepo.js",
      [
        'import { pool } from "../db.js";',
        "",
        "export async function insertNote(userId, n) {",
        "  const result = await pool.query(",
        "    `INSERT INTO notes",
        "       (user_id, title, content)",
        "     VALUES ($1, $2, $3)",
        "     RETURNING *`,",
        "    [userId, n.title, n.content],",
        "  );",
        "  return result.rows[0];",
        "}",
      ],
      {
        1: "only the repository imports the pool",
        11: "plain data out: no result object, no res",
      },
    ),
    code(
      "js",
      "services/notesService.js",
      [
        "import * as repo",
        '  from "../repositories/notesRepo.js";',
        "",
        "export async function createNote(",
        "  userId,",
        "  input,",
        ") {",
        "  const error = validateNote(input);",
        "  if (error) throw new HttpError(400, error);",
        "  return repo.insertNote(userId, {",
        "    title: input.title.trim(),",
        '    content: input.content ?? "",',
        "  });",
        "}",
      ],
      {
        5: "no req, no res: just a user id and the data",
        9: "an HttpError: the error handler sends a 400",
      },
    ),
    code(
      "js",
      "controllers/notesController.js",
      [
        "export async function createNote(req, res) {",
        "  const note = await notes.createNote(",
        "    req.user.id,",
        "    req.body,",
        "  );",
        "  res.status(201).json(note);",
        "}",
      ],
      { 2: "`notes` is the service; more on where it comes from next" },
    ),
  ),

  part(
    "service-anatomy",
    "A service, piece by piece",
    anatomy(
      "The service in four lines",
      [
        "async createNote(userId, input) {",
        "  const error = validateNote(input);",
        "  if (error) throw new HttpError(400, error);",
        "  return repo.insertNote(userId, note);",
      ],
      [
        [
          "createNote(userId, input)",
          "plain inputs",
          "Who is asking and what they sent. No req, so a job or a test can call it.",
        ],
        [
          "validateNote(input)",
          "the rule",
          "Checked here, once, for every caller.",
        ],
        [
          "throw new HttpError(400, error)",
          "fail loudly",
          "The service doesn't send responses; the error middleware does.",
        ],
        [
          "repo.insertNote",
          "data access",
          "The service asks the repository; it never writes SQL itself.",
        ],
      ],
    ),
    keyPoints(
      "A service takes plain values and returns plain values.",
      "It throws errors; it never calls res.",
      "Any caller gets the same rules: route, job, script or test.",
    ),
  ),

  part(
    "injection",
    "Dependency injection",
    explain(
      "The service above imports its repository, so it always uses the real database. [[dependency-injection|Dependency injection]] means passing it in instead: `makeNotesService({ repo })` returns the service, using whatever `repo` it was given. The app builds the real pieces once, at startup, and hands them down.",
    ),
    code(
      "js",
      "A service that is given its repository",
      [
        "export function makeNotesService({ repo }) {",
        "  return {",
        "    async createNote(userId, input) {",
        "      const error = validateNote(input);",
        "      if (error) {",
        "        throw new HttpError(400, error);",
        "      }",
        "      return repo.insertNote(userId, {",
        "        title: input.title.trim(),",
        '        content: input.content ?? "",',
        "      });",
        "    },",
        "  };",
        "}",
      ],
      { 1: "its needs are listed right in the signature" },
    ),
    code(
      "js",
      "app.js: building the pieces once",
      [
        "const repo = makeNotesRepo(pool);",
        "const notes = makeNotesService({ repo });",
        "app.use(",
        '  "/api/notes",',
        "  makeNotesRoutes(notes),",
        ");",
      ],
      {
        1: "the real repository, using the real pool",
        5: "routes and controllers get the service",
      },
    ),
  ),

  part(
    "fake-repo",
    "Testing with a fake repository",
    explain(
      "Now a test can hand the service a fake repository: a plain object with the same functions, keeping notes in an array. The test runs in milliseconds with no database. Today the Notes App's tests start the whole app and need a real PostgreSQL. Follow a test of the service, synchronous here to keep it short.",
    ),
    trace(
      "A service test with a fake",
      [
        "const saved = [];",
        "const repo = {",
        "  insertNote(userId, n) {",
        "    const row = { id: 1, ...n };",
        "    saved.push(row);",
        "    return row;",
        "  },",
        "};",
        "const notes = makeNotesService({ repo });",
        "const created = notes.createNote(7, {",
        '  title: " Milk ",',
        "});",
        "console.log(created.title, saved.length);",
      ],
      [
        {
          line: 1,
          note: "The fake's storage: an empty array instead of a table.",
          vars: [["saved", "[]"]],
        },
        {
          line: 9,
          note: "The service gets the fake. It can't tell it isn't the real repository.",
          vars: [
            ["saved", "[]"],
            ["repo", "{ insertNote }"],
            ["notes", "{ createNote }"],
          ],
        },
        {
          line: 10,
          note: "createNote validates the body and trims the title, then calls repo.insertNote.",
          vars: [
            ["saved", "[]"],
            ["repo", "{ insertNote }"],
            ["notes", "{ createNote }"],
          ],
          stack: ["createNote"],
        },
        {
          line: 4,
          note: "Inside the fake. It got the cleaned note, so the trim really happened in the service.",
          vars: [
            ["saved", "[]"],
            ["repo", "{ insertNote }"],
            ["notes", "{ createNote }"],
            ["userId", "7"],
            ["n", '{ title: "Milk", content: "" }'],
            ["row", '{ id: 1, title: "Milk", content: "" }'],
          ],
          stack: ["createNote", "insertNote"],
        },
        {
          line: 5,
          note: "The fake “saves” the row in its array.",
          vars: [
            ["saved", '[{ id: 1, title: "Milk", content: "" }]'],
            ["repo", "{ insertNote }"],
            ["notes", "{ createNote }"],
            ["userId", "7"],
            ["n", '{ title: "Milk", content: "" }'],
            ["row", '{ id: 1, title: "Milk", content: "" }'],
          ],
          stack: ["createNote", "insertNote"],
        },
        {
          line: 13,
          note: "Back in the test: the note came back and one row was saved. No database was touched.",
          vars: [
            ["saved", '[{ id: 1, title: "Milk", content: "" }]'],
            ["repo", "{ insertNote }"],
            ["notes", "{ createNote }"],
            ["created", '{ id: 1, title: "Milk", content: "" }'],
          ],
          output: "Milk 1",
        },
      ],
    ),
    keyPoints(
      "A fake only needs the functions the service calls.",
      "Inject a clock (`now`) too, so dates in tests are fixed.",
      "Keep a few full-app tests as well, against a real database.",
    ),
  ),

  part(
    "folders",
    "Folders by layer or by feature",
    explain(
      "By layer puts all controllers together, all services together and so on. That's what the Notes App does with `routes/`, `controllers/` and `validation/`. By feature puts everything about notes in one folder. By layer is easy to start; by feature scales better, because one change usually touches one folder.",
    ),
    code(
      "bash",
      "The same files, two ways",
      [
        "# by layer",
        "src/controllers/notesController.js",
        "src/services/notesService.js",
        "src/repositories/notesRepo.js",
        "",
        "# by feature",
        "src/notes/notes.controller.js",
        "src/notes/notes.service.js",
        "src/notes/notes.repo.js",
        "src/auth/auth.controller.js",
      ],
      {
        1: "a notes change touches three folders",
        6: "a notes change stays in src/notes",
      },
    ),
    quickCheck(
      "Your API has grown to 12 features. Adding a field to “invoices” touches files in five folders. What would help?",
      [
        "Putting every file in one folder",
        "Folders by feature, with invoices in one place",
        "More folders by layer",
      ],
      1,
      "By feature keeps the controller, service and repository of one feature side by side, so one change stays in one folder.",
    ),
  ),

  part(
    "when-not",
    "When not to add layers",
    explain(
      "Layers cost something: more files, more names, more jumping around to follow one request. The Notes App has four note routes and almost no rules, and its structure is fine as it is. Add a service when the same rule is needed in two places, or when tests need to run without the database. Add layers when they solve a problem you have.",
    ),
    keyPoints(
      "Small app, few rules: controllers calling the pool are fine.",
      "Rules copied, or a job needs them: add a service.",
      "Many queries, or slow tests: add a repository.",
      "A service that only passes through adds files, not value.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "req and res inside the service",
      wrong: [
        "async createNote(req, res) {",
        "  if (!req.body.title) {",
        "    return res.status(400).json(/* … */);",
        "  }",
      ],
      problem:
        "Only an Express route can call it now. A job or a test has no req or res to give it.",
      right: [
        "async createNote(userId, input) {",
        "  if (!input.title) {",
        '    throw new HttpError(400, "No title");',
        "  }",
      ],
      why: "Services take plain values and throw; the HTTP layer turns errors into responses.",
    }),
    mistake({
      title: "Rules in the repository",
      wrong: [
        "async insertNote(userId, n) {",
        "  if (n.title.length > 100) throw …;",
        "  return pool.query(/* INSERT */);",
        "}",
      ],
      problem:
        "Swap the repository for a fake in a test and the rule disappears, and the rule is hard to find.",
      right: [
        "async insertNote(userId, n) {",
        "  return pool.query(/* INSERT */);",
        "}",
      ],
      why: "The repository only stores and finds data; rules belong in the service.",
    }),
    mistake({
      title: "Importing the real thing inside the service",
      wrong: [
        'import { pool } from "../db.js";',
        "export async function createNote(…) {",
        "  await pool.query(/* … */);",
        "}",
      ],
      problem:
        "Every test of this rule needs a running database, so tests are slow and fragile.",
      right: [
        "export function makeNotesService({ repo }) {",
        "  // uses repo, given from outside",
        "}",
      ],
      why: "Inject what the service uses; the app passes the real one and tests pass a fake.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A service with a fake repository",
      task: 'Write `createNote(input, { repo, now })`. Trim the title. If it\'s empty, return `{ error: "Title is required" }`. If it\'s over 100 characters, return `{ error: "Title is too long" }`. Otherwise return `repo.add({ title, content, createdAt: now() })`, where `content` defaults to `""`.',
      starter: [
        "function createNote(input, { repo, now }) {",
        "  return repo.add(input);",
        "}",
      ],
      tests: [
        [
          'createNote({ title: " Milk " }, { repo: { add: (n) => n }, now: () => "noon" })',
          '{ title: "Milk", content: "", createdAt: "noon" }',
        ],
        [
          'createNote({ title: "Tea", content: "green" }, { repo: { add: (n) => ({ id: 1, ...n }) }, now: () => 5 })',
          '{ id: 1, title: "Tea", content: "green", createdAt: 5 }',
        ],
        [
          'createNote({ title: "   " }, { repo: { add: (n) => n }, now: () => 0 })',
          '{ error: "Title is required" }',
        ],
        [
          'createNote({ title: "x".repeat(101) }, { repo: { add: (n) => n }, now: () => 0 })',
          '{ error: "Title is too long" }',
        ],
        [
          "(() => { let calls = 0; createNote({}, { repo: { add: () => calls++ }, now: () => 0 }); return calls; })()",
          "0",
        ],
      ],
      hint: 'Use `(input.title ?? "").trim()`, return early for each error, and call `repo.add` only at the end.',
      solution: [
        "function createNote(input, { repo, now }) {",
        '  const title = (input.title ?? "").trim();',
        '  if (!title) return { error: "Title is required" };',
        "  if (title.length > 100) {",
        '    return { error: "Title is too long" };',
        "  }",
        '  const content = input.content ?? "";',
        "  return repo.add({ title, content, createdAt: now() });",
        "}",
      ],
    }),
    yourTurn({
      title: "A repository in memory",
      task: "Write `makeMemoryRepo()`. It returns `{ add, list }`. `add(userId, note)` stores `{ id, userId, ...note }` with ids 1, 2, 3… and returns it. `list(userId)` returns only that user's notes, in the order they were added.",
      starter: [
        "function makeMemoryRepo() {",
        "  const rows = [];",
        "  return {",
        "    add(userId, note) {},",
        "    list(userId) { return rows; },",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const r = makeMemoryRepo(); return r.add(7, { title: "Milk" }); })()',
          '{ id: 1, userId: 7, title: "Milk" }',
        ],
        [
          '(() => { const r = makeMemoryRepo(); r.add(7, { title: "A" }); r.add(8, { title: "B" }); r.add(7, { title: "C" }); return r.list(7).map((n) => n.title); })()',
          '["A", "C"]',
        ],
        [
          '(() => { const r = makeMemoryRepo(); r.add(7, { title: "A" }); return r.add(8, { title: "B" }).id; })()',
          "2",
        ],
        ["makeMemoryRepo().list(7)", "[]"],
      ],
      hint: "The next id is `rows.length + 1`. Filter by `row.userId === userId` in `list`.",
      solution: [
        "function makeMemoryRepo() {",
        "  const rows = [];",
        "  return {",
        "    add(userId, note) {",
        "      const row = { id: rows.length + 1, userId, ...note };",
        "      rows.push(row);",
        "      return row;",
        "    },",
        "    list(userId) {",
        "      return rows.filter((r) => r.userId === userId);",
        "    },",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Layers cheat sheet", [
      [
        "Controller",
        "Reads req, calls the service, sends res.",
        "res.status(201).json(note)",
      ],
      [
        "Service",
        "The rules. Plain values in and out; throws errors.",
        "createNote(userId, input)",
      ],
      [
        "Repository",
        "The only code that knows how data is stored.",
        "repo.insertNote(userId, n)",
      ],
      [
        "Dependency injection",
        "Pass in what code uses instead of importing it.",
        "makeNotesService({ repo })",
      ],
      [
        "Fake repository",
        "Same functions, data in an array, for tests.",
        "{ insertNote(u, n) { … } }",
      ],
      ["By layer", "Folders per kind of code.", "controllers/, services/"],
      ["By feature", "Folders per feature.", "notes/, auth/"],
      [
        "Keep it small",
        "Add layers when they solve a real problem.",
        "4 routes: no service needed",
      ],
    ]),
    quickCheck(
      "Why does `makeNotesService({ repo })` make the service easier to test?",
      [
        "It makes the service run faster in production",
        "A test can pass a fake repository, so no database is needed",
        "It removes the need for validation",
      ],
      1,
      "The service uses whatever repository it is given. The app passes the real one; a test passes a fake that keeps notes in an array.",
    ),
  ),
);
