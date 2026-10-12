import type { Concept } from "@fsl/shared";

export const dbConnectionPool: Concept = {
  id: "db-connection-pool",
  slug: "db-connection-pool",
  title: "Connection pool",
  topicId: "databases",
  summary:
    "A small set of open database connections that a server keeps ready and lends to each query, instead of connecting to the database again for every request.",
  basics: [
    "The database (PostgreSQL) is a separate program from your Node.js server, often on another computer. Before the server can send any SQL, it has to open a connection: a network link to the database that stays open while they talk.",
    "Opening a connection is slow compared with running a simple query. The two programs exchange several network messages, the database checks the user name and password, and PostgreSQL starts a new process (a small running program of its own) just for that connection.",
    "Connections are also limited. PostgreSQL accepts 100 at the same time by default, and each one uses memory on the database server even when it is doing nothing.",
  ],
  what: [
    "A connection pool keeps a few connections open and lends them out. A query borrows a free connection, uses it, and gives it back so the next query can reuse it, without the cost of connecting again.",
    "In the `pg` library the pool is `new Pool({ connectionString: process.env.DATABASE_URL })`. You create it once in `db.js`, export it, and import that same pool everywhere the server needs the database.",
  ],
  why: [
    "Without a pool, every request would connect, run its query and disconnect. Connecting can take longer than the query itself, so every page would be slower than it needs to be.",
    "A busy server can receive hundreds of requests at once. A pool caps how many connections it opens (10 by default in `pg`), so the server can never use up the database's limit and lock out everything else that connects to it.",
  ],
  howItWorks: [
    "`new Pool(...)` does not connect yet. The pool opens connections only when queries need them, up to its `max` size, and keeps them open for reuse.",
    "`pool.query(text, values)` does three things for you: borrows a free connection, runs the query on it, and returns the connection to the pool when the result (or an error) arrives.",
    "If all connections are busy, new queries wait in a queue until one is returned. A connection that has been idle for a while (10 seconds by default) is closed, so a quiet server does not hold connections it is not using.",
    "When the server shuts down, `await pool.end()` waits for running queries to finish and closes every connection cleanly.",
  ],
  basicExample: {
    language: "js",
    code: `// db.js: created once when the server starts
import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// any other file
import { pool } from "./db.js";

const result = await pool.query(
  "SELECT id, title FROM notes WHERE user_id = $1",
  [userId]
);`,
    caption:
      "One pool for the whole server, created in db.js; every file imports it, and pool.query borrows and returns a connection on its own.",
    highlightLines: [4, 9, 11],
  },
  internals: [
    "The connection string `postgres://postgres:dev@localhost:5432/postgres` holds everything needed to connect: the user (`postgres`), the password (`dev`), the host and port (`localhost:5432`) and the database name (`postgres`). Keeping it in the `DATABASE_URL` environment variable keeps the password out of your code.",
    "Each connection in the pool is a `pg` client. `pool.connect()` hands you one directly, which you need for a transaction because all its statements must run on the same connection. You must then call `client.release()` yourself, or that connection is lost to the pool for good.",
    'A database connection can break while it is idle in the pool, for example when the database restarts. The pool reports this as an `error` event; adding `pool.on("error", ...)` to log it stops the problem from crashing your whole Node.js process.',
    "Because Node.js handles many requests at once with `async`/`await`, ten connections can serve far more than ten users: most of a request's time is spent elsewhere, and a connection is only borrowed for the few milliseconds a query takes.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker, then create a Node.js project with `pg` and the database address.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
mkdir pool-demo && cd pool-demo
npm init -y
npm pkg set type=module
npm install pg
export DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres`,
      },
    },
    {
      text: "Create `db.js` with one pool. `max: 5` makes the limit easy to see in the next step.",
      code: {
        language: "js",
        fileName: "db.js",
        code: `import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
});

pool.on("error", (err) => console.error("Idle database client error:", err));`,
      },
    },
    {
      text: "Create `demo.js`. It starts 20 queries at the same time; each one asks PostgreSQL to wait one second with `pg_sleep(1)`.",
      code: {
        language: "js",
        fileName: "demo.js",
        code: `import { pool } from "./db.js";

const start = Date.now();
const queries = [];
for (let i = 0; i < 20; i++) {
  queries.push(pool.query("SELECT pg_sleep(1)"));
}
console.log("Open connections:", pool.totalCount, "waiting:", pool.waitingCount);

await Promise.all(queries);
console.log("All 20 done in", (Date.now() - start) / 1000, "seconds");

await pool.end(); // close every connection before the program exits`,
      },
    },
    {
      text: "Run `node demo.js`. You should see `Open connections: 5 waiting: 15` and then about 4 seconds: five connections ran the queries in four rounds of five. Change `max` to `20` and run it again; it now takes about 1 second.",
      code: {
        language: "bash",
        code: `node demo.js`,
      },
    },
  ],
  whereUsed: [
    "Every web server that talks to a database: the pool is created when the server starts and lives until it stops.",
    "Scripts and background jobs that run many queries, which also share one pool and call `pool.end()` when they finish.",
  ],
  connectsTo: [
    "Environment variables: the pool reads its address and password from `DATABASE_URL`.",
    "Parameterized queries: `pool.query(text, values)` is where the SQL text and the values are sent separately.",
    "Transactions, which borrow a single client with `pool.connect()` and must release it in `finally`.",
    "Controllers, which import the pool from `db.js` and run their queries through it.",
  ],
  projectUsage: [
    {
      explanation:
        "`backend/src/db.js` creates the only pool in the Notes App with `new Pool({ connectionString: process.env.DATABASE_URL })` and exports it as `pool`.",
      fileId: "backend/src/db.js",
      match: "new pg.Pool({ connectionString: process.env.DATABASE_URL })",
    },
    {
      explanation:
        "`notesController` and `authController` import that pool and call `pool.query` with parameterized SQL, such as `SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = $1 ORDER BY created_at DESC`.",
      fileId: "backend/src/controllers/notesController.js",
      match: 'import { pool } from "../db.js";',
    },
    {
      explanation:
        "Because all controllers share one pool, the backend never has more than the pool's maximum number of connections open, however many people are using the app.",
      fileId: "backend/src/db.js",
      match: "One pool for the whole app",
    },
  ],
  commonMistakes: [
    "Creating a new `Pool` inside a route handler, so every request opens fresh connections that are never closed. PostgreSQL soon refuses with `sorry, too many clients already`. Create the pool once in `db.js` and import it.",
    "Calling `pool.connect()` and forgetting `client.release()`. Each forgotten client is gone from the pool; once all are gone, every query waits forever. Release in a `finally` block, or use `pool.query` when you do not need a transaction.",
    "Writing the connection string with the password directly in the code, where it ends up in Git. Read it from `process.env.DATABASE_URL`.",
    "Not closing the pool when you are done. A script then keeps running after its last line until the idle connections time out, and a server that stops without closing leaves connections dropped mid-way. Call `await pool.end()` at the end of a script, or when the server receives a shutdown signal.",
  ],
  relatedConcepts: [
    "database",
    "environment-variables",
    "parameterized-query",
    "db-transaction",
    "controller",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
