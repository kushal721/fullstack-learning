import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "Databases" topic.
export const databasesGlossary: GlossaryEntry[] = [
  {
    id: "database",
    topicId: "databases",
    term: "Database",
    aliases: ["db", "postgresql", "postgres", "relational database"],
    kind: "concept",
    short:
      "A separate program that stores an app's data permanently and lets many users use it safely at once.",
    body: "PostgreSQL is one. Your backend connects to it and sends commands in [[sql|SQL]]. A relational database keeps data in [[sql-table|tables]] of rows and columns, and tables can point at each other, like a note that belongs to a user.",
    conceptPageId: "database",
  },
  {
    id: "sql",
    topicId: "databases",
    term: "SQL",
    aliases: ["structured query language", "query", "statement", "sequel"],
    kind: "concept",
    short:
      "The language for creating tables and adding, reading, changing and deleting the data in them.",
    body: "One command is a statement; one that asks for data is a query. SQL is declarative: you describe the result, like “Ana's notes, newest first”, and the [[database]] works out how to find it. The main statements are [[sql-select|SELECT]], [[sql-insert|INSERT]], UPDATE and DELETE.",
    conceptPageId: "sql",
  },
  {
    id: "sql-table",
    topicId: "databases",
    term: "Table",
    aliases: ["tables", "schema", "create table", "constraint"],
    kind: "concept",
    short:
      "A named container in a database for one kind of thing, such as notes, with a fixed set of typed columns.",
    body: "`CREATE TABLE notes (…)` defines the schema once: every column, its type and its rules. After that, every [[row-column|row]] must fit, so a note without a required title is refused. Each table has a [[primary-key|primary key]].",
    analogy:
      "A spreadsheet with fixed column headings that refuses rows that don't fill them in properly.",
    conceptPageId: "sql-table",
  },
  {
    id: "row-column",
    topicId: "databases",
    term: "Rows and columns",
    aliases: ["row", "column", "record", "null"],
    kind: "concept",
    short:
      "Columns name the facts every record has; each row is one record that fills them in.",
    body: "A column like `title TEXT` has a name and a type. A row is one note or one user, with exactly one value per column. `NULL` means “no value”, unless the column forbids it with `NOT NULL`. Rows live in a [[sql-table|table]].",
    conceptPageId: "row-column",
  },
  {
    id: "primary-key",
    topicId: "databases",
    term: "Primary key",
    aliases: ["id", "serial", "unique id"],
    kind: "concept",
    short:
      "A column whose value is different for every row, so each row can be found without doubt.",
    body: "In the Notes App it is `id SERIAL PRIMARY KEY`: unique, never empty, and picked by the database (1, 2, 3…). Other tables refer to a row through its primary key with a [[foreign-key|foreign key]]. URLs like `/api/notes/42` use it too.",
    conceptPageId: "primary-key",
  },
  {
    id: "foreign-key",
    topicId: "databases",
    term: "Foreign key",
    aliases: ["references", "user_id", "on delete cascade"],
    kind: "concept",
    short:
      "A column holding the id of a row in another table, which the database guarantees really exists.",
    body: "`user_id INTEGER REFERENCES users(id)` means every note's `user_id` must be a real user's [[primary-key|id]]. `ON DELETE CASCADE` deletes a user's notes with them. It is how a [[one-to-many-relationship|one-to-many relationship]] is built.",
    conceptPageId: "foreign-key",
  },
  {
    id: "one-to-many-relationship",
    topicId: "databases",
    term: "One-to-many relationship",
    aliases: ["one to many", "relationship", "relationships"],
    kind: "concept",
    short:
      "A link where one row, such as a user, owns many rows in another table, such as their notes.",
    body: "One user has many notes; each note has one owner. It is built with one [[foreign-key|foreign key]] on the “many” side: every note row has a `user_id`. To read a user's notes, [[sql-select|SELECT]] the notes `WHERE user_id = …`.",
    conceptPageId: "one-to-many-relationship",
  },
  {
    id: "crud",
    topicId: "databases",
    term: "CRUD",
    aliases: ["create read update delete"],
    kind: "concept",
    short:
      "The four basic things an app does with stored data: Create, Read, Update and Delete.",
    body: "Adding a note is Create, listing is Read, editing is Update, removing is Delete. Each lines up with an HTTP method and a SQL statement: [[http-post|POST]] and INSERT, GET and SELECT, PUT and UPDATE, DELETE and DELETE.",
    conceptPageId: "crud",
  },
  {
    id: "sql-select",
    topicId: "databases",
    term: "SELECT",
    aliases: ["sql select", "where", "order by", "limit"],
    kind: "concept",
    short:
      "The SQL statement that reads rows, choosing which columns, which rows, in what order and how many.",
    body: "`SELECT title FROM notes WHERE user_id = $1 ORDER BY created_at DESC` reads one user's note titles, newest first. The result is a small table of its own, with zero, one or many rows. Always pass values as [[parameterized-query|parameters]].",
    conceptPageId: "sql-select",
  },
  {
    id: "sql-insert",
    topicId: "databases",
    term: "INSERT",
    aliases: ["sql insert", "insert into", "returning"],
    kind: "concept",
    short:
      "The SQL statement that adds a new row, such as a new note or a newly registered user.",
    body: "`INSERT INTO notes (title, user_id) VALUES ($1, $2) RETURNING *` adds a note and returns the saved row, including the [[primary-key|id]] the database chose. It is the Create of [[crud|CRUD]].",
    conceptPageId: "sql-insert",
  },
  {
    id: "sql-update-delete",
    topicId: "databases",
    term: "UPDATE and DELETE",
    aliases: ["sql update", "sql delete", "update", "delete from"],
    kind: "concept",
    short:
      "The SQL statements that change existing rows and remove rows, such as editing or deleting a note.",
    body: "`UPDATE notes SET title = $1 WHERE id = $2` changes the matching rows; other columns keep their values. `DELETE FROM notes WHERE id = $1` removes them for good, with no recycle bin. Forgetting `WHERE` changes every row, so double-check it.",
    conceptPageId: "sql-update-delete",
  },
  {
    id: "parameterized-query",
    topicId: "databases",
    term: "Parameterized query",
    aliases: ["parameters", "placeholders", "$1", "prepared statement"],
    kind: "concept",
    short:
      "Sending the SQL text and the user's values separately, so values can never change what the query does.",
    body: '`pool.query("SELECT * FROM notes WHERE id = $1", [id])`: `$1` is filled from the array, and the database treats it as a plain value, never as SQL. This is the cure for [[sql-injection|SQL injection]].',
    conceptPageId: "parameterized-query",
  },
  {
    id: "db-transaction",
    topicId: "databases",
    term: "Transaction",
    aliases: ["transactions", "begin", "commit", "rollback"],
    kind: "concept",
    short:
      "A group of SQL statements treated as one: either all of them take effect or none do.",
    body: "`BEGIN` starts it, `COMMIT` saves everything and `ROLLBACK` throws everything away. Until the commit, the changes are a private draft. Use one when several statements must succeed together, like creating a user and their first note.",
    analogy:
      "A bank transfer: the money leaves one account and arrives in the other, or neither happens.",
    conceptPageId: "db-transaction",
  },
  {
    id: "db-connection-pool",
    topicId: "databases",
    term: "Connection pool",
    aliases: ["pool", "pg pool", "connections"],
    kind: "concept",
    short:
      "A few open database connections a server keeps ready and lends to each query, instead of reconnecting every time.",
    body: "A query borrows a free connection, uses it and gives it back. In `pg` it is `new Pool({ connectionString: process.env.DATABASE_URL })`, created once and imported wherever the server needs the [[database]]. The address comes from an [[environment-variables|environment variable]].",
    conceptPageId: "db-connection-pool",
  },
];
