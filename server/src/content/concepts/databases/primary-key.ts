import type { Concept } from "@fsl/shared";

export const primaryKey: Concept = {
  id: "primary-key",
  slug: "primary-key",
  title: "Primary key",
  topicId: "databases",
  summary:
    "A column whose value is different for every row of a table, so each row can be found and referred to without any doubt.",
  basics: [
    'A database table holds many rows, and rows can look alike: two users might both write a note called "Shopping". To change or delete one particular note, you need a way to point at exactly that row.',
    "In everyday life we use ids for this: a passport number or an order number. Two people can share a name but never a passport number.",
    "A key, in a database, is a column (or set of columns) used to identify rows. The primary key is the one main id the table uses for every row.",
  ],
  what: [
    "A primary key is a column whose values must be unique (no two rows the same) and never empty. In the Notes App it is the `id` column: `id SERIAL PRIMARY KEY`.",
    "`SERIAL` makes PostgreSQL pick the value for you: the first row gets 1, the next 2, and so on. You never send an id when creating a note — the database assigns one and can return it with `RETURNING *`.",
  ],
  why: [
    'Without a unique id, a command like "delete the note called Shopping" could delete the wrong one, or several. With a primary key, `DELETE FROM notes WHERE id = 42` touches exactly one row.',
    "Why not use the email or the title as the id? Titles repeat, and both can change — a user may update their email. If other rows and URLs pointed at the old value, they would all break. A meaningless number that never changes is a safe, stable thing to point at.",
  ],
  howItWorks: [
    "`PRIMARY KEY` is two rules in one: `NOT NULL` and `UNIQUE`. Any insert or update that would break either is refused.",
    "With `SERIAL`, PostgreSQL keeps a counter (a sequence). Each insert that leaves `id` out takes the next number from it.",
    'The id travels everywhere: the backend returns it in JSON (`{ "id": 42, ... }`), the frontend puts it in URLs like `/api/notes/42`, and the backend uses it in `WHERE id = $1` to find that exact note again.',
  ],
  basicExample: {
    language: "sql",
    code: `INSERT INTO notes (user_id, title, content)
VALUES (1, 'Shopping', 'Milk')
RETURNING id;

 id
----
 42`,
    caption:
      "The insert leaves id out; PostgreSQL generates 42 and returns it. From now on, 42 means exactly this note.",
  },
  internals: [
    "PostgreSQL creates an index for every primary key — a sorted lookup structure, like the index at the back of a book. Finding the row with `id = 42` jumps straight to it instead of reading the whole table.",
    "The sequence behind `SERIAL` never goes backwards. If you delete note 42, the next note gets 43, not 42, so an old link to `/api/notes/42` can never suddenly show someone else's new note.",
    "Numbers can also be skipped: an insert that fails after taking a number still uses it up. Gaps in ids are normal and nothing to fix.",
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
      text: "Create a table with a primary key and add two rows with the same title. Both are accepted, because the id tells them apart.",
      code: {
        language: "sql",
        code: `CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);
INSERT INTO todos (title) VALUES ('Shopping'), ('Shopping') RETURNING id;`,
      },
    },
    {
      text: "Delete one row by id, then add a new one. The new row gets id 3, not 1 — ids are never reused.",
      code: {
        language: "sql",
        code: `DELETE FROM todos WHERE id = 1;
INSERT INTO todos (title) VALUES ('Gym') RETURNING id;`,
      },
    },
    {
      text: 'Try to break the rule by forcing a duplicate id. PostgreSQL refuses with `duplicate key value violates unique constraint "todos_pkey"`, and `SELECT * FROM todos;` still shows only ids 2 and 3.',
      code: {
        language: "sql",
        code: `INSERT INTO todos (id, title) VALUES (2, 'Copy');
SELECT * FROM todos;`,
      },
    },
  ],
  whereUsed: [
    "Almost every table: users, notes, orders and comments all get an `id` primary key.",
    "In REST API URLs that name one item, such as `GET /api/notes/42` or `DELETE /api/notes/42`.",
    "As the target of foreign keys: `notes.user_id` stores the primary key of a row in `users`.",
  ],
  connectsTo: [
    "Tables, where the primary key is declared in `CREATE TABLE`.",
    "Foreign keys, which store another table's primary key to link rows together.",
    "Express routes with parameters like `/api/notes/:id`, where `req.params.id` holds the id from the URL.",
    "`UPDATE` and `DELETE` with `WHERE id = $1`, which change or remove exactly one row.",
  ],
  projectUsage: [
    {
      explanation:
        "Both Notes App tables start with `id SERIAL PRIMARY KEY`, so every user and every note gets its own number automatically.",
      fileId: "database/schema.sql",
      match: "id SERIAL PRIMARY KEY,",
    },
    {
      explanation:
        "Creating a note runs `INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, title, content, created_at, updated_at`, so the `201` response includes the new `id` and the frontend can use it right away.",
      fileId: "backend/src/controllers/notesController.js",
      match: "INSERT INTO notes (user_id, title, content)",
    },
    {
      explanation:
        'Editing note 42 sends `PUT /api/notes/42`; the controller runs `UPDATE notes ... WHERE id = $3 AND user_id = $4`, and answers `404 { "error": "Note not found" }` if that id does not exist or belongs to someone else.',
      fileId: "backend/src/controllers/notesController.js",
      match: "WHERE id = $3 AND user_id = $4",
    },
  ],
  commonMistakes: [
    "Sending your own `id` when inserting a `SERIAL` row. It can clash with numbers the sequence hands out later; leave `id` out and let the database choose.",
    "Using an email, username or title as the primary key. They change or repeat; use a separate `id` and add `UNIQUE` to the email instead.",
    "Trusting an id from the URL alone. Anyone can type `/api/notes/43`; also check ownership with `AND user_id = $n`, as the Notes App does.",
    "Expecting ids with no gaps or reused after a delete. Ids are labels, not a count of rows — use `SELECT count(*)` to count.",
  ],
  relatedConcepts: [
    "sql-table",
    "foreign-key",
    "row-column",
    "express-route",
    "sql-update-delete",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
