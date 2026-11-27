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

// Rows used by the index exercise's tests.
const rows =
  "const rows = [{ id: 1, user_id: 3 }, { id: 2, user_id: 5 }, { id: 3, user_id: 3 }, { id: 4, user_id: 9 }];";

// Indexes: reading every row vs jumping to the matches, CREATE INDEX, the
// Notes App's notes_user_id_idx, what a B-tree is good at, indexes you get
// for free, composite indexes and column order, an index step by step, the
// cost, when to add one, mistakes, practice and a recap.
export const indexesModule = moduleLesson(
  "indexes",
  "Indexes: finding rows fast",
  45,
  [
    "Explain how an index lets the database skip reading every row.",
    "Create an index and say why the Notes App has notes_user_id_idx.",
    "Tell which searches a B-tree index helps (=, <, ORDER BY) and which it can't.",
    "Choose the column order of a composite index for a real query.",
    "Weigh the cost of an index and decide when a table needs one.",
  ],

  part(
    "why",
    "Reading every row, or jumping to the matches",
    explain(
      "To answer `WHERE user_id = 3`, a table with no help must read every row and test each one. That's a [[seq-scan|sequential scan]]: fine for 100 notes, slow for 10 million. An [[db-index|index]] is a sorted list of one column's values, each pointing at its rows, so the database jumps straight to user 3's notes.",
    ),
    analogy(
      "A book's index: to find “closures”, you don't read all 400 pages. You look it up in the sorted list at the back and turn to pages 112 and 230.",
    ),
    diagram([
      ["WHERE user_id = 3"],
      ["Index", "sorted user_ids"],
      ["Row positions", "rows 1 and 3"],
      ["Just those rows", "2 notes read"],
    ]),
  ),

  part(
    "create",
    "CREATE INDEX",
    explain(
      "You add an index with one statement. Give it a name (the habit is `table_column_idx`), the table and the column. From then on PostgreSQL keeps it up to date on every write, and uses it by itself when a query can benefit: you never mention the index in a SELECT.",
    ),
    anatomy(
      "The Notes App's index",
      ["CREATE INDEX notes_user_id_idx", "  ON notes (user_id);"],
      [
        [
          "CREATE INDEX",
          "the statement",
          "Builds the index from the rows already there.",
        ],
        [
          "notes_user_id_idx",
          "its name",
          "Table, column, idx. You need it to drop the index later.",
        ],
        ["notes", "the table", "Which table it belongs to."],
        [
          "(user_id)",
          "the column",
          "The values that get sorted. Several columns make a composite index.",
        ],
      ],
    ),
    keyPoints(
      "Queries don't name the index: the database decides to use it.",
      "DROP INDEX notes_user_id_idx; removes it. The data stays.",
      "Building one on a huge table takes time; it's a schema change.",
    ),
  ),

  part(
    "notes-app",
    "Why the Notes App has notes_user_id_idx",
    explain(
      "Every notes query in the Notes App has `WHERE user_id = $n`: list, update, delete. Without an index, listing one user's notes means reading everyone's. `user_id` is a [[foreign-key|foreign key]], and PostgreSQL does not index foreign keys for you, so `schema.sql` adds the index itself.",
    ),
    code(
      "sql",
      "listNotes: the index finds the rows",
      [
        "SELECT id, title, content,",
        "       created_at, updated_at",
        "  FROM notes",
        " WHERE user_id = $1",
        " ORDER BY created_at DESC;",
      ],
      {
        4: "notes_user_id_idx jumps to this user's rows",
        5: "then the few matches are sorted",
      },
    ),
    inTheNotesApp(
      "The last line of `schema.sql` creates `notes_user_id_idx`, with a comment saying why.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "btree",
    "What a B-tree index is good at",
    explain(
      "PostgreSQL's usual index is a B-tree: the values kept in sorted order. Sorted means it can find one value, a range, or the start of some text, and hand rows back already in order. It can't help when the match could be anywhere inside the text, like `LIKE '%milk%'`: there's no place in the sorted list to start.",
    ),
    reference("A B-tree index on the column helps with…", [
      ["= (equals)", "Find one value.", "WHERE user_id = 3"],
      [
        "<, >, BETWEEN",
        "A range of values.",
        "WHERE created_at > '2026-01-01'",
      ],
      [
        "ORDER BY",
        "Rows come out sorted, no extra sort step.",
        "ORDER BY created_at DESC",
      ],
      [
        "LIKE 'milk%'",
        "Text that starts with… (PostgreSQL needs text_pattern_ops for this).",
        "WHERE title LIKE 'Shop%'",
      ],
      [
        "Not: LIKE '%milk%'",
        "Could be anywhere in the text: reads every row.",
        "Needs full-text or trigram search",
      ],
    ]),
    quickCheck(
      "`notes.title` has a B-tree index. Which query can use it?",
      [
        "WHERE title LIKE '%list%'",
        "WHERE title = 'Shopping'",
        "WHERE lower(title) = 'shopping'",
      ],
      1,
      "The index holds titles sorted as they are, so it finds an exact title. '%list%' could match anywhere, and lower(title) is a different value from the one indexed.",
    ),
  ),

  part(
    "free",
    "Indexes you get for free",
    explain(
      "A [[primary-key|primary key]] and a UNIQUE [[sql-constraint|constraint]] both need a fast way to check “does this value exist already?”, so PostgreSQL creates an index for each one automatically. That's why finding a note by id, or a user by email at login, is already fast. Foreign keys get no automatic index.",
    ),
    code(
      "sql",
      "schema.sql makes three indexes",
      [
        "id SERIAL PRIMARY KEY",
        "email TEXT NOT NULL UNIQUE",
        "CREATE INDEX notes_user_id_idx",
        "  ON notes (user_id);",
      ],
      {
        1: "users_pkey and notes_pkey, automatically",
        2: "users_email_key, automatically",
        3: "the only one written by hand",
      },
    ),
    keyPoints(
      "PRIMARY KEY → an index, made for you.",
      "UNIQUE → an index, made for you.",
      "REFERENCES (foreign key) → no index: add one if you search by it.",
    ),
  ),

  part(
    "composite",
    "Composite indexes and column order",
    explain(
      "A [[composite-index|composite index]] covers several columns, sorted by the first, then by the second within each first value: like a phone book sorted by surname, then first name. On `(user_id, created_at)` one user's notes sit together, already newest to oldest. That serves listNotes completely: find user 3, read the rows in order, no sort.",
    ),
    code(
      "sql",
      "One index for the whole listNotes query",
      [
        "CREATE INDEX notes_user_created_idx",
        "  ON notes (user_id, created_at);",
        "",
        "-- served in one go:",
        "WHERE user_id = $1",
        "ORDER BY created_at DESC",
      ],
      {
        2: "first column first: user_id, then created_at",
        6: "PostgreSQL can read the index backwards",
      },
    ),
    keyPoints(
      "It works left to right, like a phone book.",
      "(user_id, created_at) serves user_id alone too.",
      "It doesn't serve created_at alone: that's not the first column.",
      "The Notes App only has (user_id); this would replace it.",
    ),
    quickCheck(
      "With an index on `(user_id, created_at)`, which query can't use it well?",
      [
        "WHERE user_id = 3",
        "WHERE user_id = 3 ORDER BY created_at",
        "WHERE created_at > '2026-01-01'",
      ],
      2,
      "The index is sorted by user_id first. Notes after a date are spread through every user's section, like looking up everyone called Sam in a phone book sorted by surname.",
    ),
  ),

  part(
    "step-by-step",
    "An index, step by step",
    explain(
      "Here's the idea in JavaScript: a Map from each user_id to the positions of its rows. Building it reads every row once. After that, finding user 3's notes is one lookup instead of a loop over the whole table.",
    ),
    trace(
      "An index as a Map",
      [
        "const rows = [",
        "  { id: 1, user_id: 3 },",
        "  { id: 2, user_id: 5 },",
        "  { id: 3, user_id: 3 },",
        "];",
        "const index = new Map();",
        "rows.forEach((row, pos) => {",
        "  const list = index.get(row.user_id)",
        "    ?? [];",
        "  list.push(pos);",
        "  index.set(row.user_id, list);",
        "});",
        "const hits = index.get(3);",
        "const notes = hits.map((p) => rows[p]);",
      ],
      [
        {
          line: 6,
          note: "Three notes in the table. The index starts empty.",
          vars: [
            ["rows", "[{ id: 1, … }, { id: 2, … }, { id: 3, … }]"],
            ["index", "Map(0) {}"],
          ],
        },
        {
          line: 11,
          note: "Row 0 belongs to user 3: store its position under 3.",
          vars: [
            ["rows", "[…3 rows]"],
            ["index", "Map { 3 => [0] }"],
            ["row", "{ id: 1, user_id: 3 }"],
            ["pos", "0"],
            ["list", "[0]"],
          ],
          stack: ["forEach callback"],
        },
        {
          line: 11,
          note: "Row 1 belongs to user 5: a new entry.",
          vars: [
            ["rows", "[…3 rows]"],
            ["index", "Map { 3 => [0], 5 => [1] }"],
            ["row", "{ id: 2, user_id: 5 }"],
            ["pos", "1"],
            ["list", "[1]"],
          ],
          stack: ["forEach callback"],
        },
        {
          line: 11,
          note: "Row 2 is user 3 again: its position joins the same list.",
          vars: [
            ["rows", "[…3 rows]"],
            ["index", "Map { 3 => [0, 2], 5 => [1] }"],
            ["row", "{ id: 3, user_id: 3 }"],
            ["pos", "2"],
            ["list", "[0, 2]"],
          ],
          stack: ["forEach callback"],
        },
        {
          line: 13,
          note: "The query WHERE user_id = 3: one lookup, no loop over the rows.",
          vars: [
            ["rows", "[…3 rows]"],
            ["index", "Map { 3 => [0, 2], 5 => [1] }"],
            ["hits", "[0, 2]"],
          ],
        },
        {
          line: 14,
          note: "Read only those two rows. Row 1 was never touched.",
          vars: [
            ["rows", "[…3 rows]"],
            ["index", "Map { 3 => [0, 2], 5 => [1] }"],
            ["hits", "[0, 2]"],
            ["notes", "[{ id: 1, user_id: 3 }, { id: 3, user_id: 3 }]"],
          ],
        },
      ],
    ),
  ),

  part(
    "cost",
    "What an index costs",
    explain(
      "An index isn't free. Every INSERT, every DELETE and every UPDATE of an indexed column must also update the index, so writes get a little slower with each one you add. Each index also takes disk space and memory, sometimes as much as the table. So index the columns you search by, not every column.",
    ),
    keyPoints(
      "Reads get faster; writes get a little slower.",
      "Each index takes disk space and memory.",
      "An index nobody's queries use is pure cost.",
      "On a small table, reading every row is fast anyway.",
    ),
  ),

  part(
    "when",
    "When to add one",
    explain(
      "Look at the queries your app really runs. Columns in [[sql-where|WHERE]], in a [[sql-join|JOIN]]'s ON, and in [[sql-order-limit|ORDER BY]] on large tables are the candidates, especially when they pick out a few rows from many. To be sure, ask the database: `EXPLAIN` shows its [[query-plan|plan]], and `Seq Scan` on a big table hints at a missing index. The Advanced level covers reading plans.",
    ),
    code(
      "sql",
      "Ask before and after",
      [
        "EXPLAIN SELECT * FROM notes",
        " WHERE user_id = 3;",
        "",
        "-- Index Scan using notes_user_id_idx",
        "--   on notes ...",
      ],
      {
        1: "EXPLAIN shows the plan, it doesn't change data",
        4: "good: the index is used",
      },
    ),
    reference("Index it?", [
      [
        "notes.user_id",
        "Yes: every query filters by it.",
        "WHERE user_id = $1",
      ],
      ["users.email", "Already: UNIQUE made one.", "WHERE email = $1"],
      [
        "notes.content",
        "No: never searched with =.",
        "Just read with the note",
      ],
      ["A 20-row table", "No: reading 20 rows is instant.", "Seq Scan is fine"],
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Composite columns in the wrong order",
      language: "sql",
      wrong: [
        "CREATE INDEX notes_created_user_idx",
        "  ON notes (created_at, user_id);",
      ],
      problem:
        "Sorted by date first, so one user's notes are scattered all through it. WHERE user_id = $1 can't jump to them.",
      right: [
        "CREATE INDEX notes_user_created_idx",
        "  ON notes (user_id, created_at);",
      ],
      why: "Put the column you match with = first, and the one you sort or range on after it.",
    }),
    mistake({
      title: "Wrapping the column in a function",
      language: "sql",
      wrong: ["-- index on users (email)", "WHERE lower(email) = $1"],
      problem:
        "The index holds email as stored, not lower(email), so PostgreSQL reads every user.",
      right: [
        "CREATE INDEX users_lower_email_idx",
        "  ON users (lower(email));",
      ],
      why: "An expression index stores exactly the value the query compares. Or store emails lowercased in the first place.",
    }),
    mistake({
      title: "Indexing every column, just in case",
      language: "sql",
      wrong: [
        "CREATE INDEX ON notes (title);",
        "CREATE INDEX ON notes (content);",
        "CREATE INDEX ON notes (updated_at);",
      ],
      problem:
        "No query searches by these, yet every save now updates three more indexes and the disk fills up.",
      right: ["CREATE INDEX notes_user_id_idx", "  ON notes (user_id);"],
      why: "Index what your queries filter, join and sort by, and check with EXPLAIN.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Build and use an index",
      task: "Write `buildIndex(rows, column)`: a Map from each value of `column` to the array of positions of the rows that have it. Then `lookup(index, rows, value)`: the matching rows, in order, or `[]` if there are none.",
      starter: [
        "function buildIndex(rows, column) {",
        "  const index = new Map();",
        "  // store each row's position under",
        "  // its value",
        "  return index;",
        "}",
        "function lookup(index, rows, value) {",
        "  return [];",
        "}",
      ],
      tests: [
        [
          `(() => { ${rows} return buildIndex(rows, "user_id").get(3); })()`,
          "[0, 2]",
        ],
        [
          `(() => { ${rows} return lookup(buildIndex(rows, "user_id"), rows, 3); })()`,
          "[{ id: 1, user_id: 3 }, { id: 3, user_id: 3 }]",
        ],
        [
          `(() => { ${rows} return lookup(buildIndex(rows, "user_id"), rows, 7); })()`,
          "[]",
        ],
        [`(() => { ${rows} return buildIndex(rows, "id").get(4); })()`, "[3]"],
      ],
      hint: "`index.get(value) ?? []` gives the list so far. In lookup, map each position to `rows[p]`.",
      solution: [
        "function buildIndex(rows, column) {",
        "  const index = new Map();",
        "  rows.forEach((row, pos) => {",
        "    const list = index.get(row[column]) ?? [];",
        "    list.push(pos);",
        "    index.set(row[column], list);",
        "  });",
        "  return index;",
        "}",
        "function lookup(index, rows, value) {",
        "  const hits = index.get(value) ?? [];",
        "  return hits.map((p) => rows[p]);",
        "}",
      ],
    }),
    yourTurn({
      title: "Can this index help?",
      task: "Write `canUse(indexCols, whereCols)`. A composite index is read left to right, so it can help only if its first column is one of the columns in the WHERE. Return `true` or `false`.",
      starter: [
        "function canUse(indexCols, whereCols) {",
        "  return indexCols.some((c) =>",
        "    whereCols.includes(c));",
        "}",
      ],
      tests: [
        ['canUse(["user_id", "created_at"], ["user_id"])', "true"],
        ['canUse(["user_id", "created_at"], ["created_at"])', "false"],
        [
          'canUse(["user_id", "created_at"], ["created_at", "user_id"])',
          "true",
        ],
        ['canUse(["email"], [])', "false"],
      ],
      hint: "Only `indexCols[0]` matters here: is it in `whereCols`?",
      solution: [
        "function canUse(indexCols, whereCols) {",
        "  return whereCols.includes(indexCols[0]);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Indexes cheat sheet", [
      [
        "Index",
        "Sorted values pointing at rows: no need to read them all.",
        "notes_user_id_idx",
      ],
      [
        "CREATE INDEX",
        "Add one: a name, a table, the columns.",
        "CREATE INDEX notes_user_id_idx\n  ON notes (user_id);",
      ],
      [
        "B-tree helps",
        "=, <, >, BETWEEN, ORDER BY, LIKE 'abc%'.",
        "WHERE user_id = 3",
      ],
      ["B-tree can't", "Matches in the middle of text.", "LIKE '%milk%'"],
      [
        "Free indexes",
        "PRIMARY KEY and UNIQUE make one each.",
        "users_email_key",
      ],
      ["Foreign keys", "No automatic index: add your own.", "notes (user_id)"],
      [
        "Composite",
        "Several columns, used left to right.",
        "(user_id, created_at)",
      ],
      [
        "Cost",
        "Slower writes and more space per index.",
        "Don't index everything",
      ],
      ["Check", "EXPLAIN shows whether it's used.", "Index Scan using …"],
    ]),
    quickCheck(
      "The Notes App gets a `tags` table with a `note_id` foreign key, searched as `WHERE note_id = $1`. What should you add?",
      [
        "Nothing: the foreign key already makes an index",
        "CREATE INDEX on tags (note_id)",
        "An index on every column of tags",
      ],
      1,
      "PostgreSQL indexes primary keys and UNIQUE columns automatically, but not foreign keys. A column you search by on a growing table needs its own index.",
    ),
  ),
);
