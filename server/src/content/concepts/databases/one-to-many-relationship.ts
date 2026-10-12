import type { Concept } from "@fsl/shared";

export const oneToManyRelationship: Concept = {
  id: "one-to-many-relationship",
  slug: "one-to-many-relationship",
  title: "One-to-many relationships",
  topicId: "databases",
  summary:
    "A link between two tables where one row in the first table, such as a user, can own many rows in the second, such as that user's notes.",
  basics: [
    "A relational database stores data in tables. Each table holds one kind of thing: the `users` table holds users, the `notes` table holds notes. Each row is one item and each column is one piece of information about it, like `email` or `title`.",
    "Every row has a primary key, a column (usually `id`) whose value is unique, so the row can be pointed at without confusion: user `1`, note `42`.",
    'A foreign key is a column in one table that stores the primary key of a row in another table. It is how one row says "I belong to that row over there".',
  ],
  what: [
    "A one-to-many relationship means one row on one side can be connected to many rows on the other side, but each of those rows belongs to exactly one. One user has many notes; each note has one owner.",
    'It is built with a single foreign key on the "many" side. In the Notes App, every row in `notes` has a `user_id` column that holds the `id` of the user who owns it.',
  ],
  why: [
    "Real data is connected. Without a link, the database could not answer \"which notes are Ana's?\" and every user would see everyone's notes.",
    'Putting the foreign key on the "many" side keeps every fact in one place. A user row cannot hold a list of note ids in a single column cleanly, but each note can easily hold one `user_id`. The user\'s email is stored once in `users`, not copied into every note, so changing it means changing one row.',
  ],
  howItWorks: [
    "The `notes` table declares `user_id INTEGER NOT NULL REFERENCES users(id)`. `REFERENCES` tells the database the value must match an existing user `id`, and `NOT NULL` means every note must have an owner.",
    "To get one user's notes, you filter the many side by the foreign key: `SELECT * FROM notes WHERE user_id = 1;`. The database returns zero, one or many rows.",
    "To show data from both tables together, you use a `JOIN`. `JOIN users ON users.id = notes.user_id` matches each note with its owner's row, so one result row can contain the note's title and the author's email.",
    "There are two other shapes. One-to-one: each row matches at most one row in the other table, built with a foreign key that is also `UNIQUE` (for example one profile per user). Many-to-many: rows on both sides can have many partners (notes and tags), built with a third join table such as `note_tags (note_id, tag_id)` that holds one row per link.",
  ],
  basicExample: {
    language: "sql",
    code: `-- The "many" side holds the foreign key
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

-- All notes of user 1
SELECT id, title FROM notes WHERE user_id = 1;

-- Each note together with its author's email
SELECT notes.title, users.email
FROM notes
JOIN users ON users.id = notes.user_id;`,
    caption:
      "`user_id` on each note points to one user; filtering by it lists a user's notes, and a JOIN brings in the author's email.",
    highlightLines: [4, 9, 14],
  },
  internals: [
    "The `REFERENCES` constraint is checked on every write. Inserting a note with `user_id = 999` when no user 999 exists fails with a foreign key error, so the database never holds a note without an owner.",
    "`ON DELETE CASCADE` tells the database what to do when a user is deleted: delete their notes too. Without it, deleting a user who still has notes would be refused, because those notes would point at nothing.",
    "A foreign key does not make lookups fast by itself. The Notes App adds `CREATE INDEX notes_user_id_idx ON notes (user_id);`, a sorted lookup structure that lets `WHERE user_id = $1` jump straight to one user's notes instead of reading every note in the table.",
    "A `JOIN` does not store anything. The database combines the two tables only while answering the query; the data stays in two separate tables.",
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
      text: 'Create the "one" table and the "many" table. The foreign key goes on `notes`.',
      code: {
        language: "sql",
        code: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE
);
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);`,
      },
    },
    {
      text: "Add two users, give the first one two notes and the second one one note.",
      code: {
        language: "sql",
        code: `INSERT INTO users (email) VALUES ('ana@example.com'), ('ben@example.com');
INSERT INTO notes (user_id, title) VALUES (1, 'Shopping'), (1, 'Ideas'), (2, 'Trip');`,
      },
    },
    {
      text: "Ask for Ana's notes, then list every note with its author's email.",
      code: {
        language: "sql",
        code: `SELECT id, title FROM notes WHERE user_id = 1;

SELECT notes.title, users.email
FROM notes
JOIN users ON users.id = notes.user_id;`,
      },
    },
    {
      text: "The first query returns 2 rows (Shopping, Ideas) and the second returns 3 rows, each with an email. Now try `INSERT INTO notes (user_id, title) VALUES (99, 'Lost');` — it fails with a foreign key error because user 99 does not exist. Type `\\q` to quit.",
    },
  ],
  whereUsed: [
    "Almost every app with accounts: a user has many notes, posts, orders or comments.",
    "Nested data in general: a post has many comments, an order has many order items, a folder has many files.",
    "Admin and list screens that show an item with its owner, built with a `JOIN`.",
  ],
  connectsTo: [
    "Primary keys, which the foreign key points at.",
    "Foreign keys and their `REFERENCES` and `ON DELETE` rules.",
    "`SELECT` with `WHERE` and `JOIN`, which read the related rows.",
    "Authentication on the server, which supplies the logged-in user's id used in `WHERE user_id = $1`.",
  ],
  projectUsage: [
    {
      explanation:
        "`database/schema.sql` creates `notes` with `user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE` and adds the index `notes_user_id_idx` so one user's notes are found quickly.",
      fileId: "database/schema.sql",
      match:
        "user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,",
    },
    {
      explanation:
        "`listNotes` in `backend/src/controllers/notesController.js` runs `SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC` with `req.user.id`, so each user only ever receives their own notes.",
      fileId: "backend/src/controllers/notesController.js",
      match: "SELECT id, title, content, created_at, updated_at",
    },
    {
      explanation:
        "`updateNote` and `deleteNote` add `AND user_id = $n` to their `WHERE`, which uses the same relationship to stop one user changing another user's notes.",
      fileId: "backend/src/controllers/notesController.js",
      match: "WHERE id = $3 AND user_id = $4",
    },
  ],
  commonMistakes: [
    'Putting the link on the wrong side, such as a `note_ids` column in `users` holding a list. Put a single `user_id` foreign key on the "many" side instead.',
    "Leaving out `REFERENCES`, so the database accepts notes pointing at users that don't exist. Declare the foreign key so the database checks it for you.",
    "Copying the author's email into every note instead of joining. When the email changes, the copies go out of date; store it once in `users` and use a `JOIN` when you need it.",
    "Forgetting to filter by the owner, for example `SELECT * FROM notes` in an API endpoint, which shows every user's notes. Always add `WHERE user_id = $1` with the logged-in user's id.",
  ],
  relatedConcepts: ["foreign-key", "primary-key", "sql-table", "sql-select"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
