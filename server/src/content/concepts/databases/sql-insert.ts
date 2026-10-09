import type { Concept } from "@fsl/shared";

export const sqlInsert: Concept = {
  id: "sql-insert",
  slug: "sql-insert",
  title: "SQL INSERT",
  topicId: "databases",
  summary:
    "The SQL statement that adds a new row to a table, such as a new note or a newly registered user.",
  basics: [
    "A database table stores items as rows, and every row has the same columns. The `notes` table has `id`, `user_id`, `title`, `content`, `created_at` and `updated_at`.",
    "When a table is created, each column can get rules, called constraints, that the database enforces on every write. `NOT NULL` means the column must have a value; `UNIQUE` means no two rows may share the same value.",
    "A column can also get a default, a value the database fills in by itself when you don't give one, such as `DEFAULT now()` for the current time.",
  ],
  what: [
    "`INSERT INTO table (columns) VALUES (values)` adds one or more new rows. The first list names the columns you are filling, the second gives the values in the same order.",
    "In PostgreSQL you can add `RETURNING` at the end to get the saved row back in the same query, including the values the database filled in itself.",
  ],
  why: [
    "Every time a user creates something, such as signing up or saving a note, the backend must store it permanently. `INSERT` is how new data enters the database.",
    "Letting the database fill in `id` and timestamps means they are always correct and unique, even when many requests arrive at the same moment. `RETURNING` saves a second query to read those values back.",
  ],
  howItWorks: [
    "You list only the columns you are providing, for example `(user_id, title, content)`. Columns you leave out get their default: `id` gets the next number from its `SERIAL` counter, `created_at` and `updated_at` get `now()`.",
    "Before saving, the database checks every constraint. A missing title breaks `NOT NULL`, an email that is already taken breaks `UNIQUE`, and a `user_id` with no matching user breaks the foreign key.",
    "If every check passes, the row is saved. With `RETURNING *` the database sends back the complete row, so the backend can answer `201 Created` with the new note and its `id`.",
    "If a check fails, nothing is saved and the database sends an error with a code. A `UNIQUE` violation has code `23505`, which the backend can turn into `409 Conflict`.",
  ],
  basicExample: {
    language: "sql",
    code: `INSERT INTO notes (user_id, title, content)
VALUES (1, 'Shopping', 'Milk and bread')
RETURNING *;

--  id | user_id |  title   |    content     |          created_at           |          updated_at
-- ----+---------+----------+----------------+-------------------------------+-------------------------------
--   3 |       1 | Shopping | Milk and bread | 2026-10-09 08:30:00.123456+00 | 2026-10-09 08:30:00.123456+00`,
    caption:
      "You give three values; the database fills in `id`, `created_at` and `updated_at`, and `RETURNING *` shows you the whole saved row.",
    highlightLines: [3],
  },
  internals: [
    "`SERIAL` creates a hidden counter called a sequence. Each insert takes the next number, and a number is never handed out twice, even if two inserts happen at the same instant. A failed insert can still use up a number, so gaps in ids are normal.",
    "Constraints are checked inside the database, not in your JavaScript. That makes them the last line of defence: even if a bug skips validation in the backend, the bad row cannot be saved.",
    "A `UNIQUE` column gets an index automatically. On insert the database looks the value up in that index, which is how it can reject a duplicate email instantly even with millions of users.",
    'In Node.js, `pg` turns a failed statement into a rejected promise. The error object has a `code` property, such as `"23505"` for a unique violation or `"23502"` for a not-null violation, which the controller can check in a `try...catch`.',
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
      text: "Create a `users` table with defaults and constraints.",
      code: {
        language: "sql",
        code: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
      },
    },
    {
      text: "Insert a user and ask for the saved row back.",
      code: {
        language: "sql",
        code: `INSERT INTO users (email) VALUES ('ana@example.com') RETURNING *;`,
      },
    },
    {
      text: "Now break the rules on purpose: insert the same email again, then a row without an email.",
      code: {
        language: "sql",
        code: `INSERT INTO users (email) VALUES ('ana@example.com');
INSERT INTO users (email) VALUES (NULL);`,
      },
    },
    {
      text: 'The first insert returns a row with `id` 1 and a `created_at` you never typed. The second fails with `duplicate key value violates unique constraint "users_email_key"`, and the third with `null value in column "email" ... violates not-null constraint`. `SELECT * FROM users;` still shows only one row.',
    },
  ],
  whereUsed: [
    "Sign-up forms, which insert a new user.",
    'Every "create" or "add" button: a new note, comment, order or message.',
    "Seed scripts like `seed.sql` that fill a fresh database with sample data.",
  ],
  connectsTo: [
    "POST requests, which usually lead to an `INSERT` on the server.",
    "Parameterized queries, which pass the user's input as `$1, $2, $3` values.",
    "Constraints such as `NOT NULL`, `UNIQUE` and foreign keys, which the insert must satisfy.",
    "HTTP status codes: `201` when it worked, `409` when it hit a duplicate.",
  ],
  projectUsage: [
    {
      explanation:
        "`createNote` in `backend/src/controllers/notesController.js` runs `INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *` with `req.user.id` and the request body, then answers `201` with `result.rows[0]`.",
    },
    {
      explanation:
        "`register` in `authController` runs `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`. Returning only those two columns keeps the password hash out of the response.",
    },
    {
      explanation:
        'When the email is already taken, PostgreSQL reports error code `23505`, and the controller answers `409` with `{ "error": "Email already registered" }` instead of crashing.',
    },
  ],
  commonMistakes: [
    "Inserting the `id` yourself, such as `VALUES (1, ...)`, which clashes with the `SERIAL` counter later. Leave `id` out and let the database choose it.",
    "Running a second `SELECT` to find the row you just inserted, which is slower and can pick the wrong row. Add `RETURNING *` (or the columns you need) instead.",
    'Checking "does this email exist?" with a `SELECT` before inserting, which can still fail when two sign-ups arrive at once. Rely on the `UNIQUE` constraint and handle error code `23505` as `409`.',
    "Leaving out the column list and writing `INSERT INTO notes VALUES (...)`, which depends on the exact column order. Always name the columns.",
  ],
  relatedConcepts: ["sql", "crud", "parameterized-query", "primary-key"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
