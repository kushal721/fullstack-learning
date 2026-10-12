import type { Concept } from "@fsl/shared";

export const sqlTable: Concept = {
  id: "sql-table",
  slug: "sql-table",
  title: "Tables",
  topicId: "databases",
  summary:
    "A named container in a relational database that holds one kind of thing, such as users or notes, with a fixed set of typed columns.",
  basics: [
    "A relational database like PostgreSQL stores data in tables. Each table holds one kind of thing: a `users` table holds users, a `notes` table holds notes.",
    "A table is described by its columns. A column is one named piece of information every item has, like `title` or `email`, together with its type — the kind of value allowed in it, such as text or a whole number.",
    "You create a table with SQL (Structured Query Language), the language used to talk to relational databases. The command that defines a table is `CREATE TABLE`.",
  ],
  what: [
    "A table is a fixed structure, called a schema, plus the data stored in it. The schema lists every column, its type, and rules called constraints that every row must follow.",
    "`CREATE TABLE notes (...)` defines that structure once. After that, every note you insert must fit it: a note without a required title, or with text where a number belongs, is refused.",
  ],
  why: [
    "Declaring the shape up front lets the database protect your data. If the rules say every note needs a title, no bug in any program can ever store a note without one — the database itself refuses.",
    "Knowing the exact type of each column also lets the database store data compactly, compare and sort it correctly (dates as dates, not as text), and search it quickly.",
  ],
  howItWorks: [
    "Each column gets a type. Common PostgreSQL types: `INTEGER` for whole numbers, `TEXT` for text of any length, `TIMESTAMPTZ` for a moment in time including the time zone, and `SERIAL`, an integer the database fills in automatically by counting up 1, 2, 3…",
    "Constraints add rules. `NOT NULL` means the column must always have a value. `UNIQUE` means no two rows may have the same value, such as two users with one email. `DEFAULT now()` fills in a value when the insert does not give one.",
    "When you insert or update a row, PostgreSQL checks every type and constraint first. If anything breaks a rule, the whole command fails with an error and nothing is stored.",
  ],
  basicExample: {
    language: "sql",
    code: `CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);`,
    caption:
      "The Notes App's users table: an automatic id, an email that must exist and be unique, a password hash, and a creation time filled in automatically.",
    highlightLines: [3, 5],
  },
  internals: [
    "PostgreSQL saves the table's definition in its own internal tables, called the system catalog. That is where psql reads from when you run `\\d notes`.",
    "`SERIAL` is a shortcut: PostgreSQL creates a small counter object called a sequence and sets the column's default to the next number from it. That is why the insert can leave `id` out.",
    "`UNIQUE` and `PRIMARY KEY` each create an index behind the scenes — a sorted lookup structure — so the database can check for duplicates without reading every row.",
    "Names without double quotes are converted to lowercase, so `CREATE TABLE Notes` creates a table called `notes`. Use lowercase names with underscores (`created_at`) to avoid surprises.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker if it is not running yet, and open psql, PostgreSQL's command-line client.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
docker exec -it notes-db psql -U postgres`,
      },
    },
    {
      text: "Create the Notes App's two tables. `users` must come first, because `notes` points at it. If a `notes` table is left over from an earlier lesson, run `DROP TABLE notes;` first.",
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
);`,
      },
    },
    {
      text: "Check the tables exist with `\\dt`, then look at one in detail. `\\d notes` lists every column with its type, whether it may be empty (`not null`), its default, and the indexes and foreign keys.",
      code: {
        language: "sql",
        code: `\\dt
\\d notes`,
      },
    },
    {
      text: "Test the rules. The first insert works and `created_at` is filled in for you; the second fails with `duplicate key value violates unique constraint`, because that email is already taken.",
      code: {
        language: "sql",
        code: `INSERT INTO users (email, password_hash) VALUES ('ana@example.com', 'x');
INSERT INTO users (email, password_hash) VALUES ('ana@example.com', 'y');
SELECT * FROM users;`,
      },
    },
  ],
  whereUsed: [
    "Every relational database app: one table per kind of thing — users, notes, orders, comments.",
    "Schema files like `schema.sql` that set up a fresh database the same way on every developer's machine and on the real server.",
  ],
  connectsTo: [
    "Rows and columns, the records and fields that make up a table.",
    "Primary keys, which give every row in a table its own id.",
    "Foreign keys, which link a row in one table to a row in another.",
    "`INSERT` and `SELECT`, which put rows into a table and read them back.",
  ],
  projectUsage: [
    {
      explanation:
        "`database/schema.sql` creates the `users` and `notes` tables and an index on `notes.user_id`. Running it once sets up an empty database for the Notes App.",
      fileId: "database/schema.sql",
      match: "CREATE TABLE users (",
    },
    {
      explanation:
        'The `UNIQUE` rule on `users.email` is what makes registration safe: when someone signs up with an email that already exists, PostgreSQL refuses with error code `23505` and `authController` answers `409 { "error": "Email already registered" }`.',
      fileId: "database/schema.sql",
      match: "email TEXT NOT NULL UNIQUE,",
    },
    {
      explanation:
        "Because `content` has `DEFAULT ''` and `created_at`/`updated_at` default to `now()`, the controller's insert only needs `user_id`, `title` and `content`.",
      fileId: "database/schema.sql",
      match: "content TEXT NOT NULL DEFAULT '',",
    },
  ],
  commonMistakes: [
    "Creating `notes` before `users`. The foreign key needs `users` to exist already, so create the table being pointed at first.",
    "Leaving out `NOT NULL` on columns that must always have a value, then finding empty titles in the data. Add the constraint so the database enforces it.",
    "Storing dates in a `TEXT` column. Text dates sort wrongly and cannot be compared; use `TIMESTAMPTZ`.",
    'Running `CREATE TABLE` twice and getting `relation "notes" already exists`. Drop it first with `DROP TABLE notes;` while experimenting, or use `CREATE TABLE IF NOT EXISTS`.',
  ],
  relatedConcepts: [
    "database",
    "row-column",
    "primary-key",
    "foreign-key",
    "sql",
    "sql-insert",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
