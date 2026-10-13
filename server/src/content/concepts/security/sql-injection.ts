import type { Concept } from "@fsl/shared";

export const sqlInjection: Concept = {
  id: "sql-injection",
  slug: "sql-injection",
  title: "SQL injection",
  topicId: "security",
  summary:
    "An attack where text sent to the app is pasted into an SQL query and runs as part of it, letting the attacker read, change or delete data they should never reach.",
  basics: [
    "The backend talks to the database in SQL, short pieces of text such as `DELETE FROM notes WHERE id = 7 AND user_id = 1`. The database reads the whole text and does what it says.",
    "Parts of most queries come from the user: the `7` above is the note id from the URL. In code, the query is often built by joining fixed SQL with those values.",
    "The database can't tell which part of the text the developer wrote and which part came from the user. To it, it's all just SQL.",
  ],
  what: [
    "SQL injection happens when user input is glued into SQL text and that input contains SQL of its own. The attacker's text stops being a value and becomes part of the command.",
    "It is one of the oldest and most damaging web vulnerabilities, and it is completely preventable: send values to the database as parameters, separately from the SQL text, so they can never be read as SQL (see parameterized queries).",
  ],
  why: [
    "An injected query runs with all the permissions the app has. Depending on the query, an attacker can read every user's data, change other people's records, delete whole tables or log in as someone else.",
    "In the Notes App, the condition `AND user_id = …` is what keeps notes private. An injection that cuts that condition off would let any logged-in user see, change or delete everybody's notes.",
    "Knowing what it looks like helps you recognise it in code reviews: any query built with `+` or `${…}` from a value that came from a request is a warning sign.",
  ],
  howItWorks: [
    "Imagine the delete route built its SQL with a template literal: `` `DELETE FROM notes WHERE id = ${req.params.id} AND user_id = ${req.user.id}` ``. With the URL `/api/notes/7`, that is the intended query.",
    "Now an attacker requests `/api/notes/0 OR true --` (encoded in the URL as `0%20OR%20true%20--`). The query becomes `DELETE FROM notes WHERE id = 0 OR true -- AND user_id = 1`.",
    "In SQL, `--` starts a comment, so everything after it is ignored, including the `user_id` check. What's left is `WHERE id = 0 OR true`, which is true for every row. Every note of every user is deleted.",
    "With parameters, the same input is just a value: the database is asked to compare the `id` column with the text `0 OR true --`, which isn't a number, so PostgreSQL rejects it instead of running anything.",
  ],
  basicExample: {
    language: "js",
    code: `// VULNERABLE: the id from the URL becomes part of the SQL
await pool.query(
  \`DELETE FROM notes WHERE id = \${req.params.id} AND user_id = \${req.user.id}\`,
);
// id "0 OR true --" runs:
// DELETE FROM notes WHERE id = 0 OR true -- AND user_id = 1
// → deletes every user's notes

// SAFE (the Notes App): values travel separately as $1 and $2
await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [
  id,
  req.user.id,
]);`,
    caption:
      "The same input does two very different things: in the first version it rewrites the query, in the second it is only ever a value.",
    highlightLines: [3, 6, 10],
  },
  internals: [
    "Text values need quotes in SQL, so attacks on text often start by closing the quote. For `WHERE email = '${email}'`, the email `' OR '1'='1` produces `WHERE email = '' OR '1'='1'`, which matches every user.",
    "Some injections add a whole second statement after a `;`. With the simple way of sending a query (a single string, no values array), PostgreSQL runs several statements in one go, so a title like `x'); DELETE FROM notes; --` inside an INSERT can delete everything. With a values array, `pg` uses PostgreSQL's extended protocol, which only allows one statement.",
    "Attackers don't need to see the query. They try characters such as `'` and watch for errors or changed behaviour, and automated tools do this to every form and URL they find.",
    "Escaping quotes by hand, or blocking words like `DROP`, is not a fix: there are many ways around such filters. Parameters remove the problem instead of patching it.",
    "Defence in depth: the Notes App also turns the id into a positive whole number with `noteId` before querying, so `0 OR true --` is answered `404` before it reaches SQL at all. That is a useful second layer, but the parameters are what make the query safe.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker and create a project with the `pg` library.",
      code: {
        language: "bash",
        code: `docker run --name injection-db -e POSTGRES_PASSWORD=dev -p 5433:5432 -d postgres:16
mkdir injection-demo && cd injection-demo
npm init -y
npm pkg set type=module
npm install pg
export DATABASE_URL=postgres://postgres:dev@localhost:5433/postgres`,
      },
    },
    {
      text: 'Create `delete-note.js`. It creates a fresh table with notes for two users, then deletes "one of Ana\'s notes" using the id given on the command line, either the vulnerable way or the safe way.',
      code: {
        language: "js",
        fileName: "delete-note.js",
        code: `import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

await pool.query("DROP TABLE IF EXISTS notes");
await pool.query("CREATE TABLE notes (id SERIAL PRIMARY KEY, user_id INTEGER, title TEXT)");
await pool.query("INSERT INTO notes (user_id, title) VALUES (1, 'Ana 1'), (1, 'Ana 2'), (2, 'Ben 1')");

const [mode, id] = process.argv.slice(2);
const userId = 1; // Ana is logged in
try {
  if (mode === "vulnerable") {
    await pool.query(\`DELETE FROM notes WHERE id = \${id} AND user_id = \${userId}\`);
  } else {
    await pool.query("DELETE FROM notes WHERE id = $1 AND user_id = $2", [id, userId]);
  }
} catch (err) {
  console.log("rejected:", err.message);
}
console.log("left:", (await pool.query("SELECT title FROM notes ORDER BY id")).rows);
await pool.end();`,
      },
    },
    {
      text: 'Run it four times. With id `1`, both versions delete only `Ana 1`. With the attack, the vulnerable version deletes all three notes, Ben\'s too, while the safe version prints `rejected: invalid input syntax for type integer: "0 OR true --"` and deletes nothing. Afterwards, remove the database with `docker rm -f injection-db`.',
      code: {
        language: "bash",
        code: `node delete-note.js vulnerable 1
node delete-note.js safe 1
node delete-note.js vulnerable "0 OR true --"
node delete-note.js safe "0 OR true --"`,
      },
    },
  ],
  whereUsed: [
    "Anywhere SQL is built from input: URL ids, form fields, search boxes, sort options, cookies and headers.",
    "Other query languages have the same problem when input is glued into commands, for example in NoSQL databases or shell commands. The fix is always to keep code and data separate.",
  ],
  connectsTo: [
    "Parameterized queries, the fix: values sent separately from the SQL text.",
    "Input validation, a second layer that rejects nonsense such as a non-numeric id, but not a replacement for parameters.",
    "Authorization: the `user_id` condition that an injection would remove.",
    "The connection pool's `pool.query(text, values)`, which sends parameters.",
  ],
  projectUsage: [
    {
      explanation:
        "Every notes query in the controller uses `$1`, `$2`… placeholders with a values array, as the comment at the top of the file says. Deleting runs `DELETE FROM notes WHERE id = $1 AND user_id = $2` with `[id, req.user.id]`.",
      fileId: "backend/src/controllers/notesController.js",
      match: '"DELETE FROM notes WHERE id = $1 AND user_id = $2",',
    },
    {
      explanation:
        "The UPDATE passes the new title and content as `$1` and `$2`, so a title full of quotes, semicolons or SQL keywords is saved as plain text.",
      fileId: "backend/src/controllers/notesController.js",
      match: "WHERE id = $3 AND user_id = $4",
    },
    {
      explanation:
        "Login looks the email up with `WHERE email = $1`, so the classic `' OR '1'='1` email is just an email nobody has.",
      fileId: "backend/src/controllers/authController.js",
      match: '"SELECT id, email, password_hash FROM users WHERE email = $1",',
    },
    {
      explanation:
        "A backend test sends exactly the attack above, `DELETE /api/notes/0%20OR%20true`, and expects `404`: it can never become a query that matches every row.",
      fileId: "backend/src/routes/notes.test.js",
      match: '.delete("/api/notes/0%20OR%20true")',
    },
  ],
  commonMistakes: [
    'Thinking a value is safe because it "should" be a number. The id in the URL is whatever the attacker types.',
    "Escaping or filtering input by hand instead of using parameters.",
    "Using a placeholder for values but gluing in a column name for sorting, such as `ORDER BY ${req.query.sort}`. Pick names from a fixed list in your code instead.",
    "Logging or returning database error messages to the user. They show attackers how the query is built; the Notes App sends only `Something went wrong` for unexpected errors.",
  ],
  relatedConcepts: [
    "parameterized-query",
    "input-validation",
    "sql",
    "sql-update-delete",
    "db-connection-pool",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
