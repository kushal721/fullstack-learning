import {
  analogy,
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
  scene,
  trace,
  yourTurn,
} from "../blocks.js";

// SQL from your backend: the pg driver, db.js and DATABASE_URL,
// pool.query and its result, parameters, why gluing strings is dangerous,
// the values kept apart step by step, database errors as HTTP answers, the
// connection pool, what JavaScript gets back, mistakes, practice and a
// recap.
export const sqlFromNodeModule = moduleLesson(
  "sql-from-node",
  "SQL from your backend",
  50,
  [
    "Explain what the pg driver does and how db.js creates one pool from DATABASE_URL.",
    "Run pool.query(text, values) and use the rows and rowCount it returns.",
    "Pass every value as $1, $2… and explain why gluing strings into SQL is dangerous.",
    "Turn database error codes like 23505 into the right HTTP status.",
    "Explain why a server keeps one connection pool, and what types come back.",
  ],

  part(
    "driver",
    "From a controller to PostgreSQL",
    explain(
      "PostgreSQL is a separate program, often on another machine. Your Node.js code talks to it through a [[db-driver|database driver]]: for PostgreSQL that is the `pg` package. It opens connections, sends your SQL and the values, waits, and turns the rows that come back into JavaScript objects. Every query is a promise, so controllers `await` it.",
    ),
    diagram([
      ["Controller", "createNote"],
      ["pg Pool", "db.js"],
      ["PostgreSQL", "notes table"],
      ["Rows", "→ JS objects"],
    ]),
    scene("note-saved-read-back"),
  ),

  part(
    "db-js",
    "db.js: one pool for the app",
    explain(
      "The Notes App connects in one small file. It creates a [[db-connection-pool|connection pool]] from `DATABASE_URL`, an [[environment-variables|environment variable]] holding the database's address, user and password. Every controller imports the same `pool`. The address is not in the code, so each machine can point at its own database.",
    ),
    anatomy(
      "backend/src/db.js",
      [
        'import pg from "pg";',
        "export const pool = new pg.Pool({",
        "  connectionString:",
        "    process.env.DATABASE_URL });",
      ],
      [
        ['"pg"', "the driver", "From npm: node-postgres."],
        ["export const pool", "shared", "Controllers import this one pool."],
        [
          "new pg.Pool",
          "a pool",
          "Keeps a few connections open and lends them out.",
        ],
        [
          "process.env.DATABASE_URL",
          "where",
          "postgres://user:password@host:5432/notes, read from .env.",
        ],
      ],
    ),
    code(
      "bash",
      "The shape of DATABASE_URL, in backend/.env",
      ["DATABASE_URL=postgres://user:pw@host:5432/db"],
      {
        1: "Locally: postgres://postgres:dev@localhost:5432/notes (from .env.example). .env itself is never committed.",
      },
    ),
  ),

  part(
    "pool-query",
    "pool.query and its result",
    explain(
      "`pool.query(text, values)` sends one SQL statement. `text` is the SQL with `$1`, `$2`… where values go; `values` is an array filled in by position. It resolves to a result object. You mostly need two fields: `rows`, an array with one object per row, and `rowCount`, how many rows were returned or changed.",
    ),
    code(
      "js",
      "listNotes, asking for one user's notes",
      [
        "const result = await pool.query(",
        '  "SELECT id, title FROM notes" +',
        '    " WHERE user_id = $1",',
        "  [req.user.id],",
        ");",
        "result.rows;",
        '// [{ id: 7, title: "Milk" }, …]',
        "result.rowCount; // 2",
      ],
      {
        3: "$1 is a placeholder, not a value",
        4: "values: $1 is the first item",
        6: "one plain object per row",
        8: "rows returned, or rows changed",
      },
    ),
    keyPoints(
      "$1 is values[0], $2 is values[1], and so on.",
      "rows is always an array; it may be empty.",
      "For INSERT … RETURNING, rows[0] is the new row.",
      "A failed query rejects, so await throws.",
    ),
  ),

  part(
    "parameters",
    "Parameters keep values apart",
    explain(
      "A [[parameterized-query|parameterized query]] sends the SQL text and the values separately. PostgreSQL reads the SQL first and works out what it means; only then are the values slotted in, as plain data. A title can contain quotes, semicolons or the word DROP, and it is still just a title.",
    ),
    anatomy(
      "createNote's INSERT",
      [
        "pool.query(",
        '  "INSERT INTO notes (user_id, title)" +',
        '  " VALUES ($1, $2) RETURNING *",',
        "  [req.user.id, title.trim()]);",
      ],
      [
        ["pool.query(", "send", "One statement, one round trip."],
        [
          "($1, $2)",
          "placeholders",
          "Holes in the SQL. Its meaning is fixed before any value arrives.",
        ],
        ["RETURNING *", "send it back", "The saved row, with its new id."],
        ["req.user.id", "$1", "The first value fills $1."],
        ["title.trim()", "$2", "The second fills $2: always plain text."],
      ],
    ),
  ),

  part(
    "injection",
    "Why gluing strings is dangerous",
    explain(
      "It is tempting to build SQL with a template literal. But then the user's text becomes part of the SQL itself. A note titled `'); DROP TABLE notes; --` closes the string, ends the INSERT, adds a statement of its own and turns the rest into a comment. This is called SQL injection; the Security topic covers it in depth. The cure is always parameters.",
    ),
    code(
      "js",
      "Never do this",
      [
        "const sql = `INSERT INTO notes (title)",
        "  VALUES ('${title}')`;",
        "",
        "// with that title, the SQL becomes:",
        "// INSERT INTO notes (title)",
        "//   VALUES (''); DROP TABLE notes; --')",
      ],
      {
        2: "the user's text is pasted into the SQL",
        6: "a second statement: every note is gone",
      },
    ),
    quickCheck(
      'With `pool.query("… VALUES ($1)", [title])`, what happens to a title of `\'); DROP TABLE notes; --`?',
      [
        "The notes table is dropped",
        "PostgreSQL rejects the query",
        "A note is saved with exactly that text as its title",
      ],
      2,
      "The SQL's meaning was fixed before the value arrived, so the value is only ever data. The note is saved with that odd title, and nothing else happens.",
    ),
  ),

  part(
    "step-by-step",
    "The values stay apart, step by step",
    explain(
      "A helper that builds a query returns two things: the text and the values. Follow it with the nasty title. Watch `text`: it never changes, whatever the title is.",
    ),
    trace(
      "Building { text, values }",
      [
        "function insertNote(userId, title) {",
        "  const text = `INSERT INTO notes",
        "    (user_id, title) VALUES ($1, $2)`;",
        "  const values = [userId, title];",
        "  return { text, values };",
        "}",
        'const title = "\'); DROP TABLE notes; --";',
        "const q = insertNote(3, title);",
        "// pool.query(q.text, q.values)",
      ],
      [
        {
          line: 7,
          note: "A title typed by a user who is trying their luck.",
          vars: [["title", '"\'); DROP TABLE notes; --"']],
        },
        {
          line: 8,
          note: "Build the query for user 3.",
          vars: [["title", '"\'); DROP TABLE notes; --"']],
        },
        {
          line: 2,
          note: "The SQL text has only placeholders. The title isn't in it.",
          vars: [
            ["userId", "3"],
            ["title", '"\'); DROP TABLE notes; --"'],
            ["text", '"INSERT INTO notes … ($1, $2)"'],
          ],
          stack: ["insertNote"],
        },
        {
          line: 4,
          note: "The values go in their own array.",
          vars: [
            ["userId", "3"],
            ["title", '"\'); DROP TABLE notes; --"'],
            ["text", '"INSERT INTO notes … ($1, $2)"'],
            ["values", '[3, "\'); DROP TABLE notes; --"]'],
          ],
          stack: ["insertNote"],
        },
        {
          line: 8,
          note: "pool.query sends both separately. PostgreSQL stores the title as text; no table is dropped.",
          vars: [
            ["title", '"\'); DROP TABLE notes; --"'],
            ["q", '{ text: "INSERT … ($1, $2)", values: [3, "\');…"] }'],
          ],
        },
      ],
    ),
  ),

  part(
    "errors",
    "Database errors as HTTP answers",
    explain(
      "When a write breaks a rule in the schema, `await pool.query` throws an error with a `code`, a five-character SQLSTATE. A [[controller]] can catch the ones it understands and pick a better [[http-status-codes|status]]: a duplicate email is the client's problem (409 Conflict), not a server crash. Anything else is re-thrown, and the error handler answers 500.",
    ),
    code(
      "js",
      "register in authController.js (shortened)",
      [
        'const UNIQUE_VIOLATION = "23505";',
        "try {",
        "  const result = await pool.query(insert,",
        "    [email, passwordHash]);",
        "  res.status(201).json(result.rows[0]);",
        "} catch (err) {",
        "  if (err.code === UNIQUE_VIOLATION) {",
        "    return res.status(409).json({",
        '      error: "Email already registered",',
        "    });",
        "  }",
        "  throw err;",
        "}",
      ],
      {
        1: "email is UNIQUE in schema.sql",
        7: "this email is already taken",
        12: "anything else: let the error handler send 500",
      },
    ),
    reference("Error codes worth knowing", [
      ["23505 unique_violation", "A UNIQUE value already exists.", "409"],
      [
        "23503 foreign_key_violation",
        "Points at a row that doesn't exist.",
        "400 (or 404)",
      ],
      ["23502 not_null_violation", "A required column got NULL.", "400"],
      ["Anything else", "A real server problem: re-throw it.", "500"],
    ]),
  ),

  part(
    "pool",
    "Why a connection pool",
    explain(
      "Opening a database connection is slow: a network handshake, a login, a new process on the database server. Doing it for every request would add tens of milliseconds each time. A pool opens a few connections and keeps them. Each `pool.query` borrows a free one, runs, and gives it back. If all are busy, the query waits in line.",
    ),
    analogy(
      "A pool is like a few shopping trolleys by the door: you take one, use it, return it. Nobody builds a new trolley per customer.",
    ),
    keyPoints(
      "pg's pool holds up to 10 connections by default (the max option).",
      "pool.query borrows and returns a connection for you.",
      "Create one pool per app, in one file, and import it.",
      "PostgreSQL limits total connections, often to 100.",
      "Tests and shutdown call pool.end() to close them.",
    ),
  ),

  part(
    "types",
    "What JavaScript gets back",
    explain(
      "pg turns each row into a plain object whose keys are the column names, exactly as written in SQL: `created_at`, not `createdAt`. It also converts the values. Most do what you'd expect, but a few surprise people: COUNT(*) gives a string, because a 64-bit number might not fit in a JavaScript number.",
    ),
    reference("PostgreSQL → JavaScript, with pg", [
      ["INTEGER, SERIAL", "number", "7"],
      ["TEXT", "string", '"Milk"'],
      ["BOOLEAN", "true or false", "true"],
      ["TIMESTAMPTZ", "a Date object; JSON turns it into ISO text", "Date"],
      ["NULL", "null", "null"],
      ["BIGINT, COUNT(*), NUMERIC", "string, to keep the exact digits", '"42"'],
    ]),
    inTheNotesApp(
      "`listNotes` sends `result.rows` straight to `res.json`, so the browser gets `created_at` as text like `2026-11-27T09:30:00.000Z`.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Gluing user input into SQL",
      wrong: ["pool.query(", "  `SELECT * FROM notes WHERE id = ${id}`);"],
      problem:
        "The id is part of the SQL text, so a crafted value can change what the query does.",
      right: [
        "pool.query(",
        '  "SELECT * FROM notes WHERE id = $1",',
        "  [id]);",
      ],
      why: "With $1 the value is only ever data, never SQL.",
    }),
    mistake({
      title: "A new pool for every request",
      wrong: [
        "export async function listNotes(req, res) {",
        "  const pool = new pg.Pool(config);",
        "  const result = await pool.query(sql, v);",
      ],
      problem:
        "Each request opens new connections and never closes them, until PostgreSQL refuses more.",
      right: [
        'import { pool } from "../db.js";',
        "export async function listNotes(req, res) {",
        "  const result = await pool.query(sql, v);",
      ],
      why: "One pool, created once in db.js, shared by every controller.",
    }),
    mistake({
      title: "Every error is a 409",
      wrong: ["} catch (err) {", "  return res.status(409).json(taken);", "}"],
      problem:
        "If the database is down, the user is told their email is taken, and the real error is hidden.",
      right: [
        "} catch (err) {",
        '  if (err.code === "23505") {',
        "    return res.status(409).json(taken);",
        "  }",
        "  throw err;",
        "}",
      ],
      why: "Only handle the code you understand; re-throw the rest.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build a parameterized query",
      task: "Write `buildQuery(table, where)`. `where` is an object like `{ user_id: 3, id: 7 }`. Return `{ text, values }` where text is `SELECT * FROM notes WHERE user_id = $1 AND id = $2` and values is `[3, 7]`. With an empty `where`, return just `SELECT * FROM notes` and `[]`. (Table and column names come from your code, never the user.)",
      starter: [
        "function buildQuery(table, where) {",
        "  const conds = Object.keys(where)",
        "    .map((k) => `${k} = ${where[k]}`);",
        "  const text = `SELECT * FROM ${table}` +",
        '    " WHERE " + conds.join(" AND ");',
        "  return { text, values: [] };",
        "}",
      ],
      tests: [
        [
          'buildQuery("notes", { user_id: 3 })',
          '{ text: "SELECT * FROM notes WHERE user_id = $1", values: [3] }',
        ],
        [
          'buildQuery("notes", { user_id: 3, id: 7 })',
          '{ text: "SELECT * FROM notes WHERE user_id = $1 AND id = $2", values: [3, 7] }',
        ],
        [
          'buildQuery("notes", {})',
          '{ text: "SELECT * FROM notes", values: [] }',
        ],
        [
          'buildQuery("notes", { title: "\'); DROP TABLE notes; --" }).text',
          '"SELECT * FROM notes WHERE title = $1"',
        ],
      ],
      hint: "`Object.keys(where)` gives the columns. Use the index: `${k} = $${i + 1}`. Values are `keys.map((k) => where[k])`.",
      solution: [
        "function buildQuery(table, where) {",
        "  const keys = Object.keys(where);",
        "  const values = keys.map((k) => where[k]);",
        "  const conds = keys.map(",
        "    (k, i) => `${k} = $${i + 1}`,",
        "  );",
        "  let text = `SELECT * FROM ${table}`;",
        "  if (conds.length) {",
        '    text += " WHERE " + conds.join(" AND ");',
        "  }",
        "  return { text, values };",
        "}",
      ],
    }),
    yourTurn({
      title: "Error code to status",
      task: 'Write `errorToStatus(err)`. Return `409` for code `"23505"`, `400` for `"23503"` and `"23502"`, and `500` for anything else, including errors with no code.',
      starter: [
        "function errorToStatus(err) {",
        '  if (err.code === "23505") return 409;',
        "  return 400;",
        "}",
      ],
      tests: [
        ['errorToStatus({ code: "23505" })', "409"],
        ['errorToStatus({ code: "23503" })', "400"],
        ['errorToStatus({ code: "23502" })', "400"],
        ['errorToStatus(new Error("connection refused"))', "500"],
        ['errorToStatus({ code: "42P01" })', "500"],
      ],
      hint: "Check the known codes one by one, and end with `return 500`.",
      solution: [
        "function errorToStatus(err) {",
        "  switch (err.code) {",
        '    case "23505":',
        "      return 409;",
        '    case "23503":',
        '    case "23502":',
        "      return 400;",
        "    default:",
        "      return 500;",
        "  }",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("SQL from Node.js cheat sheet", [
      ["pg", "The PostgreSQL driver for Node.js.", 'import pg from "pg"'],
      [
        "Pool",
        "Open connections, lent to each query. One per app.",
        "new pg.Pool({ connectionString })",
      ],
      [
        "DATABASE_URL",
        "Where the database is, from the environment.",
        "postgres://user:pw@host:5432/notes",
      ],
      [
        "pool.query",
        "Send SQL and values; resolves to a result.",
        "await pool.query(text, values)",
      ],
      ["rows", "One object per row, keys = column names.", "result.rows[0]"],
      ["rowCount", "Rows returned or changed.", "if (result.rowCount === 0) …"],
      [
        "$1, $2",
        "Placeholders filled from the array, as data.",
        "WHERE id = $1 AND user_id = $2",
      ],
      [
        "err.code",
        "SQLSTATE of a failed query.",
        '"23505" → 409, "23503" → 400',
      ],
      ["Types", "TIMESTAMPTZ → Date, NULL → null, COUNT → string."],
    ]),
    quickCheck(
      "Why does the Notes App create its pool once in db.js instead of in each controller?",
      [
        "Pools only work in a file called db.js",
        "Opening connections is slow, and one shared pool reuses a few for every request",
        "So that each request gets its own database",
      ],
      1,
      "A pool keeps a few connections open and lends them out. Creating pools per request would open new connections each time, which is slow and soon hits PostgreSQL's connection limit.",
    ),
  ),
);
