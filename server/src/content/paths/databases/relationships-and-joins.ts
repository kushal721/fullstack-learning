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

// Sample rows for the exercises: three users (one with no notes), three notes.
const data =
  'const users = [{ id: 1, email: "ann@x.io" }, { id: 2, email: "bo@x.io" }, { id: 3, email: "cy@x.io" }]; const notes = [{ id: 10, user_id: 1, title: "Milk" }, { id: 11, user_id: 2, title: "Rent" }, { id: 12, user_id: 1, title: "Eggs" }];';

// Relationships and JOIN: one-to-many again, INNER JOIN and aliases, a join
// step by step, LEFT JOIN, counting with GROUP BY, many-to-many with a join
// table, querying through it, ON DELETE rules, why the Notes App needs no
// JOIN, mistakes, practice and a recap.
export const relationshipsAndJoinsModule = moduleLesson(
  "relationships-and-joins",
  "Relationships and JOIN",
  55,
  [
    "Combine two tables in one query with JOIN … ON, using table aliases.",
    "Use LEFT JOIN with GROUP BY to count notes per user, including users with none.",
    "Model a many-to-many relationship with a join table and a composite primary key.",
    "Choose between ON DELETE CASCADE, RESTRICT and SET NULL for a foreign key.",
    "Explain why the Notes App's queries need no JOIN today.",
  ],

  part(
    "one-to-many",
    "One user, many notes",
    explain(
      "The Notes App has two tables. Each note has a `user_id`, a [[foreign-key|foreign key]] holding the id of the user who owns it. One user has many notes; each note has one user: a [[one-to-many-relationship|one-to-many relationship]]. The link is stored once, on the “many” side. To see a note next to its owner's email, you need both tables in one query.",
    ),
    diagram([
      ["users", "id, email"],
      ["notes", "id, user_id, title"],
    ]),
    keyPoints(
      "notes.user_id points at users.id.",
      "The email is stored once, in users, never copied into notes.",
      "A JOIN puts the two back together when you read.",
    ),
  ),

  part(
    "inner-join",
    "JOIN … ON",
    explain(
      "A [[sql-join|JOIN]] combines rows from two tables. `ON` says which rows belong together: a note goes with the user whose id equals its `user_id`. Each result row has columns from both. A plain JOIN is an INNER JOIN: a row only comes out if it has a match on both sides. Short aliases like `n` and `u` save typing.",
    ),
    anatomy(
      "Each note with its owner's email",
      [
        "SELECT n.title, u.email",
        "  FROM notes n",
        "  JOIN users u",
        "    ON u.id = n.user_id;",
      ],
      [
        [
          "n.title, u.email",
          "columns from both",
          "table.column says which table each comes from.",
        ],
        ["notes n", "first table", "n is a short alias for notes."],
        ["JOIN users u", "second table", "Same as INNER JOIN; u for users."],
        [
          "ON u.id = n.user_id",
          "the match",
          "Pair each note with the user it points at.",
        ],
      ],
    ),
    code(
      "sql",
      "The result: one row per note",
      [
        "--  title | email",
        "-- -------+----------",
        "--  Milk  | ann@x.io",
        "--  Rent  | bo@x.io",
        "--  Eggs  | ann@x.io",
      ],
      { 3: "Ann's email appears once per note she owns" },
    ),
  ),

  part(
    "step-by-step",
    "A join, step by step",
    explain(
      "One way the database can run a JOIN is two nested loops: for each note, look through the users for the one whose id matches. (With an index it can jump straight to the user; the next module covers that.) Here it is in JavaScript.",
    ),
    trace(
      "An inner join as nested loops",
      [
        "function join(notes, users) {",
        "  const out = [];",
        "  for (const n of notes) {",
        "    for (const u of users) {",
        "      if (u.id === n.user_id) {",
        "        out.push([n.title, u.email]);",
        "      }",
        "    }",
        "  }",
        "  return out;",
        "}",
        'const notes = [{ user_id: 1, title: "A" }];',
        'const users = [{ id: 2, email: "bo" },',
        '  { id: 1, email: "ann" }];',
        "const rows = join(notes, users);",
      ],
      [
        {
          line: 15,
          note: "One note, owned by user 1. Two users.",
          vars: [
            ["notes", '[{ user_id: 1, title: "A" }]'],
            ["users", "[{ id: 2, … }, { id: 1, … }]"],
          ],
        },
        {
          line: 3,
          note: "Take the first note.",
          vars: [
            ["notes", '[{ user_id: 1, title: "A" }]'],
            ["users", "[{ id: 2, … }, { id: 1, … }]"],
            ["out", "[]"],
            ["n", '{ user_id: 1, title: "A" }'],
          ],
          stack: ["join"],
        },
        {
          line: 5,
          note: "User 2: 2 isn't 1, no match.",
          vars: [
            ["notes", '[{ user_id: 1, title: "A" }]'],
            ["users", "[{ id: 2, … }, { id: 1, … }]"],
            ["out", "[]"],
            ["n", '{ user_id: 1, title: "A" }'],
            ["u", '{ id: 2, email: "bo" }'],
          ],
          stack: ["join"],
        },
        {
          line: 6,
          note: "User 1 matches the ON condition: one result row.",
          vars: [
            ["notes", '[{ user_id: 1, title: "A" }]'],
            ["users", "[{ id: 2, … }, { id: 1, … }]"],
            ["out", '[["A", "ann"]]'],
            ["n", '{ user_id: 1, title: "A" }'],
            ["u", '{ id: 1, email: "ann" }'],
          ],
          stack: ["join"],
        },
        {
          line: 10,
          note: "Every pair has been checked.",
          vars: [
            ["notes", '[{ user_id: 1, title: "A" }]'],
            ["users", "[{ id: 2, … }, { id: 1, … }]"],
            ["out", '[["A", "ann"]]'],
          ],
          stack: ["join"],
        },
        {
          line: 15,
          note: "Bo has no notes, so Bo isn't in the result: that's what INNER means.",
          vars: [
            ["notes", '[{ user_id: 1, title: "A" }]'],
            ["users", "[{ id: 2, … }, { id: 1, … }]"],
            ["rows", '[["A", "ann"]]'],
          ],
        },
      ],
    ),
  ),

  part(
    "left-join",
    "LEFT JOIN: keep every user",
    explain(
      "An inner join drops users who have no notes. A [[left-join|LEFT JOIN]] keeps every row of the left table. Where the right table has no match, its columns come back as NULL. Use it when “none” is a real answer you want to see, like a user with no notes yet.",
    ),
    code(
      "sql",
      "Every user, with their notes if any",
      [
        "SELECT u.email, n.title",
        "  FROM users u",
        "  LEFT JOIN notes n",
        "    ON n.user_id = u.id;",
        "",
        "--  email    | title",
        "--  ann@x.io | Milk",
        "--  ann@x.io | Eggs",
        "--  bo@x.io  | Rent",
        "--  cy@x.io  | NULL",
      ],
      {
        2: "the left table: all of its rows stay",
        10: "Cy has no notes: title is NULL",
      },
    ),
    quickCheck(
      "Cy has no notes. Which query lists Cy?",
      [
        "users u JOIN notes n ON n.user_id = u.id",
        "users u LEFT JOIN notes n ON n.user_id = u.id",
        "Neither: a user with no notes can't be listed",
      ],
      1,
      "The inner JOIN only keeps users with a matching note. LEFT JOIN keeps every user and fills the note columns with NULL for Cy.",
    ),
  ),

  part(
    "group-by",
    "Counting notes per user",
    explain(
      "`GROUP BY` folds the rows into one per group; `COUNT` counts within each. Combined with LEFT JOIN, you get every user and their number of notes, including 0. Count `n.id`, not `*`: COUNT of a column skips NULLs, so Cy gets 0. `COUNT(*)` would count Cy's single NULL row as 1.",
    ),
    code(
      "sql",
      "Notes per user, most first",
      [
        "SELECT u.email, COUNT(n.id) AS notes",
        "  FROM users u",
        "  LEFT JOIN notes n ON n.user_id = u.id",
        " GROUP BY u.id, u.email",
        " ORDER BY notes DESC;",
        "",
        "--  ann@x.io | 2",
        "--  bo@x.io  | 1",
        "--  cy@x.io  | 0",
      ],
      {
        1: "COUNT(n.id) skips the NULL from LEFT JOIN",
        4: "one output row per user",
        9: "kept thanks to LEFT JOIN, counted as 0",
      },
    ),
    keyPoints(
      "Every column in SELECT is grouped or inside COUNT, SUM, MAX….",
      "COUNT(column) skips NULL; COUNT(*) counts rows.",
      'pg returns COUNT as a string: "2". Use Number() if needed.',
    ),
  ),

  part(
    "many-to-many",
    "Many-to-many: notes and tags",
    explain(
      "Say notes could have tags: one note has many tags, and one tag is on many notes. That is [[many-to-many|many-to-many]], and neither table can hold the link alone. A third table, a join table, holds one row per link. Its primary key is the pair of ids, so the same tag can't be added to a note twice. The Notes App has no tags; this is how you would add them.",
    ),
    code(
      "sql",
      "Tags (not in the Notes App)",
      [
        "CREATE TABLE tags (",
        "  id SERIAL PRIMARY KEY,",
        "  name TEXT NOT NULL UNIQUE",
        ");",
        "CREATE TABLE note_tags (",
        "  note_id INTEGER NOT NULL",
        "    REFERENCES notes (id) ON DELETE CASCADE,",
        "  tag_id INTEGER NOT NULL",
        "    REFERENCES tags (id) ON DELETE CASCADE,",
        "  PRIMARY KEY (note_id, tag_id)",
        ");",
      ],
      {
        5: "the join table: one row per link",
        7: "delete a note, its links go too",
        10: "a composite key: each pair only once",
      },
    ),
    diagram([
      ["notes", "id, title"],
      ["note_tags", "note_id, tag_id"],
      ["tags", "id, name"],
    ]),
  ),

  part(
    "through",
    "Querying through the join table",
    explain(
      "To get from notes to tags you join twice: notes to note_tags, then note_tags to tags. The same pattern answers both directions: the tags on one note, or the notes with one tag. Keep the owner check, so users only ever see their own notes.",
    ),
    code(
      "sql",
      "User 3's notes tagged 'work'",
      [
        "SELECT n.id, n.title",
        "  FROM notes n",
        "  JOIN note_tags nt ON nt.note_id = n.id",
        "  JOIN tags t ON t.id = nt.tag_id",
        " WHERE t.name = $1",
        "   AND n.user_id = $2;",
      ],
      {
        3: "note → its links",
        4: "link → the tag",
        6: "still only this user's notes",
      },
    ),
  ),

  part(
    "on-delete",
    "ON DELETE: what happens to the children",
    explain(
      "A foreign key also decides what happens when the row it points at is deleted. [[on-delete-cascade|ON DELETE CASCADE]] deletes the children too. RESTRICT refuses the delete with error 23503 while children exist; the default, NO ACTION, behaves the same way. SET NULL keeps the children and empties their link, which needs a column that allows NULL.",
    ),
    reference("Deleting user 3, who has two notes", [
      [
        "ON DELETE CASCADE",
        "User and both notes are deleted. The Notes App's choice.",
        "REFERENCES users (id)\n  ON DELETE CASCADE",
      ],
      [
        "RESTRICT / default",
        "The DELETE fails (23503). Delete the notes first.",
        "REFERENCES users (id)",
      ],
      [
        "ON DELETE SET NULL",
        "User deleted; notes stay with user_id NULL.",
        "user_id INTEGER REFERENCES users (id)\n  ON DELETE SET NULL",
      ],
    ]),
    keyPoints(
      "CASCADE: the children only make sense with the parent (notes, links).",
      "RESTRICT: the children matter more; delete them on purpose first.",
      "SET NULL: keep the children, e.g. comments by a deleted user.",
    ),
    quickCheck(
      "The Notes App's `notes.user_id` is NOT NULL. Could it use ON DELETE SET NULL?",
      [
        "Yes, it works the same as CASCADE",
        "No: setting user_id to NULL breaks NOT NULL, so the delete fails",
        "Yes, and the notes are hidden automatically",
      ],
      1,
      "SET NULL writes NULL into user_id, which NOT NULL forbids, so the DELETE fails. SET NULL needs a nullable column; the Notes App wants CASCADE anyway.",
    ),
  ),

  part(
    "notes-app",
    "Why the Notes App has no JOIN",
    explain(
      "Look through notesController.js: no query joins. Every one filters notes by `user_id = $1`, and the user's id already comes from requireAuth. The browser never needs the owner's email on each note, because the owner is always the person asking. A JOIN would appear the day you add tags, or an admin page listing every note with its author.",
    ),
    inTheNotesApp(
      "`listNotes` reads only the notes table: `SELECT … FROM notes WHERE user_id = $1 ORDER BY created_at DESC`.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    inTheNotesApp(
      "The foreign key and its ON DELETE CASCADE are on `notes.user_id` in the schema.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "An ambiguous column",
      language: "sql",
      wrong: [
        "SELECT id, title, email",
        "  FROM notes n",
        "  JOIN users u ON u.id = n.user_id;",
      ],
      problem:
        'Both tables have an id column, so PostgreSQL fails with: column reference "id" is ambiguous.',
      right: [
        "SELECT n.id, n.title, u.email",
        "  FROM notes n",
        "  JOIN users u ON u.id = n.user_id;",
      ],
      why: "Prefix columns with the table or alias once two tables are involved.",
    }),
    mistake({
      title: "COUNT(*) with a LEFT JOIN",
      language: "sql",
      wrong: [
        "SELECT u.email, COUNT(*)",
        "  FROM users u",
        "  LEFT JOIN notes n ON n.user_id = u.id",
        " GROUP BY u.id, u.email;",
      ],
      problem:
        "A user with no notes still has one row (with NULLs), so they are counted as 1, not 0.",
      right: [
        "SELECT u.email, COUNT(n.id)",
        "  FROM users u",
        "  LEFT JOIN notes n ON n.user_id = u.id",
        " GROUP BY u.id, u.email;",
      ],
      why: "COUNT(column) skips NULLs, so no notes means 0.",
    }),
    mistake({
      title: "A join table without a key",
      language: "sql",
      wrong: [
        "CREATE TABLE note_tags (",
        "  note_id INTEGER, tag_id INTEGER",
        ");",
      ],
      problem:
        "The same tag can be linked to a note twice, and links can point at notes or tags that don't exist.",
      right: [
        "CREATE TABLE note_tags (",
        "  note_id INTEGER REFERENCES notes (id),",
        "  tag_id INTEGER REFERENCES tags (id),",
        "  PRIMARY KEY (note_id, tag_id)",
        ");",
      ],
      why: "Foreign keys keep links real; the composite key keeps them unique.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "An inner join",
      task: "Write `join(notes, users)`. For each note, in order, find the user whose `id` equals the note's `user_id` and return `{ title, email }`. Leave out notes with no matching user.",
      starter: [
        "function join(notes, users) {",
        "  return notes.map((n) => ({ title: n.title }));",
        "}",
      ],
      tests: [
        [
          `(() => { ${data} return join(notes, users); })()`,
          '[{ title: "Milk", email: "ann@x.io" }, { title: "Rent", email: "bo@x.io" }, { title: "Eggs", email: "ann@x.io" }]',
        ],
        [
          `(() => { ${data} return join([{ id: 9, user_id: 99, title: "Lost" }], users); })()`,
          "[]",
        ],
        [`(() => { ${data} return join(notes, []); })()`, "[]"],
      ],
      hint: "Loop over notes; `users.find((u) => u.id === n.user_id)`. Only push when a user was found.",
      solution: [
        "function join(notes, users) {",
        "  const out = [];",
        "  for (const n of notes) {",
        "    const u = users.find((u) => u.id === n.user_id);",
        "    if (u) out.push({ title: n.title, email: u.email });",
        "  }",
        "  return out;",
        "}",
      ],
    }),
    yourTurn({
      title: "LEFT JOIN and COUNT",
      task: "Write `leftJoinCount(users, notes)`. Return one `{ email, count }` per user, in the users' order, where `count` is how many notes have that user's id. Users with no notes must be there too, with `count: 0`.",
      starter: [
        "function leftJoinCount(users, notes) {",
        "  const out = [];",
        "  for (const u of users) {",
        "    const mine = notes.filter(",
        "      (n) => n.user_id === u.id);",
        "    if (mine.length) {",
        "      out.push({ email: u.email,",
        "        count: mine.length });",
        "    }",
        "  }",
        "  return out;",
        "}",
      ],
      tests: [
        [
          `(() => { ${data} return leftJoinCount(users, notes); })()`,
          '[{ email: "ann@x.io", count: 2 }, { email: "bo@x.io", count: 1 }, { email: "cy@x.io", count: 0 }]',
        ],
        [
          `(() => { ${data} return leftJoinCount(users, []).map((r) => r.count); })()`,
          "[0, 0, 0]",
        ],
        [`(() => { ${data} return leftJoinCount([], notes); })()`, "[]"],
      ],
      hint: "That `if` is what an INNER JOIN does. A LEFT JOIN pushes every user, whatever the count.",
      solution: [
        "function leftJoinCount(users, notes) {",
        "  return users.map((u) => ({",
        "    email: u.email,",
        "    count: notes.filter(",
        "      (n) => n.user_id === u.id,",
        "    ).length,",
        "  }));",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Relationships and JOIN cheat sheet", [
      [
        "One-to-many",
        "The “many” side stores the foreign key.",
        "notes.user_id → users.id",
      ],
      [
        "JOIN … ON",
        "Rows that match on both sides (INNER).",
        "FROM notes n\nJOIN users u ON u.id = n.user_id",
      ],
      ["Alias", "A short name for a table in one query.", "FROM notes n"],
      [
        "LEFT JOIN",
        "Every left row; NULLs where nothing matches.",
        "FROM users u\nLEFT JOIN notes n ON n.user_id = u.id",
      ],
      [
        "GROUP BY + COUNT",
        "One row per group. COUNT(col) skips NULL.",
        "COUNT(n.id) … GROUP BY u.id",
      ],
      [
        "Many-to-many",
        "A join table with two foreign keys.",
        "note_tags (note_id, tag_id)",
      ],
      [
        "Composite key",
        "The pair is the primary key: no duplicate links.",
        "PRIMARY KEY (note_id, tag_id)",
      ],
      ["ON DELETE CASCADE", "Delete the parent, delete the children."],
      ["RESTRICT / default", "Refuse while children exist (23503)."],
      ["ON DELETE SET NULL", "Keep the children; their link becomes NULL."],
    ]),
    quickCheck(
      "Ann has 2 notes, Bo has 0. `SELECT u.email, COUNT(n.id) FROM users u JOIN notes n ON n.user_id = u.id GROUP BY u.id, u.email`: how many rows come back?",
      ["1: only Ann", "2: Ann with 2, Bo with 0", "3: one per note plus Bo"],
      0,
      "A plain JOIN is an INNER JOIN, so Bo has no matching row and disappears before the grouping. Use LEFT JOIN to keep Bo with a count of 0.",
    ),
  ),
);
