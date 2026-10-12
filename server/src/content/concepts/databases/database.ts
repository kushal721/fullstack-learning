import type { Concept } from "@fsl/shared";

export const database: Concept = {
  id: "database",
  slug: "database",
  title: "Database",
  topicId: "databases",
  summary:
    "A separate program that stores an app's data permanently and lets many users read and change it safely at the same time.",
  basics: [
    "A backend is the program running on a server that answers requests from the browser. While it runs, it keeps values in memory — the computer's fast, temporary storage. Everything in memory disappears when the program stops or crashes.",
    "An app needs data that outlives the program: a user's account and notes must still be there tomorrow, after the server restarts or is updated. Storage that survives restarts is called persistent storage, and it lives on disk.",
    "A database is a program built only for this job. It stores data on disk, finds it again quickly, and lets many programs read and change it at the same time without corrupting it.",
  ],
  what: [
    "A database server is a separate program — for example PostgreSQL — that runs next to your backend, often on another computer. Your backend connects to it over the network, sends it commands written in SQL (Structured Query Language), and gets back results.",
    "PostgreSQL is a relational database: it stores data in tables of rows and columns, and tables can point at each other (a note belongs to a user). Other kinds exist, such as document databases like MongoDB that store JSON-like documents, or key-value stores like Redis — but relational databases are the most common default for web apps.",
  ],
  why: [
    "Why not keep notes in a variable? A variable lives in memory, so every restart deletes every note. Why not a JSON file? Two users saving at the same moment can overwrite each other's changes, finding one user's notes means reading the whole file, and a crash halfway through writing can leave a broken file. A database solves all four: it survives restarts, handles many users at once, searches quickly, and never leaves data half-written.",
    "The database is only ever reached by the backend, never by the browser. Code in the browser runs on the user's computer, where anyone can read and change it — if it could talk to the database, anyone could read every user's notes. The backend checks who is asking and what they are allowed to do before it touches the data.",
  ],
  howItWorks: [
    "The database server starts and waits for connections, by default on port 5432 for PostgreSQL. A port is a numbered door on a computer that one program listens on.",
    "The backend opens a connection with an address, a username and a password (often all in one connection string, `postgres://user:password@host:5432/dbname`), then sends SQL such as `SELECT * FROM notes WHERE user_id = 1`.",
    "The database finds the matching data, sends the rows back, and the backend turns them into JSON for the browser. Changes like `INSERT` are written to disk before the database says they succeeded, so a confirmed save is never lost.",
  ],
  basicExample: {
    language: "sql",
    code: `CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);

INSERT INTO notes (title) VALUES ('Shopping');

SELECT * FROM notes;`,
    caption:
      "Create a place for notes, store one, and read it back. The note stays there even after the database or backend restarts.",
  },
  internals: [
    "PostgreSQL stores each table in files on disk, but you never open those files yourself. You only talk to the server, which decides how to read and write them safely.",
    "Before changing a table file, PostgreSQL first writes the change to a log (the write-ahead log). If the power goes out mid-write, it replays the log on restart, so the data is never left half-changed.",
    "When two users change data at the same moment, the database handles them one after another where they would clash, so neither change is silently lost. Grouping several changes so they all succeed or all fail together is called a transaction.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL 16 in Docker (a tool that runs programs in isolated containers). This downloads PostgreSQL and runs it in the background with the password `dev`.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16`,
      },
    },
    {
      text: "Open psql, PostgreSQL's command-line client, inside the container. You get a `postgres=#` prompt where you can type SQL.",
      code: {
        language: "bash",
        code: `docker exec -it notes-db psql -U postgres`,
      },
    },
    {
      text: "Create a table, insert a note and read it back. Each SQL command ends with a semicolon.",
      code: {
        language: "sql",
        code: `CREATE TABLE notes (id SERIAL PRIMARY KEY, title TEXT NOT NULL);
INSERT INTO notes (title) VALUES ('Shopping');
SELECT * FROM notes;`,
      },
    },
    {
      text: "Type `\\q` to quit, then restart the database with `docker restart notes-db` and connect again. `SELECT * FROM notes;` still shows the Shopping note — it survived the restart, which a variable never would.",
    },
  ],
  whereUsed: [
    "Almost every web app with accounts: users, posts, orders, messages and settings all live in a database.",
    "Anywhere data must be shared between users or devices — a note saved on your laptop shows up on your phone because both ask the same database.",
  ],
  connectsTo: [
    "SQL, the language the backend uses to give the database commands.",
    "Tables, rows and columns, the shape PostgreSQL stores data in.",
    "The backend's database connection (a connection pool from the `pg` package), configured by the `DATABASE_URL` environment variable.",
    "Controllers that run queries when an Express route receives a request.",
  ],
  projectUsage: [
    {
      explanation:
        "The Notes App stores all its data in PostgreSQL: the `users` and `notes` tables are created by `database/schema.sql`, and `database/seed.sql` adds a demo user with two notes.",
      fileId: "database/schema.sql",
      match: "CREATE TABLE users (",
    },
    {
      explanation:
        "`backend/src/db.js` creates one shared connection pool with `new Pool({ connectionString: process.env.DATABASE_URL })`, and every controller uses it to run queries.",
      fileId: "backend/src/db.js",
      match: "new pg.Pool({ connectionString: process.env.DATABASE_URL })",
    },
    {
      explanation:
        "The React frontend never connects to the database. It calls the backend's API (for example `GET /api/notes`), and the backend queries the database for the logged-in user's notes only.",
      fileId: "frontend/src/services/notesApi.js",
      match: 'return request("/api/notes");',
    },
  ],
  commonMistakes: [
    "Keeping app data in arrays in the backend's memory, then wondering why everything vanishes on restart. Store anything that must last in the database.",
    "Trying to connect to the database from React code. That would put the password in every user's browser; always go through the backend's API instead.",
    "Writing the database password straight into the code. Put the connection string in the `DATABASE_URL` environment variable so it stays out of your repository.",
    "Forgetting the database server must be running. An error like `ECONNREFUSED 127.0.0.1:5432` means nothing is listening; start it (for example `docker start notes-db`) and try again.",
  ],
  relatedConcepts: [
    "sql",
    "sql-table",
    "row-column",
    "db-connection-pool",
    "environment-variables",
    "controller",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
