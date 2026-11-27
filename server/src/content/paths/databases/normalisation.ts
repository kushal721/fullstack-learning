import {
  anatomy,
  analogy,
  code,
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

// Normalisation: one big table and its problems, three anomalies, each fact
// once (the Notes App's schema), first normal form, second and third in
// plain words, a messy table split step by step, when to denormalise,
// JSONB as a deliberate exception, mistakes, practice and a recap.
export const normalisationModule = moduleLesson(
  "normalisation",
  "Normalisation: each fact once",
  45,
  [
    "Explain the problems duplicated data causes: update, insert and delete anomalies.",
    "Store each fact once and link tables by keys, as the Notes App does with user_id.",
    "Apply first, second and third normal form in plain words.",
    "Split a messy spreadsheet-like table into proper tables.",
    "Decide when to denormalise on purpose, and keep the copy in step.",
  ],

  part(
    "one-big-table",
    "One big table",
    explain(
      "A first database often looks like a spreadsheet: one table with everything in each row. Here every note row also carries its owner's email. It works, until Ana changes her email. Now you must change every one of her notes, and if one is missed, the database says two different things about the same person.",
    ),
    code(
      "sql",
      "A notes table that copies the email",
      [
        "-- id | email          | title",
        "--  1 | ana@example.com | Milk",
        "--  2 | ana@example.com | Rent",
        "--  3 | ben@example.com | Gym",
        "UPDATE notes",
        "   SET email = 'ana@new.io'",
        " WHERE id = 1;",
      ],
      {
        2: "Ana's email, copy 1",
        3: "the same fact again, copy 2",
        7: "only one copy changed: which is right now?",
      },
    ),
    analogy(
      "Writing a friend's phone number on every page of your diary. When they change it, you'll miss a page.",
    ),
  ),

  part(
    "anomalies",
    "Three ways duplicated data goes wrong",
    explain(
      "These problems have names, called anomalies. All three come from the same cause: one fact (Ana's email) stored in many places, or a fact that can only exist next to another one. [[normalization|Normalisation]] is the way of designing tables that removes them.",
    ),
    keyPoints(
      "Update anomaly: change one copy, miss another, and the copies disagree.",
      "Insert anomaly: you can't store a user who has no notes yet.",
      "Delete anomaly: delete Ben's last note and his email is gone too.",
    ),
    quickCheck(
      "In the one-big-table design, what happens when Ben deletes his only note?",
      [
        "Nothing else changes",
        "The database forgets Ben's email too",
        "The DELETE fails",
      ],
      1,
      "Ben's email only lived inside his note row. Delete the row and the fact is gone: a delete anomaly. With a separate users table, Ben stays even with no notes.",
    ),
  ),

  part(
    "each-fact-once",
    "Each fact once: the Notes App's schema",
    explain(
      "The fix is to give each kind of thing its own table and store each fact once. The email lives in `users`, once per person. A note stores only `user_id`, the [[foreign-key|foreign key]] that points at its owner. Change the email in one row and every note shows the new one, because they look it up instead of copying it.",
    ),
    anatomy(
      "notes points at users, it doesn't copy them",
      [
        "CREATE TABLE notes (",
        "  id SERIAL PRIMARY KEY,",
        "  user_id INTEGER NOT NULL",
        "    REFERENCES users (id),",
      ],
      [
        [
          "notes",
          "one thing per table",
          "A note: its title, content and times.",
        ],
        [
          "id SERIAL PRIMARY KEY",
          "the key",
          "Every other column in this table is a fact about this id.",
        ],
        [
          "user_id INTEGER",
          "a link, not a copy",
          "Just the owner's id. Their email stays in users.",
        ],
        [
          "REFERENCES users (id)",
          "kept honest",
          "The id must belong to a real user.",
        ],
      ],
    ),
    code(
      "sql",
      "Need the email with the note? Join it",
      [
        "SELECT notes.title, users.email",
        "  FROM notes",
        "  JOIN users ON users.id = notes.user_id",
        " WHERE notes.id = 1;",
      ],
      { 3: "looked up at read time, always current" },
    ),
    inTheNotesApp(
      "`schema.sql` is already normalised: `users` holds the email once, and `notes` holds `user_id`. Its queries never need the email, so they don't even join.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "first-nf",
    "First normal form: one value per cell",
    explain(
      "First normal form says each cell holds one value. A `tags` column holding `\"work, urgent\"` breaks it: you can't index one tag, renaming a tag means editing text, and `LIKE '%work%'` also matches \"homework\". Tags get their own rows instead. A note has many tags and a tag many notes, so it's [[many-to-many|many-to-many]], with a table in between.",
    ),
    code(
      "sql",
      "Tags as rows, not a comma list",
      [
        "CREATE TABLE tags (",
        "  id SERIAL PRIMARY KEY,",
        "  name TEXT NOT NULL UNIQUE",
        ");",
        "CREATE TABLE note_tags (",
        "  note_id INTEGER REFERENCES notes (id),",
        "  tag_id INTEGER REFERENCES tags (id),",
        "  PRIMARY KEY (note_id, tag_id)",
        ");",
      ],
      {
        3: "each tag name stored once",
        6: "one row per note-and-tag pair",
        8: "the same pair can't be added twice",
      },
    ),
    keyPoints(
      "The Notes App has no tags: this is how you'd add them.",
      "A list inside a cell is the clue: it wants to be rows.",
      "Numbered columns (tag1, tag2, tag3) are the same mistake.",
    ),
  ),

  part(
    "second-third",
    "Second and third normal form, simply",
    explain(
      'The rule behind the higher forms is usually said as: every column must be about the key, the whole key, and nothing but the key. "The key" is the [[primary-key|primary key]]. If a column describes something else, it belongs in that something else\'s table. Most well-designed schemas reach third normal form without trying.',
    ),
    reference("The key, the whole key, nothing but the key", [
      [
        "1NF: the key",
        "One value per cell, and each row has a key.",
        'no "work, urgent" cells',
      ],
      [
        "2NF: the whole key",
        "With a two-column key, no column may depend on just one part.",
        "note_tags.tag_colour: about the tag\nalone → move it to tags",
      ],
      [
        "3NF: nothing but",
        "No column may describe another column instead of the key.",
        "notes.user_email: about the user,\nnot the note → users",
      ],
    ]),
    quickCheck(
      "A `notes` table has `id`, `user_id`, `title` and `user_name`. What's wrong?",
      [
        "Nothing: it saves a join",
        "user_name is about the user, not the note: it belongs in users",
        "title should be in users",
      ],
      1,
      "user_name depends on user_id, not on the note's id, which breaks third normal form. Store it once in users and join when you need it.",
    ),
  ),

  part(
    "split-step-by-step",
    "Splitting a messy table, step by step",
    explain(
      "Say you're importing a spreadsheet where each row has an email and a title. To load it into normalised tables, give each new email an id the first time you see it, and store only that id in each note. Follow two rows from the same person.",
    ),
    trace(
      "Rows with emails → users and notes",
      [
        "const rows = [",
        '  { email: "ana@x.io", title: "Milk" },',
        '  { email: "ana@x.io", title: "Rent" },',
        "];",
        "const users = new Map(); // email → id",
        "const notes = [];",
        "for (const r of rows) {",
        "  if (!users.has(r.email)) {",
        "    users.set(r.email, users.size + 1);",
        "  }",
        "  const user_id = users.get(r.email);",
        "  notes.push({ user_id, title: r.title });",
        "}",
      ],
      [
        {
          line: 1,
          note: "Two rows, the same email copied into both.",
          vars: [["rows", "[{ … Milk }, { … Rent }]"]],
        },
        {
          line: 5,
          note: "The users table: email to id. Empty so far.",
          vars: [
            ["rows", "[{ … Milk }, { … Rent }]"],
            ["users", "Map {}"],
          ],
        },
        {
          line: 7,
          note: "The first row: Ana and Milk.",
          vars: [
            ["rows", "[{ … Milk }, { … Rent }]"],
            ["users", "Map {}"],
            ["notes", "[]"],
            ["r", '{ email: "ana@x.io", title: "Milk" }'],
          ],
        },
        {
          line: 9,
          note: "A new email: Ana becomes user 1. Her email is stored here, once.",
          vars: [
            ["rows", "[{ … Milk }, { … Rent }]"],
            ["users", 'Map { "ana@x.io" => 1 }'],
            ["notes", "[]"],
            ["r", '{ email: "ana@x.io", title: "Milk" }'],
          ],
        },
        {
          line: 12,
          note: "The note keeps only user_id: 1, not the email.",
          vars: [
            ["rows", "[{ … Milk }, { … Rent }]"],
            ["users", 'Map { "ana@x.io" => 1 }'],
            ["notes", '[{ user_id: 1, title: "Milk" }]'],
            ["r", '{ email: "ana@x.io", title: "Milk" }'],
            ["user_id", "1"],
          ],
        },
        {
          line: 8,
          note: "The second row. Ana is already known, so no new user.",
          vars: [
            ["rows", "[{ … Milk }, { … Rent }]"],
            ["users", 'Map { "ana@x.io" => 1 }'],
            ["notes", '[{ user_id: 1, title: "Milk" }]'],
            ["r", '{ email: "ana@x.io", title: "Rent" }'],
          ],
        },
        {
          line: 12,
          note: "Rent also points at user 1. One email, two notes linked to it.",
          vars: [
            ["rows", "[{ … Milk }, { … Rent }]"],
            ["users", 'Map { "ana@x.io" => 1 }'],
            ["notes", "[{ user_id: 1, … }, { user_id: 1, … }]"],
            ["r", '{ email: "ana@x.io", title: "Rent" }'],
            ["user_id", "1"],
          ],
        },
      ],
    ),
  ),

  part(
    "denormalise",
    "When to denormalise",
    explain(
      "Sometimes you copy a fact on purpose for speed: that's [[denormalization|denormalisation]]. A `note_count` on users saves counting thousands of rows on every page; a cached summary saves a slow report. Do it only after measuring a real slow query. Then every change must update the copy too, in the same [[db-transaction|transaction]], or the copy drifts.",
    ),
    code(
      "sql",
      "Keeping a counted column in step",
      [
        "BEGIN;",
        "INSERT INTO notes (user_id, title)",
        "  VALUES ($1, $2);",
        "UPDATE users",
        "   SET note_count = note_count + 1",
        " WHERE id = $1;",
        "COMMIT;",
      ],
      {
        1: "both or neither: the count can't drift",
        5: "and the DELETE path must subtract 1",
      },
    ),
    keyPoints(
      "The Notes App has no note_count: COUNT(*) would be fast enough.",
      "A copy means two writes for every change, forever.",
      "Write down which column is the copy, and what keeps it in step.",
    ),
  ),

  part(
    "jsonb",
    "JSONB: a deliberate exception",
    explain(
      "PostgreSQL can store a whole JSON object in one `JSONB` column. That breaks one-value-per-cell on purpose, and it's fine for data you always read and write as a whole and rarely search, like a user's display settings. If you find yourself filtering or joining on a field inside it, that field wants to be a real column.",
    ),
    code(
      "sql",
      "Settings as one JSONB value",
      [
        "ALTER TABLE users ADD COLUMN settings",
        "  JSONB NOT NULL DEFAULT '{}';",
        "SELECT settings->>'theme'",
        "  FROM users WHERE id = $1;",
      ],
      {
        2: "the whole object, read and saved together",
        3: "->> takes one field out, as text",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Copying the owner into every row",
      language: "sql",
      wrong: [
        "INSERT INTO notes (user_email, title)",
        "VALUES ('ana@example.com', 'Milk');",
      ],
      problem:
        "Ana's email is now stored once per note. Change it, and the old copies disagree with the new one.",
      right: ["INSERT INTO notes (user_id, title)", "VALUES ($1, $2);"],
      why: "Store the key; the email lives once, in users.",
    }),
    mistake({
      title: "A comma list in a column",
      language: "sql",
      wrong: ["SELECT * FROM notes", " WHERE tags LIKE '%work%';"],
      problem:
        "It also finds 'homework', it can't use an index, and renaming a tag means rewriting text in every row.",
      right: [
        "SELECT notes.* FROM notes",
        "  JOIN note_tags ON note_id = notes.id",
        " WHERE tag_id = $1;",
      ],
      why: "One value per cell: each tag is a row in note_tags.",
    }),
    mistake({
      title: "A copy that isn't kept in step",
      language: "sql",
      wrong: ["DELETE FROM notes", " WHERE id = $1 AND user_id = $2;"],
      problem:
        "users.note_count still counts the deleted note. Every page now shows the wrong number.",
      right: [
        "BEGIN; -- DELETE the note, then:",
        "UPDATE users SET note_count =",
        "  note_count - 1 WHERE id = $2;",
        "COMMIT;",
      ],
      why: "Every write path must update the copy, in the same transaction.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Normalise the import",
      task: "Write `normalise(rows)`. Each row is `{ email, title }`. Return `{ users, notes }`: one user `{ id, email }` per different email (ids 1, 2, … in order of first appearance) and one note `{ id, user_id, title }` per row (ids 1, 2, …).",
      starter: [
        "function normalise(rows) {",
        "  const notes = rows.map((r, i) => ({",
        "    id: i + 1, email: r.email, title: r.title,",
        "  }));",
        "  return { users: [], notes };",
        "}",
      ],
      tests: [
        [
          'normalise([{ email: "ana@x.io", title: "Milk" }, { email: "ben@x.io", title: "Gym" }, { email: "ana@x.io", title: "Rent" }])',
          '{ users: [{ id: 1, email: "ana@x.io" }, { id: 2, email: "ben@x.io" }], notes: [{ id: 1, user_id: 1, title: "Milk" }, { id: 2, user_id: 2, title: "Gym" }, { id: 3, user_id: 1, title: "Rent" }] }',
        ],
        ["normalise([])", "{ users: [], notes: [] }"],
      ],
      hint: "Look the email up in `users` with `find`. If it isn't there, push `{ id: users.length + 1, email }`.",
      solution: [
        "function normalise(rows) {",
        "  const users = [];",
        "  const notes = [];",
        "  for (const { email, title } of rows) {",
        "    let user = users.find(",
        "      (u) => u.email === email);",
        "    if (!user) {",
        "      user = { id: users.length + 1, email };",
        "      users.push(user);",
        "    }",
        "    const id = notes.length + 1;",
        "    notes.push({ id, user_id: user.id, title });",
        "  }",
        "  return { users, notes };",
        "}",
      ],
    }),
    yourTurn({
      title: "One tag per row",
      task: 'Write `splitTags(notes)`. Each note is `{ id, tags }` where `tags` is text like `"work, urgent"`. Return one `{ note_id, tag }` row per tag, trimmed, skipping empty ones.',
      starter: [
        "function splitTags(notes) {",
        "  return notes.map((n) => ({",
        "    note_id: n.id, tag: n.tags,",
        "  }));",
        "}",
      ],
      tests: [
        [
          'splitTags([{ id: 1, tags: "work, urgent" }, { id: 2, tags: "" }])',
          '[{ note_id: 1, tag: "work" }, { note_id: 1, tag: "urgent" }]',
        ],
        [
          'splitTags([{ id: 3, tags: "home" }])',
          '[{ note_id: 3, tag: "home" }]',
        ],
        [
          'splitTags([{ id: 4, tags: "a,, b " }])',
          '[{ note_id: 4, tag: "a" }, { note_id: 4, tag: "b" }]',
        ],
      ],
      hint: '`n.tags.split(",")` gives the pieces; `trim()` each one and skip it if it\'s empty.',
      solution: [
        "function splitTags(notes) {",
        "  const rows = [];",
        "  for (const n of notes) {",
        '    for (const piece of n.tags.split(",")) {',
        "      const tag = piece.trim();",
        "      if (tag) rows.push({ note_id: n.id, tag });",
        "    }",
        "  }",
        "  return rows;",
        "}",
      ],
    }),
    yourTurn({
      title: "Is the copy in step?",
      task: "Users have a denormalised `note_count`. Write `wrongCounts(db)`: return the ids of users whose `note_count` doesn't match how many notes in `db.notes` have their `user_id`.",
      starter: ["function wrongCounts(db) {", "  return [];", "}"],
      tests: [
        [
          "wrongCounts({ users: [{ id: 1, note_count: 2 }, { id: 2, note_count: 1 }], notes: [{ user_id: 1 }, { user_id: 1 }] })",
          "[2]",
        ],
        [
          "wrongCounts({ users: [{ id: 1, note_count: 1 }, { id: 2, note_count: 0 }], notes: [{ user_id: 1 }] })",
          "[]",
        ],
        [
          "wrongCounts({ users: [{ id: 5, note_count: 0 }], notes: [{ user_id: 5 }] })",
          "[5]",
        ],
      ],
      hint: "For each user, count the notes with `filter((n) => n.user_id === u.id).length` and compare.",
      solution: [
        "function wrongCounts(db) {",
        "  const real = (id) => db.notes",
        "    .filter((n) => n.user_id === id).length;",
        "  return db.users",
        "    .filter((u) => u.note_count !== real(u.id))",
        "    .map((u) => u.id);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Normalisation cheat sheet", [
      [
        "Normalise",
        "Each fact once, in one table, linked by keys.",
        "notes.user_id, not the email",
      ],
      ["Update anomaly", "Copies disagree after a change misses one."],
      [
        "Insert / delete anomaly",
        "A fact can't exist, or vanishes, without another row.",
      ],
      [
        "1NF",
        "One value per cell: lists become rows.",
        "note_tags (note_id, tag_id)",
      ],
      ["2NF", "Columns depend on the whole key, not part of it."],
      [
        "3NF",
        "Columns describe the key, nothing but the key.",
        "user_email → users",
      ],
      [
        "Denormalise",
        "A deliberate copy for speed, after measuring.",
        "users.note_count",
      ],
      [
        "Keep it in step",
        "Update the copy in the same transaction.",
        "BEGIN; INSERT …; UPDATE …; COMMIT;",
      ],
      [
        "JSONB",
        "A whole object in one cell: fine if you don't search inside it.",
        "settings->>'theme'",
      ],
    ]),
    quickCheck(
      "Why does the Notes App store `user_id` in notes instead of the user's email?",
      [
        "Numbers take less space, that's all",
        "So the email is stored once and every note always shows the current one",
        "Emails can't be used in a WHERE",
      ],
      1,
      "Storing the key instead of a copy means the email lives in one row of users. Change it there and nothing can disagree: that's normalisation.",
    ),
  ),
);
