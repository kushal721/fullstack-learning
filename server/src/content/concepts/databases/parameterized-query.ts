import type { Concept } from "@fsl/shared";

export const parameterizedQuery: Concept = {
  id: "parameterized-query",
  slug: "parameterized-query",
  title: "Parameterized queries",
  topicId: "databases",
  summary:
    "A way of running SQL where the query text and the values typed by users are sent to the database separately, so those values can never change what the query does.",
  basics: [
    "A server talks to the database by sending it SQL, a short piece of text like `SELECT * FROM notes WHERE id = 7`. The database reads that text, works out what it means and runs it.",
    "Most queries contain values that come from the user: the note id from the URL, the title typed into a form. Anything that arrives in a request is user input, and an attacker can put any text they like into it.",
    "The tempting way to build a query is to glue the user's text into the SQL string, for example with a template literal (a JavaScript string in backticks that inserts values with `${...}`). Then the database cannot tell which part you wrote and which part the user wrote.",
    "SQL injection is the attack this allows: the user sends text that contains SQL, and the database runs it as part of your query. It is one of the most common and most damaging security holes on the web.",
  ],
  what: [
    'A parameterized query is SQL text with numbered placeholders, `$1`, `$2`, `$3`, where the values belong. The values themselves are passed in a separate array: `pool.query("SELECT * FROM notes WHERE id = $1", [id])`.',
    "`$1` is filled with the first item of the array, `$2` with the second, and so on. The database treats every parameter as a plain value, a number or a piece of text, and never as SQL, whatever characters it contains.",
  ],
  why: [
    "If user text is pasted into SQL, the user can rewrite your query. A note id of `0 OR true --` turns `WHERE id = 0 AND user_id = 1` into `WHERE id = 0 OR true -- AND user_id = 1`. The `--` starts an SQL comment, so the `user_id` check is ignored and every user's notes are returned.",
    "Parameters close this hole completely instead of trying to spot dangerous characters. As a bonus, ordinary text just works: a title like `Bob's list` contains a quote that would break a glued-together query with a syntax error, but as a parameter it is stored exactly as typed.",
  ],
  howItWorks: [
    "With `pool.query(text, values)`, the `pg` library sends the SQL text with its `$1`, `$2` placeholders to PostgreSQL first. PostgreSQL parses it and decides what the query will do before it has seen any value.",
    "Then the values are sent in a separate message. They are slotted into the already-planned query as data, the same way a function argument fills a parameter, so a value can never add a condition, a comment or a new statement.",
    "Each value is converted to the type PostgreSQL expects in that spot. Sending `0 OR true --` where an integer `id` is expected does not run anything; PostgreSQL rejects it with `invalid input syntax for type integer`.",
  ],
  basicExample: {
    language: "js",
    code: `// UNSAFE: the user's text becomes part of the SQL
const id = req.params.id; // attacker sends "0 OR true --"
await pool.query(
  \`SELECT * FROM notes WHERE id = \${id} AND user_id = \${req.user.id}\`
);
// runs: SELECT * FROM notes WHERE id = 0 OR true -- AND user_id = 1

// SAFE: SQL text and values travel separately
await pool.query(
  "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
  [req.params.id, req.user.id]
);`,
    caption:
      "In the unsafe version the attacker's text turns the condition into one that is always true; in the safe version it is only ever compared with the id column as a value.",
    highlightLines: [4, 10, 11],
  },
  internals: [
    "PostgreSQL has two ways to receive a query. The simple way takes one string of SQL, and that string may even contain several statements separated by `;`. That is how a title like `x'); DELETE FROM notes; --` pasted into an `INSERT` can close your statement and start a second one that deletes every note.",
    "When you pass a values array, `pg` uses the extended way instead: a Parse message carries the SQL text, then a Bind message carries the values. The SQL is fixed at the Parse step, and only one statement is allowed, so nothing in the values can reach the parser.",
    'Placeholders can only stand for values. A table name, a column name or the words `ASC`/`DESC` cannot be a parameter, because they change what the query does. If those must come from the user, pick them from a fixed list in your own code, such as `const column = sortBy === "title" ? "title" : "created_at"`.',
    "Escaping quotes by hand is not a substitute. It is easy to miss one place, and the rules differ between databases and settings. Parameters avoid the problem instead of patching it.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker, then create a small Node.js project with the `pg` library and tell it where the database is.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
mkdir injection-demo && cd injection-demo
npm init -y
npm pkg set type=module
npm install pg
export DATABASE_URL=postgres://postgres:dev@localhost:5432/postgres`,
      },
    },
    {
      text: "Open `psql` with `docker exec -it notes-db psql -U postgres` and create two users with one note each. Ana is user 1; Ben's note is private to Ben. Type `\\q` to leave `psql` afterwards.",
      code: {
        language: "sql",
        code: `CREATE TABLE users (id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE);
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL
);
INSERT INTO users (email) VALUES ('ana@example.com'), ('ben@example.com');
INSERT INTO notes (user_id, title) VALUES (1, 'Ana''s list'), (2, 'Ben''s secret');`,
      },
    },
    {
      text: "Create `find-note.js`. It looks up a note for Ana (user 1) twice: once by gluing the id into the SQL, once with parameters.",
      code: {
        language: "js",
        fileName: "find-note.js",
        code: `import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const id = process.argv[2]; // pretend this came from the URL
const userId = 1; // the logged-in user, Ana

const unsafe = await pool.query(
  \`SELECT * FROM notes WHERE id = \${id} AND user_id = \${userId}\`
);
console.log("unsafe:", unsafe.rows);

try {
  const safe = await pool.query(
    "SELECT * FROM notes WHERE id = $1 AND user_id = $2",
    [id, userId]
  );
  console.log("safe:", safe.rows);
} catch (err) {
  console.log("safe: rejected:", err.message);
}

await pool.end();`,
      },
    },
    {
      text: "Run it with a normal id, then with an attack. Both versions find Ana's note for id `1`. With `0 OR true --`, the unsafe version also prints Ben's secret note, while the safe version prints `rejected: invalid input syntax for type integer`.",
      code: {
        language: "bash",
        code: `node find-note.js 1
node find-note.js "0 OR true --"`,
      },
    },
  ],
  whereUsed: [
    "Every query that contains a value from outside your code: ids from the URL, form fields, query-string filters, cookies, headers.",
    "Inserts, updates and deletes as well as selects. Text saved today with `INSERT` is often read back later, so it must go in as a parameter too.",
    'Search boxes: write `WHERE title ILIKE $1` and pass the value `"%" + search + "%"`, instead of putting the `%` signs and the search text into the SQL.',
  ],
  connectsTo: [
    "The connection pool: `pool.query(text, values)` is the function that sends the text and the values separately.",
    "Controllers, which take values from `req.params`, `req.body` and `req.user` and pass them as parameters.",
    "Every SQL statement the app runs: `SELECT`, `INSERT`, `UPDATE` and `DELETE`.",
    "Input validation, which checks that values make sense (a title is not empty, an id is a number). Validation helps, but it does not replace parameters.",
  ],
  projectUsage: [
    {
      explanation:
        "Every query in `notesController` uses placeholders. Creating a note runs `INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING id, title, content, created_at, updated_at` with `[req.user.id, title.trim(), content]`.",
      fileId: "backend/src/controllers/notesController.js",
      match: "[req.user.id, title.trim(), content],",
    },
    {
      explanation:
        "Updating runs `UPDATE notes SET title = $1, content = $2, updated_at = now() WHERE id = $3 AND user_id = $4 RETURNING id, title, content, created_at, updated_at`. The note id from the URL and the user id from the login are both parameters, so neither can change the condition.",
      fileId: "backend/src/controllers/notesController.js",
      match: "WHERE id = $3 AND user_id = $4",
    },
    {
      explanation:
        "`authController` registers users with `INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email`, so an email address full of quotes and semicolons is stored as harmless text.",
      fileId: "backend/src/controllers/authController.js",
      match:
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email",
    },
  ],
  commonMistakes: [
    "Building SQL with `+` or a template literal because the value looks safe, such as an id that should be a number. Use a placeholder for every value that comes from outside your code, every time.",
    "Putting quotes around the placeholder, `WHERE title = '$1'`. That is the literal text `$1`, not a parameter. Write `WHERE title = $1` with no quotes.",
    "Getting the numbers and the array out of step, so `$2` receives the value meant for `$3`. `$1` is the first array item; read the two side by side after every change.",
    "Trying to use a placeholder for a table or column name. `SELECT * FROM $1` is a syntax error, and `ORDER BY $1` never picks a column: the value is treated as data, so the query fails or does not sort the way you meant. Choose names from a fixed list in your code instead.",
  ],
  relatedConcepts: [
    "sql",
    "sql-select",
    "sql-insert",
    "sql-update-delete",
    "db-connection-pool",
    "controller",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
