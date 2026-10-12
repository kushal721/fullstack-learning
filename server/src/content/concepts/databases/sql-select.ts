import type { Concept } from "@fsl/shared";

export const sqlSelect: Concept = {
  id: "sql-select",
  slug: "sql-select",
  title: "SQL SELECT",
  topicId: "databases",
  summary:
    "The SQL statement that reads rows from a table, letting you choose which columns, which rows, what order and how many.",
  basics: [
    "A database table is like a spreadsheet: named columns across the top, one row per item. The Notes App's `notes` table has columns such as `id`, `user_id`, `title`, `content` and `created_at`.",
    "SQL is the language you use to talk to the database. You send it a statement as text, and it sends back a result.",
    "Reading data never changes it. A query that only reads can run as often as you like without any risk to the stored notes.",
  ],
  what: [
    '`SELECT` is the SQL statement for reading data. It answers questions like "the title and date of every note that belongs to user 1, newest first".',
    "The result is always a small table of its own: a set of rows, each with the columns you asked for. It may hold zero rows, one row or thousands.",
  ],
  why: [
    "Every screen that shows stored data needs a read: the notes list, a profile page, a search result. `SELECT` is how the backend gets that data out of the database.",
    "Doing the filtering, sorting and limiting in the database is much faster than loading every row into JavaScript and doing it there. The database can use indexes and only sends back what you need.",
  ],
  howItWorks: [
    "`SELECT id, title FROM notes` picks the columns after `SELECT` and the table after `FROM`. `SELECT *` means every column; it is handy in `psql`, but app code should list the columns it needs so it never sends extra data, like a `password_hash`, by accident.",
    "`WHERE` keeps only the rows that match a condition, such as `WHERE user_id = 1`. Conditions can be combined with `AND` and `OR`.",
    "`ORDER BY created_at DESC` sorts the result (`DESC` means newest or largest first, `ASC` the opposite). Without `ORDER BY`, the order of rows is not guaranteed.",
    '`LIMIT 10` returns at most 10 rows, which is useful for "latest 10 notes" or for showing results page by page. The parts always come in this order: `SELECT`, `FROM`, `WHERE`, `ORDER BY`, `LIMIT`.',
  ],
  basicExample: {
    language: "sql",
    code: `SELECT id, title, content, created_at, updated_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC
LIMIT 10;`,
    caption:
      "Choose five columns, keep only user 1's notes, sort newest first, and return no more than 10 rows.",
  },
  internals: [
    "The database does not run the lines top to bottom. It first finds the table (`FROM`), filters the rows (`WHERE`), sorts them (`ORDER BY`), cuts the list (`LIMIT`) and only then picks the columns (`SELECT`).",
    "To find matching rows quickly, the database can use an index, a sorted lookup structure on a column. With an index on `user_id`, it jumps straight to one user's notes; without one, it reads every row in the table.",
    'In Node.js, the `pg` package returns the result as `result.rows`, an array of plain objects such as `{ id: 1, title: "Shopping" }`, one object per row. `res.json(result.rows)` sends that array to the browser as a JSON array.',
    'Some values change type on the way: a `TIMESTAMPTZ` becomes a JavaScript `Date`, which `res.json` writes as a text date like `"2026-10-09T08:30:00.000Z"`.',
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker and open `psql`.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
docker exec -it notes-db psql -U postgres`,
      },
    },
    {
      text: "Create a table and add some notes for two users.",
      code: {
        language: "sql",
        code: `CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO notes (user_id, title) VALUES (1, 'Shopping'), (2, 'Trip'), (1, 'Ideas');`,
      },
    },
    {
      text: "Read them in different ways.",
      code: {
        language: "sql",
        code: `SELECT * FROM notes;
SELECT id, title FROM notes WHERE user_id = 1;
SELECT id, title FROM notes WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1;`,
      },
    },
    {
      text: "The first query shows all 3 rows and every column, the second shows only Shopping and Ideas with two columns, and the third shows just Ideas, the newest of user 1's notes. Try `WHERE user_id = 3` and you get `(0 rows)`, an empty result, not an error.",
    },
  ],
  whereUsed: [
    "Every list or detail screen: notes, products, messages, search results.",
    "Login, where the server looks up a user by email with `SELECT ... WHERE email = $1`.",
    "Reports and dashboards that count, sum or group data.",
  ],
  connectsTo: [
    "GET requests, which usually lead to a `SELECT` on the server.",
    "Parameterized queries, which put values like the user id into `WHERE` safely.",
    "Foreign keys and `JOIN`, which let one `SELECT` read related rows from several tables.",
    "JSON, the format the rows are sent to the browser in.",
  ],
  projectUsage: [
    {
      explanation:
        "`listNotes` in `backend/src/controllers/notesController.js` runs `SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC` with `req.user.id`, so each user gets only their own notes, newest first.",
      fileId: "backend/src/controllers/notesController.js",
      match: "SELECT id, title, content, created_at, updated_at",
    },
    {
      explanation:
        "The controller sends `result.rows` with `res.json`, so `GET /api/notes` answers with a JSON array of note objects that the frontend renders as the notes list.",
      fileId: "backend/src/controllers/notesController.js",
      match: "res.json(result.rows);",
    },
  ],
  commonMistakes: [
    "Using `SELECT *` in app code, which can leak columns like `password_hash` and breaks when columns are added. List the columns you need.",
    "Forgetting `ORDER BY` and expecting rows in insert order. Without it the order can change; always sort when order matters.",
    "Leaving out `WHERE user_id = $1`, which returns every user's notes. Always filter by the logged-in user.",
    "Treating an empty result as an error. Zero rows is a normal answer; send an empty array, or `404` only when you looked up one specific item.",
  ],
  relatedConcepts: ["sql", "crud", "parameterized-query", "json"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
