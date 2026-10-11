import type { BuildStep } from "@fsl/shared";

export const addDatabaseStep: BuildStep = {
  id: "add-database",
  slug: "add-database",
  order: 10,
  title: "Add the database",
  goal: "Store the notes in PostgreSQL with a schema, a connection pool and parameterized queries.",
  why: "A database keeps data safe when the server restarts, crashes or runs as several copies, and can find the right rows quickly. Parameterized queries keep user input from ever changing the SQL itself.",
  problemSolved: "Notes that disappear whenever the server restarts.",
  prerequisites: ["create-api-routes"],
  explanation: [
    "**PostgreSQL** is a relational database: data lives in **tables** of rows and columns, and you talk to it in **SQL**. It runs as its own program; the backend connects to it over the network, like the frontend connects to the backend.",
    "The **schema** (`database/schema.sql`) describes the tables. We create both tables now: `users` (one row per account) and `notes` (one row per note). Each note has a `user_id` that must point at an existing user — a **foreign key** — because every note will belong to someone. Accounts arrive in step 11; until then the backend uses a demo user from `seed.sql`.",
    "Column rules protect the data even if the backend has a bug: `PRIMARY KEY` gives each row a unique id, `NOT NULL` forbids empty values, `UNIQUE` forbids two accounts with the same email and `DEFAULT now()` fills in times automatically.",
    "Each SQL statement matches a CRUD action: `SELECT` reads, `INSERT` creates, `UPDATE` changes and `DELETE` removes. `RETURNING` sends back the row the database just wrote, including its new `id` and times.",
    "**Parameterized queries** put `$1`, `$2`… in the SQL and pass the values separately. The database never treats those values as SQL, so a title like `'); DROP TABLE notes; --` is stored as text instead of deleting your data — this prevents **SQL injection**.",
    "Opening a database connection is slow, so `db.js` creates one **pool**: it keeps a few connections open and lends one to each query. The whole app imports the same pool.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL 16 with Docker. One command downloads it and starts it with the password `dev`, an empty database called `notes`, and port 5432 open on your computer.",
      code: {
        language: "bash",
        code: "docker run --name notes-db -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=notes -p 5432:5432 -d postgres:16",
        caption:
          "Install Docker Desktop first if `docker` isn't found. Later you can start it again with `docker start notes-db`. Docker itself is explained in step 14; here it is just a quick way to run PostgreSQL.",
      },
    },
    {
      text: "PostgreSQL needs a few seconds to start the first time. Check whether it is ready; run the command again until it prints `accepting connections`.",
      code: {
        language: "bash",
        code: "docker exec notes-db pg_isready -h localhost -U postgres",
        caption:
          '`no response` means it is still starting. Running the SQL files before it is ready fails with "connection to server … failed".',
      },
    },
    {
      text: "In the second terminal, go up to `notes-app` and create the `database` folder. The SQL files go there because they belong to neither the frontend nor the backend.",
      code: {
        language: "bash",
        code: "cd ..\nmkdir database",
      },
    },
    {
      text: "Create `database/schema.sql` with the two tables.",
      code: {
        language: "sql",
        code: "-- Notes App database schema (PostgreSQL 16).\n-- Run once on an empty database:\n--   psql \"$DATABASE_URL\" -f database/schema.sql\n\n-- One row per account.\nCREATE TABLE users (\n  -- PRIMARY KEY: every user has a unique id the database creates\n  -- (SERIAL counts up: 1, 2, 3…). Other tables refer to users by this id.\n  id SERIAL PRIMARY KEY,\n\n  -- UNIQUE: two accounts can never share an email. The backend relies on\n  -- this rule (error 23505 → 409) instead of checking first, so two\n  -- sign-ups at the same moment can't both succeed.\n  email TEXT NOT NULL UNIQUE,\n\n  -- Never the password itself: a bcrypt hash that can't be turned back.\n  password_hash TEXT NOT NULL,\n\n  -- DEFAULT now(): the database fills in the time; the app doesn't send it.\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\n-- One row per note. Each note belongs to exactly one user (one-to-many).\nCREATE TABLE notes (\n  id SERIAL PRIMARY KEY,\n\n  -- FOREIGN KEY: user_id must be the id of an existing user, so a note can\n  -- never point at nobody. ON DELETE CASCADE: deleting a user also deletes\n  -- their notes.\n  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,\n\n  -- NOT NULL: every note needs a title (the backend also checks it is not\n  -- empty and at most 100 characters).\n  title TEXT NOT NULL,\n\n  -- Content is optional, so it defaults to an empty string instead of NULL.\n  content TEXT NOT NULL DEFAULT '',\n\n  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),\n  -- Set again by the UPDATE query whenever a note is edited.\n  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()\n);\n\n-- Every notes query filters by user_id. This index lets PostgreSQL find one\n-- user's notes directly instead of reading the whole table.\nCREATE INDEX notes_user_id_idx ON notes (user_id);",
        fileName: "database/schema.sql",
        caption:
          "Final version. The comments explain every rule; `password_hash` and the email rule are used in step 11.",
      },
    },
    {
      text: "Create `database/seed.sql` with a demo user and two notes, so there is something to see.",
      code: {
        language: "sql",
        code: "-- Demo data for local development only. Run after schema.sql:\n--   psql \"$DATABASE_URL\" -f database/seed.sql\n--\n-- Log in with:  demo@example.com  /  demo-password\n-- (The hash below is bcrypt, cost 12, of \"demo-password\". Never put real\n-- passwords or production data in a seed file.)\n\nINSERT INTO users (email, password_hash)\nVALUES (\n  'demo@example.com',\n  '$2b$12$O7mKyRkPczpSxhgK2rD7QuZVdKN8yAsaZaMPxnxvw6xHqKiiJRLyO'\n);\n\n-- The user id comes from the row above, looked up by email, so this file\n-- works whatever id the database gave the user.\nINSERT INTO notes (user_id, title, content)\nSELECT id, 'Welcome to your notes', 'Edit or delete this note, or write a new one above.'\nFROM users\nWHERE email = 'demo@example.com';\n\nINSERT INTO notes (user_id, title, content)\nSELECT id, 'Shopping', 'Milk, bread, apples'\nFROM users\nWHERE email = 'demo@example.com';",
        fileName: "database/seed.sql",
        caption:
          "Final version. The demo password works once log in exists (step 11).",
      },
    },
    {
      text: "Run both files inside the database container. `<` sends the file's text to `psql`, PostgreSQL's command-line client.",
      code: {
        language: "bash",
        code: "docker exec -i notes-db psql -U postgres -d notes < database/schema.sql\ndocker exec -i notes-db psql -U postgres -d notes < database/seed.sql",
        caption:
          'Expected output: `CREATE TABLE` twice and `CREATE INDEX`, then `INSERT 0 1` three times. Running schema.sql a second time fails with "already exists" — that is fine.',
      },
    },
    {
      text: "Go back into the backend and install `pg`, the PostgreSQL client for Node.js.",
      code: {
        language: "bash",
        code: "cd backend\nnpm install pg",
      },
    },
    {
      text: "Add the database address to `.env.example`, between `PORT` and `NODE_ENV`. The address contains the user, password, host, port and database name.",
      code: {
        language: "bash",
        code: "# Copy this file to .env and change the values. .env is never committed.\nPORT=3000\nDATABASE_URL=postgres://postgres:dev@localhost:5432/notes\nNODE_ENV=development",
        fileName: "backend/.env.example",
        caption: "Step 11 adds `JWT_SECRET`.",
      },
    },
    {
      text: "Copy it to `.env` again so your real settings include the new line (or add the line to `.env` by hand if you changed other values there).",
      code: {
        language: "bash",
        code: "cp .env.example .env",
      },
    },
    {
      text: "Create `src/db.js` with the one connection pool the whole backend shares.",
      code: {
        language: "js",
        code: 'import pg from "pg";\n\n// One pool for the whole app: it keeps a few database connections open and\n// lends them to each query, because opening a new connection is slow.\nexport const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });',
        fileName: "backend/src/db.js",
        caption: "Final version.",
      },
    },
    {
      text: "Replace `src/controllers/notesController.js` so every function runs SQL instead of changing the array. The values always go in the second argument, never inside the SQL text.",
      code: {
        language: "js",
        code: 'import { pool } from "../db.js";\nimport { validateNote } from "../validation/noteValidation.js";\n\n// Until log in exists (step 11), every note belongs to the demo user that\n// database/seed.sql creates (the first user, so id 1).\nconst DEMO_USER_ID = 1;\n\n// Values are always passed separately ($1, $2…), never glued into the SQL,\n// so user input can never change the query (no SQL injection).\n\n// Ids in the URL are text. Anything that isn\'t a positive whole number can\'t\n// be a note, so it is "not found" instead of a database error.\nfunction noteId(req) {\n  const id = Number(req.params.id);\n  return Number.isInteger(id) && id > 0 ? id : null;\n}\n\nexport async function listNotes(req, res) {\n  const result = await pool.query(\n    `SELECT id, title, content, created_at, updated_at\n       FROM notes\n      WHERE user_id = $1\n      ORDER BY created_at DESC`,\n    [DEMO_USER_ID],\n  );\n  res.json(result.rows);\n}\n\nexport async function createNote(req, res) {\n  const error = validateNote(req.body);\n  if (error) return res.status(400).json({ error });\n\n  const { title, content = "" } = req.body;\n  const result = await pool.query(\n    `INSERT INTO notes (user_id, title, content)\n     VALUES ($1, $2, $3)\n     RETURNING id, title, content, created_at, updated_at`,\n    [DEMO_USER_ID, title.trim(), content],\n  );\n  res.status(201).json(result.rows[0]);\n}\n\nexport async function updateNote(req, res) {\n  const id = noteId(req);\n  if (!id) return res.status(404).json({ error: "Note not found" });\n  const error = validateNote(req.body);\n  if (error) return res.status(400).json({ error });\n\n  const { title, content = "" } = req.body;\n  const result = await pool.query(\n    `UPDATE notes\n        SET title = $1, content = $2, updated_at = now()\n      WHERE id = $3\n      RETURNING id, title, content, created_at, updated_at`,\n    [title.trim(), content, id],\n  );\n  if (result.rowCount === 0) {\n    return res.status(404).json({ error: "Note not found" });\n  }\n  res.json(result.rows[0]);\n}\n\nexport async function deleteNote(req, res) {\n  const id = noteId(req);\n  if (!id) return res.status(404).json({ error: "Note not found" });\n  const result = await pool.query("DELETE FROM notes WHERE id = $1", [id]);\n  if (result.rowCount === 0) {\n    return res.status(404).json({ error: "Note not found" });\n  }\n  res.status(204).end();\n}',
        fileName: "backend/src/controllers/notesController.js",
        caption:
          "Step 11 replaces `DEMO_USER_ID` with the logged-in user, and step 12 makes update and delete check that the note belongs to that user.",
      },
    },
    {
      text: "Replace `src/server.js` so the server refuses to start without `DATABASE_URL`, with a message that says what to do, instead of failing on the first request.",
      code: {
        language: "js",
        code: 'import { createApp } from "./app.js";\n\n// Stop at once with a clear message if a setting is missing, instead of\n// failing later on the first request.\nconst required = ["DATABASE_URL"];\nconst missing = required.filter((name) => !process.env[name]);\nif (missing.length > 0) {\n  console.error(`Missing environment variables: ${missing.join(", ")}`);\n  console.error("Copy .env.example to .env and fill it in.");\n  process.exit(1);\n}\n\nconst port = Number(process.env.PORT ?? 3000);\n\ncreateApp().listen(port, () => {\n  console.log(`Notes API listening on http://localhost:${port}`);\n});',
        fileName: "backend/src/server.js",
        caption: "Step 11 adds `JWT_SECRET` to the list.",
      },
    },
    {
      text: "In the third terminal, restart the backend so it reads the new `.env`: press Ctrl+C, then run `npm run dev` again. `--watch` restarts on code changes, but not when `.env` changes.",
      code: {
        language: "bash",
        code: "npm run dev",
      },
    },
    {
      text: "Check it worked: `curl http://localhost:3000/api/notes` returns the two seed notes (*Shopping* first, then *Welcome to your notes*), and the frontend shows them. Add a note in the app, stop the backend, start it again and reload: the note is still there. Data now survives restarts.",
    },
  ],
  fromScratch: [
    "Run a local PostgreSQL (Docker: `docker run -e POSTGRES_PASSWORD=… -p 5432:5432 -d postgres:16`) and keep its address in `DATABASE_URL`.",
    "Write the tables in a `schema.sql` file with keys and constraints (`PRIMARY KEY`, `NOT NULL`, `UNIQUE`, `REFERENCES`), and keep demo data in a separate `seed.sql`.",
    "Install `pg` and create one shared `pg.Pool` in `db.js`.",
    "Always use parameterized queries (`$1`, `$2` + an array of values); never build SQL by joining strings with user input.",
    "Use `RETURNING` to send back what was written, and check `rowCount` to answer 404 when an UPDATE or DELETE matched nothing.",
  ],
  filesCreated: [
    "database/schema.sql",
    "database/seed.sql",
    "backend/src/db.js",
  ],
  filesModified: [
    "backend/src/controllers/notesController.js",
    "backend/.env.example",
    "backend/src/server.js",
    "backend/package.json",
    "backend/package-lock.json",
  ],
  filesRemoved: [],
  conceptIds: [
    "database",
    "sql",
    "sql-table",
    "crud",
    "parameterized-query",
    "db-connection-pool",
  ],
  codeExamples: [
    {
      language: "js",
      code: "await pool.query(\n  `INSERT INTO notes (user_id, title, content)\n   VALUES ($1, $2, $3)\n   RETURNING id, title, content, created_at, updated_at`,\n  [DEMO_USER_ID, title.trim(), content],\n);",
      fileName: "backend/src/controllers/notesController.js",
      caption:
        "The SQL text never changes; the values travel separately, so input can't become SQL.",
    },
    {
      language: "sql",
      code: "user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,",
      fileName: "database/schema.sql",
      caption:
        "A foreign key: the database itself refuses a note whose user doesn't exist.",
    },
  ],
  relationshipIds: [],
  enables: "Keep notes permanently in a real database that survives restarts.",
  commonMistakes: [
    "Building SQL with template strings, e.g. `` `WHERE id = ${id}` ``. Anything the user sends becomes part of the query: SQL injection. Use `$1` and pass values separately.",
    "Forgetting `await` before `pool.query(…)`. You get a Promise instead of the result, so `result.rows` is undefined.",
    "Changing `.env` without restarting the backend. `--watch` only restarts on code changes, so `DATABASE_URL` stays missing.",
    "Running `seed.sql` before `schema.sql`, or running the seed twice. The tables must exist first, and a second seed fails because the demo email is `UNIQUE`.",
    "Creating a new `pg.Pool` in every controller or request. Connections run out; create one pool in `db.js` and import it everywhere.",
  ],
  nextStepId: "add-authentication",
  nextWhy:
    "Everyone using the app shares the demo user's notes. Next we add accounts, so each person registers, logs in and gets their own notes.",
};
