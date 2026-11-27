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

// Why a database: notes in an array, notes in a JSON file (two writes at
// once, step by step), what a database gives, relational databases and
// PostgreSQL, a separate server and DATABASE_URL, SQL, looking around with
// psql, the Notes App's two tables, CRUD, mistakes, practice and a recap.
export const whyADatabaseModule = moduleLesson(
  "why-a-database",
  "Why a database",
  45,
  [
    "Explain why notes kept in an array or a JSON file get lost or broken.",
    "Name what a database gives you: durability, rules, many users at once and fast search.",
    "Describe PostgreSQL as a separate server the backend connects to with DATABASE_URL.",
    "Look around a database with psql and recognise the Notes App's two tables.",
    "Match each CRUD action to its SQL statement and its HTTP method.",
  ],

  part(
    "array",
    "Notes in an array",
    explain(
      "The simplest place to keep notes is a JavaScript array in the server. It works for a demo: POST pushes a note, GET returns the array. But the array lives in the server's memory. Restart the server, or let it crash, and every note is gone.",
    ),
    code(
      "js",
      "Notes kept in memory",
      [
        "const notes = [];",
        "",
        'app.post("/api/notes", (req, res) => {',
        "  const note = { id: notes.length + 1,",
        "    title: req.body.title };",
        "  notes.push(note);",
        "  res.status(201).json(note);",
        "});",
      ],
      {
        1: "lives in this one process's memory",
        6: "gone on the next restart or crash",
      },
    ),
    keyPoints(
      "Memory is wiped when the process stops.",
      "Two copies of the server would each have their own array.",
      "Users would see different notes depending on which copy answered.",
    ),
  ),

  part(
    "json-file",
    "Notes in a JSON file",
    explain(
      "Saving the array to `notes.json` survives a restart. Each request reads the file, changes the array and writes it back. Now two requests arrive at the same moment. Step through what happens: request A adds Milk, request B adds Eggs.",
    ),
    trace(
      "Two requests, one file",
      [
        'let file = "[]"; // notes.json',
        "const a = JSON.parse(file); // A reads",
        "const b = JSON.parse(file); // B reads",
        'a.push("Milk");',
        'b.push("Eggs");',
        "file = JSON.stringify(a); // A writes",
        "file = JSON.stringify(b); // B writes",
        "console.log(file);",
      ],
      [
        {
          line: 1,
          note: "The file on disk holds an empty list.",
          vars: [["file", "'[]'"]],
        },
        {
          line: 2,
          note: "Request A reads the file to add Milk.",
          vars: [
            ["file", "'[]'"],
            ["a", "[]"],
          ],
        },
        {
          line: 3,
          note: "Request B reads it too, before A has written anything back.",
          vars: [
            ["file", "'[]'"],
            ["a", "[]"],
            ["b", "[]"],
          ],
        },
        {
          line: 4,
          note: "A adds Milk to its own copy.",
          vars: [
            ["file", "'[]'"],
            ["a", '["Milk"]'],
            ["b", "[]"],
          ],
        },
        {
          line: 5,
          note: "B adds Eggs to its copy, which has never seen Milk.",
          vars: [
            ["file", "'[]'"],
            ["a", '["Milk"]'],
            ["b", '["Eggs"]'],
          ],
        },
        {
          line: 6,
          note: "A writes its list. Milk is saved, for now.",
          vars: [
            ["file", "'[\"Milk\"]'"],
            ["a", '["Milk"]'],
            ["b", '["Eggs"]'],
          ],
        },
        {
          line: 7,
          note: "B writes its list over A's. Milk is lost, and nobody got an error.",
          vars: [
            ["file", "'[\"Eggs\"]'"],
            ["a", '["Milk"]'],
            ["b", '["Eggs"]'],
          ],
        },
        {
          line: 8,
          note: "Two notes were created; one is saved.",
          vars: [
            ["file", "'[\"Eggs\"]'"],
            ["a", '["Milk"]'],
            ["b", '["Eggs"]'],
          ],
          output: '["Eggs"]',
        },
      ],
    ),
    keyPoints(
      "Two writes at once lose data, or leave half-written JSON that won't parse.",
      "Finding one note means reading and parsing the whole file.",
      "Nothing stops a note with no title or a user id that doesn't exist.",
    ),
  ),

  part(
    "what-it-gives",
    "What a database gives you",
    explain(
      "A [[database]] is a separate program built to solve exactly these problems. It saves every change safely to disk, handles thousands of requests at once without losing any, refuses data that breaks your rules, and finds one row among millions quickly.",
    ),
    analogy(
      "A JSON file is a notebook everyone scribbles in at once. A database is a librarian: one desk, rules for every entry, a catalogue to find anything.",
    ),
    keyPoints(
      "Durable: a saved note survives restarts and crashes.",
      "Rules: every note needs a title and a real owner.",
      "Many users at once: no lost or half-written changes.",
      "Fast search: one user's notes without reading every note.",
    ),
  ),

  part(
    "relational",
    "Relational databases and PostgreSQL",
    explain(
      "A [[relational-database|relational database]] keeps data in tables of rows and columns, like a strict spreadsheet. Tables point at each other: every note row holds the id of the user who owns it. PostgreSQL (often just Postgres) is a popular, free relational database, and the one the Notes App uses. MySQL and SQLite are others.",
    ),
    code(
      "sql",
      "Two rows of the notes table",
      [
        "-- id | user_id | title    | content",
        "--  1 |       1 | Welcome  | Edit or…",
        "--  2 |       1 | Shopping | Milk, bread",
      ],
      {
        1: "columns: the facts every note has",
        2: "a row: one note",
      },
    ),
    quickCheck(
      "What makes a database relational?",
      [
        "It stores JavaScript objects as they are",
        "Data sits in tables of rows and columns, linked by ids",
        "It only runs on the same computer as the backend",
      ],
      1,
      "A relational database keeps tables of rows and columns, and rows link to rows in other tables by their ids, like a note's user_id.",
    ),
  ),

  part(
    "separate-server",
    "A separate server",
    explain(
      "PostgreSQL runs as its own server, apart from your backend. The backend connects to it over the network and sends it commands, just as a browser sends requests to the backend. Where to connect is one setting: `DATABASE_URL`, read from the environment so each machine can point at its own database.",
    ),
    diagram([
      ["Browser", "fetch"],
      ["Backend", "Express"],
      ["PostgreSQL", "port 5432"],
    ]),
    anatomy(
      "DATABASE_URL in backend/.env.example",
      ["postgres://postgres:dev@localhost:5432/notes"],
      [
        ["postgres://", "kind", "Talk to a PostgreSQL server."],
        ["postgres", "user", "The database user to log in as."],
        [
          "dev",
          "password",
          "That user's password. A real one never goes in Git.",
        ],
        ["localhost", "host", "Which computer: here, your own."],
        ["5432", "port", "PostgreSQL's usual port."],
        [
          "notes",
          "database",
          "One server can hold many databases; use this one.",
        ],
      ],
    ),
    inTheNotesApp(
      "`.env.example` lists `DATABASE_URL`, and `db.js` reads it to connect. Copy the example to `.env` and change the values.",
      { fileId: "backend/.env.example" },
    ),
  ),

  part(
    "sql",
    "SQL: the language you send",
    explain(
      "You talk to the database in [[sql|SQL]]. You describe the result you want, like 'user 1's note titles, newest first', and the database works out how to find it. One command is a statement; one that asks for data is a query. The rest of this level teaches the main ones.",
    ),
    code(
      "sql",
      "Four statements, four jobs",
      [
        "SELECT title FROM notes WHERE user_id = 1;",
        "",
        "INSERT INTO notes (user_id, title)",
        "VALUES (1, 'Milk');",
        "",
        "UPDATE notes SET title = 'Eggs' WHERE id = 3;",
        "",
        "DELETE FROM notes WHERE id = 3;",
      ],
      {
        1: "read rows",
        3: "add a row",
        6: "change rows",
        8: "remove rows",
      },
    ),
    keyPoints(
      "Keywords are written in capitals by habit; SQL doesn't mind.",
      "Text values use single quotes: 'Milk'.",
      "A statement ends with a semicolon.",
    ),
  ),

  part(
    "psql",
    "Looking around with psql",
    explain(
      "[[psql]] is PostgreSQL's command-line client. Connect with your `DATABASE_URL`, then type SQL and see the rows that come back. Commands that start with a backslash are psql's own: `\\dt` lists the tables, `\\d notes` describes one, `\\q` quits.",
    ),
    code(
      "bash",
      "A short psql session (output trimmed)",
      [
        'psql "$DATABASE_URL"',
        "notes=# \\dt",
        " public | notes | table | postgres",
        " public | users | table | postgres",
        "notes=# \\d notes",
        " id         | integer",
        " user_id    | integer",
        " title      | text",
        " content    | text",
        " created_at | timestamp with time zone",
        " updated_at | timestamp with time zone",
        "notes=# SELECT title FROM notes;",
        " Welcome to your notes",
        " Shopping",
        "notes=# \\q",
      ],
      {
        1: "connect to the database in the URL",
        2: "list the tables",
        5: "describe one table's columns",
        12: "any SQL works here",
      },
    ),
  ),

  part(
    "two-tables",
    "The Notes App's two tables",
    explain(
      "The whole Notes App needs two tables: `users`, one row per account, and `notes`, one row per note. Each note's `user_id` holds the id of its owner. They are defined in `database/schema.sql`, which you run once on an empty database. The next module takes it apart line by line.",
    ),
    code(
      "sql",
      "schema.sql at a glance (shortened)",
      [
        "CREATE TABLE users (",
        "  id SERIAL PRIMARY KEY,",
        "  email TEXT NOT NULL UNIQUE,",
        "  password_hash TEXT NOT NULL,",
        "  created_at TIMESTAMPTZ …",
        ");",
        "CREATE TABLE notes (",
        "  id SERIAL PRIMARY KEY,",
        "  user_id INTEGER NOT NULL",
        "    REFERENCES users (id) …,",
        "  title TEXT NOT NULL,",
        "  content TEXT NOT NULL DEFAULT '',",
        "  created_at …, updated_at …",
        ");",
      ],
      {
        1: "one row per account",
        7: "one row per note",
        10: "every note points at a real user",
      },
    ),
    inTheNotesApp(
      'Run it with `psql "$DATABASE_URL" -f database/schema.sql`, then `seed.sql` for a demo user and two notes.',
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "crud",
    "CRUD: four things you do with data",
    explain(
      "Almost everything an app does with stored data is one of four actions: Create, Read, Update, Delete, or [[crud|CRUD]]. Each lines up with a SQL statement and with an [[http-methods|HTTP method]], so a Notes App route, its controller and its SQL all say the same thing.",
    ),
    reference("CRUD in the Notes App", [
      ["Create", "INSERT. POST /api/notes.", "INSERT INTO notes …"],
      ["Read", "SELECT. GET /api/notes.", "SELECT … FROM notes"],
      ["Update", "UPDATE. PUT /api/notes/:id.", "UPDATE notes SET …"],
      ["Delete", "DELETE. DELETE /api/notes/:id.", "DELETE FROM notes …"],
    ]),
    inTheNotesApp(
      "`notesController.js` has one controller per row: listNotes, createNote, updateNote and deleteNote, each sending one SQL statement.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Keeping real data in memory",
      wrong: ["const users = [];", "users.push({ email, passwordHash });"],
      problem:
        "Every account vanishes on the next deploy or crash, and a second server copy has different users.",
      right: [
        "await pool.query(",
        "  `INSERT INTO users (email, password_hash)",
        "   VALUES ($1, $2)`, [email, hash]);",
      ],
      why: "Anything that must outlive the process belongs in the database.",
    }),
    mistake({
      title: "Writing the database address into the code",
      wrong: [
        "new pg.Pool({ connectionString:",
        '  "postgres://postgres:dev@localhost/notes" });',
      ],
      problem:
        "Production would try your laptop's database, and the password ends up in Git.",
      right: [
        "new pg.Pool({ connectionString:",
        "  process.env.DATABASE_URL });",
      ],
      why: "Each machine sets its own DATABASE_URL; the code stays the same.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Notes that survive a restart",
      task: "`createStore(disk)` returns `{ add(title), all() }`. Right now notes live in a local array, so a new store (a restart) starts empty. Keep them in `disk.notes` instead (create it as `[]` if it's missing), so a new store made with the same `disk` sees them.",
      starter: [
        "function createStore(disk) {",
        "  const notes = [];",
        "  return {",
        "    add(title) { notes.push(title); },",
        "    all() { return notes; },",
        "  };",
        "}",
      ],
      tests: [
        [
          '(() => { const disk = {}; createStore(disk).add("Milk"); return createStore(disk).all(); })()',
          '["Milk"]',
        ],
        [
          '(() => { const s = createStore({}); s.add("Milk"); s.add("Eggs"); return s.all(); })()',
          '["Milk", "Eggs"]',
        ],
        ['createStore({ notes: ["Old"] }).all()', '["Old"]'],
      ],
      hint: "Start with `if (!disk.notes) disk.notes = [];`, then push to and return `disk.notes`.",
      solution: [
        "function createStore(disk) {",
        "  if (!disk.notes) disk.notes = [];",
        "  return {",
        "    add(title) { disk.notes.push(title); },",
        "    all() { return disk.notes; },",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "CRUD for a method",
      task: 'Write `crudFor(method)`: for `"POST"`, `"GET"`, `"PUT"` and `"DELETE"` return `{ action, sql }`, such as `{ action: "Create", sql: "INSERT" }`. Return `null` for any other method.',
      starter: [
        "function crudFor(method) {",
        '  if (method === "POST") {',
        '    return { action: "Create", sql: "INSERT" };',
        "  }",
        "  return null;",
        "}",
      ],
      tests: [
        ['crudFor("POST")', '{ action: "Create", sql: "INSERT" }'],
        ['crudFor("GET")', '{ action: "Read", sql: "SELECT" }'],
        ['crudFor("PUT")', '{ action: "Update", sql: "UPDATE" }'],
        ['crudFor("DELETE")', '{ action: "Delete", sql: "DELETE" }'],
        ['crudFor("HEAD")', "null"],
      ],
      hint: "An object keyed by method keeps it short: `CRUD[method] ?? null`.",
      solution: [
        "const CRUD = {",
        '  POST: { action: "Create", sql: "INSERT" },',
        '  GET: { action: "Read", sql: "SELECT" },',
        '  PUT: { action: "Update", sql: "UPDATE" },',
        '  DELETE: { action: "Delete", sql: "DELETE" },',
        "};",
        "function crudFor(method) {",
        "  return CRUD[method] ?? null;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Why a database: cheat sheet", [
      [
        "Array in memory",
        "Lost on restart; one server only.",
        "const notes = []",
      ],
      [
        "JSON file",
        "Two writes at once lose data; slow to search; no rules.",
        "notes.json",
      ],
      [
        "Database",
        "Durable, enforces rules, many users at once, fast search.",
        "PostgreSQL",
      ],
      [
        "Relational",
        "Tables of rows and columns, linked by ids.",
        "notes.user_id → users.id",
      ],
      [
        "DATABASE_URL",
        "Where the database server is, from the environment.",
        "postgres://…@localhost:5432/notes",
      ],
      ["SQL", "The language you send it.", "SELECT title FROM notes;"],
      [
        "psql",
        "Command-line client. \\dt, \\d notes, \\q.",
        'psql "$DATABASE_URL"',
      ],
      [
        "CRUD",
        "Create, Read, Update, Delete: INSERT, SELECT, UPDATE, DELETE.",
        "POST → INSERT",
      ],
    ]),
    quickCheck(
      "Which SQL statement does `GET /api/notes` run in the Notes App?",
      ["INSERT", "SELECT", "UPDATE"],
      1,
      "GET reads, and reading is the R of CRUD, so listNotes sends a SELECT. POST creates with INSERT, PUT changes with UPDATE.",
    ),
  ),
);
