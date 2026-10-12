import type { Concept } from "@fsl/shared";

export const rowColumn: Concept = {
  id: "row-column",
  slug: "row-column",
  title: "Rows and columns",
  topicId: "databases",
  summary:
    "A table's columns describe what facts every record has, and each row is one record that fills in those facts.",
  basics: [
    "A database table stores many items of the same kind, like many notes. To keep them organised, every item is described by the same set of facts: for a note, its id, its title, its content, and when it was created.",
    "Picture a spreadsheet. The headings across the top are the facts (the columns), and each line underneath is one item (a row). Reading across a row tells you everything about one note.",
    "SQL, the language used to talk to the database, works with these rows and columns: `SELECT title FROM notes` reads the `title` column of every row in the `notes` table.",
  ],
  what: [
    "A column is one kind of fact with a name and a type, such as `title TEXT` or `user_id INTEGER`. Every value in that column must be of that type.",
    'A row is one record — one note, one user. It has exactly one value for every column of the table. A value can also be `NULL`, which means "no value here", unless the column forbids it with `NOT NULL`.',
  ],
  why: [
    "Because every row has the same columns, the database knows exactly what to expect. It can check each value's type, sort all notes by `created_at`, or find every note with a given `user_id`, without guessing what each record looks like.",
    'Splitting facts into separate columns, instead of one big text blob, is what makes questions like "all notes by user 1, newest first" fast and reliable: the database compares one column, not text buried inside a sentence.',
  ],
  howItWorks: [
    "The columns are fixed when the table is created with `CREATE TABLE`. Adding a column later (`ALTER TABLE ... ADD COLUMN`) adds it to every existing row at once, filled with its default or `NULL`.",
    "`INSERT` adds a new row. Any column you leave out gets its `DEFAULT` value, or `NULL` if it has no default — and if that column is `NOT NULL`, the insert fails instead.",
    "`SELECT` returns rows and lets you choose which columns you want. The result is itself a small table: the columns you asked for and the rows that matched.",
  ],
  basicExample: {
    language: "sql",
    code: `SELECT id, user_id, title FROM notes;

 id | user_id |   title
----+---------+-----------
  1 |       1 | Shopping
  2 |       1 | Ideas
  3 |       2 | Holiday`,
    caption:
      "Three columns (id, user_id, title) and three rows. Each row is one note; each column is one fact every note has.",
  },
  internals: [
    "On disk, PostgreSQL stores a table row by row: all of a row's values are kept together, so reading one whole note is quick.",
    '`NULL` is not zero and not an empty string; it means "unknown or missing". That is why `WHERE title = NULL` never matches anything — you must write `WHERE title IS NULL`.',
    "Rows have no built-in order. Without `ORDER BY`, PostgreSQL may return them in any order, and the order can change after updates. Always add `ORDER BY` when order matters.",
    "Where the spreadsheet picture breaks: in a database every value in a column must have the column's type, rows have no fixed line numbers, there are no formulas in cells, and a row in one table can point at a row in another (a note at its user) — something a spreadsheet does not enforce.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker if needed and open psql, its command-line client.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
docker exec -it notes-db psql -U postgres`,
      },
    },
    {
      text: "Create a small table with three columns. `subtitle` has no `NOT NULL`, so it may be empty.",
      code: {
        language: "sql",
        code: `CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT
);`,
      },
    },
    {
      text: 'Insert rows. The second one leaves `subtitle` out, so it becomes `NULL`. The third leaves out `title`, which is `NOT NULL`, so it fails with `null value in column "title" violates not-null constraint`.',
      code: {
        language: "sql",
        code: `INSERT INTO books (title, subtitle) VALUES ('Dune', 'Book One');
INSERT INTO books (title) VALUES ('Emma');
INSERT INTO books (subtitle) VALUES ('No title');`,
      },
    },
    {
      text: "Read the rows back and find the one without a subtitle. You should see two rows, and then only Emma — found with `IS NULL`, not `= NULL`.",
      code: {
        language: "sql",
        code: `SELECT * FROM books ORDER BY id;
SELECT title FROM books WHERE subtitle IS NULL;`,
      },
    },
  ],
  whereUsed: [
    "Every table in a relational database: each user is a row in `users`, each note a row in `notes`.",
    "Every query result: the backend receives rows from the database, and the `pg` package gives them to your code as an array of objects with one key per column.",
  ],
  connectsTo: [
    "Tables, which define the columns that every row has.",
    "Primary keys: the `id` column that tells one row apart from all others.",
    "`SELECT`, `INSERT`, `UPDATE` and `DELETE`, which read, add, change and remove rows.",
    'JSON: the backend sends each row to the browser as an object like `{ "id": 1, "title": "Shopping" }`.',
  ],
  projectUsage: [
    {
      explanation:
        "Each note in the Notes App is one row in `notes`, with the columns `id`, `user_id`, `title`, `content`, `created_at` and `updated_at`.",
      fileId: "database/schema.sql",
      match: "CREATE TABLE notes (",
    },
    {
      explanation:
        "`notesController` lists notes with `SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC`: it chooses only the columns the frontend needs, and `ORDER BY` puts the newest note first.",
      fileId: "backend/src/controllers/notesController.js",
      match: "SELECT id, title, content, created_at, updated_at",
    },
    {
      explanation:
        "The `pg` package returns the rows in `result.rows` as an array of objects, so the controller can send them straight back with `res.json(result.rows)`.",
      fileId: "backend/src/controllers/notesController.js",
      match: "res.json(result.rows);",
    },
  ],
  commonMistakes: [
    "Comparing with `= NULL`, which never matches. Use `IS NULL` or `IS NOT NULL`.",
    "Expecting rows in insertion order without `ORDER BY`. Always say how to sort when the order matters.",
    'Putting several facts in one column, like `"Shopping, 2024-05-01"`. Give each fact its own typed column so it can be searched and sorted.',
    "Using `SELECT *` in app code and accidentally sending columns like `password_hash` to the browser. List the columns you actually need.",
  ],
  relatedConcepts: [
    "sql-table",
    "primary-key",
    "sql-select",
    "sql-insert",
    "json",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
