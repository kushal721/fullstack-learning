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

// Three notes the select exercises run on.
const notes =
  '[{ id: 1, user_id: 1, title: "Welcome" }, { id: 2, user_id: 2, title: "Gym" }, { id: 3, user_id: 1, title: "Shopping" }, { id: 4, user_id: 1, title: "Books" }]';

// SELECT and INSERT: SELECT taken apart, WHERE, ORDER BY and LIMIT, COUNT
// and naming columns, a SELECT step by step, INSERT and defaults,
// RETURNING, INSERT … SELECT in seed.sql, the Notes App's two queries,
// mistakes, practice and a recap.
export const selectAndInsertModule = moduleLesson(
  "select-and-insert",
  "SELECT and INSERT",
  50,
  [
    "Read rows with SELECT, choosing columns and filtering with WHERE.",
    "Sort and page results with ORDER BY, LIMIT and OFFSET, and count rows with COUNT.",
    "Add rows with INSERT, letting DEFAULTs and generated ids fill in the rest.",
    "Get the saved row back with RETURNING, and insert from a SELECT.",
    "Read the Notes App's listNotes and createNote queries line by line.",
  ],

  part(
    "select",
    "SELECT, taken apart",
    explain(
      "[[sql-select|SELECT]] reads rows. You say which columns, from which table, which rows and in what order. The answer is a small table of its own: zero, one or many rows. Here is the shape of the Notes App's list query.",
    ),
    anatomy(
      "One user's notes, newest first",
      [
        "SELECT id, title, created_at",
        "  FROM notes",
        " WHERE user_id = 1",
        " ORDER BY created_at DESC;",
      ],
      [
        ["SELECT", "read", "This statement reads rows; it changes nothing."],
        [
          "id, title, created_at",
          "columns",
          "Only these columns come back, in this order.",
        ],
        ["FROM notes", "table", "Which table to read from."],
        ["WHERE user_id = 1", "which rows", "Only rows where this is true."],
        [
          "ORDER BY created_at DESC",
          "order",
          "Newest first. DESC is high to low; ASC (the default) low to high.",
        ],
      ],
    ),
    keyPoints(
      "The line breaks and indents are only for reading.",
      "No WHERE: every row in the table.",
      "No ORDER BY: rows in no promised order.",
    ),
  ),

  part(
    "where",
    "WHERE: picking rows",
    explain(
      "[[sql-where|WHERE]] keeps the rows where a condition is true. Compare with `=`, `<>` (not equal), `<` and `>`. Join conditions with AND and OR. LIKE matches a pattern where `%` means 'anything'; ILIKE does the same ignoring case. NULL needs IS NULL, because `= NULL` is never true.",
    ),
    code(
      "sql",
      "Conditions",
      [
        "SELECT title FROM notes WHERE id = 2;",
        "SELECT title FROM notes WHERE id <> 2;",
        "SELECT title FROM notes WHERE id < 10;",
        "",
        "SELECT title FROM notes",
        " WHERE user_id = 1 AND content = '';",
        "SELECT title FROM notes",
        " WHERE id = 1 OR id = 2;",
        "",
        "SELECT title FROM notes",
        " WHERE title ILIKE '%milk%';",
        "SELECT email FROM users",
        " WHERE email LIKE '%@example.com';",
        "SELECT title FROM notes",
        " WHERE content IS NULL;",
      ],
      {
        2: "<> means 'not equal'",
        6: "both must be true",
        8: "either one is enough",
        11: "Milk, MILK, oat milk…",
        15: "never = NULL (none here: NOT NULL)",
      },
    ),
    quickCheck(
      "`SELECT title FROM notes WHERE content = NULL;` What comes back?",
      ["The notes with no content", "No rows, ever", "Every note"],
      1,
      "Comparing anything with NULL gives 'unknown', never true, so = NULL matches no rows. Write WHERE content IS NULL instead.",
    ),
  ),

  part(
    "order-limit",
    "ORDER BY, LIMIT and OFFSET",
    explain(
      "[[sql-order-limit|ORDER BY]] sorts the rows; add DESC for high to low, and a second column to break ties. LIMIT keeps only the first few rows, and OFFSET skips some first, which gives simple pages. Always ORDER BY when you LIMIT, or which rows you get is up to the database.",
    ),
    code(
      "sql",
      "Page 2 of one user's notes, 20 per page",
      [
        "SELECT id, title FROM notes",
        " WHERE user_id = 1",
        " ORDER BY created_at DESC, id DESC",
        " LIMIT 20 OFFSET 20;",
      ],
      {
        3: "id breaks ties between equal times",
        4: "skip the first 20, keep the next 20",
      },
    ),
    keyPoints(
      "The order runs: FROM, WHERE, ORDER BY, OFFSET, LIMIT.",
      "The Notes App's listNotes has no LIMIT: it returns every note.",
      "Big OFFSETs get slow; the Advanced level shows better paging.",
    ),
  ),

  part(
    "count-columns",
    "COUNT, and naming your columns",
    explain(
      "`COUNT(*)` gives back one row with one number: how many rows match. It's how you answer 'how many notes does user 1 have?' without sending them all. And in app code, always name the columns you want instead of `SELECT *`: you send only what's needed, and a column added later (like a password hash) can't leak out.",
    ),
    code(
      "sql",
      "Counting, and asking for what you need",
      [
        "SELECT COUNT(*) FROM notes WHERE user_id = 1;",
        "-- count",
        "-- -------",
        "--      3",
        "",
        "SELECT id, email FROM users WHERE id = 1;",
      ],
      {
        1: "one row back, whatever the number",
        6: "never password_hash",
      },
    ),
    inTheNotesApp(
      "`currentUser` asks for `id, email` only, so the password hash never leaves the database.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "step-by-step",
    "A SELECT, step by step",
    explain(
      "The database works out a query in a set order, whatever order you write it in: FROM, then WHERE, then ORDER BY, then LIMIT, and the SELECT columns last. Here is `SELECT title FROM notes WHERE user_id = 1 ORDER BY id DESC LIMIT 1` done by hand in JavaScript.",
    ),
    trace(
      "The newest title of user 1",
      [
        "const notes = [",
        '  { id: 1, user_id: 1, title: "Welcome" },',
        '  { id: 2, user_id: 2, title: "Gym" },',
        '  { id: 3, user_id: 1, title: "Shopping" },',
        "];",
        "let rows = notes; // FROM notes",
        "rows = rows.filter(",
        "  (n) => n.user_id === 1); // WHERE",
        "rows = [...rows].sort(",
        "  (a, b) => b.id - a.id); // ORDER BY",
        "rows = rows.slice(0, 1); // LIMIT 1",
        "rows = rows.map(",
        "  (n) => ({ title: n.title })); // SELECT",
        "console.log(rows);",
      ],
      [
        {
          line: 6,
          note: "FROM: start with every row of the table.",
          vars: [
            ["notes", "[Welcome, Gym, Shopping]"],
            ["rows", "[Welcome, Gym, Shopping]"],
          ],
        },
        {
          line: 7,
          note: "WHERE: keep user 1's rows. Gym belongs to user 2.",
          vars: [
            ["notes", "[Welcome, Gym, Shopping]"],
            ["rows", "[Welcome, Shopping]"],
          ],
        },
        {
          line: 9,
          note: "ORDER BY id DESC: highest id first.",
          vars: [
            ["notes", "[Welcome, Gym, Shopping]"],
            ["rows", "[Shopping, Welcome]"],
          ],
        },
        {
          line: 11,
          note: "LIMIT 1: keep only the first row.",
          vars: [
            ["notes", "[Welcome, Gym, Shopping]"],
            ["rows", "[Shopping]"],
          ],
        },
        {
          line: 12,
          note: "SELECT title: keep only the asked-for column.",
          vars: [
            ["notes", "[Welcome, Gym, Shopping]"],
            ["rows", '[{ title: "Shopping" }]'],
          ],
        },
        {
          line: 14,
          note: "The result: a one-row, one-column table.",
          vars: [
            ["notes", "[Welcome, Gym, Shopping]"],
            ["rows", '[{ title: "Shopping" }]'],
          ],
          output: '[{ title: "Shopping" }]',
        },
      ],
    ),
  ),

  part(
    "insert",
    "INSERT: adding rows",
    explain(
      "[[sql-insert|INSERT INTO]] adds rows: name the table, list the columns you're giving, then the VALUES in the same order. Columns you leave out get their DEFAULT, and the id is generated. One INSERT can add several rows. If a value breaks a rule, the whole statement fails and nothing is added.",
    ),
    code(
      "sql",
      "Adding notes",
      [
        "INSERT INTO notes (user_id, title, content)",
        "VALUES (1, 'Milk', '2 litres');",
        "",
        "INSERT INTO notes (user_id, title)",
        "VALUES (1, 'Eggs'), (1, 'Bread');",
      ],
      {
        1: "the columns you're giving…",
        2: "…and their values, in that order",
        4: "no content: DEFAULT '' fills it",
        5: "two rows in one statement",
      },
    ),
    keyPoints(
      "id, created_at and updated_at are filled in by the database.",
      "Text in single quotes; numbers without.",
      "A missing NOT NULL column with no DEFAULT fails the insert.",
    ),
  ),

  part(
    "returning",
    "RETURNING: get the saved row back",
    explain(
      "After an INSERT you usually want the new row: its id, and the times the database filled in. [[sql-returning|RETURNING]] sends the inserted rows back in the same trip, so there's no second SELECT. It's PostgreSQL's addition to SQL and also works on UPDATE and DELETE.",
    ),
    code(
      "sql",
      "Insert and read back at once",
      [
        "INSERT INTO notes (user_id, title)",
        "VALUES (1, 'Milk')",
        "RETURNING id, title, content, created_at;",
        "-- id | title | content | created_at",
        "--  5 | Milk  |         | 2026-11-27 …",
      ],
      {
        3: "which columns of the new row to send back",
        5: "the id and time the database chose",
      },
    ),
    quickCheck(
      "Why does `createNote` end its INSERT with RETURNING?",
      [
        "Without it the row isn't saved",
        "To send the new note, with its id, back to the client",
        "To undo the insert if it fails",
      ],
      1,
      "The insert saves the row either way. RETURNING gives back the stored row, including the id and times the database made, which the 201 response sends to the client.",
    ),
  ),

  part(
    "insert-select",
    "INSERT … SELECT: values from a query",
    explain(
      "Instead of VALUES, an INSERT can take its rows from a SELECT. The seed file uses it: it doesn't know which id the demo user got, so it looks the user up by email and inserts a note with that id. If the SELECT finds no rows, nothing is inserted.",
    ),
    code(
      "sql",
      "From database/seed.sql",
      [
        "INSERT INTO notes (user_id, title, content)",
        "SELECT id, 'Shopping', 'Milk, bread, apples'",
        "  FROM users",
        " WHERE email = 'demo@example.com';",
      ],
      {
        2: "one row per user found: their id + fixed text",
        4: "finds the demo user, whatever their id",
      },
    ),
    inTheNotesApp(
      "`seed.sql` inserts the demo user with VALUES, then both demo notes with INSERT … SELECT.",
      { fileId: "database/seed.sql" },
    ),
  ),

  part(
    "notes-app",
    "The Notes App's queries",
    explain(
      "Here are the two queries from `notesController.js`. `$1`, `$2` and `$3` are placeholders: the values (the logged-in user's id, the title, the content) are sent separately, never pasted into the SQL. The 'SQL from your backend' module (step 5) explains them. Everything else you can now read.",
    ),
    code(
      "sql",
      "listNotes and createNote",
      [
        "SELECT id, title, content,",
        "       created_at, updated_at",
        "  FROM notes",
        " WHERE user_id = $1",
        " ORDER BY created_at DESC;",
        "",
        "INSERT INTO notes (user_id, title, content)",
        "VALUES ($1, $2, $3)",
        "RETURNING id, title, content,",
        "          created_at, updated_at;",
      ],
      {
        1: "named columns: user_id isn't sent back",
        4: "$1 is the logged-in user's id",
        5: "newest first; no LIMIT",
        8: "user id, trimmed title, content",
        9: "the new note, for the 201 response",
      },
    ),
    inTheNotesApp(
      "Both queries are in `notesController.js`; `res.json(result.rows)` and `result.rows[0]` send what they return.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "SELECT * in app code",
      language: "sql",
      wrong: ["SELECT * FROM users WHERE id = $1;"],
      problem:
        "password_hash comes back too, and one res.json(user) sends it to the browser.",
      right: ["SELECT id, email FROM users WHERE id = $1;"],
      why: "Name the columns you need; new columns stay private by default.",
    }),
    mistake({
      title: "= NULL",
      language: "sql",
      wrong: ["SELECT title FROM notes", " WHERE content = NULL;"],
      problem: "Nothing ever equals NULL, so this returns no rows.",
      right: ["SELECT title FROM notes", " WHERE content IS NULL;"],
      why: "Test for NULL with IS NULL or IS NOT NULL.",
    }),
    mistake({
      title: "LIMIT without ORDER BY",
      language: "sql",
      wrong: ["SELECT title FROM notes LIMIT 10;"],
      problem:
        "'The first 10' isn't defined, so the rows can change between runs.",
      right: [
        "SELECT title FROM notes",
        " ORDER BY created_at DESC",
        " LIMIT 10;",
      ],
      why: "Sort first, so 'the first 10' means the 10 newest.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "A tiny SELECT",
      task: 'Write `select(rows, { where, orderBy, limit })`. `where` is an object; keep rows where every key equals its value (like AND). `orderBy` is `[column, "ASC" or "DESC"]`. `limit` keeps the first rows. Each option may be left out. Don\'t change `rows`.',
      starter: [
        "function select(rows, { where = {} } = {}) {",
        "  return rows.filter((r) =>",
        "    Object.entries(where)",
        "      .every(([k, v]) => r[k] === v));",
        "}",
      ],
      tests: [
        [
          `select(${notes}, { where: { user_id: 1 } }).map((n) => n.id)`,
          "[1, 3, 4]",
        ],
        [
          `select(${notes}, { orderBy: ["title", "ASC"] }).map((n) => n.title)`,
          '["Books", "Gym", "Shopping", "Welcome"]',
        ],
        [
          `select(${notes}, { orderBy: ["id", "DESC"], limit: 2 }).map((n) => n.id)`,
          "[4, 3]",
        ],
        [
          `select(${notes}, { where: { user_id: 1 }, orderBy: ["title", "DESC"], limit: 1 })`,
          '[{ id: 1, user_id: 1, title: "Welcome" }]',
        ],
        [`select(${notes}).length`, "4"],
      ],
      hint: "Filter first, then sort a copy (`[...out].sort`), then `slice(0, limit)` if a limit was given. For DESC, flip the sign of the comparison.",
      solution: [
        "function select(rows, opts = {}) {",
        "  const { where = {}, orderBy, limit } = opts;",
        "  let out = rows.filter((r) =>",
        "    Object.entries(where)",
        "      .every(([k, v]) => r[k] === v));",
        "  if (orderBy) {",
        "    const [col, dir] = orderBy;",
        '    const s = dir === "DESC" ? -1 : 1;',
        "    out = [...out].sort((a, b) =>",
        "      a[col] < b[col] ? -s : a[col] > b[col] ? s : 0);",
        "  }",
        "  if (limit !== undefined) out = out.slice(0, limit);",
        "  return out;",
        "}",
      ],
    }),
    yourTurn({
      title: "INSERT … RETURNING",
      task: "Write `insert(table, row)`. `table` is `{ nextId, defaults, rows }`. Build the stored row from `id: table.nextId`, then `table.defaults`, then `row` (the row's own values win). Add 1 to `nextId`, push the stored row onto `table.rows` and return it, like RETURNING.",
      starter: [
        "function insert(table, row) {",
        "  table.rows.push(row);",
        "  return row;",
        "}",
      ],
      tests: [
        [
          '(() => { const t = { nextId: 1, defaults: { content: "" }, rows: [] }; return insert(t, { title: "Milk" }); })()',
          '{ id: 1, content: "", title: "Milk" }',
        ],
        [
          '(() => { const t = { nextId: 1, defaults: { content: "" }, rows: [] }; insert(t, { title: "Milk" }); const b = insert(t, { title: "Eggs" }); return [t.rows.length, b.id, t.nextId]; })()',
          "[2, 2, 3]",
        ],
        [
          '(() => { const t = { nextId: 5, defaults: { content: "" }, rows: [] }; return insert(t, { title: "Milk", content: "2 litres" }); })()',
          '{ id: 5, content: "2 litres", title: "Milk" }',
        ],
      ],
      hint: "`const stored = { id: table.nextId, ...table.defaults, ...row };` then `table.nextId += 1`.",
      solution: [
        "function insert(table, row) {",
        "  const stored = {",
        "    id: table.nextId,",
        "    ...table.defaults,",
        "    ...row,",
        "  };",
        "  table.nextId += 1;",
        "  table.rows.push(stored);",
        "  return stored;",
        "}",
      ],
    }),
    yourTurn({
      title: "COUNT(*) WHERE",
      task: "Write `countWhere(rows, where)`: like `SELECT COUNT(*) … WHERE`, return how many rows match every key of `where`. `countWhere(rows, {})` counts every row.",
      starter: [
        "function countWhere(rows, where) {",
        "  return rows.length;",
        "}",
      ],
      tests: [
        [`countWhere(${notes}, { user_id: 1 })`, "3"],
        [`countWhere(${notes}, { user_id: 1, title: "Gym" })`, "0"],
        [`countWhere(${notes}, {})`, "4"],
      ],
      hint: "Filter with `Object.entries(where).every(…)`, then take `.length`.",
      solution: [
        "function countWhere(rows, where) {",
        "  return rows.filter((r) =>",
        "    Object.entries(where)",
        "      .every(([k, v]) => r[k] === v),",
        "  ).length;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("SELECT and INSERT: cheat sheet", [
      [
        "SELECT … FROM",
        "Read these columns from a table.",
        "SELECT id, title FROM notes",
      ],
      [
        "WHERE",
        "Only rows where the condition is true.",
        "WHERE user_id = 1 AND id < 10",
      ],
      [
        "IS NULL",
        "Test for no value; = NULL never matches.",
        "WHERE content IS NULL",
      ],
      [
        "LIKE / ILIKE",
        "Pattern match; % is anything. ILIKE ignores case.",
        "WHERE title ILIKE '%milk%'",
      ],
      ["ORDER BY", "Sort. DESC for high to low.", "ORDER BY created_at DESC"],
      ["LIMIT / OFFSET", "Keep the first n / skip n.", "LIMIT 20 OFFSET 20"],
      ["COUNT(*)", "How many rows match.", "SELECT COUNT(*) FROM notes"],
      [
        "INSERT INTO … VALUES",
        "Add rows; left-out columns get DEFAULT.",
        "INSERT INTO notes (user_id, title)\nVALUES (1, 'Milk')",
      ],
      ["RETURNING", "Send back the inserted row.", "RETURNING id, created_at"],
      [
        "INSERT … SELECT",
        "Insert the rows a query finds.",
        "INSERT INTO notes (user_id, title)\nSELECT id, 'Hi' FROM users",
      ],
    ]),
    quickCheck(
      "Which query gives user 1's three newest notes?",
      [
        "SELECT title FROM notes WHERE user_id = 1 LIMIT 3",
        "SELECT title FROM notes WHERE user_id = 1 ORDER BY created_at DESC LIMIT 3",
        "SELECT title FROM notes ORDER BY created_at LIMIT 3",
      ],
      1,
      "Filter to user 1 with WHERE, sort newest first with ORDER BY created_at DESC, then keep 3 with LIMIT. Without ORDER BY there's no 'newest'; without WHERE you get everyone's notes.",
    ),
  ),
);
