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

// A fake pool for the exercises: one client that records every query.
const fakePool =
  "const client = { log: [], released: false, async query(sql) { this.log.push(sql); }, release() { this.released = true; } }; const pool = { async connect() { return client; } };";

// Transactions: all or nothing, BEGIN/COMMIT/ROLLBACK taken apart, ACID,
// transactions from Node.js with one client, why one client, a lost update
// step by step, isolation levels and row locks, deadlocks and short
// transactions, the Notes App, mistakes, practice and a recap.
export const transactionsModule = moduleLesson(
  "transactions",
  "Transactions: all or nothing",
  50,
  [
    "Explain why some changes must all happen or none, and group them with BEGIN and COMMIT.",
    "Describe the four ACID promises in plain words.",
    "Run a transaction from Node.js on one client from the pool, with ROLLBACK on error.",
    "Spot a lost update and prevent it with one statement or SELECT … FOR UPDATE.",
    "Know the default isolation level, what a deadlock is and why transactions stay short.",
  ],

  part(
    "why",
    "Several changes that belong together",
    explain(
      "Some jobs take more than one statement. Imagine moving note 7 to another user and writing a line in a log table to say so. If the server crashes after the first statement, the note has moved but nobody knows why. A [[db-transaction|transaction]] groups the statements so either all of them take effect or none do.",
    ),
    diagram([
      ["BEGIN", "start a draft"],
      ["UPDATE notes", "move note 7"],
      ["INSERT log", "write it down"],
      ["COMMIT", "both, at once"],
    ]),
    analogy(
      "A bank transfer: the money leaves one account and arrives in the other, or neither happens. Half a transfer is never allowed.",
    ),
  ),

  part(
    "anatomy",
    "BEGIN, COMMIT and ROLLBACK",
    anatomy(
      "Moving a note, in one transaction",
      [
        "BEGIN;",
        "UPDATE notes SET user_id = 9 WHERE id = 7;",
        "INSERT INTO note_log (note_id) VALUES (7);",
        "COMMIT;",
      ],
      [
        [
          "BEGIN",
          "start",
          "From here on, changes are a private draft that other connections can't see.",
        ],
        [
          "UPDATE",
          "first change",
          "Note 7 now belongs to user 9, in the draft.",
        ],
        [
          "INSERT",
          "second change",
          "The log line, in the same draft. note_log is an example table.",
        ],
        [
          "COMMIT",
          "save it all",
          "Both changes become real together. Until now, nothing was visible.",
        ],
      ],
    ),
    explain(
      "`ROLLBACK` instead of `COMMIT` throws the whole draft away, as if it never happened. If any statement fails inside the transaction, PostgreSQL refuses everything after it until you roll back. A crash before the commit is a rollback too: on restart, the half-done draft is gone.",
    ),
    code(
      "sql",
      "Changing your mind",
      [
        "BEGIN;",
        "DELETE FROM notes WHERE user_id = 3;",
        "-- oops, that was the wrong user",
        "ROLLBACK;",
      ],
      { 4: "the notes are all still there" },
    ),
  ),

  part(
    "acid",
    "ACID: four promises",
    explain(
      "Databases describe what a transaction guarantees with four letters, [[acid|ACID]]. You don't need to memorise them, but you'll see the word in docs and job interviews, and each letter answers a real worry.",
    ),
    reference("What ACID means", [
      ["Atomic", "All or nothing: never half a transaction.", "move + log"],
      [
        "Consistent",
        "Every rule (NOT NULL, foreign keys, UNIQUE) holds after commit.",
      ],
      [
        "Isolated",
        "Others don't see your draft; how much they're shielded is the isolation level.",
      ],
      [
        "Durable",
        "Once COMMIT returns, the change survives a crash: it's in the write-ahead log on disk.",
      ],
    ]),
    quickCheck(
      "The server loses power right after PostgreSQL answers COMMIT. What happens to the change?",
      [
        "It's lost: it was only in memory",
        "It's kept: committed means written to disk",
        "Half of it is kept",
      ],
      1,
      "That's the D in ACID: durable. PostgreSQL writes the change to its write-ahead log on disk before it says the commit is done, so it survives a crash.",
    ),
  ),

  part(
    "node",
    "A transaction from Node.js",
    explain(
      "With `pg`, a transaction must run on one connection. `pool.connect()` borrows a client and keeps it until you call `release()`. Every statement goes through that client: BEGIN, the changes, then COMMIT. If anything throws, ROLLBACK and pass the error on. `finally` gives the client back whatever happened.",
    ),
    code(
      "js",
      "Move a note and log it, all or nothing",
      [
        "const client = await pool.connect();",
        "try {",
        '  await client.query("BEGIN");',
        "  await client.query(moveSql, [7, 9]);",
        "  await client.query(logSql, [7]);",
        '  await client.query("COMMIT");',
        "} catch (err) {",
        '  await client.query("ROLLBACK");',
        "  throw err;",
        "} finally {",
        "  client.release();",
        "}",
      ],
      {
        1: "borrow one connection and keep it",
        3: "every query below uses the same client",
        8: "something failed: undo the whole draft",
        9: "the error handler still answers 500",
        11: "always give the connection back",
      },
    ),
    keyPoints(
      "pool.connect() lends one client until you release it.",
      "BEGIN, the changes and COMMIT all go through that client.",
      "catch: ROLLBACK, then throw the error on.",
      "finally: release(), or the pool slowly runs out of connections.",
    ),
  ),

  part(
    "one-client",
    "Why pool.query can't do it",
    explain(
      "A transaction belongs to one connection. `pool.query` borrows any free connection for each call and gives it straight back. So `pool.query('BEGIN')` may start a transaction on connection 1, the UPDATE may run on connection 2 with no transaction at all, and COMMIT may land somewhere else. Nothing errors; it just isn't all or nothing.",
    ),
    diagram([
      ["pool.query(BEGIN)", "connection 1"],
      ["pool.query(UPDATE)", "connection 2"],
      ["pool.query(COMMIT)", "connection 3"],
    ]),
    keyPoints(
      "One statement on its own: pool.query is perfect.",
      "Several statements together: pool.connect() and one client.",
      "Mixing them up gives no error, just changes that can end up half-done.",
    ),
  ),

  part(
    "lost-update",
    "Two requests at once: a lost update",
    explain(
      "Transactions also matter when two requests change the same row at the same moment. Each one reads a value, works out a new one in JavaScript, and writes it back. The second write is based on an old read, so the first change disappears. Follow two withdrawals of 30 from an account holding 100.",
    ),
    trace(
      "Read, then write: one change is lost",
      [
        "const row = { id: 1, balance: 100 };",
        "// Request A and request B each take 30",
        "const a = row.balance; // A reads",
        "const b = row.balance; // B reads",
        "row.balance = a - 30; // A writes",
        "row.balance = b - 30; // B writes",
        "console.log(row.balance);",
      ],
      [
        {
          line: 1,
          note: "The row in the database: 100 in the account.",
          vars: [["row", "{ id: 1, balance: 100 }"]],
        },
        {
          line: 3,
          note: "Request A reads the balance: 100.",
          vars: [
            ["row", "{ id: 1, balance: 100 }"],
            ["a", "100"],
          ],
        },
        {
          line: 4,
          note: "Before A writes, request B reads it too. It also sees 100.",
          vars: [
            ["row", "{ id: 1, balance: 100 }"],
            ["a", "100"],
            ["b", "100"],
          ],
        },
        {
          line: 5,
          note: "A writes 100 - 30 = 70. So far, so good.",
          vars: [
            ["row", "{ id: 1, balance: 70 }"],
            ["a", "100"],
            ["b", "100"],
          ],
        },
        {
          line: 6,
          note: "B writes 100 - 30 = 70 as well, from its old read. A's change is overwritten.",
          vars: [
            ["row", "{ id: 1, balance: 70 }"],
            ["a", "100"],
            ["b", "100"],
          ],
        },
        {
          line: 7,
          note: "60 was taken out, but only 30 is gone. That's a lost update.",
          vars: [
            ["row", "{ id: 1, balance: 70 }"],
            ["a", "100"],
            ["b", "100"],
          ],
          output: "70",
        },
      ],
    ),
    code(
      "sql",
      "Fix 1: one statement does the read and the write",
      [
        "UPDATE accounts",
        "   SET balance = balance - 30",
        " WHERE id = 1 AND balance >= 30",
        "RETURNING balance;",
      ],
      {
        2: "the database does the maths on the latest value",
        3: "no row changed means not enough money",
      },
    ),
  ),

  part(
    "isolation-locks",
    "Isolation levels and row locks",
    explain(
      "The [[isolation-level|isolation level]] says how much a transaction is shielded from others. PostgreSQL's default is READ COMMITTED: each statement sees whatever was committed when it started, so read-then-write can still lose updates. When the decision needs JavaScript, take a [[row-lock|row lock]] with `SELECT … FOR UPDATE`: a second request waits until the first commits.",
    ),
    code(
      "sql",
      "Fix 2: lock the row, decide, then write",
      [
        "BEGIN;",
        "SELECT balance FROM accounts",
        " WHERE id = 1 FOR UPDATE;",
        "-- the app checks: balance >= 30?",
        "UPDATE accounts",
        "   SET balance = balance - 30",
        " WHERE id = 1;",
        "COMMIT;",
      ],
      {
        3: "other FOR UPDATEs on row 1 wait here",
        8: "the lock is released; the next one reads 70",
      },
    ),
    reference("PostgreSQL's isolation levels", [
      [
        "READ COMMITTED",
        "The default. Each statement sees the latest commits.",
        "BEGIN;",
      ],
      [
        "REPEATABLE READ",
        "The whole transaction sees one snapshot. A clash fails with an error.",
        "BEGIN ISOLATION LEVEL\n  REPEATABLE READ;",
      ],
      [
        "SERIALIZABLE",
        "As if transactions ran one at a time. May fail: you retry it.",
        "BEGIN ISOLATION LEVEL\n  SERIALIZABLE;",
      ],
    ]),
  ),

  part(
    "deadlocks",
    "Deadlocks, and keeping transactions short",
    explain(
      "Request A locks row 1 and wants row 2. Request B has locked row 2 and wants row 1. Each waits for the other forever: a deadlock. PostgreSQL notices after about a second and cancels one of them with an error (code 40P01), so the other can finish. Lock rows in the same order everywhere, and retry the cancelled one.",
    ),
    keyPoints(
      "Locks are held until COMMIT or ROLLBACK, so others wait that long.",
      "Never call another API or wait for a user inside a transaction.",
      "Do the slow work first, then BEGIN, change, COMMIT quickly.",
      "Lock rows in the same order (e.g. lowest id first) to avoid deadlocks.",
    ),
  ),

  part(
    "notes-app",
    "In the Notes App",
    explain(
      "The Notes App uses no transactions, and doesn't need any. Every request runs exactly one SQL statement: one INSERT, one UPDATE or one DELETE. A single statement is already atomic: PostgreSQL wraps it in its own tiny transaction. `updateNote` writes the new title in SQL, never read-then-write in JavaScript, so there's nothing to lose.",
    ),
    inTheNotesApp(
      "Each controller in `notesController.js` sends one statement with `pool.query`. Deleting a user removes their notes too, but that's ON DELETE CASCADE inside one DELETE, not a transaction.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
    quickCheck(
      "Which new Notes App feature would need a transaction?",
      [
        "Listing a user's notes",
        "Renaming one note",
        "Copying a note to another user and logging the copy",
      ],
      2,
      "Copying the note and logging it are two statements that must happen together. Listing is a single read, and renaming is a single UPDATE, which is atomic on its own.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "BEGIN through pool.query",
      wrong: [
        'await pool.query("BEGIN");',
        "await pool.query(moveSql, [7, 9]);",
        "await pool.query(logSql, [7]);",
        'await pool.query("COMMIT");',
      ],
      problem:
        "Each call may use a different connection, so the statements aren't in one transaction. A failure halfway leaves half the change.",
      right: [
        "const client = await pool.connect();",
        'await client.query("BEGIN");',
        "// … the rest on client, then COMMIT",
      ],
      why: "A transaction lives on one connection, so every statement must use the same client.",
    }),
    mistake({
      title: "No release() on the error path",
      wrong: [
        "const client = await pool.connect();",
        'await client.query("BEGIN");',
        "await client.query(moveSql, [7, 9]);",
        'await client.query("COMMIT");',
        "client.release();",
      ],
      problem:
        "If a query throws, release() never runs and the connection is never returned. After ten errors the pool is empty and every request hangs.",
      right: [
        "try { /* BEGIN … COMMIT */ }",
        "catch (e) {",
        '  await client.query("ROLLBACK");',
        "  throw e;",
        "} finally {",
        "  client.release();",
        "}",
      ],
      why: "finally runs on success and on error, so the client always goes back.",
    }),
    mistake({
      title: "Read, change in JavaScript, write back",
      wrong: [
        "const { rows } = await pool.query(getSql);",
        "const left = rows[0].balance - 30;",
        "await pool.query(setSql, [left]);",
      ],
      problem:
        "Two requests at once both read the old balance, and one withdrawal is lost.",
      right: [
        "await pool.query(",
        '  "UPDATE accounts SET balance =" +',
        '  " balance - $1 WHERE id = $2", [30, 1]);',
      ],
      why: "One statement reads and writes the latest value; or lock it with FOR UPDATE.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "All or nothing",
      task: 'Write `transaction(db, steps)`. Each step is a function that changes the data it is given. Run every step on a copy of `db.data`. If all succeed, put the copy in `db.data` and return `"COMMIT"`. If one throws, leave `db.data` untouched and return `"ROLLBACK"`.',
      starter: [
        "function transaction(db, steps) {",
        "  for (const step of steps) step(db.data);",
        '  return "COMMIT";',
        "}",
      ],
      tests: [
        [
          '(() => { const db = { data: { notes: [{ id: 7, user_id: 3 }], log: [] } }; const r = transaction(db, [(d) => { d.notes[0].user_id = 9; }, (d) => { d.log.push("moved 7"); }]); return [r, db.data]; })()',
          '["COMMIT", { notes: [{ id: 7, user_id: 9 }], log: ["moved 7"] }]',
        ],
        [
          '(() => { const db = { data: { notes: [{ id: 7, user_id: 3 }], log: [] } }; const r = transaction(db, [(d) => { d.notes[0].user_id = 9; }, () => { throw new Error("disk full"); }]); return [r, db.data]; })()',
          '["ROLLBACK", { notes: [{ id: 7, user_id: 3 }], log: [] }]',
        ],
        [
          "(() => { const db = { data: { n: 1 } }; return [transaction(db, []), db.data]; })()",
          '["COMMIT", { n: 1 }]',
        ],
      ],
      hint: "`JSON.parse(JSON.stringify(db.data))` makes a deep copy. Run the steps on it inside try/catch.",
      solution: [
        "function transaction(db, steps) {",
        "  const draft = JSON.parse(",
        "    JSON.stringify(db.data));",
        "  try {",
        "    for (const step of steps) step(draft);",
        "  } catch {",
        '    return "ROLLBACK";',
        "  }",
        "  db.data = draft;",
        '  return "COMMIT";',
        "}",
      ],
    }),
    yourTurn({
      title: "withTransaction on one client",
      task: "Write `async withTransaction(pool, work)`. Borrow a client with `pool.connect()`, send `BEGIN`, `await work(client)`, send `COMMIT` and return work's result. If work throws, send `ROLLBACK` and throw the error again. Always call `client.release()`.",
      starter: [
        "async function withTransaction(pool, work) {",
        '  await pool.query("BEGIN");',
        "  const result = await work(pool);",
        '  await pool.query("COMMIT");',
        "  return result;",
        "}",
      ],
      tests: [
        [
          `(async () => { ${fakePool} const r = await withTransaction(pool, async (c) => { await c.query("UPDATE"); return 7; }); return [r, client.log, client.released]; })()`,
          '[7, ["BEGIN", "UPDATE", "COMMIT"], true]',
        ],
        [
          `(async () => { ${fakePool} let msg; try { await withTransaction(pool, async (c) => { await c.query("UPDATE"); throw new Error("boom"); }); } catch (e) { msg = e.message; } return [msg, client.log, client.released]; })()`,
          '["boom", ["BEGIN", "UPDATE", "ROLLBACK"], true]',
        ],
      ],
      hint: "`const client = await pool.connect();` then try { … } catch (err) { ROLLBACK; throw err; } finally { client.release(); }.",
      solution: [
        "async function withTransaction(pool, work) {",
        "  const client = await pool.connect();",
        "  try {",
        '    await client.query("BEGIN");',
        "    const result = await work(client);",
        '    await client.query("COMMIT");',
        "    return result;",
        "  } catch (err) {",
        '    await client.query("ROLLBACK");',
        "    throw err;",
        "  } finally {",
        "    client.release();",
        "  }",
        "}",
      ],
    }),
    yourTurn({
      title: "Spot a lost update",
      task: 'Events like `"A read"` and `"B write"` happen in order on one row. Write `lostUpdate(events)`: return `true` if a request writes after a different request has written since its own read (so it overwrote a change it never saw), otherwise `false`.',
      starter: ["function lostUpdate(events) {", "  return false;", "}"],
      tests: [
        ['lostUpdate(["A read", "B read", "A write", "B write"])', "true"],
        ['lostUpdate(["A read", "A write", "B read", "B write"])', "false"],
        ['lostUpdate(["A read", "B read", "B write", "A write"])', "true"],
        ['lostUpdate(["A read", "B read", "A write"])', "false"],
      ],
      hint: "Remember the index of each request's last read, and who wrote last and when. A write is lost-update if someone else wrote after this request's read.",
      solution: [
        "function lostUpdate(events) {",
        "  const readAt = {};",
        "  let last = null; // the last write",
        "  for (let i = 0; i < events.length; i++) {",
        '    const [who, op] = events[i].split(" ");',
        '    if (op === "read") {',
        "      readAt[who] = i;",
        "      continue;",
        "    }",
        "    if (last && last.who !== who &&",
        "      last.at > readAt[who]) return true;",
        "    last = { who, at: i };",
        "  }",
        "  return false;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Transactions cheat sheet", [
      ["BEGIN", "Start a transaction: changes are a private draft.", "BEGIN;"],
      ["COMMIT", "Make every change real, together.", "COMMIT;"],
      ["ROLLBACK", "Throw the whole draft away.", "ROLLBACK;"],
      [
        "ACID",
        "Atomic, consistent, isolated, durable.",
        "all or nothing, kept after commit",
      ],
      [
        "One client",
        "Transactions need pool.connect(), not pool.query.",
        "const client = await pool.connect();",
      ],
      [
        "Always release",
        "In finally, on success and on error.",
        "finally { client.release(); }",
      ],
      [
        "Lost update",
        "Two read-then-writes: one change vanishes.",
        "SET balance = balance - 30",
      ],
      [
        "Row lock",
        "Others wait until you commit.",
        "SELECT … WHERE id = 1\n  FOR UPDATE;",
      ],
      [
        "Isolation level",
        "READ COMMITTED by default; SERIALIZABLE may need a retry.",
      ],
      ["Keep it short", "No API calls or waiting inside BEGIN … COMMIT."],
    ]),
    quickCheck(
      "Why does a transaction in Node.js use `pool.connect()` instead of `pool.query`?",
      [
        "pool.query can't run BEGIN",
        "Each pool.query may use a different connection, and a transaction lives on one",
        "pool.connect() is faster",
      ],
      1,
      "pool.query borrows any free connection per call. BEGIN, the changes and COMMIT must all run on the same connection, so you borrow one client and keep it until release().",
    ),
  ),
);
