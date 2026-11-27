import {
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// A fake db for the N+1 exercise: counts every call it gets.
const fakeDb =
  'const db = { calls: 0, notes(userId) { this.calls++; return [{ id: 1, title: "Milk" }, { id: 2, title: "Bills" }, { id: 3, title: "Trip" }]; }, tagsFor(noteId) { this.calls++; return this.links.filter((l) => l.note_id === noteId).map((l) => l.name); }, tagsForMany(ids) { this.calls++; return this.links.filter((l) => ids.includes(l.note_id)); }, links: [{ note_id: 1, name: "shop" }, { note_id: 1, name: "home" }, { note_id: 3, name: "travel" }] };';

// ORMs and query builders: three ways to talk to the database, listNotes
// by hand, with a query builder and with an ORM, an ORM call taken apart,
// what ORMs give and cost, the N+1 problem step by step and its fix,
// choosing, why SQL still matters, mistakes, practice and a recap.
export const ormsModule = moduleLesson(
  "orms",
  "ORMs and query builders",
  45,
  [
    "Compare hand-written SQL, a query builder and an ORM on the same query.",
    "Read listNotes written with pg, Knex, Kysely and Prisma.",
    "Weigh what an ORM gives (types, relations, less typing) against what it hides.",
    "Spot the N+1 problem and fix it with one query.",
    "Explain why you still need SQL when you use an ORM.",
  ],

  part(
    "three-ways",
    "Three ways to talk to the database",
    explain(
      "However you write it, PostgreSQL only understands SQL. The question is who writes it. You can write it yourself and send it with the [[db-driver|driver]], as the Notes App does. A [[query-builder|query builder]] builds the SQL from function calls. An [[orm|ORM]] lets you work with objects like `prisma.note` and writes the SQL for you.",
    ),
    diagram([
      ["Your code"],
      ["SQL by hand / builder / ORM", "who writes the SQL"],
      ["Driver", "pg"],
      ["PostgreSQL", "runs SQL"],
    ]),
    reference("Who writes the SQL?", [
      ["SQL by hand", "You do, every word.", "pool.query(sql, values)"],
      [
        "Query builder",
        "You, through functions shaped like SQL.",
        'knex("notes").where(…)',
      ],
      [
        "ORM",
        "The library, from objects and options.",
        "prisma.note.findMany(…)",
      ],
    ]),
  ),

  part(
    "by-hand",
    "listNotes, by hand",
    explain(
      "Here is the Notes App's `listNotes` query. You see exactly what runs, and every value goes in as a [[parameterized-query|parameter]]. The cost: the SQL is a string, so a typo in a column name only shows up when the query runs, and nothing tells your editor what shape `result.rows` has.",
    ),
    code(
      "js",
      "pg: the SQL is right there",
      [
        "const result = await pool.query(",
        "  `SELECT id, title, content,",
        "          created_at, updated_at",
        "     FROM notes",
        "    WHERE user_id = $1",
        "    ORDER BY created_at DESC`,",
        "  [req.user.id],",
        ");",
        "const notes = result.rows;",
      ],
      {
        5: "$1 is filled from the array, safely",
        9: "plain objects; their shape isn't checked",
      },
    ),
    inTheNotesApp(
      "Every query in `notesController.js` is hand-written SQL sent with `pool.query`. The Notes App uses no ORM or query builder.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "builder",
    "With a query builder",
    explain(
      "Knex and Kysely turn chained calls into the same SQL, with the values passed as parameters for you. You still think in tables, columns and WHERE. Kysely also knows your tables' types, so a misspelt column is a TypeScript error before you run anything. Building a query step by step, like adding a filter only when it's given, gets easy.",
    ),
    code(
      "js",
      "Knex",
      [
        'const notes = await knex("notes")',
        '  .select("id", "title", "content",',
        '    "created_at", "updated_at")',
        "  .where({ user_id: req.user.id })",
        '  .orderBy("created_at", "desc");',
      ],
      {
        4: "becomes WHERE user_id = $1",
        5: "the result is the rows, no .rows",
      },
    ),
    code(
      "ts",
      "Kysely: the same, typed",
      [
        "const notes = await db",
        '  .selectFrom("notes")',
        '  .select(["id", "title", "content",',
        '    "created_at", "updated_at"])',
        '  .where("user_id", "=", req.user.id)',
        '  .orderBy("created_at", "desc")',
        "  .execute();",
      ],
      {
        3: 'a typo like "titel" won\'t compile',
      },
    ),
  ),

  part(
    "orm",
    "With an ORM",
    explain(
      "With Prisma you describe your tables once in a schema file, and it generates a client with a property per table. You ask for objects with options; it writes and sends the SQL. Fields are usually camelCase (`userId`), mapped to the snake_case columns (`user_id`).",
    ),
    anatomy(
      "Prisma's listNotes",
      [
        "const notes = await prisma.note.findMany({",
        "  where: { userId: req.user.id },",
        '  orderBy: { createdAt: "desc" },',
        "});",
      ],
      [
        ["prisma.note", "the notes table", "Generated from the Prisma schema."],
        [
          "findMany",
          "SELECT many rows",
          "findUnique, create, update, delete are the others.",
        ],
        [
          "where",
          "WHERE",
          "Becomes WHERE user_id = $1, with the value sent separately.",
        ],
        ["orderBy", "ORDER BY", "createdAt maps to the created_at column."],
      ],
    ),
    keyPoints(
      "The result is typed: notes[0].title is known to be a string.",
      "You never see the SQL unless you turn on query logging.",
      "Relations come with include: { tags: true }.",
    ),
  ),

  part(
    "trade-offs",
    "What an ORM gives, and what it costs",
    explain(
      "An ORM saves typing for everyday CRUD, gives typed results, loads related rows with one option, and often generates migrations from its schema. The price: the SQL is hidden, so a slow query is hard to spot; it's easy to fire many queries without noticing; its API is one more thing to learn; and for hard queries you end up back in SQL through its escape hatch.",
    ),
    reference("Gives and costs", [
      [
        "Less typing",
        "Simple reads and writes are one call.",
        "prisma.note.create({ data })",
      ],
      ["Types", "Your editor knows every field.", "note.title: string"],
      ["Relations", "Related rows with one option.", "include: { tags: true }"],
      ["Migrations", "Generated from its schema.", "prisma migrate dev"],
      [
        "Hidden SQL",
        "You don't see what runs, or how fast.",
        "Turn on query logging",
      ],
      [
        "Escape hatch",
        "Raw SQL for what it can't express.",
        "prisma.$queryRaw`SELECT …`",
      ],
    ]),
  ),

  part(
    "n-plus-one",
    "The N+1 problem",
    explain(
      "Load a user's notes (1 query), then loop and load each note's tags (N queries). With 50 notes that's 51 round trips to the database, each waiting for the last. That's the [[n-plus-one|N+1 problem]]. ORMs make it easy because `note.tags` can look like a property while it quietly runs a query. Here it is with a counter.",
    ),
    trace(
      "Counting queries in a loop",
      [
        "let queries = 0;",
        "function query(sql, values) {",
        "  queries++;",
        "  return fake(sql, values);",
        "}",
        "const notes = query(selectNotes, [3]);",
        "for (const note of notes) {",
        "  note.tags = query(selectTags,",
        "    [note.id]);",
        "}",
        "console.log(queries);",
      ],
      [
        {
          line: 1,
          note: "A counter, and a query function that adds 1 per call. fake() stands in for the database.",
          vars: [["queries", "0"]],
        },
        {
          line: 6,
          note: "Query 1: this user's notes. Three come back.",
          vars: [
            ["queries", "1"],
            ["notes", "[{ id: 1 }, { id: 2 }, { id: 3 }]"],
          ],
        },
        {
          line: 8,
          note: "Query 2: the tags of note 1.",
          vars: [
            ["queries", "2"],
            ["notes", "[{ id: 1, tags }, { id: 2 }, { id: 3 }]"],
            ["note", '{ id: 1, tags: ["shop"] }'],
          ],
        },
        {
          line: 8,
          note: "Query 3: the tags of note 2.",
          vars: [
            ["queries", "3"],
            ["notes", "[{ id: 1, tags }, { id: 2, tags }, { id: 3 }]"],
            ["note", "{ id: 2, tags: [] }"],
          ],
        },
        {
          line: 8,
          note: "Query 4: the tags of note 3. One more query per note.",
          vars: [
            ["queries", "4"],
            ["notes", "[{ id: 1, tags }, { id: 2, tags }, { id: 3, tags }]"],
            ["note", '{ id: 3, tags: ["travel"] }'],
          ],
        },
        {
          line: 11,
          note: "1 + N = 4. With 500 notes it would be 501.",
          vars: [
            ["queries", "4"],
            ["notes", "[…3 notes with tags]"],
          ],
          output: "4",
        },
      ],
    ),
  ),

  part(
    "fix",
    "The fix: one query for all of them",
    explain(
      "Ask for every note's tags at once. Collect the note ids and send them as one array: `WHERE note_id = ANY($1)`. pg turns a JavaScript array into a PostgreSQL array. Then group the rows by `note_id` in JavaScript. Two queries, whether there are 3 notes or 3,000. A [[sql-join|JOIN]] can do it in one.",
    ),
    code(
      "js",
      "Two queries instead of 1 + N",
      [
        "const ids = notes.map((n) => n.id);",
        "const { rows } = await pool.query(",
        "  `SELECT note_tags.note_id, tags.name",
        "     FROM note_tags",
        "     JOIN tags ON tags.id = note_tags.tag_id",
        "    WHERE note_tags.note_id = ANY($1)`,",
        "  [ids],",
        ");",
        "for (const note of notes) {",
        "  note.tags = rows",
        "    .filter((r) => r.note_id === note.id)",
        "    .map((r) => r.name);",
        "}",
      ],
      {
        6: "every note's tags in one round trip",
        7: "[1, 2, 3] becomes a PostgreSQL array",
        9: "grouping happens in memory: no queries",
      },
    ),
    keyPoints(
      "In Prisma, include: { tags: true } batches it like this.",
      "Watch the query log: the same query again and again is the sign.",
      "A list page should take a fixed number of queries, not one per row.",
    ),
    quickCheck(
      "A page shows 20 notes and each note's owner email, loaded with `getUser(note.userId)` inside a loop. How many queries?",
      ["1", "2", "21"],
      2,
      "One for the notes and one per note for its owner: 1 + 20. A JOIN on users, or one query with WHERE id = ANY($1), brings it down to one or two.",
    ),
  ),

  part(
    "choosing",
    "Choosing",
    explain(
      "There's no single right answer, and teams use all three. Small apps with a handful of queries, like the Notes App, do well with plain SQL. A query builder suits apps that build queries dynamically (filters, sorting) and want types. An ORM suits apps with many tables and lots of plain CRUD, as long as someone keeps an eye on the SQL it sends.",
    ),
    reference("Which one when", [
      [
        "SQL by hand",
        "Few queries, full control, nothing extra to learn.",
        "The Notes App",
      ],
      [
        "Query builder",
        "Dynamic queries, types, still close to SQL.",
        "Knex, Kysely",
      ],
      [
        "ORM",
        "Many tables, lots of CRUD, relations everywhere.",
        "Prisma, Sequelize, TypeORM",
      ],
      [
        "Mixed",
        "An ORM for CRUD, raw SQL for the hard reports.",
        "prisma.$queryRaw",
      ],
    ]),
  ),

  part(
    "sql-matters",
    "SQL still matters",
    explain(
      "An ORM writes the SQL, but the database still runs SQL, and its errors, plans and slow-query logs are all in SQL. To find why a page is slow, you read the query it sent. To add the right [[db-index|index]], design tables, or write a report the ORM can't express, you need SQL. Learn SQL first; then an ORM is a shortcut, not a mystery.",
    ),
    keyPoints(
      "Turn on query logging in development and read what runs.",
      "Errors like 23505 (unique) come from PostgreSQL, ORM or not.",
      "Indexes, constraints and migrations are SQL concepts.",
      "Escape hatches mean you'll write SQL sooner or later.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A query inside a loop",
      wrong: [
        "for (const note of notes) {",
        "  note.tags = await prisma.tag.findMany({",
        "    where: { notes: { some: { id: note.id } } },",
        "  });",
        "}",
      ],
      problem:
        "One query per note: 1 + N round trips, and the page gets slower with every note.",
      right: [
        "const notes = await prisma.note.findMany({",
        "  where: { userId },",
        "  include: { tags: true },",
        "});",
      ],
      why: "Load the related rows together: include, a JOIN, or WHERE … = ANY($1).",
    }),
    mistake({
      title: "Gluing values into raw SQL",
      wrong: [
        "await knex.raw(",
        "  `SELECT * FROM notes WHERE title = '${title}'`,",
        ");",
      ],
      problem:
        "The escape hatch skips the builder's protection: a title with a quote changes the SQL (SQL injection).",
      right: [
        "await knex.raw(",
        '  "SELECT * FROM notes WHERE title = ?",',
        "  [title],",
        ");",
      ],
      why: "Raw SQL still takes values separately: ? in Knex, $1 in pg, a tagged template in Prisma's $queryRaw.",
    }),
    mistake({
      title: "Loading every column and row to use a few",
      wrong: [
        "const all = await prisma.note.findMany();",
        "const mine = all.filter(",
        "  (n) => n.userId === userId);",
      ],
      problem:
        "Every user's notes travel from the database to filter them in JavaScript, and they can't use an index.",
      right: [
        "const mine = await prisma.note.findMany({",
        "  where: { userId },",
        "});",
      ],
      why: "Filter in the query, so the database does it with its index and sends only what you need.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Fix the N+1",
      task: "`withTags(db, userId)` returns the user's notes, each with `tags`: an array of tag names. It works, but makes 1 + N calls. Rewrite it with exactly 2: `db.notes(userId)`, then `db.tagsForMany(ids)`, which returns `{ note_id, name }` rows for all the ids at once.",
      starter: [
        "function withTags(db, userId) {",
        "  const notes = db.notes(userId);",
        "  for (const note of notes) {",
        "    note.tags = db.tagsFor(note.id);",
        "  }",
        "  return notes;",
        "}",
      ],
      tests: [
        [
          `(() => { ${fakeDb} return withTags(db, 3).map((n) => n.tags); })()`,
          '[["shop", "home"], [], ["travel"]]',
        ],
        [`(() => { ${fakeDb} withTags(db, 3); return db.calls; })()`, "2"],
        [
          `(() => { ${fakeDb} return withTags(db, 3)[0]; })()`,
          '{ id: 1, title: "Milk", tags: ["shop", "home"] }',
        ],
      ],
      hint: "`const ids = notes.map((n) => n.id)`, one `db.tagsForMany(ids)`, then for each note filter the rows by `note_id` and map to `name`.",
      solution: [
        "function withTags(db, userId) {",
        "  const notes = db.notes(userId);",
        "  const ids = notes.map((n) => n.id);",
        "  const rows = db.tagsForMany(ids);",
        "  for (const note of notes) {",
        "    note.tags = rows",
        "      .filter((r) => r.note_id === note.id)",
        "      .map((r) => r.name);",
        "  }",
        "  return notes;",
        "}",
      ],
    }),
    yourTurn({
      title: "What a query builder does",
      task: "Write `buildSelect(table, where)`, like a tiny query builder. `where` is an object such as `{ user_id: 3 }`. Return `{ text, values }`: `SELECT * FROM table`, plus ` WHERE col = $1 AND col = $2…` for each key, with the values in `values`, never in the text.",
      starter: [
        "function buildSelect(table, where) {",
        "  const conds = Object.entries(where)",
        "    .map(([col, v]) => `${col} = ${v}`);",
        "  const text = `SELECT * FROM ${table}` +",
        '    " WHERE " + conds.join(" AND ");',
        "  return { text, values: [] };",
        "}",
      ],
      tests: [
        [
          'buildSelect("notes", { user_id: 3 })',
          '{ text: "SELECT * FROM notes WHERE user_id = $1", values: [3] }',
        ],
        [
          'buildSelect("notes", { id: 7, user_id: 3 })',
          '{ text: "SELECT * FROM notes WHERE id = $1 AND user_id = $2", values: [7, 3] }',
        ],
        [
          'buildSelect("tags", {})',
          '{ text: "SELECT * FROM tags", values: [] }',
        ],
      ],
      hint: "Map `Object.keys(where)` with its index `i` to `col = $` plus `i + 1`. `Object.values(where)` are the values. Add WHERE only if there are conditions.",
      solution: [
        "function buildSelect(table, where) {",
        "  const cols = Object.keys(where);",
        "  const conds = cols.map(",
        "    (col, i) => `${col} = $${i + 1}`);",
        "  let text = `SELECT * FROM ${table}`;",
        "  if (conds.length) {",
        '    text += " WHERE " + conds.join(" AND ");',
        "  }",
        "  return { text, values: Object.values(where) };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("ORMs and query builders cheat sheet", [
      ["SQL by hand", "You write it; you see it all.", "pool.query(sql, [id])"],
      [
        "Query builder",
        "SQL from function calls, values safe.",
        'knex("notes").where({ user_id })',
      ],
      [
        "ORM",
        "Objects in, SQL written for you.",
        "prisma.note.findMany({ where })",
      ],
      [
        "Gives",
        "Less typing, types, relations, migrations.",
        "include: { tags: true }",
      ],
      ["Costs", "Hidden SQL, N+1, its own API to learn.", "Log the queries"],
      ["N+1", "One query per row in a loop.", "51 queries for 50 notes"],
      ["The fix", "Load them together.", "WHERE note_id = ANY($1)"],
      [
        "Escape hatch",
        "Raw SQL, values still separate.",
        'knex.raw("… = ?", [title])',
      ],
    ]),
    quickCheck(
      "Your Prisma app's notes page is slow. What's the best first step?",
      [
        "Switch to a different ORM",
        "Turn on query logging and read the SQL it sends",
        "Add an index on every column",
      ],
      1,
      "The database runs SQL, so that's where the problem is: maybe N+1 queries, maybe a missing index. Read the queries first, then fix what you find.",
    ),
  ),
);
