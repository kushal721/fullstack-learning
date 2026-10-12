import type { Concept } from "@fsl/shared";

export const dbTransaction: Concept = {
  id: "db-transaction",
  slug: "db-transaction",
  title: "Transactions",
  topicId: "databases",
  summary:
    "A group of SQL statements that the database treats as one unit, so either all of them take effect or none of them do.",
  basics: [
    "A server changes data in the database by sending SQL statements, such as `INSERT` to add a row or `UPDATE` to change one. Normally each statement is saved for good as soon as it finishes.",
    "Some jobs need several statements. Imagine that signing up should create the user and also a welcome note for them: that is one `INSERT` into `users` and one `INSERT` into `notes`.",
    "Things can fail between two statements: the second insert breaks a rule, the server crashes, the network drops. If the first statement was already saved, you are left with half a job, such as a user without their welcome note.",
  ],
  what: [
    "A transaction wraps several statements so the database treats them as a single change. You start it with `BEGIN`, and end it with `COMMIT` to save everything or `ROLLBACK` to throw everything away.",
    "Until `COMMIT`, the changes are only a draft: other connections cannot see them yet, and if anything goes wrong the database removes them as if they never happened.",
  ],
  why: [
    "Data that is half updated is worse than data that was never updated, because the app later finds a state it was never designed for. A transaction removes the in-between state: the user and the welcome note both exist, or neither does.",
    "You do not have to write clean-up code that undoes step one when step two fails, which is hard to get right. The database already knows how to undo, and it does it even if your server crashes in the middle.",
  ],
  howItWorks: [
    "`BEGIN` tells the database that the following statements on this connection belong together. They run normally, and you can even read back the rows you just inserted.",
    "If every statement succeeds, `COMMIT` makes all the changes permanent and visible to everyone at the same moment.",
    "If any statement fails, PostgreSQL ignores every further command in that transaction until you send `ROLLBACK`, which discards all of its changes. If the connection is lost before `COMMIT`, PostgreSQL rolls back by itself.",
    "A transaction belongs to one connection. With the `pg` library, `pool.query` may use a different connection for each call, so you must borrow one client with `const client = await pool.connect()`, run `BEGIN`, the statements and `COMMIT` on that client, and give it back with `client.release()`.",
  ],
  basicExample: {
    language: "js",
    code: `const client = await pool.connect(); // borrow ONE connection
try {
  await client.query("BEGIN");
  const { rows } = await client.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
    [email, passwordHash]
  );
  await client.query(
    "INSERT INTO notes (user_id, title) VALUES ($1, $2)",
    [rows[0].id, "Welcome to Notes!"]
  );
  await client.query("COMMIT");
} catch (err) {
  await client.query("ROLLBACK");
  throw err;
} finally {
  client.release(); // always give the connection back
}`,
    caption:
      "The user and their welcome note are saved together by COMMIT; if either insert fails, ROLLBACK removes both.",
    highlightLines: [1, 3, 12, 14, 17],
  },
  internals: [
    "PostgreSQL writes the new rows as soon as each statement runs, but marks them with the transaction's id. Other connections skip rows whose transaction has not committed, so they keep seeing the old data. `COMMIT` flips that one marker, which is why all the changes appear at once.",
    "`ROLLBACK` marks the transaction as aborted, so its rows are never shown to anyone, and they are cleaned up later. One thing is not undone: numbers taken from a `SERIAL` counter, so after a rollback the next user may get id 5 instead of 4. Gaps in ids are normal.",
    "Every statement you send without `BEGIN` already runs in its own tiny transaction that commits automatically. That is why a single `UPDATE` never half-finishes, and why you only need `BEGIN` when several statements must stick together.",
    "How much transactions running at the same time can see of each other is called isolation; PostgreSQL's default (Read Committed) is fine for most apps.",
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
      text: "Create the Notes App tables, then try a transaction by hand. Inside it the new user is visible; after `ROLLBACK` it is gone.",
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

BEGIN;
INSERT INTO users (email, password_hash) VALUES ('test@example.com', 'x');
SELECT id, email FROM users;  -- test@example.com is there
ROLLBACK;
SELECT id, email FROM users;  -- and now it is gone`,
      },
    },
    {
      text: "Leave `psql` with `\\q`. In a new folder, set up Node.js with `pg` and the database address.",
      code: {
        language: "bash",
        code: `mkdir tx-demo && cd tx-demo
npm init -y
npm pkg set type=module
npm install pg
export DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres`,
      },
    },
    {
      text: "Create `register.js`. Passing `broken` as an argument makes the second insert fail, because `title` may not be `NULL`.",
      code: {
        language: "js",
        fileName: "register.js",
        code: `import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const email = process.argv[2];
const title = process.argv[3] === "broken" ? null : "Welcome to Notes!";

const client = await pool.connect();
try {
  await client.query("BEGIN");
  const { rows } = await client.query(
    "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id",
    [email, "not-a-real-hash"]
  );
  await client.query(
    "INSERT INTO notes (user_id, title) VALUES ($1, $2)",
    [rows[0].id, title]
  );
  await client.query("COMMIT");
  console.log("Saved user", rows[0].id, "and their welcome note");
} catch (err) {
  await client.query("ROLLBACK");
  console.log("Rolled back:", err.message);
} finally {
  client.release();
}
await pool.end();`,
      },
    },
    {
      text: 'Run it twice, then look at the users. `ok@example.com` is saved with its note; `bad@example.com` prints `Rolled back: null value in column "title"` and does not appear in `users` at all, even though its own insert had succeeded.',
      code: {
        language: "bash",
        code: `node register.js ok@example.com
node register.js bad@example.com broken
docker exec -it notes-db psql -U postgres -c "SELECT id, email FROM users"`,
      },
    },
  ],
  whereUsed: [
    "Any action that writes to more than one row or table and must not stop halfway: creating an account with default data, placing an order and reducing stock, moving money from one account to another.",
    "Changes that must check something and then act on it as one step, such as reading a balance and then subtracting from it.",
  ],
  connectsTo: [
    "The connection pool, which lends out the single client a transaction must run on.",
    "`async`/`await` with `try`/`catch`/`finally`, which decides when to `COMMIT`, when to `ROLLBACK` and makes sure the client is always released.",
    "Parameterized queries: the statements inside a transaction still pass their values as `$1`, `$2`.",
    "Foreign keys: the welcome note's `user_id` must point at the user created a moment earlier in the same transaction.",
  ],
  projectUsage: [
    {
      explanation:
        "Each action in the Notes App, such as creating, updating or deleting a note, is a single SQL statement. PostgreSQL already runs each one as its own small transaction, so `notesController` can safely use `pool.query` without `BEGIN`.",
      fileId: "backend/src/controllers/notesController.js",
      match: 'import { pool } from "../db.js";',
    },
    {
      explanation:
        "Registration in `authController` is also a single `INSERT INTO users`. If you extend it to create a welcome note as well, that is the moment to switch to `pool.connect()` and wrap both inserts in `BEGIN` and `COMMIT`, exactly as in the example.",
      fileId: "backend/src/controllers/authController.js",
      match:
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    },
  ],
  commonMistakes: [
    "Running `BEGIN`, the inserts and `COMMIT` with `pool.query`. Each call can land on a different connection, so the statements are not in one transaction at all. Use `const client = await pool.connect()` and `client.query` for all of them.",
    "Forgetting `client.release()`, or only calling it on success. The connection never returns to the pool, and after a few errors the app hangs waiting for one. Release it in `finally`.",
    "Catching an error and carrying on without `ROLLBACK`. The transaction stays broken and every later query on that client fails with `current transaction is aborted`. Always `ROLLBACK` in `catch`.",
    "Wrapping slow work, like calling another website, inside a transaction. The connection is held for the whole time; do slow work before `BEGIN` and keep transactions short.",
  ],
  relatedConcepts: [
    "db-connection-pool",
    "sql-insert",
    "sql-update-delete",
    "parameterized-query",
    "foreign-key",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
