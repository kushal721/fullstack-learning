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

// Query plans: don't guess, EXPLAIN and EXPLAIN ANALYZE, one plan line taken
// apart, scan types, listNotes without its index, rows read step by step,
// estimates and ANALYZE, common fixes, measuring and slow query logs,
// mistakes, practice and a recap.
export const queryPlansModule = moduleLesson(
  "query-plans",
  "Query plans: why is it slow?",
  50,
  [
    "Use EXPLAIN and EXPLAIN ANALYZE to see how PostgreSQL runs a query.",
    "Read a plan: Seq Scan, Index Scan, Bitmap scans, cost, rows, actual time and loops.",
    "Explain why listNotes would be slow without notes_user_id_idx.",
    "Compare estimated and actual rows, and refresh statistics with ANALYZE.",
    "Apply common fixes and measure before and after, using slow query logs.",
  ],

  part(
    "dont-guess",
    "Don't guess: ask the database",
    explain(
      "When a page gets slow and the cause is a query, it's tempting to guess and add indexes at random. PostgreSQL can tell you exactly what it does instead. Before running a query, its planner picks a [[query-plan|query plan]]: which tables to read, which indexes to use, in what order. You can ask to see that plan.",
    ),
    diagram([
      ["Your SQL", "SELECT … WHERE"],
      ["Planner", "guesses the costs"],
      ["Plan", "the cheapest way"],
      ["Executor", "runs it"],
    ]),
    keyPoints(
      "The same SQL can run very differently on 10 rows and on 10 million.",
      "The planner chooses using statistics about each table.",
      "Read the plan first, then change one thing, then measure again.",
    ),
  ),

  part(
    "explain",
    "EXPLAIN and EXPLAIN ANALYZE",
    explain(
      "Put `EXPLAIN` in front of a query, in psql or any SQL tool, and PostgreSQL shows the plan without running it, with its estimates. `EXPLAIN ANALYZE` really runs the query and adds what actually happened: real times and real row counts. That's the one you want for a slow query, but remember it really runs it.",
    ),
    code(
      "sql",
      "listNotes' query, explained",
      [
        "EXPLAIN ANALYZE",
        "SELECT id, title, content,",
        "       created_at, updated_at",
        "  FROM notes",
        " WHERE user_id = 3",
        " ORDER BY created_at DESC;",
      ],
      {
        1: "runs the query and reports how it went",
        5: "write a real value where the app sends $1",
      },
    ),
  ),

  part(
    "anatomy",
    "One line of a plan, taken apart",
    explain(
      "A plan is a tree of steps, printed with the last step at the top and indented `->` children under it. Each step shows its estimate in the first brackets and, with ANALYZE, the real numbers in the second. Costs are in made-up units, only useful for comparing; times are milliseconds.",
    ),
    anatomy(
      "A Seq Scan step",
      [
        "-> Seq Scan on notes",
        "   (cost=0.00..1943.00 rows=38 width=72)",
        "   (actual time=0.02..21.3 rows=40 loops=1)",
      ],
      [
        [
          "Seq Scan",
          "how it reads",
          "Every row of the table, one after another.",
        ],
        ["on notes", "which table", "The table this step reads."],
        [
          "cost=0.00..1943.00",
          "the guess",
          "Cost to the first row .. cost to the last. Units, not ms.",
        ],
        [
          "rows=38",
          "estimated rows",
          "How many rows the planner expected this step to return.",
        ],
        [
          "actual time=0.02..21.3",
          "the real time",
          "Milliseconds to the first row .. to the last.",
        ],
        [
          "rows=40",
          "real rows",
          "How many came back. Close to 38: a good guess.",
        ],
        [
          "loops=1",
          "how many times",
          "Inside a join a step can run many times: multiply time by loops.",
        ],
      ],
    ),
  ),

  part(
    "scans",
    "Seq Scan, Index Scan and Bitmap scans",
    explain(
      "A [[seq-scan|Seq Scan]] reads the whole table, which is right for small tables or when most rows match. An Index Scan uses an [[db-index|index]] to jump to the matching rows. A Bitmap Index Scan first collects the matches from the index, then a Bitmap Heap Scan fetches them in disk order: PostgreSQL's choice when there are a few dozen to many thousand matches.",
    ),
    reference("Step names you'll see", [
      [
        "Seq Scan",
        "Reads every row; checks each against the WHERE.",
        "Filter: (user_id = 3)",
      ],
      [
        "Index Scan",
        "Walks the index, fetches each matching row.",
        "Index Cond: (id = 7)",
      ],
      ["Index Only Scan", "Everything needed is in the index: no table read."],
      [
        "Bitmap Index / Heap Scan",
        "Collects matches from the index, then reads them in order.",
        "Recheck Cond: (user_id = 3)",
      ],
      ["Sort", "Sorts rows for ORDER BY.", "Sort Key: created_at DESC"],
      ["Limit", "Stops after n rows.", "LIMIT 20"],
      ["Nested Loop / Hash Join", "Two ways to join tables."],
    ]),
  ),

  part(
    "without-index",
    "listNotes without its index",
    explain(
      "Imagine 100,000 notes and no index on `user_id`. To find user 3's 40 notes, PostgreSQL must read all 100,000 and throw away the rest. The plan says so plainly: a Seq Scan, a Filter, and `Rows Removed by Filter: 99960`. Lots of rows removed by a filter is the classic sign of a missing index.",
    ),
    code(
      "sql",
      "The plan with no index (rewrapped to fit)",
      [
        "Sort (cost=1943.5..1943.6 rows=38)",
        " (actual time=21.4..21.4 rows=40 loops=1)",
        " Sort Key: created_at DESC",
        " -> Seq Scan on notes",
        "    (cost=0.00..1943.00 rows=38)",
        "    (actual time=0.02..21.3 rows=40 loops=1)",
        "    Filter: (user_id = 3)",
        "    Rows Removed by Filter: 99960",
        "Execution Time: 21.6 ms",
      ],
      {
        4: "reads the whole table",
        8: "99,960 rows read for nothing",
        9: "for every page load, for every user",
      },
    ),
    code(
      "sql",
      "The same query with notes_user_id_idx",
      [
        "Sort (actual time=0.12..0.13 rows=40)",
        " -> Bitmap Heap Scan on notes",
        "    (actual time=0.03..0.09 rows=40)",
        "    -> Bitmap Index Scan",
        "       on notes_user_id_idx",
        "       Index Cond: (user_id = 3)",
        "Execution Time: 0.16 ms",
      ],
      {
        6: "only user 3's rows are touched",
        7: "about 130 times faster",
      },
    ),
    inTheNotesApp(
      "`schema.sql` creates `notes_user_id_idx` because every notes query filters on `user_id`. On the seed data's two notes, though, PostgreSQL may still pick a Seq Scan: reading two rows is quicker than opening an index.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "rows-read",
    "Rows read, step by step",
    explain(
      "Here is the difference between the two plans in JavaScript. The loop is a Seq Scan: it looks at every note to find user 3's. The Map is an index: it goes straight from the user id to that user's note ids. Count how many rows each one reads.",
    ),
    trace(
      "A scan versus an index",
      [
        "const notes = [",
        "  { id: 1, user_id: 3 },",
        "  { id: 2, user_id: 5 },",
        "  { id: 3, user_id: 3 },",
        "];",
        "let read = 0;",
        "for (const n of notes) {",
        "  read++;",
        "  if (n.user_id === 3) console.log(n.id);",
        "}",
        'console.log("seq scan read", read);',
        "const idx = new Map([[3, [1, 3]], [5, [2]]]);",
        "const ids = idx.get(3);",
        'console.log("index read", ids.length);',
      ],
      [
        {
          line: 1,
          note: "The table: three notes, two of them user 3's.",
          vars: [["notes", "[{ id: 1, … }, { id: 2, … }, { id: 3, … }]"]],
        },
        {
          line: 9,
          note: "Note 1 is read. It's user 3's, so it matches.",
          vars: [
            ["notes", "[ … 3 notes ]"],
            ["read", "1"],
            ["n", "{ id: 1, user_id: 3 }"],
          ],
          output: "1",
        },
        {
          line: 9,
          note: "Note 2 is read too, then removed by the filter: it's user 5's.",
          vars: [
            ["notes", "[ … 3 notes ]"],
            ["read", "2"],
            ["n", "{ id: 2, user_id: 5 }"],
          ],
        },
        {
          line: 9,
          note: "Note 3 matches. Every row had to be read to be sure.",
          vars: [
            ["notes", "[ … 3 notes ]"],
            ["read", "3"],
            ["n", "{ id: 3, user_id: 3 }"],
          ],
          output: "3",
        },
        {
          line: 11,
          note: "The scan read all 3 rows. With 100,000 notes it reads 100,000.",
          vars: [
            ["notes", "[ … 3 notes ]"],
            ["read", "3"],
          ],
          output: "seq scan read 3",
        },
        {
          line: 12,
          note: "The index: each user id points at its notes, kept up to date on every write.",
          vars: [
            ["notes", "[ … 3 notes ]"],
            ["read", "3"],
            ["idx", "Map { 3 => [1, 3], 5 => [2] }"],
          ],
        },
        {
          line: 14,
          note: "One lookup gives exactly user 3's notes: 2 rows to fetch, however big the table.",
          vars: [
            ["notes", "[ … 3 notes ]"],
            ["read", "3"],
            ["idx", "Map { 3 => [1, 3], 5 => [2] }"],
            ["ids", "[1, 3]"],
          ],
          output: "index read 2",
        },
      ],
    ),
  ),

  part(
    "estimates",
    "Estimates, actual rows and ANALYZE",
    explain(
      "The planner picks a plan from its estimates, so compare `rows=` in the two brackets. Close numbers mean it understood the data. If it expected 1 row and got 50,000, it may have picked a plan that's terrible for 50,000. Its guesses come from statistics about each table, which go stale after a big import.",
    ),
    code(
      "sql",
      "Refresh the statistics",
      ["ANALYZE notes;", "-- then EXPLAIN ANALYZE again"],
      { 1: "samples the table and updates its statistics" },
    ),
    keyPoints(
      "ANALYZE (on its own) is not EXPLAIN ANALYZE: it gathers statistics.",
      "Autovacuum runs ANALYZE for you now and then.",
      "Run it by hand after loading or deleting lots of rows.",
    ),
  ),

  part(
    "fixes",
    "Common fixes",
    explain(
      "Most slow queries come from a few causes. Find which one the plan shows, fix it, and run EXPLAIN ANALYZE again to check the plan really changed.",
    ),
    reference("What the plan shows, and the fix", [
      [
        "Seq Scan, many rows removed",
        "Add an index on the WHERE column.",
        "CREATE INDEX ON notes (user_id);",
      ],
      [
        "LIKE '%milk%'",
        "A leading % can't use a normal index. A prefix 'milk%' can, or use full-text search.",
        "WHERE title LIKE 'milk%'",
      ],
      [
        "A function on the column",
        "lower(email) skips the index on email. Index the expression instead.",
        "CREATE INDEX ON users\n  (lower(email));",
      ],
      [
        "Sort, then Limit",
        "A composite index in the same order returns rows sorted, so it stops after 20.",
        "CREATE INDEX ON notes\n  (user_id, created_at DESC);",
      ],
      ["Estimates far off", "Refresh the statistics.", "ANALYZE notes;"],
    ]),
    quickCheck(
      "A plan shows `Seq Scan on users` with `Filter: (lower(email) = 'ana@x.io')`. There's an index on email. Why isn't it used?",
      [
        "Indexes don't work on text",
        "The index holds email, not lower(email)",
        "The table needs ANALYZE",
      ],
      1,
      "An index stores the column's values as they are. Wrapping the column in a function asks for different values, so PostgreSQL must compute lower() for every row. Index lower(email) instead.",
    ),
  ),

  part(
    "measure",
    "Measure before and after: slow query logs",
    explain(
      "You can't EXPLAIN a query you don't know is slow. Two PostgreSQL settings find them for you. `log_min_duration_statement` writes any query slower than a limit to the server log. The `pg_stat_statements` extension keeps totals for every query: how often it ran and its average time. Fix the slowest common ones, then compare the numbers again.",
    ),
    code(
      "sql",
      "Finding the slow queries",
      [
        "ALTER DATABASE notes",
        "  SET log_min_duration_statement = 200;",
        "",
        "SELECT query, calls, mean_exec_time",
        "  FROM pg_stat_statements",
        " ORDER BY mean_exec_time DESC",
        " LIMIT 5;",
      ],
      {
        2: "log every query that takes over 200 ms",
        5: "an extension: CREATE EXTENSION first",
        6: "the slowest on average, in ms",
      },
    ),
    keyPoints(
      "Hosted databases usually show these in a dashboard.",
      "A fast query run a million times can matter more than one slow one.",
      "The Notes App has no slow query logging set up: it's a server setting.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "EXPLAIN ANALYZE on a change",
      language: "sql",
      wrong: ["EXPLAIN ANALYZE", "DELETE FROM notes WHERE user_id = 3;"],
      problem:
        "ANALYZE really runs the statement: user 3's notes are now deleted.",
      right: [
        "BEGIN;",
        "EXPLAIN ANALYZE",
        "DELETE FROM notes WHERE user_id = 3;",
        "ROLLBACK;",
      ],
      why: "Inside a transaction you can measure it, then roll the change back.",
    }),
    mistake({
      title: "Judging a plan on a tiny table",
      language: "sql",
      wrong: ["-- 2 rows in dev: Seq Scan", '-- "the index doesn\'t work!"'],
      problem:
        "On a few rows a Seq Scan really is the fastest plan, so the index isn't used. That says nothing about 100,000 rows.",
      right: [
        "-- load realistic amounts of fake data,",
        "ANALYZE notes;",
        "-- then EXPLAIN ANALYZE",
      ],
      why: "Plans depend on table size: test with data shaped like production.",
    }),
    mistake({
      title: "Adding an index on every column",
      language: "sql",
      wrong: [
        "CREATE INDEX ON notes (title);",
        "CREATE INDEX ON notes (content);",
        "CREATE INDEX ON notes (updated_at);",
      ],
      problem:
        "Every INSERT and UPDATE must now update every index, and unused indexes only cost disk and time.",
      right: ["-- index what the plans of real,", "-- slow queries ask for"],
      why: "Add an index for a measured slow query, and check the plan uses it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "The biggest Seq Scan",
      task: 'A plan is a tree of steps `{ type, table, rows, children }` (`children` may be missing). Write `worstSeqScan(plan)`: return the `table` of the `"Seq Scan"` step with the most `rows`, anywhere in the tree, or `null` if there is none.',
      starter: [
        "function worstSeqScan(plan) {",
        '  return plan.type === "Seq Scan"',
        "    ? plan.table",
        "    : null;",
        "}",
      ],
      tests: [
        [
          'worstSeqScan({ type: "Hash Join", rows: 40, children: [{ type: "Seq Scan", table: "users", rows: 50 }, { type: "Seq Scan", table: "notes", rows: 100000 }] })',
          '"notes"',
        ],
        [
          'worstSeqScan({ type: "Sort", rows: 9, children: [{ type: "Limit", rows: 9, children: [{ type: "Seq Scan", table: "tags", rows: 300 }] }] })',
          '"tags"',
        ],
        [
          'worstSeqScan({ type: "Index Scan", table: "notes", rows: 40 })',
          "null",
        ],
      ],
      hint: "Visit every step with a small recursive function, remembering the biggest Seq Scan so far. Use `node.children ?? []`.",
      solution: [
        "function worstSeqScan(plan) {",
        "  let worst = null;",
        "  const visit = (node) => {",
        '    if (node.type === "Seq Scan" &&',
        "      (!worst || node.rows > worst.rows)) {",
        "      worst = node;",
        "    }",
        "    (node.children ?? []).forEach(visit);",
        "  };",
        "  visit(plan);",
        "  return worst ? worst.table : null;",
        "}",
      ],
    }),
    yourTurn({
      title: "Bad estimates",
      task: "Each step is `{ type, est, actual }` rows. Write `badEstimates(steps)`: return the types of the steps where one number is at least 10 times the other. Treat 0 as 1 so you never divide by zero.",
      starter: [
        "function badEstimates(steps) {",
        "  return steps",
        "    .filter((s) => s.est !== s.actual)",
        "    .map((s) => s.type);",
        "}",
      ],
      tests: [
        [
          'badEstimates([{ type: "Seq Scan", est: 38, actual: 40 }, { type: "Index Scan", est: 1, actual: 5000 }])',
          '["Index Scan"]',
        ],
        [
          'badEstimates([{ type: "Sort", est: 10000, actual: 12 }])',
          '["Sort"]',
        ],
        ['badEstimates([{ type: "Limit", est: 0, actual: 0 }])', "[]"],
      ],
      hint: "`Math.max(s.est, 1)` avoids zero. Then check `est / act >= 10 || act / est >= 10`.",
      solution: [
        "function badEstimates(steps) {",
        "  return steps",
        "    .filter((s) => {",
        "      const est = Math.max(s.est, 1);",
        "      const act = Math.max(s.actual, 1);",
        "      return est / act >= 10 || act / est >= 10;",
        "    })",
        "    .map((s) => s.type);",
        "}",
      ],
    }),
    yourTurn({
      title: "Can LIKE use the index?",
      task: "A normal index can help `LIKE` only when the pattern starts with plain text. Write `likeCanUseIndex(pattern)`: `false` if the pattern is empty or starts with `%` or `_` (the wildcards), otherwise `true`.",
      starter: ["function likeCanUseIndex(pattern) {", "  return true;", "}"],
      tests: [
        ['likeCanUseIndex("milk%")', "true"],
        ['likeCanUseIndex("%milk%")', "false"],
        ['likeCanUseIndex("_ilk")', "false"],
        ['likeCanUseIndex("")', "false"],
      ],
      hint: "Look at `pattern[0]`.",
      solution: [
        "function likeCanUseIndex(pattern) {",
        "  const first = pattern[0];",
        "  return first !== undefined &&",
        '    first !== "%" && first !== "_";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Query plans cheat sheet", [
      [
        "EXPLAIN",
        "Shows the plan and its estimates. Doesn't run it.",
        "EXPLAIN SELECT …",
      ],
      [
        "EXPLAIN ANALYZE",
        "Runs it and adds real times and rows.",
        "BEGIN; EXPLAIN ANALYZE DELETE …;\nROLLBACK;",
      ],
      ["Seq Scan", "Reads every row: fine when small, slow when big."],
      ["Index Scan", "Jumps to the matching rows through an index."],
      ["Bitmap scans", "Index first, then the rows in disk order."],
      ["cost / rows", "The planner's guess, in made-up units."],
      ["actual time / loops", "Real ms per run; multiply by loops."],
      ["Rows Removed by Filter", "Big number: probably a missing index."],
      [
        "ANALYZE",
        "Refreshes the statistics behind the estimates.",
        "ANALYZE notes;",
      ],
      [
        "Slow query logs",
        "Find the slow queries to explain.",
        "log_min_duration_statement\npg_stat_statements",
      ],
    ]),
    quickCheck(
      "A plan shows `Seq Scan on notes`, `Filter: (user_id = 3)`, `Rows Removed by Filter: 99960`. What's the likely fix?",
      [
        "Add LIMIT 100000",
        "An index on notes (user_id)",
        "Run the query twice",
      ],
      1,
      "PostgreSQL read 100,000 rows to keep 40. An index on the filtered column lets it go straight to user 3's rows. It's why the Notes App's schema has notes_user_id_idx.",
    ),
  ),
);
