import type { Concept } from "@fsl/shared";

export const sql: Concept = {
  id: "sql",
  slug: "sql",
  title: "SQL",
  topicId: "databases",
  summary:
    "The language you use to create tables in a relational database and to add, read, change and delete the data inside them.",
  basics: [
    "A database is a program that stores data safely on disk and lets other programs ask for it. The Notes App uses PostgreSQL, a popular free database, which runs as its own server next to the Node.js backend.",
    "A relational database keeps data in tables, like spreadsheets with strict rules: each table has named columns, each row is one item, and every value must fit its column's type (a number, some text, a date).",
    "Your backend cannot reach into the database's files directly. It sends text commands to the database server and gets results back, the same way a browser sends HTTP requests to a web server. Those commands are written in SQL.",
  ],
  what: [
    'SQL (Structured Query Language, said "S-Q-L" or "sequel") is the standard language for talking to relational databases. One command is called a statement, and a statement that asks for data is often called a query.',
    'SQL is declarative: you describe the result you want, such as "Ana\'s notes, newest first", and the database decides how to find it. You never write the loops that search through the rows yourself.',
  ],
  why: [
    "Data must outlive the server. Arrays in JavaScript vanish when the process restarts; rows in a database stay on disk, and SQL is how you put them there and get them back.",
    "Because SQL only says what you want, the database is free to pick the fastest way to do it, for example by using an index. The same short query keeps working whether the table has ten rows or ten million.",
  ],
  howItWorks: [
    "A statement is a sentence made of keywords and names, and it ends with a semicolon `;`. Keywords are the words SQL itself defines, like `SELECT`, `FROM` and `WHERE`; by convention they are written in capitals. Names are the tables and columns you created, like `notes` and `title`, written in lowercase.",
    "Text values go in single quotes, like `'Shopping'`. Double quotes are for names, not text, which surprises people coming from JavaScript.",
    "Statements come in families. `CREATE TABLE` defines the shape of the data. `INSERT` adds rows, `SELECT` reads them, `UPDATE` changes them and `DELETE` removes them. Those last four are the ones the Notes App uses every time someone works with a note.",
    "The database parses the text, checks that the tables and columns exist, plans the work, runs it and sends back the result: rows for a `SELECT`, or a count of affected rows for the others.",
  ],
  basicExample: {
    language: "sql",
    code: `SELECT title, created_at
FROM notes
WHERE user_id = 1
ORDER BY created_at DESC;`,
    caption:
      "Read it like a sentence: give me the title and creation time from notes that belong to user 1, newest first.",
  },
  internals: [
    "When the database receives a statement, a parser first turns the text into a tree. A typo like `SELEC` stops it right there with a syntax error.",
    'Then a planner looks at the tables, their sizes and their indexes and picks a plan, for example "use the index on `user_id`, then sort". You can see the plan by putting `EXPLAIN` in front of a query.',
    "Each statement runs as a whole or not at all. If an `UPDATE` touching 50 rows fails on row 30, none of the 50 rows change, so the data is never left half-done.",
    "SQL is one standard, but each database adds its own extras. Things like `SERIAL` and `RETURNING` are PostgreSQL features, so small details can differ if you later use MySQL or SQLite.",
  ],
  howToCreate: [
    {
      text: "Start PostgreSQL in Docker and open `psql`, the interactive SQL prompt.",
      code: {
        language: "bash",
        code: `docker run --name notes-db -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
docker exec -it notes-db psql -U postgres`,
      },
    },
    {
      text: "Create a table. Don't forget the `;` at the end — without it, `psql` waits for more text.",
      code: {
        language: "sql",
        code: `CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL
);`,
      },
    },
    {
      text: "Try one statement from each of the four families, in order.",
      code: {
        language: "sql",
        code: `INSERT INTO notes (title) VALUES ('Shopping');
SELECT id, title FROM notes;
UPDATE notes SET title = 'Groceries' WHERE id = 1;
DELETE FROM notes WHERE id = 1;`,
      },
    },
    {
      text: "Check the replies: `INSERT 0 1`, then a small table with one row, then `UPDATE 1` and `DELETE 1`, which tell you how many rows each statement touched. `\\dt` lists your tables, `\\d notes` describes one, and `\\q` quits. Commands starting with a backslash belong to `psql`, not to SQL, so they need no `;`.",
    },
  ],
  whereUsed: [
    "Every backend that stores data in a relational database such as PostgreSQL, MySQL, SQLite or SQL Server.",
    "Setup scripts like `schema.sql` and `seed.sql` that create tables and fill them with sample data.",
    "Reports and data analysis, where people run `SELECT` queries directly to answer questions about the data.",
  ],
  connectsTo: [
    "Tables, rows and columns, which SQL creates and works with.",
    "The four CRUD operations, which map to `INSERT`, `SELECT`, `UPDATE` and `DELETE`.",
    "The `pg` package in Node.js, which sends SQL text from the backend to PostgreSQL.",
    "Parameterized queries, the safe way to put user input into SQL.",
  ],
  projectUsage: [
    {
      explanation:
        "`database/schema.sql` is pure SQL: two `CREATE TABLE` statements for `users` and `notes` and one `CREATE INDEX`. `database/seed.sql` uses `INSERT` to add one demo user and two notes.",
    },
    {
      explanation:
        "`notesController.js` sends one SQL statement per action through `pool.query()` from `backend/src/db.js`: `SELECT` in `listNotes`, `INSERT` in `createNote`, `UPDATE` in `updateNote` and `DELETE` in `deleteNote`.",
    },
  ],
  commonMistakes: [
    "Forgetting the `;`, so `psql` shows a `postgres-#` prompt and waits. Type `;` and press Enter to finish the statement.",
    'Using double quotes for text, as in `WHERE title = "Shopping"`, which PostgreSQL reads as a column name and answers with `column "Shopping" does not exist`. Use single quotes for text values.',
    "Running `UPDATE` or `DELETE` without a `WHERE`, which changes or removes every row in the table. Always write the `WHERE` first and check it with a `SELECT`.",
    "Building SQL by gluing user input into the string, which allows SQL injection. Use parameterized queries with `$1, $2` placeholders instead.",
  ],
  relatedConcepts: ["database", "sql-table", "crud", "parameterized-query"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
