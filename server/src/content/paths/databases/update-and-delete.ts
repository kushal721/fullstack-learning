import {
  anatomy,
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

// Sample rows for the exercises: two notes, owned by users 3 and 4.
const notes =
  'const notes = [{ id: 1, user_id: 3, title: "Milk" }, { id: 2, user_id: 4, title: "Rent" }];';

// UPDATE and DELETE: changing rows, removing rows, why WHERE matters, only
// your own rows, rowCount and the 404, the update step by step, deleting a
// user (cascade), soft delete, testing a change before you make it,
// mistakes, practice and a recap.
export const updateAndDeleteModule = moduleLesson(
  "update-and-delete",
  "UPDATE and DELETE",
  45,
  [
    "Change rows with UPDATE … SET … WHERE and remove them with DELETE FROM … WHERE.",
    "Explain why an UPDATE or DELETE without WHERE changes every row.",
    "Scope every change by owner, and use rowCount to answer 404.",
    "Describe ON DELETE CASCADE and soft delete as ways to handle deleted data.",
    "Try a risky statement safely: SELECT first, or inside BEGIN … ROLLBACK.",
  ],

  part(
    "changing-rows",
    "Changing and removing rows",
    explain(
      "SELECT reads rows and INSERT adds them. The other two letters of CRUD are [[sql-update-delete|UPDATE and DELETE]]. UPDATE changes some columns of rows that already exist; the columns you don't name keep their values. DELETE removes whole rows, for good: there is no recycle bin. Both use [[sql-where|WHERE]] to pick which rows.",
    ),
    code(
      "sql",
      "Rename note 7, then delete note 8",
      [
        "UPDATE notes",
        "   SET title = 'Groceries'",
        " WHERE id = 7;",
        "",
        "DELETE FROM notes",
        " WHERE id = 8;",
      ],
      {
        2: "only title changes; content stays as it was",
        3: "which rows: just the one with id 7",
        5: "DELETE takes no column list: whole rows go",
      },
    ),
    keyPoints(
      "UPDATE table SET column = value, … WHERE condition.",
      "DELETE FROM table WHERE condition.",
      "SET can change several columns, separated by commas.",
      "psql answers with a count: UPDATE 1, DELETE 1.",
    ),
  ),

  part(
    "anatomy",
    "updateNote's UPDATE, taken apart",
    explain(
      "This is the query `updateNote` sends. The values arrive as `$1` to `$4`; the next module shows how. It sets the new title and content, stamps the edit time, and only touches the note if both its id and its owner match.",
    ),
    anatomy(
      "The UPDATE in notesController.js",
      [
        "UPDATE notes",
        "SET title = $1, content = $2,",
        "  updated_at = now()",
        "WHERE id = $3 AND user_id = $4",
      ],
      [
        ["UPDATE notes", "which table", "Rows in notes will change."],
        [
          "title = $1, content = $2",
          "the new values",
          "Columns not listed (id, user_id, created_at) stay as they are.",
        ],
        [
          "updated_at = now()",
          "edit time",
          "The database's clock, not the browser's, so it is always right.",
        ],
        ["id = $3", "this note", "The id from the URL."],
        [
          "AND user_id = $4",
          "and it's yours",
          "The logged-in user's id. Someone else's note is never matched.",
        ],
      ],
    ),
    inTheNotesApp(
      "The real query ends with `RETURNING id, title, content, created_at, updated_at`, so the changed note comes back in the same trip.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "where",
    "Forget WHERE, change every row",
    explain(
      "WHERE is optional in SQL. Leave it out and the statement applies to every row in the table. `UPDATE notes SET title = 'Groceries'` renames every note of every user. `DELETE FROM notes` empties the table. The database doesn't ask “are you sure?”, and there is no undo.",
    ),
    code(
      "sql",
      "Spot the difference",
      [
        "-- one note",
        "DELETE FROM notes WHERE id = 8;",
        "",
        "-- EVERY note, of every user",
        "DELETE FROM notes;",
      ],
      {
        2: "psql: DELETE 1",
        5: "psql: DELETE 4812",
      },
    ),
    quickCheck(
      "You run `UPDATE notes SET content = ''` in psql. What happens?",
      [
        "psql refuses because there is no WHERE",
        "Only the newest note is emptied",
        "The content of every note in the table is emptied",
      ],
      2,
      "Without WHERE the UPDATE matches every row. SQL has no safety catch for this, so you write the WHERE first.",
    ),
  ),

  part(
    "owner",
    "Only your own rows",
    explain(
      "The id in `PUT /api/notes/7` comes from the URL, and anyone can type any number there. If the query said only `WHERE id = $1`, user 3 could edit user 4's note just by guessing its id. So every change also says `AND user_id = $2`, with the id that requireAuth read from the login cookie. A note that isn't yours simply doesn't match.",
    ),
    code(
      "sql",
      "The DELETE in deleteNote",
      ["DELETE FROM notes", " WHERE id = $1", "   AND user_id = $2"],
      {
        2: "the note id from the URL",
        3: "the logged-in user, never from the body",
      },
    ),
    keyPoints(
      "Every notes query in the Notes App includes user_id = $n.",
      "The owner's id comes from req.user.id, not from the request.",
      "The rule lives in the SQL, so it can't be skipped by accident.",
    ),
  ),

  part(
    "rowcount",
    "rowCount and the 404",
    explain(
      "Every query result from pg has `rowCount`: how many rows the statement matched. For an UPDATE or DELETE it is the number changed or removed, the same number psql prints. If it is 0, the note doesn't exist, or it isn't yours. The Notes App answers 404 for both, so nobody can find out which note ids exist.",
    ),
    code(
      "js",
      "deleteNote, after the query",
      [
        "const result = await pool.query(",
        '  "DELETE FROM notes WHERE id = $1" +',
        '    " AND user_id = $2",',
        "  [id, req.user.id],",
        ");",
        "if (result.rowCount === 0) {",
        "  return res.status(404)",
        '    .json({ error: "Note not found" });',
        "}",
        "res.status(204).end();",
      ],
      {
        6: "nothing matched: missing, or someone else's",
        10: "one row deleted: 204 No Content",
      },
    ),
    inTheNotesApp(
      "`updateNote` and `deleteNote` both check `result.rowCount === 0` and answer 404 with the same message.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "step-by-step",
    "An UPDATE, step by step",
    explain(
      "Here is what the database does for `UPDATE … WHERE id = $2 AND user_id = $3`, written as JavaScript over an array of rows. User 3 tries to rename note 2, which belongs to user 4.",
    ),
    trace(
      "An UPDATE as a loop over rows",
      [
        "function update(rows, id, uid, title) {",
        "  let rowCount = 0;",
        "  for (const row of rows) {",
        "    if (row.id === id &&",
        "        row.user_id === uid) {",
        "      row.title = title;",
        "      rowCount++;",
        "    }",
        "  }",
        "  return { rowCount };",
        "}",
        "const rows = [{ id: 1, user_id: 3 },",
        "  { id: 2, user_id: 4 }];",
        'const r = update(rows, 2, 3, "Mine");',
      ],
      [
        {
          line: 12,
          note: "The table: note 1 is user 3's, note 2 is user 4's.",
          vars: [["rows", "[{ id: 1, … }, { id: 2, … }]"]],
        },
        {
          line: 14,
          note: "User 3 asks to rename note 2.",
          vars: [["rows", "[{ id: 1, … }, { id: 2, … }]"]],
        },
        {
          line: 2,
          note: "Nothing changed yet.",
          vars: [
            ["rows", "[{ id: 1, … }, { id: 2, … }]"],
            ["id", "2"],
            ["uid", "3"],
            ["title", '"Mine"'],
            ["rowCount", "0"],
          ],
          stack: ["update"],
        },
        {
          line: 4,
          note: "Row 1: its id is 1, not 2. No match.",
          vars: [
            ["rows", "[{ id: 1, … }, { id: 2, … }]"],
            ["id", "2"],
            ["uid", "3"],
            ["title", '"Mine"'],
            ["rowCount", "0"],
            ["row", "{ id: 1, user_id: 3 }"],
          ],
          stack: ["update"],
        },
        {
          line: 5,
          note: "Row 2: the id matches, but its owner is 4, not 3. No match.",
          vars: [
            ["rows", "[{ id: 1, … }, { id: 2, … }]"],
            ["id", "2"],
            ["uid", "3"],
            ["title", '"Mine"'],
            ["rowCount", "0"],
            ["row", "{ id: 2, user_id: 4 }"],
          ],
          stack: ["update"],
        },
        {
          line: 10,
          note: "No row changed. User 4's note is safe.",
          vars: [
            ["rows", "[{ id: 1, … }, { id: 2, … }]"],
            ["id", "2"],
            ["uid", "3"],
            ["title", '"Mine"'],
            ["rowCount", "0"],
          ],
          stack: ["update"],
        },
        {
          line: 14,
          note: "rowCount is 0, so the controller answers 404 Note not found.",
          vars: [
            ["rows", "[{ id: 1, … }, { id: 2, … }]"],
            ["r", "{ rowCount: 0 }"],
          ],
        },
      ],
    ),
  ),

  part(
    "deleting-users",
    "Deleting a row others point at",
    explain(
      "Notes point at users through the foreign key `user_id`. So what happens to a user's notes when the user is deleted? The schema decides. The Notes App says `ON DELETE CASCADE`: deleting the user deletes their notes too. Without it, PostgreSQL would refuse to delete a user who still has notes. The Intermediate module on joins covers all the options.",
    ),
    code(
      "sql",
      "In schema.sql, and what it does",
      [
        "user_id INTEGER NOT NULL",
        "  REFERENCES users (id)",
        "  ON DELETE CASCADE,",
        "",
        "-- removes user 3 AND all their notes",
        "DELETE FROM users WHERE id = 3;",
      ],
      {
        3: "deleting the user takes their notes with it",
      },
    ),
    inTheNotesApp(
      "The Notes App has no “delete my account” route yet, but the schema is ready for one: a single DELETE on users would remove the notes too.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "soft-delete",
    "Soft delete: hide instead of remove",
    explain(
      "DELETE is final. Some apps want a trash can instead: “undo”, or keeping records for a while. The usual way is a soft delete: add a `deleted_at` column, set it instead of deleting, and make every read skip rows where it is set. The cost: every query must remember `deleted_at IS NULL`. The Notes App doesn't do this; its deletes are real.",
    ),
    code(
      "sql",
      "Soft delete (not in the Notes App)",
      [
        "ALTER TABLE notes",
        "  ADD COLUMN deleted_at TIMESTAMPTZ;",
        "",
        "UPDATE notes SET deleted_at = now()",
        " WHERE id = $1 AND user_id = $2;",
        "",
        "SELECT id, title FROM notes",
        " WHERE user_id = $1",
        "   AND deleted_at IS NULL;",
      ],
      {
        2: "NULL means “not deleted”",
        4: "“delete” is now an UPDATE",
        9: "every read must skip the hidden rows",
      },
    ),
  ),

  part(
    "safely",
    "Try it before you run it",
    explain(
      "Before you change rows by hand in psql, run a SELECT with the same WHERE and look at what comes back: those are exactly the rows the UPDATE or DELETE will hit. Or wrap the change in `BEGIN` … `ROLLBACK`: you see the count, and ROLLBACK throws the change away. Only when the count is right do you run it again with `COMMIT`.",
    ),
    code(
      "sql",
      "A dry run in psql",
      [
        "SELECT id, title FROM notes",
        " WHERE user_id = 3;  -- 2 rows",
        "",
        "BEGIN;",
        "DELETE FROM notes WHERE user_id = 3;",
        "-- DELETE 2: the count you expected?",
        "ROLLBACK;  -- nothing was deleted",
      ],
      {
        1: "same WHERE as the change: these rows",
        4: "start a transaction",
        7: "undo it all; COMMIT would keep it",
      },
    ),
    keyPoints(
      "SELECT with the same WHERE shows which rows will change.",
      "BEGIN … ROLLBACK lets you see the count, then undo.",
      "Transactions get a full module in the Advanced level.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "No WHERE",
      language: "sql",
      wrong: ["UPDATE notes", "   SET title = 'Groceries';"],
      problem: "Every note in the table, of every user, is renamed.",
      right: [
        "UPDATE notes",
        "   SET title = 'Groceries'",
        " WHERE id = 7 AND user_id = 3;",
      ],
      why: "WHERE picks the rows. Write it first, then the SET.",
    }),
    mistake({
      title: "Matching on the note id only",
      language: "sql",
      wrong: ["DELETE FROM notes WHERE id = $1;"],
      problem:
        "Anyone logged in can delete any note by putting its id in the URL.",
      right: ["DELETE FROM notes", " WHERE id = $1 AND user_id = $2;"],
      why: "The owner check belongs in the WHERE, with the id from requireAuth.",
    }),
    mistake({
      title: "Ignoring rowCount",
      wrong: [
        "const result = await pool.query(upd, vals);",
        "res.json(result.rows[0]);",
      ],
      problem:
        "When nothing matched, rows[0] is undefined and the client gets a 200 with no note instead of a 404.",
      right: [
        "if (result.rowCount === 0) {",
        "  return res.status(404).json(gone);",
        "}",
        "res.json(result.rows[0]);",
      ],
      why: "rowCount 0 means not found, or not yours: answer 404.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "An UPDATE with an owner",
      task: "Write `update(rows, id, userId, changes)`. For each row whose `id` and `user_id` both match, copy every field of `changes` onto it. Return `{ rows, rowCount }`: the changed rows and how many there were.",
      starter: [
        "function update(rows, id, userId, changes) {",
        "  const hit = rows.filter((r) => r.id === id);",
        "  hit.forEach((r) => Object.assign(r, changes));",
        "  return { rows: hit, rowCount: hit.length };",
        "}",
      ],
      tests: [
        [
          `(() => { ${notes} const r = update(notes, 1, 3, { title: "Eggs" }); return [r.rowCount, notes[0].title]; })()`,
          '[1, "Eggs"]',
        ],
        [
          `(() => { ${notes} const r = update(notes, 1, 3, { title: "Eggs" }); return r.rows; })()`,
          '[{ id: 1, user_id: 3, title: "Eggs" }]',
        ],
        [
          `(() => { ${notes} const r = update(notes, 2, 3, { title: "Mine" }); return [r.rowCount, r.rows, notes[1].title]; })()`,
          '[0, [], "Rent"]',
        ],
      ],
      hint: "Filter on `r.id === id && r.user_id === userId`, then `Object.assign(r, changes)` on each match.",
      solution: [
        "function update(rows, id, userId, changes) {",
        "  const hit = rows.filter(",
        "    (r) => r.id === id && r.user_id === userId,",
        "  );",
        "  hit.forEach((r) => Object.assign(r, changes));",
        "  return { rows: hit, rowCount: hit.length };",
        "}",
      ],
    }),
    yourTurn({
      title: "A DELETE with an owner",
      task: "Write `remove(rows, id, userId)`. Return `{ rows, rowCount }`, where `rows` is a new array without the matching rows (same `id` and `user_id`), and `rowCount` is how many were removed.",
      starter: [
        "function remove(rows, id, userId) {",
        "  const kept = rows.filter((r) => r.id !== id);",
        "  return { rows: kept, rowCount: 1 };",
        "}",
      ],
      tests: [
        [
          `(() => { ${notes} const r = remove(notes, 1, 3); return [r.rowCount, r.rows.map((n) => n.id)]; })()`,
          "[1, [2]]",
        ],
        [
          `(() => { ${notes} const r = remove(notes, 2, 3); return [r.rowCount, r.rows.length]; })()`,
          "[0, 2]",
        ],
        [`(() => { ${notes} return remove(notes, 9, 3).rowCount; })()`, "0"],
      ],
      hint: "A row is removed when `r.id === id && r.user_id === userId`. rowCount is the old length minus the new one.",
      solution: [
        "function remove(rows, id, userId) {",
        "  const kept = rows.filter(",
        "    (r) => !(r.id === id && r.user_id === userId),",
        "  );",
        "  return {",
        "    rows: kept,",
        "    rowCount: rows.length - kept.length,",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("UPDATE and DELETE cheat sheet", [
      [
        "UPDATE … SET … WHERE",
        "Change columns of matching rows.",
        "UPDATE notes SET title = $1\n WHERE id = $2 AND user_id = $3",
      ],
      [
        "DELETE FROM … WHERE",
        "Remove matching rows, for good.",
        "DELETE FROM notes\n WHERE id = $1 AND user_id = $2",
      ],
      [
        "No WHERE",
        "Every row in the table. Almost never what you want.",
        "DELETE FROM notes; -- all of them",
      ],
      [
        "Owner check",
        "AND user_id = the logged-in user, in every query.",
        "WHERE id = $3 AND user_id = $4",
      ],
      [
        "rowCount",
        "How many rows matched. 0 → answer 404.",
        "if (result.rowCount === 0) …",
      ],
      ["updated_at = now()", "Stamp the edit time with the database's clock."],
      [
        "ON DELETE CASCADE",
        "Deleting a user deletes their notes too.",
        "REFERENCES users (id) ON DELETE CASCADE",
      ],
      [
        "Soft delete",
        "Set deleted_at instead; reads skip those rows.",
        "SET deleted_at = now()",
      ],
      [
        "Dry run",
        "SELECT with the same WHERE, or BEGIN … ROLLBACK.",
        "BEGIN; DELETE …; ROLLBACK;",
      ],
    ]),
    quickCheck(
      "User 3 sends `DELETE /api/notes/12`, but note 12 belongs to user 5. What happens?",
      [
        "Note 12 is deleted",
        "The DELETE matches no row, rowCount is 0, and the answer is 404",
        "PostgreSQL throws an error and the answer is 500",
      ],
      1,
      "The WHERE says id = 12 AND user_id = 3. No row has both, so nothing is deleted and deleteNote answers 404, the same as for a note that doesn't exist.",
    ),
  ),
);
