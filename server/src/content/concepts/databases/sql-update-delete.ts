import type { Concept } from "@fsl/shared";

export const sqlUpdateDelete: Concept = {
  id: "sql-update-delete",
  slug: "sql-update-delete",
  title: "SQL UPDATE and DELETE",
  topicId: "databases",
  summary:
    "The SQL statements that change existing rows in a table and remove rows from it, such as editing or deleting a note.",
  basics: [
    "A database stores data in tables. A table is like a spreadsheet: each row is one record (one note) and each column is one piece of information about it (its `id`, `title`, `content`).",
    "SQL is the language you use to talk to the database. You send it a statement, a sentence like `SELECT title FROM notes`, and the database carries it out and answers.",
    "Data does not stay the same forever: people fix typos in a note and delete notes they no longer need. SQL has one statement for changing rows that already exist (`UPDATE`) and one for removing them (`DELETE`).",
    "Both use a `WHERE` clause: a condition, such as `WHERE id = 7`, that picks which rows the statement applies to. Only the rows for which the condition is true are touched.",
  ],
  what: [
    "`UPDATE notes SET title = 'Groceries' WHERE id = 7` changes the columns listed after `SET` in every row that matches the `WHERE`. Columns you do not mention keep their old values.",
    "`DELETE FROM notes WHERE id = 7` removes every matching row completely. There is no recycle bin: once the statement has finished, the row is gone.",
  ],
  why: [
    "Changing and removing data are two of the four basic operations every app needs (create, read, update, delete). Each Edit and Delete button in the Notes App ends with one of these statements.",
    "`UPDATE` changes a row in place, so it keeps the same `id`. Links to the note and other rows that point at it keep working, which would not happen if you deleted the note and inserted a new copy.",
  ],
  howItWorks: [
    "The database looks for every row that matches the `WHERE` condition, then changes the columns in `SET` (for `UPDATE`) or removes the row (for `DELETE`). A search by primary key like `id = 7` is fast because the database keeps an index on it.",
    "If you leave out `WHERE`, the condition is simply true for every row. `DELETE FROM notes` empties the whole table and `UPDATE notes SET title = 'Hi'` renames every note, without any warning.",
    "Adding `AND user_id = $2` to the condition means a row only matches if it belongs to the logged-in user. Someone who sends another user's note id matches nothing, so they cannot change or delete it. This is authorization: checking that a user is allowed to touch this data.",
    "The database reports how many rows it affected; the `pg` library gives you that number as `result.rowCount`. A count of `0` means no note matched (it does not exist or belongs to someone else), so the server answers `404 Not Found`. Adding `RETURNING *` makes the statement also send back the changed rows, so you do not need an extra `SELECT`.",
  ],
  basicExample: {
    language: "sql",
    code: `UPDATE notes
SET title = 'Groceries', updated_at = now()
WHERE id = 1 AND user_id = 1
RETURNING id, title, updated_at;

DELETE FROM notes
WHERE id = 2 AND user_id = 1;`,
    caption:
      "The UPDATE renames note 1 only if it belongs to user 1 and returns the changed row; the DELETE removes note 2 under the same rule.",
    highlightLines: [3, 7],
  },
  internals: [
    "PostgreSQL does not overwrite a row in place. An `UPDATE` writes a new version of the row and marks the old version as dead; a `DELETE` only marks the row as dead. A background job called autovacuum later frees that space. Keeping old versions for a while is what lets other connections keep reading a consistent picture while you write.",
    "Each statement runs as one all-or-nothing unit: if an `UPDATE` matches 50 rows and one of them would break a rule (for example a `NOT NULL` column set to `NULL`), none of the 50 rows change.",
    "A column `DEFAULT` like `updated_at ... DEFAULT now()` is only used by `INSERT`. An `UPDATE` never fills it in for you, which is why the statement has to say `updated_at = now()` itself.",
    "Foreign keys decide what happens to rows that point at a deleted row. Because `notes.user_id` is declared `REFERENCES users(id) ON DELETE CASCADE`, deleting a user also deletes all their notes. Without `ON DELETE CASCADE`, PostgreSQL would refuse to delete a user who still has notes.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker and open `psql`, the program where you type SQL.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
docker exec -it notes-db psql -U postgres`,
      },
    },
    {
      text: "Create the two Notes App tables and some data: two users, and notes for each of them.",
      code: {
        language: "sql",
        code: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO users (email, password_hash)
VALUES ('ana@example.com', 'x'), ('ben@example.com', 'x');
INSERT INTO notes (user_id, title)
VALUES (1, 'Shopping'), (1, 'Ideas'), (2, 'Ben''s secret');`,
      },
    },
    {
      text: "Edit a note as user 1, then try to edit Ben's note (id 3) as user 1. The first prints `UPDATE 1` and the changed row; the second prints `UPDATE 0` because the `user_id` check matched nothing.",
      code: {
        language: "sql",
        code: `UPDATE notes SET title = 'Groceries', updated_at = now()
WHERE id = 1 AND user_id = 1
RETURNING *;

UPDATE notes SET title = 'Hacked'
WHERE id = 3 AND user_id = 1
RETURNING *;`,
      },
    },
    {
      text: "Delete a note, then see what a missing `WHERE` would do. `BEGIN` and `ROLLBACK` make the database undo everything in between, so the second part is a safe experiment.",
      code: {
        language: "sql",
        code: `DELETE FROM notes WHERE id = 2 AND user_id = 1;
SELECT id, user_id, title FROM notes;

BEGIN;
DELETE FROM notes;           -- no WHERE: every row
SELECT count(*) FROM notes;  -- 0
ROLLBACK;                    -- undo
SELECT count(*) FROM notes;  -- 2 again`,
      },
    },
    {
      text: "Check that it worked: the first `SELECT` lists only notes 1 and 3, note 1 is now called Groceries, and the last count is `2`. Type `\\q` to leave `psql`.",
    },
  ],
  whereUsed: [
    "Editing things: saving a changed note, updating a profile, marking a task as done.",
    "Removing things: deleting a note, closing an account, clearing old sessions or expired data.",
    "Behind `PUT`/`PATCH` and `DELETE` HTTP requests, which the server turns into these statements.",
  ],
  connectsTo: [
    "HTTP methods: `PUT /api/notes/:id` usually ends in an `UPDATE`, and `DELETE /api/notes/:id` in a `DELETE`.",
    "The controller on the server, which reads the note id from the URL and the user id from the login, runs the statement and picks the status code.",
    "Parameterized queries, which pass the id, title and user id as `$1`, `$2` values instead of pasting them into the SQL text.",
    "Foreign keys, whose `ON DELETE` rule decides what happens to related rows.",
  ],
  projectUsage: [
    {
      explanation:
        '`notesController.updateNote` runs `UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 AND user_id = $4 RETURNING *` and answers `200` with the returned row, or `404` with `{ "error": "Note not found" }` when no row matched.',
    },
    {
      explanation:
        "`notesController.deleteNote` runs `DELETE FROM notes WHERE id = $1 AND user_id = $2`. If `rowCount` is `1` it answers `204 No Content`; if it is `0` it answers `404`.",
    },
    {
      explanation:
        "In both statements the `user_id` value comes from `req.user.id`, set by the login check, never from the request body. That is why one user cannot edit or delete another user's notes.",
    },
  ],
  commonMistakes: [
    "Forgetting `WHERE`, which changes or deletes every row in the table. Always write the `WHERE` first, and try risky statements inside `BEGIN` ... `ROLLBACK` while learning.",
    "Checking only the note id (`WHERE id = $1`), so any logged-in user can edit any note by guessing ids. Add `AND user_id = $2` with the id of the logged-in user.",
    "Answering `200` or `204` without looking at `rowCount`, so the client is told a note was deleted that never existed. When `rowCount` is `0`, answer `404`.",
    "Forgetting `updated_at = now()` in an `UPDATE`, so the note still shows the time it was created. Column defaults only apply on `INSERT`; set it yourself.",
  ],
  relatedConcepts: [
    "sql",
    "crud",
    "sql-select",
    "sql-insert",
    "parameterized-query",
    "foreign-key",
    "http-methods",
    "controller",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
