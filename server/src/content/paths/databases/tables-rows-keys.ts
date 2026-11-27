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

// Tables, rows and keys: tables, rows and columns, CREATE TABLE taken apart,
// data types, constraints, primary keys and generated ids, foreign keys and
// one-to-many, a row checked step by step, NULL and content's default, the
// schema as the design, mistakes, practice and a recap.
export const tablesRowsKeysModule = moduleLesson(
  "tables-rows-keys",
  "Tables, rows and keys",
  50,
  [
    "Read a CREATE TABLE statement: columns, data types and constraints.",
    "Use NOT NULL, UNIQUE, DEFAULT and CHECK to make the database refuse bad rows.",
    "Explain primary keys and why the database generates ids.",
    "Link two tables with a foreign key to build a one-to-many relationship.",
    "Know what NULL means and why the Notes App's content defaults to ''.",
  ],

  part(
    "tables",
    "Tables, rows and columns",
    explain(
      "A [[sql-table|table]] holds one kind of thing: the `notes` table holds notes, `users` holds accounts. Its [[row-column|columns]] name the facts every note has (id, title, content). Each row is one note, with exactly one value per column. Unlike a spreadsheet, the columns are fixed and typed, and a row that doesn't fit is refused.",
    ),
    code(
      "sql",
      "The notes table, as psql shows it (trimmed)",
      [
        " id | user_id | title    | content",
        "----+---------+----------+------------",
        "  1 |       1 | Welcome  | Edit or…",
        "  2 |       1 | Shopping | Milk, bread",
      ],
      {
        1: "the columns: same for every row",
        3: "one row: one note",
      },
    ),
    keyPoints(
      "Table: one kind of thing, like notes.",
      "Column: one named, typed fact, like title TEXT.",
      "Row: one record, like the note with id 2.",
    ),
  ),

  part(
    "create-table",
    "CREATE TABLE, taken apart",
    explain(
      "A table is made once with `CREATE TABLE`: its name, then each column with its name, its type and its rules. Here is the start of `users` from `schema.sql`.",
    ),
    anatomy(
      "The users table (first lines)",
      [
        "CREATE TABLE users (",
        "  id SERIAL PRIMARY KEY,",
        "  email TEXT NOT NULL UNIQUE,",
        "  password_hash TEXT NOT NULL,",
      ],
      [
        ["CREATE TABLE users", "the table", "Make a table called users."],
        ["id", "column name", "Each column: a name, then a type, then rules."],
        ["SERIAL", "type", "A whole number the database counts up: 1, 2, 3…"],
        [
          "PRIMARY KEY",
          "rule",
          "Unique and never empty: this is how a row is found.",
        ],
        ["email", "column name", "The login email."],
        ["TEXT", "type", "Text of any length."],
        [
          "NOT NULL UNIQUE",
          "rules",
          "Every user has an email, and no two users share one.",
        ],
        [
          "password_hash TEXT NOT NULL",
          "one more column",
          "Never the password itself, only a hash of it. Required.",
        ],
      ],
    ),
  ),

  part(
    "types",
    "Data types",
    explain(
      "Every column has a [[sql-data-type|data type]], and the database refuses values of the wrong type: `'abc'` can't go into an INTEGER column. Pick the type that matches the meaning, such as TIMESTAMPTZ for a moment in time, not TEXT.",
    ),
    reference("Types you'll use first", [
      ["SERIAL", "A counting whole number, for ids.", "id SERIAL PRIMARY KEY"],
      [
        "INTEGER",
        "A whole number, such as another row's id.",
        "user_id INTEGER",
      ],
      ["TEXT", "Text of any length.", "title TEXT"],
      [
        "TIMESTAMPTZ",
        "A moment in time, with its time zone.",
        "created_at TIMESTAMPTZ",
      ],
      [
        "BOOLEAN",
        "true or false. Not in the Notes App.",
        "pinned BOOLEAN DEFAULT false",
      ],
    ]),
    quickCheck(
      "Which type fits a note's `updated_at` column?",
      ["TEXT", "INTEGER", "TIMESTAMPTZ"],
      2,
      "updated_at is a moment in time, so TIMESTAMPTZ. The database can then sort it and compare it as a time, which text can't do reliably.",
    ),
  ),

  part(
    "constraints",
    "Constraints: rules the database enforces",
    explain(
      "A [[sql-constraint|constraint]] is a rule checked on every write, whatever program sends it. NOT NULL: a value is required. UNIQUE: no two rows share it. DEFAULT: the value used when none is given. CHECK: any condition you write. A write that breaks one fails with an error and nothing is saved.",
    ),
    code(
      "sql",
      "Rules broken, rows refused",
      [
        "INSERT INTO notes (user_id) VALUES (1);",
        '-- ERROR: null value in column "title"',
        "--   violates not-null constraint",
        "",
        "INSERT INTO users (email, password_hash)",
        "VALUES ('demo@example.com', 'x');",
        "-- ERROR: duplicate key value violates",
        '--   unique constraint "users_email_key"',
        "",
        "-- A CHECK (not in schema.sql):",
        "title TEXT NOT NULL",
        "  CHECK (length(title) <= 100)",
      ],
      {
        1: "no title given",
        6: "this email is already taken",
        12: "the backend checks the length instead",
      },
    ),
    inTheNotesApp(
      "`register` doesn't look up the email first. It inserts, and turns PostgreSQL's unique-violation error (code 23505) into a 409 'Email already registered'.",
      { fileId: "backend/src/controllers/authController.js" },
    ),
  ),

  part(
    "primary-keys",
    "Primary keys and generated ids",
    explain(
      "Every table needs a [[primary-key|primary key]]: a column that is different for every row, so `/api/notes/42` means exactly one note. You don't pick it: with SERIAL the database gives each new row the next number, a [[auto-id|generated id]]. The app inserts without an id and reads the new one back.",
    ),
    code(
      "sql",
      "Insert without an id; the database picks it",
      [
        "INSERT INTO notes (user_id, title)",
        "VALUES (1, 'Milk')",
        "RETURNING id;",
        "-- id",
        "-- ----",
        "--   3",
      ],
      {
        1: "no id column in the list",
        3: "send back the id it chose",
      },
    ),
    keyPoints(
      "SERIAL never reuses a number, even after a delete.",
      "Newer schemas write GENERATED ALWAYS AS IDENTITY; same idea.",
      "UUIDs are random ids that don't reveal how many rows exist.",
    ),
  ),

  part(
    "foreign-keys",
    "Foreign keys and one-to-many",
    explain(
      "A note belongs to a user. Instead of copying the user into each note, the note stores its owner's id in `user_id`. `REFERENCES users (id)` makes it a [[foreign-key|foreign key]]: the database refuses a note whose `user_id` isn't a real user. One user, many notes: a [[one-to-many-relationship|one-to-many relationship]].",
    ),
    diagram([
      ["users", "id 1: demo@…"],
      ["notes", "user_id 1, 1, 1"],
    ]),
    code(
      "sql",
      "notes.user_id in schema.sql",
      [
        "user_id INTEGER NOT NULL",
        "  REFERENCES users (id)",
        "  ON DELETE CASCADE,",
      ],
      {
        1: "same type as users.id, and required",
        2: "must match an existing users.id",
        3: "delete a user: their notes go too",
      },
    ),
    keyPoints(
      "The foreign key goes on the 'many' side: notes, not users.",
      "One user's notes: SELECT … FROM notes WHERE user_id = 1.",
      "A note can never point at nobody.",
    ),
  ),

  part(
    "step-by-step",
    "A note checked, step by step",
    explain(
      "Here is roughly what PostgreSQL does on an INSERT into `notes`, written as JavaScript: check the foreign key, fill in the defaults and the next id, then store the row. Follow a note for user 1, then one for user 9, who doesn't exist.",
    ),
    trace(
      "addNote: foreign key, defaults, id",
      [
        "const users = [{ id: 1 }];",
        "const notes = [];",
        "function addNote(row) {",
        "  const ok = users.some(",
        "    (u) => u.id === row.user_id);",
        '  if (!ok) throw new Error("foreign key");',
        "  const note = { id: notes.length + 1,",
        '    content: "", ...row };',
        "  notes.push(note);",
        "  return note;",
        "}",
        'addNote({ user_id: 1, title: "Milk" });',
        'addNote({ user_id: 9, title: "Eggs" });',
      ],
      [
        {
          line: 12,
          note: "Insert a note for user 1. No id and no content are given.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[]"],
          ],
        },
        {
          line: 4,
          note: "The foreign key: is there a user with id 1? Yes.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[]"],
            ["row", '{ user_id: 1, title: "Milk" }'],
            ["ok", "true"],
          ],
          stack: ["addNote"],
        },
        {
          line: 7,
          note: "The database picks the id and fills content with its DEFAULT ''.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[]"],
            ["row", '{ user_id: 1, title: "Milk" }'],
            ["ok", "true"],
            ["note", '{ id: 1, content: "", user_id: 1, title: "Milk" }'],
          ],
          stack: ["addNote"],
        },
        {
          line: 9,
          note: "The row is stored.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[{ id: 1, … }]"],
            ["row", '{ user_id: 1, title: "Milk" }'],
            ["ok", "true"],
            ["note", '{ id: 1, content: "", user_id: 1, title: "Milk" }'],
          ],
          stack: ["addNote"],
        },
        {
          line: 13,
          note: "Now a note for user 9.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[{ id: 1, … }]"],
          ],
        },
        {
          line: 4,
          note: "No user has id 9, so ok is false.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[{ id: 1, … }]"],
            ["row", '{ user_id: 9, title: "Eggs" }'],
            ["ok", "false"],
          ],
          stack: ["addNote"],
        },
        {
          line: 6,
          note: "The insert fails and nothing is stored: notes still has one row.",
          vars: [
            ["users", "[{ id: 1 }]"],
            ["notes", "[{ id: 1, … }]"],
            ["row", '{ user_id: 9, title: "Eggs" }'],
            ["ok", "false"],
          ],
          stack: ["addNote"],
          output: "Error: foreign key",
        },
      ],
    ),
  ),

  part(
    "null",
    "NULL, and why content defaults to ''",
    explain(
      "[[sql-null|NULL]] is SQL's 'no value'. It isn't 0 and it isn't an empty string. A column allows NULL unless it says NOT NULL. In JavaScript the row arrives with `content: null`, and `note.content.length` throws. So the Notes App makes content `NOT NULL DEFAULT ''`: an empty note has empty text, never NULL.",
    ),
    code(
      "sql",
      "Optional, but never NULL",
      [
        "content TEXT NOT NULL DEFAULT '',",
        "",
        "INSERT INTO notes (user_id, title)",
        "VALUES (1, 'Milk');",
        "-- content is '' for this row",
      ],
      {
        1: "optional to send, always a string",
        3: "content left out: DEFAULT fills it",
      },
    ),
    quickCheck(
      "A column is `TEXT` with no other rules, and an INSERT leaves it out. What does the row hold?",
      ["An empty string", "NULL", "The insert fails"],
      1,
      "With no DEFAULT, a missing value is NULL, and NULL is allowed because there's no NOT NULL. Add NOT NULL DEFAULT '' to get an empty string instead.",
    ),
  ),

  part(
    "schema",
    "The schema is the design",
    explain(
      "All the CREATE TABLE statements together are the [[db-schema|schema]]: which tables exist, their columns, types and rules. It is the design of your data, so write it first and let it say what must always be true. The Notes App keeps it in one file. Changing a schema once there's data in it is done with migrations, a later module.",
    ),
    code(
      "bash",
      "Create the tables, then add demo data",
      [
        'psql "$DATABASE_URL" -f database/schema.sql',
        'psql "$DATABASE_URL" -f database/seed.sql',
      ],
      {
        1: "run once, on an empty database",
      },
    ),
    inTheNotesApp(
      "`schema.sql` is two tables and one index, with a comment on every rule saying why it's there.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Choosing ids in the app",
      language: "sql",
      wrong: [
        "INSERT INTO notes (id, user_id, title)",
        "VALUES (3, 1, 'Milk');",
      ],
      problem:
        "Two requests can pick the same id at once, and the counter doesn't know about it, so a later insert fails.",
      right: [
        "INSERT INTO notes (user_id, title)",
        "VALUES (1, 'Milk')",
        "RETURNING id;",
      ],
      why: "Let SERIAL pick the id, and read it back with RETURNING.",
    }),
    mistake({
      title: "Copying the owner into each note",
      language: "sql",
      wrong: [
        "CREATE TABLE notes (",
        "  owner_email TEXT,",
        "  title TEXT",
        ");",
      ],
      problem:
        "Change a user's email and old notes keep the old one; nothing stops an email that matches no user.",
      right: [
        "CREATE TABLE notes (",
        "  user_id INTEGER NOT NULL",
        "    REFERENCES users (id),",
        "  title TEXT NOT NULL",
        ");",
      ],
      why: "Store the owner's id once, as a foreign key the database checks.",
    }),
    mistake({
      title: "Leaving out NOT NULL",
      language: "sql",
      wrong: ["title TEXT,"],
      problem:
        "Notes with no title can be saved, and the frontend shows blanks.",
      right: ["title TEXT NOT NULL,"],
      why: "Required facts get NOT NULL, so the database refuses rows without them.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "NOT NULL and UNIQUE",
      task: 'Write `checkUser(users, row)` like the database would: return `"NOT NULL"` if `row.email` is `null` or `undefined`, `"UNIQUE"` if a user in `users` already has that email, and `null` if the row is fine.',
      starter: [
        "function checkUser(users, row) {",
        "  if (row.email === undefined) {",
        '    return "NOT NULL";',
        "  }",
        "  return null;",
        "}",
      ],
      tests: [
        ['checkUser([], { email: "ana@x.io" })', "null"],
        ["checkUser([], { email: null })", '"NOT NULL"'],
        ["checkUser([], {})", '"NOT NULL"'],
        [
          'checkUser([{ id: 1, email: "ana@x.io" }], { email: "ana@x.io" })',
          '"UNIQUE"',
        ],
        [
          'checkUser([{ id: 1, email: "ana@x.io" }], { email: "ben@x.io" })',
          "null",
        ],
      ],
      hint: "`row.email == null` is true for both null and undefined. Then `users.some((u) => u.email === row.email)`.",
      solution: [
        "function checkUser(users, row) {",
        '  if (row.email == null) return "NOT NULL";',
        "  const taken = users.some(",
        "    (u) => u.email === row.email,",
        "  );",
        '  if (taken) return "UNIQUE";',
        "  return null;",
        "}",
      ],
    }),
    yourTurn({
      title: "One user, many notes",
      task: "Write `titlesOf(notes, userId)`: follow the foreign key the other way and return the titles of the notes whose `user_id` is `userId`, in the order given.",
      starter: [
        "function titlesOf(notes, userId) {",
        "  return notes.map((n) => n.title);",
        "}",
      ],
      tests: [
        [
          'titlesOf([{ id: 1, user_id: 1, title: "Milk" }, { id: 2, user_id: 2, title: "Gym" }, { id: 3, user_id: 1, title: "Eggs" }], 1)',
          '["Milk", "Eggs"]',
        ],
        ['titlesOf([{ id: 2, user_id: 2, title: "Gym" }], 1)', "[]"],
        ["titlesOf([], 5)", "[]"],
      ],
      hint: "`filter` the notes where `n.user_id === userId`, then `map` to the title.",
      solution: [
        "function titlesOf(notes, userId) {",
        "  return notes",
        "    .filter((n) => n.user_id === userId)",
        "    .map((n) => n.title);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Tables, rows and keys: cheat sheet", [
      [
        "Table",
        "One kind of thing, with fixed typed columns.",
        "CREATE TABLE notes (…)",
      ],
      ["Row / column", "One record / one named fact.", "title TEXT"],
      ["Data type", "What a column holds.", "INTEGER, TEXT, TIMESTAMPTZ"],
      ["NOT NULL", "A value is required.", "title TEXT NOT NULL"],
      ["UNIQUE", "No two rows share the value.", "email TEXT UNIQUE"],
      ["DEFAULT", "Used when no value is given.", "DEFAULT now()"],
      ["CHECK", "Any condition you write.", "CHECK (length(title) <= 100)"],
      [
        "Primary key",
        "Unique id for each row; generated.",
        "id SERIAL PRIMARY KEY",
      ],
      [
        "Foreign key",
        "Must match a row in another table.",
        "REFERENCES users (id)",
      ],
      ["NULL", "No value. Not 0, not ''.", "content NOT NULL DEFAULT ''"],
    ]),
    quickCheck(
      "Where does the foreign key go for 'one user has many notes'?",
      [
        "A note_ids column on users",
        "A user_id column on notes",
        "Both tables, pointing at each other",
      ],
      1,
      "The foreign key goes on the 'many' side. Each note stores one user_id, which works for any number of notes; a list of note ids on users wouldn't fit in one typed column.",
    ),
  ),
);
