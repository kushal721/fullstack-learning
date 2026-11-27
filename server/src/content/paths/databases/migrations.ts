import {
  anatomy,
  analogy,
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

// Migrations used by the migrate exercise's tests.
const migs =
  'const migrations = [{ name: "002_add_pinned", up: (s) => s.notes.push("pinned") }, { name: "001_add_content", up: (s) => s.notes.push("content") }, { name: "003_add_color", up: (s) => s.notes.push("color") }];';

// Migrations: why schema.sql isn't enough once there's data, a numbered
// file per change, the table that records what has run, up and down,
// adding a column and a tags table, renaming safely (expand, migrate,
// contract), a runner step by step, rules for running them, tools,
// mistakes, practice and a recap.
export const migrationsModule = moduleLesson(
  "migrations",
  "Migrations: changing the schema",
  45,
  [
    "Explain why a schema file can't change a database that already holds data.",
    "Write a migration as a numbered up step with a matching down step.",
    "Describe how a migration tool knows which migrations still need to run.",
    "Rename a column safely in three steps: expand, migrate the data, contract.",
    "Follow the rules: never edit a migration that has run; migrate before new code.",
  ],

  part(
    "problem",
    "schema.sql only works once",
    explain(
      "The Notes App's [[db-schema|schema]] is one file of CREATE TABLE statements, run once on an empty database. Now you want a `pinned` column. Running schema.sql again fails: the tables exist. Dropping them and starting over would delete every user's notes. You need a way to change a live database one step at a time, the same way on every machine.",
    ),
    code(
      "bash",
      "Running the schema again",
      [
        'psql "$DATABASE_URL" -f database/schema.sql',
        'ERROR:  relation "users" already exists',
      ],
      {
        2: "the tables are there, full of real data",
      },
    ),
    inTheNotesApp(
      "The Notes App has no migrations tool: just `schema.sql`, run by hand on an empty database. Fine for learning, but not for an app with users.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "files",
    "A file per change",
    explain(
      "A [[db-migration|migration]] is a small file that changes the schema one step. Each change gets a new file, numbered (or timestamped) so they sort in the order they were written, and committed to git with the code that needs it. Running them all in order on an empty database builds today's schema; running only the new ones brings an old database up to date.",
    ),
    analogy(
      "Like git commits for your schema: each one a small, named change on top of the last, replayed in order on every copy.",
    ),
    code(
      "bash",
      "A migrations folder",
      [
        "migrations/",
        "  001_create_users.sql",
        "  002_create_notes.sql",
        "  003_add_pinned.sql",
        "  004_create_tags.sql",
      ],
      {
        1: "committed with the code",
        4: "the newest change, written last",
      },
    ),
  ),

  part(
    "tracking",
    "How the tool knows what has run",
    explain(
      "A migration tool keeps its own table in your database listing every migration it has applied. When you run it, it compares the files in the folder with that table and runs only the missing ones, in order, recording each. So the same command works on your laptop, a teammate's, the test database and production.",
    ),
    code(
      "sql",
      "node-pg-migrate's record",
      [
        "SELECT name, run_on FROM pgmigrations;",
        "",
        "-- 001_create_users | 2026-03-01 10:02",
        "-- 002_create_notes | 2026-03-01 10:02",
        "-- 003_add_pinned   | 2026-05-14 09:30",
      ],
      {
        1: "Knex calls it knex_migrations",
        5: "004 isn't here yet: it runs next",
      },
    ),
    diagram([
      ["Files", "001 … 004"],
      ["Migrations table", "001 … 003 ran"],
      ["Run", "004 only"],
      ["Record", "004 ran"],
    ]),
  ),

  part(
    "up-down",
    "Up and down",
    explain(
      "Each migration has an up step that makes the change and, usually, a down step that undoes it: [[down-migration|rolling back]]. Adding `pinned` with a DEFAULT matters: the table already has rows, and NOT NULL without a default would fail because those rows have no value. With `DEFAULT false`, every existing note gets false.",
    ),
    anatomy(
      "003_add_pinned.sql, the up step",
      [
        "-- Up Migration",
        "ALTER TABLE notes ADD COLUMN pinned",
        "  BOOLEAN NOT NULL DEFAULT false;",
      ],
      [
        [
          "-- Up Migration",
          "the change",
          "node-pg-migrate's marker in a .sql file: what to run going forward.",
        ],
        [
          "ALTER TABLE notes",
          "change a table",
          "It keeps its rows; only its shape changes.",
        ],
        ["ADD COLUMN pinned", "the new column", "Added to every existing row."],
        ["BOOLEAN", "its type", "true or false."],
        [
          "NOT NULL DEFAULT false",
          "the rule and the fill",
          "Old rows get false, so NOT NULL holds from the start.",
        ],
      ],
    ),
    code(
      "sql",
      "The down step, in the same file",
      ["-- Down Migration", "ALTER TABLE notes DROP COLUMN pinned;"],
      {
        2: "undoes the up step, and loses any pins",
      },
    ),
  ),

  part(
    "tags",
    "A bigger one: a tags table",
    explain(
      "Adding tags to notes is a [[many-to-many]] link: a `tags` table and a `note_tags` table pairing them up. One migration can create both. The down step drops them in reverse order, because `note_tags` points at `tags`.",
    ),
    code(
      "sql",
      "004_create_tags.sql",
      [
        "-- Up Migration",
        "CREATE TABLE tags (",
        "  id SERIAL PRIMARY KEY,",
        "  name TEXT NOT NULL UNIQUE",
        ");",
        "CREATE TABLE note_tags (",
        "  note_id INTEGER NOT NULL",
        "    REFERENCES notes ON DELETE CASCADE,",
        "  tag_id INTEGER NOT NULL",
        "    REFERENCES tags ON DELETE CASCADE,",
        "  PRIMARY KEY (note_id, tag_id)",
        ");",
        "-- Down Migration",
        "DROP TABLE note_tags;",
        "DROP TABLE tags;",
      ],
      {
        11: "a note can't get the same tag twice",
        14: "the table that points at tags goes first",
      },
    ),
  ),

  part(
    "rename",
    "Renaming a column safely",
    explain(
      "Say `content` should become `body`. `RENAME COLUMN` is instant, but while the new code deploys, the old code is still running and still asks for `content`: errors until it's replaced. The safe way takes three releases. Expand: add `body`. Migrate: copy the data, and ship code that writes both and reads `body`. Contract: once nothing uses `content`, drop it.",
    ),
    code(
      "sql",
      "Expand, migrate, contract",
      [
        "-- 005: expand",
        "ALTER TABLE notes ADD COLUMN body TEXT",
        "  NOT NULL DEFAULT '';",
        "-- 006: migrate the data",
        "UPDATE notes SET body = content;",
        "-- (deploy code that uses body)",
        "-- 007: contract, a later release",
        "ALTER TABLE notes DROP COLUMN content;",
      ],
      {
        2: "old code ignores it, nothing breaks",
        5: "existing notes copied across",
        8: "only once no running code reads content",
      },
    ),
    keyPoints(
      "Every step works with both the old and the new code.",
      "Dropping a column can't be undone: its data is gone.",
      "On a huge table, copy the data in batches.",
    ),
  ),

  part(
    "step-by-step",
    "A migration runner, step by step",
    explain(
      "Here's what the tool does, in JavaScript. `applied` stands for the migrations table, `files` for the folder, already sorted. Follow it on a database that has only run 001.",
    ),
    trace(
      "Run what's missing, in order",
      [
        'const applied = ["001_create_notes"];',
        "const files = [",
        '  "001_create_notes",',
        '  "002_add_pinned",',
        '  "003_create_tags",',
        "];",
        "for (const name of files) {",
        "  if (applied.includes(name)) continue;",
        '  console.log("running " + name);',
        "  applied.push(name);",
        "}",
      ],
      [
        {
          line: 1,
          note: "The migrations table: 001 ran some time ago.",
          vars: [["applied", '["001_create_notes"]']],
        },
        {
          line: 7,
          note: "Three files in the folder, in order.",
          vars: [
            ["applied", '["001_create_notes"]'],
            [
              "files",
              '["001_create_notes", "002_add_pinned", "003_create_tags"]',
            ],
          ],
        },
        {
          line: 8,
          note: "001 is already in the table: skip it, never run twice.",
          vars: [
            ["applied", '["001_create_notes"]'],
            ["files", "[…3 names]"],
            ["name", '"001_create_notes"'],
          ],
        },
        {
          line: 9,
          note: "002 is missing: run its up step.",
          vars: [
            ["applied", '["001_create_notes"]'],
            ["files", "[…3 names]"],
            ["name", '"002_add_pinned"'],
          ],
          output: "running 002_add_pinned",
        },
        {
          line: 10,
          note: "Record it, so the next run skips it.",
          vars: [
            ["applied", '["001_create_notes", "002_add_pinned"]'],
            ["files", "[…3 names]"],
            ["name", '"002_add_pinned"'],
          ],
        },
        {
          line: 9,
          note: "003 is missing too: run it next, after 002.",
          vars: [
            ["applied", '["001_create_notes", "002_add_pinned"]'],
            ["files", "[…3 names]"],
            ["name", '"003_create_tags"'],
          ],
          output: "running 003_create_tags",
        },
        {
          line: 10,
          note: "All three recorded. Running it again would do nothing.",
          vars: [
            [
              "applied",
              '["001_create_notes", "002_add_pinned", "003_create_tags"]',
            ],
            ["files", "[…3 names]"],
            ["name", '"003_create_tags"'],
          ],
        },
      ],
    ),
  ),

  part(
    "rules",
    "The rules for running them",
    explain(
      "Once a migration has run anywhere else, it's history: never edit it, because databases that ran the old version won't run it again, and the schemas drift apart. Fix it with a new migration. On deploy, run migrations before the new code starts, since the new code expects the new schema. Rolling back with a down step is handy in development; in production, fixing forward is often safer.",
    ),
    diagram([
      ["Deploy starts"],
      ["Run migrations", "new columns exist"],
      ["Start new code", "uses them"],
    ]),
    keyPoints(
      "A merged migration is never edited: write a new one.",
      "Migrate first, then start the new code.",
      "Each change must also work with the old code still running.",
      "Run every migration on your own database before pushing.",
    ),
    quickCheck(
      "003_add_pinned ran in production last week, but the default should have been true. What do you do?",
      [
        "Edit 003 to say DEFAULT true",
        "Write 005 that changes the default",
        "Delete 003 from the migrations table and run it again",
      ],
      1,
      "Databases that already ran 003 would never see an edit, so they'd differ from new ones. A new migration with ALTER COLUMN pinned SET DEFAULT true reaches every database the same way.",
    ),
  ),

  part(
    "tools",
    "Migration tools",
    explain(
      "You don't write the runner yourself. node-pg-migrate works with plain `pg` like the Notes App. Knex has migrations built in. Prisma Migrate writes migration files for you from a schema you describe. They all do the same job: numbered files, a table of what ran, up (and down) commands.",
    ),
    reference("The same jobs in three tools", [
      [
        "node-pg-migrate: new",
        "Create the next migration file.",
        "npx node-pg-migrate create add-pinned",
      ],
      [
        "node-pg-migrate: run",
        "Run every pending migration.",
        "npx node-pg-migrate up",
      ],
      ["Knex: run", "Run every pending migration.", "npx knex migrate:latest"],
      ["Knex: undo", "Roll back the last batch.", "npx knex migrate:rollback"],
      [
        "Prisma: dev",
        "Write and run a migration from the schema.",
        "npx prisma migrate dev --name add_pinned",
      ],
      [
        "Prisma: deploy",
        "Run pending migrations in production.",
        "npx prisma migrate deploy",
      ],
    ]),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Adding a required column with no default",
      language: "sql",
      wrong: ["ALTER TABLE notes ADD COLUMN pinned", "  BOOLEAN NOT NULL;"],
      problem:
        "Existing notes have no value for pinned, so NOT NULL fails and the migration stops.",
      right: [
        "ALTER TABLE notes ADD COLUMN pinned",
        "  BOOLEAN NOT NULL DEFAULT false;",
      ],
      why: "The default fills every existing row, so the rule holds from the start.",
    }),
    mistake({
      title: "Changing the schema by hand in production",
      language: "sql",
      wrong: [
        "-- typed into psql on the server",
        "ALTER TABLE notes ADD COLUMN color TEXT;",
      ],
      problem:
        "No file, no record. Your laptop, the tests and a new server don't have it, and nobody knows it happened.",
      right: [
        "-- migrations/005_add_color.sql",
        "ALTER TABLE notes ADD COLUMN color TEXT;",
      ],
      why: "Every change goes through a committed migration, so every database gets it the same way.",
    }),
    mistake({
      title: "Renaming in one step",
      language: "sql",
      wrong: ["ALTER TABLE notes", "  RENAME COLUMN content TO body;"],
      problem:
        "The old code, still running during the deploy, asks for content and fails until it's replaced.",
      right: [
        "-- expand: add body, copy the data",
        "-- deploy code that uses body",
        "-- contract: later, drop content",
      ],
      why: "Each step is safe with both versions of the code running.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Which migrations still need to run?",
      task: "Write `pending(applied, files)`: the file names that are not in `applied`, sorted in order. Don't change `files`.",
      starter: ["function pending(applied, files) {", "  return files;", "}"],
      tests: [
        [
          'pending(["001_users"], ["002_notes", "001_users", "003_pinned"])',
          '["002_notes", "003_pinned"]',
        ],
        [
          'pending(["001_users", "002_notes"], ["001_users", "002_notes"])',
          "[]",
        ],
        [
          'pending([], ["002_notes", "001_users"])',
          '["001_users", "002_notes"]',
        ],
        [
          '(() => { const files = ["002_b", "001_a"]; pending([], files); return files; })()',
          '["002_b", "001_a"]',
        ],
      ],
      hint: "`files.filter((f) => !applied.includes(f))` makes a new array; then `.sort()` it.",
      solution: [
        "function pending(applied, files) {",
        "  return files",
        "    .filter((f) => !applied.includes(f))",
        "    .sort();",
        "}",
      ],
    }),
    yourTurn({
      title: "Run the up steps",
      task: "Write `migrate(schema, migrations, applied)`. Each migration is `{ name, up }`. In name order, call `up(schema)` for every migration whose name isn't in `applied`, and push its name onto `applied`. Return `applied`.",
      starter: [
        "function migrate(schema, migrations, applied) {",
        "  for (const m of migrations) {",
        "    m.up(schema);",
        "  }",
        "  return applied;",
        "}",
      ],
      tests: [
        [
          `(() => { ${migs} const schema = { notes: ["id"] }; migrate(schema, migrations, []); return schema.notes; })()`,
          '["id", "content", "pinned", "color"]',
        ],
        [
          `(() => { ${migs} const schema = { notes: ["id", "content"] }; return migrate(schema, migrations, ["001_add_content"]); })()`,
          '["001_add_content", "002_add_pinned", "003_add_color"]',
        ],
        [
          `(() => { ${migs} const schema = { notes: ["id", "content", "pinned", "color"] }; migrate(schema, migrations, ["001_add_content", "002_add_pinned", "003_add_color"]); return schema.notes.length; })()`,
          "4",
        ],
      ],
      hint: "Sort a copy: `[...migrations].sort((a, b) => a.name.localeCompare(b.name))`. Skip names already in `applied`.",
      solution: [
        "function migrate(schema, migrations, applied) {",
        "  const ordered = [...migrations].sort((a, b) =>",
        "    a.name.localeCompare(b.name));",
        "  for (const m of ordered) {",
        "    if (applied.includes(m.name)) continue;",
        "    m.up(schema);",
        "    applied.push(m.name);",
        "  }",
        "  return applied;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Migrations cheat sheet", [
      [
        "Migration",
        "A numbered file with one schema change.",
        "003_add_pinned.sql",
      ],
      [
        "Migrations table",
        "The tool's record of what has run.",
        "pgmigrations, knex_migrations",
      ],
      [
        "Up",
        "Makes the change.",
        "ADD COLUMN pinned BOOLEAN\n  NOT NULL DEFAULT false",
      ],
      ["Down", "Undoes it, if it can.", "DROP COLUMN pinned"],
      [
        "New required column",
        "Give it a DEFAULT for existing rows.",
        "DEFAULT false",
      ],
      [
        "Rename safely",
        "Expand, migrate the data, contract.",
        "add body → copy → drop content",
      ],
      [
        "Never edit",
        "A migration that ran: write a new one.",
        "005_fix_pinned_default.sql",
      ],
      [
        "On deploy",
        "Migrate first, then start the new code.",
        "npx node-pg-migrate up",
      ],
    ]),
    quickCheck(
      "A teammate pulls your branch, which adds 004_create_tags.sql. What should they run?",
      [
        "schema.sql again, on their database",
        "The migrate command: it runs only 004",
        "Every migration from 001, after emptying the database",
      ],
      1,
      "The migrations table says 001 to 003 already ran on their database, so the tool runs just 004 and records it. Their notes stay where they are.",
    ),
  ),
);
