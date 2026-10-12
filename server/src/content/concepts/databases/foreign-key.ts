import type { Concept } from "@fsl/shared";

export const foreignKey: Concept = {
  id: "foreign-key",
  slug: "foreign-key",
  title: "Foreign key",
  topicId: "databases",
  summary:
    "A column that stores the id of a row in another table, and a rule that makes the database guarantee that row really exists.",
  basics: [
    "Data in an app is connected: every note belongs to a user. A relational database keeps users and notes in separate tables, so it needs a way to record which user each note belongs to.",
    "Every user row already has a primary key — a unique `id` that never changes. So a note can simply store its owner's id in a column, `user_id`.",
    'A key is a column used to identify rows. A foreign key is a column that holds a key from a different ("foreign") table, plus a rule that the value must match a real row there.',
  ],
  what: [
    "In the Notes App, `user_id INTEGER NOT NULL REFERENCES users(id)` declares the foreign key. `REFERENCES users(id)` says: every value in this column must be an `id` that exists in `users`.",
    "`ON DELETE CASCADE` adds what happens when that user is deleted: all of their notes are deleted automatically along with them.",
  ],
  why: [
    "Without the rule, a bug could save a note with `user_id = 999` when no user 999 exists — an orphan row that belongs to nobody. With the foreign key, the database refuses it, so the link is always valid no matter which program writes the data.",
    "Storing only the user's id, instead of copying their email into every note, means each fact lives in one place. If the user changes their email, nothing in `notes` needs updating.",
  ],
  howItWorks: [
    "On every insert or update of `notes.user_id`, PostgreSQL looks up that id in `users`. If it is missing, the command fails with `violates foreign key constraint` (error code `23503`) and nothing is saved.",
    "When a user row is deleted, PostgreSQL checks `notes` for rows pointing at it. With `ON DELETE CASCADE` it deletes those notes in the same step; without it, the delete is refused while notes still exist.",
    "To read a note together with its owner, a query joins the two tables on the link: `JOIN users ON users.id = notes.user_id`.",
  ],
  basicExample: {
    language: "sql",
    code: `CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

INSERT INTO notes (user_id, title) VALUES (999, 'Ghost');
-- ERROR: insert or update on table "notes" violates foreign key constraint`,
    caption:
      "user_id must match an existing users.id. There is no user 999, so the database refuses the note.",
    highlightLines: [3],
  },
  internals: [
    "Checking the link on insert is fast because `users.id` is a primary key and already has an index. The reverse check — finding a user's notes when the user is deleted — has no index unless you create one.",
    'That is why the Notes App adds `CREATE INDEX notes_user_id_idx ON notes (user_id)`. Without it, deleting a user, and every "list my notes" query (`WHERE user_id = $1`), reads the whole notes table; with it, PostgreSQL jumps straight to that user\'s rows.',
    "`ON DELETE CASCADE` is powerful and permanent: one `DELETE FROM users WHERE id = 1` silently removes every note that user wrote. That is right for notes, which mean nothing without their owner, but for data you must keep (like invoices) use the default instead, which refuses the delete.",
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
      text: "Create the two linked tables and the index. If you already created them in an earlier lesson, run `DROP TABLE notes, users;` first.",
      code: {
        language: "sql",
        fileName: "database/schema.sql",
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

CREATE INDEX notes_user_id_idx ON notes (user_id);`,
      },
    },
    {
      text: "Add a user and two notes for them, then try a note for a user who does not exist. The last insert fails with `violates foreign key constraint`.",
      code: {
        language: "sql",
        code: `INSERT INTO users (email, password_hash) VALUES ('ana@example.com', 'x') RETURNING id;
INSERT INTO notes (user_id, title) VALUES (1, 'Shopping'), (1, 'Ideas');
INSERT INTO notes (user_id, title) VALUES (999, 'Ghost');`,
      },
    },
    {
      text: "Delete the user and count the notes. The count is 0: `ON DELETE CASCADE` removed both notes together with their owner.",
      code: {
        language: "sql",
        code: `DELETE FROM users WHERE id = 1;
SELECT count(*) FROM notes;`,
      },
    },
  ],
  whereUsed: [
    "Any time one thing belongs to another: notes to users, comments to posts, order lines to orders.",
    'One-to-many relationships, where one row (a user) can be linked from many rows (their notes) — the foreign key always sits on the "many" side.',
  ],
  connectsTo: [
    "Primary keys: a foreign key always stores the primary key of the row it points at.",
    "One-to-many relationships, which foreign keys are used to build.",
    'Indexes on the foreign key column, which make "all rows for this owner" queries fast.',
    "Queries filtering by owner, like `WHERE user_id = $1`, which the backend uses to show each user only their own data.",
  ],
  projectUsage: [
    {
      explanation:
        "`database/schema.sql` declares `notes.user_id` as `INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE` and creates `notes_user_id_idx` on it.",
      fileId: "database/schema.sql",
      match:
        "user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,",
    },
    {
      explanation:
        "When a note is created, `notesController` fills `user_id` with `req.user.id` — the id of the logged-in user — never with a value sent by the browser, so a note always belongs to whoever created it.",
      fileId: "backend/src/controllers/notesController.js",
      match: "[req.user.id, title.trim(), content],",
    },
    {
      explanation:
        "Listing (`WHERE user_id = $1`), updating and deleting (`AND user_id = $n`) all filter on this column, which is how one user can never see or change another user's notes. The index keeps these queries fast as the table grows.",
      fileId: "backend/src/controllers/notesController.js",
      match: "WHERE user_id = $1",
    },
  ],
  commonMistakes: [
    "Creating the child table before the parent: `notes` cannot reference `users` until `users` exists. Create `users` first.",
    "Adding `ON DELETE CASCADE` without thinking about what disappears with it. Use it only where the child rows are worthless without the parent.",
    "Forgetting the index on the foreign key column. PostgreSQL does not create one automatically; add `CREATE INDEX ... ON notes (user_id)`.",
    "Taking `user_id` from the request body. A user could send someone else's id; always use the id of the logged-in user from the server side.",
  ],
  relatedConcepts: [
    "primary-key",
    "one-to-many-relationship",
    "sql-table",
    "sql-select",
    "controller",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
