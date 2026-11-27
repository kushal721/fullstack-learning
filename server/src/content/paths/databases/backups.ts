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

// Backups and recovery: what can go wrong, pg_dump taken apart, restoring
// with pg_restore and psql, hosted snapshots, point-in-time recovery and a
// replay step by step, where and how many, RPO and RTO, testing restores,
// no production data in development, a plan for the Notes App, mistakes,
// practice and a recap.
export const backupsModule = moduleLesson(
  "backups",
  "Backups and recovery",
  45,
  [
    "Name what can destroy data, from a bad DELETE to a lost disk.",
    "Back up and restore a database with pg_dump, pg_restore and psql.",
    "Explain snapshots and point-in-time recovery with the write-ahead log.",
    "Choose where and how many backups to keep, using RPO and RTO.",
    "Test restores regularly and keep production data out of development.",
  ],

  part(
    "what-goes-wrong",
    "What can go wrong",
    explain(
      "Disks are reliable and PostgreSQL is careful, yet data still gets lost. Most often by people: a DELETE without its WHERE, a bug that saves empty titles for a week, a migration that drops the wrong column. Sometimes by machines: a disk dies, a server is deleted, an account is closed. A [[db-backup|backup]] is the copy you restore from when that happens.",
    ),
    keyPoints(
      "A bad statement: DELETE FROM notes; with no WHERE.",
      "A bug that quietly writes wrong data for days.",
      "A lost disk or server, or a database deleted by mistake.",
      "Durable (the D in ACID) protects against crashes, not against mistakes.",
    ),
    analogy(
      "A spare house key kept at a friend's. One under your own doormat burns with the house.",
    ),
  ),

  part(
    "pg-dump",
    "pg_dump: the database in a file",
    explain(
      "`pg_dump` comes with PostgreSQL. It connects like any client and writes every table's structure and rows to one file, while the app keeps running: it sees one consistent moment, even if writes happen meanwhile. The custom format (`-Fc`) is compressed and lets you restore only some tables.",
    ),
    anatomy(
      "A backup of the Notes App's database",
      ['pg_dump -Fc -f notes.dump "$DATABASE_URL"'],
      [
        ["pg_dump", "the tool", "Installed with PostgreSQL, like psql."],
        [
          "-Fc",
          "custom format",
          "Compressed, restored with pg_restore. Leave it out for plain SQL.",
        ],
        ["-f notes.dump", "the file", "Where the copy is written."],
        [
          '"$DATABASE_URL"',
          "which database",
          "The same connection string the backend uses.",
        ],
      ],
    ),
  ),

  part(
    "restore",
    "Restoring: pg_restore and psql",
    explain(
      "A custom-format dump goes back in with `pg_restore`. A plain SQL dump is just a long SQL file, so [[psql]] replays it with `-f`, the same way `schema.sql` is run. Restore into a new, empty database, check it, then point the app at it: never straight over the only copy you still have.",
    ),
    code(
      "bash",
      "Two ways back",
      [
        "# a custom-format dump",
        "pg_restore --no-owner \\",
        '  -d "$RESTORE_URL" notes.dump',
        "",
        "# a plain SQL dump",
        'pg_dump -f notes.sql "$DATABASE_URL"',
        'psql "$RESTORE_URL" -f notes.sql',
      ],
      {
        2: "--no-owner: don't need the same login names",
        3: "a new, empty database",
        7: "runs every statement in the file",
      },
    ),
  ),

  part(
    "snapshots-pitr",
    "Snapshots and point-in-time recovery",
    explain(
      "Hosted databases take an automatic snapshot every day and keep it for a few days. But a daily copy loses everything since. PostgreSQL also writes every change to its write-ahead log (WAL) before it's committed. [[point-in-time-recovery|Point-in-time recovery]] restores a base backup, then replays the WAL up to any moment you choose, such as one minute before a bad DELETE.",
    ),
    diagram([
      ["Base backup", "Sunday 02:00"],
      ["Replay the WAL", "every change since"],
      ["Stop at 14:02", "just before the DELETE"],
      ["Restored", "a new database"],
    ]),
    keyPoints(
      "Hosted PostgreSQL offers it as a setting, usually for 7 or more days.",
      "Restoring usually creates a new database; you switch the app to it.",
      "Running it yourself means archiving WAL files somewhere safe.",
    ),
  ),

  part(
    "replay",
    "Replaying the log, step by step",
    explain(
      "Here is point-in-time recovery in miniature. The base backup has 2 notes. The log lists every change after it, and at 09:12 someone deleted 4 notes by mistake. Replay the changes up to 09:11 and stop.",
    ),
    trace(
      "Restore to 09:11",
      [
        'const base = { at: "09:00", notes: 2 };',
        "const wal = [",
        '  { at: "09:05", change: 1 },',
        '  { at: "09:09", change: 1 },',
        '  { at: "09:12", change: -4 }, // DELETE',
        "];",
        'const target = "09:11";',
        "let notes = base.notes;",
        "for (const e of wal) {",
        "  if (e.at > target) break;",
        "  notes += e.change;",
        "}",
        "console.log(notes);",
      ],
      [
        {
          line: 1,
          note: "The base backup, taken at 09:00, with 2 notes.",
          vars: [["base", '{ at: "09:00", notes: 2 }']],
        },
        {
          line: 7,
          note: "Every change since, from the WAL, and the moment to stop at.",
          vars: [
            ["base", '{ at: "09:00", notes: 2 }'],
            ["wal", "[ … 3 changes ]"],
            ["target", '"09:11"'],
          ],
        },
        {
          line: 8,
          note: "Start from the backup.",
          vars: [
            ["base", '{ at: "09:00", notes: 2 }'],
            ["wal", "[ … 3 changes ]"],
            ["target", '"09:11"'],
            ["notes", "2"],
          ],
        },
        {
          line: 11,
          note: "09:05 is before the target: a note was added. Replay it.",
          vars: [
            ["base", '{ at: "09:00", notes: 2 }'],
            ["wal", "[ … 3 changes ]"],
            ["target", '"09:11"'],
            ["notes", "3"],
            ["e", '{ at: "09:05", change: 1 }'],
          ],
        },
        {
          line: 11,
          note: "09:09 too. Now 4 notes.",
          vars: [
            ["base", '{ at: "09:00", notes: 2 }'],
            ["wal", "[ … 3 changes ]"],
            ["target", '"09:11"'],
            ["notes", "4"],
            ["e", '{ at: "09:09", change: 1 }'],
          ],
        },
        {
          line: 10,
          note: "09:12 is after the target: that's the bad DELETE. Stop before it.",
          vars: [
            ["base", '{ at: "09:00", notes: 2 }'],
            ["wal", "[ … 3 changes ]"],
            ["target", '"09:11"'],
            ["notes", "4"],
            ["e", '{ at: "09:12", change: -4 }'],
          ],
        },
        {
          line: 13,
          note: "All 4 notes are back, including the two written after the backup.",
          vars: [
            ["base", '{ at: "09:00", notes: 2 }'],
            ["wal", "[ … 3 changes ]"],
            ["target", '"09:11"'],
            ["notes", "4"],
          ],
          output: "4",
        },
      ],
    ),
  ),

  part(
    "where-how-many",
    "Keep them elsewhere, keep several",
    explain(
      "A backup on the same server dies with the server, and one in the same cloud account goes when the account does. Keep a copy somewhere separate. Keep several too: a bug found a week late needs a backup from before it started. A common pattern is daily backups for a week and weekly ones for a month.",
    ),
    keyPoints(
      "Another place: different storage, region or account.",
      "Several ages: last night's won't help with a week-old bug.",
      "Encrypted, and readable by as few people as possible.",
      "Old backups deleted on a schedule, not forgotten forever.",
    ),
  ),

  part(
    "rpo-rto",
    "RPO and RTO: how much, how long",
    explain(
      "Two numbers decide how good your backups must be. RPO (recovery point objective) is how much recent data you can afford to lose: with daily backups, up to a day. RTO (recovery time objective) is how long you can afford to be down while restoring. A hobby app may accept a day and a few hours; a shop may need minutes for both.",
    ),
    reference("Which setup gives what", [
      [
        "Nightly pg_dump",
        "RPO: up to 24 hours. RTO: as long as the restore takes.",
      ],
      ["Daily snapshots", "RPO: up to 24 hours. RTO: minutes to an hour."],
      [
        "Point-in-time recovery",
        "RPO: seconds to minutes. RTO: minutes to an hour.",
      ],
      [
        "A live replica",
        "Takes over in seconds, but copies a bad DELETE too: not a backup.",
      ],
    ]),
    quickCheck(
      "Backups run every night at 02:00. The disk dies at 17:00. With an RPO of one hour, is this enough?",
      [
        "Yes: there's a backup from today",
        "No: up to 15 hours of changes are lost",
        "Yes, if the restore is fast",
      ],
      1,
      "Everything written between 02:00 and 17:00 is gone, far more than the one hour allowed. You'd need point-in-time recovery or far more frequent backups. A fast restore helps the RTO, not the RPO.",
    ),
  ),

  part(
    "test-restores",
    "Test your restores",
    explain(
      "A backup you've never restored is a hope, not a backup. Files turn out empty, the wrong database was dumped, or nobody knows the steps under pressure. Restore into a scratch database on a schedule, say monthly, check it has your data, and time it: that time is your real RTO. Write the steps down while you do it.",
    ),
    code(
      "bash",
      "A restore drill",
      [
        "createdb notes_restore_test",
        "pg_restore --no-owner \\",
        "  -d notes_restore_test notes.dump",
        "psql notes_restore_test \\",
        '  -c "SELECT count(*) FROM notes;"',
      ],
      {
        1: "a fresh, empty database for the test",
        5: "about the number you expect? It worked.",
      },
    ),
  ),

  part(
    "no-prod-in-dev",
    "Never use production data in development",
    explain(
      "Restoring last night's backup onto your laptop to chase a bug is tempting. Don't. Production holds real people's emails and notes, and laptops get lost, logs get shared and test emails get sent. Use seed data and fake data instead. If you truly need production's shape, use a copy with every personal detail replaced, made by a careful script.",
    ),
    inTheNotesApp(
      "`seed.sql` says it plainly: development data only, and never real passwords or production data in a seed file. It creates one demo user and two notes.",
      { fileId: "database/seed.sql" },
    ),
  ),

  part(
    "notes-app-plan",
    "A minimal plan for the Notes App",
    explain(
      "The Notes App has no backups set up at all. `schema.sql` can rebuild empty tables and `seed.sql` a demo user, but neither brings back anyone's notes. Deployed for real, a small plan would cover it: one automatic copy, one separate copy, and a tested way back.",
    ),
    reference("Backups for a small app", [
      [
        "Hosted PostgreSQL",
        "Turn on daily snapshots and point-in-time recovery for 7 days.",
      ],
      [
        "Nightly pg_dump",
        "To storage in another account; keep 7 daily, 4 weekly.",
        'pg_dump -Fc -f "notes-$(date +%F).dump" \\\n  "$DATABASE_URL"',
      ],
      [
        "Monthly drill",
        "Restore into a scratch database, count rows, time it.",
      ],
      [
        "A written runbook",
        "The steps to restore, where the backups are, who can reach them.",
      ],
    ]),
    inTheNotesApp(
      "`schema.sql` creates the tables, empty. It's how you rebuild the structure, not the data.",
      { fileId: "database/schema.sql" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "The backup lives next to the database",
      language: "bash",
      wrong: ["pg_dump -Fc -f /var/lib/db/notes.dump \\", '  "$DATABASE_URL"'],
      problem:
        "The dump is on the same disk as the database. When the disk dies, both go together.",
      right: [
        'pg_dump -Fc -f notes.dump "$DATABASE_URL"',
        "# then copy it to storage elsewhere",
      ],
      why: "A backup must survive whatever destroys the database.",
    }),
    mistake({
      title: "Never trying a restore",
      language: "bash",
      wrong: ["# backups run every night", "# (nobody has ever restored one)"],
      problem:
        "On the bad day you find the files are empty, or the steps don't work, while the app is down.",
      right: [
        "createdb notes_restore_test",
        "pg_restore -d notes_restore_test \\",
        "  notes.dump",
      ],
      why: "Only a tested restore proves the backup works, and tells you how long it takes.",
    }),
    mistake({
      title: "Production copied to a laptop",
      language: "bash",
      wrong: ['pg_dump "$PROD_URL" | psql notes_dev'],
      problem:
        "Real users' emails and notes now sit on a laptop, in its backups and in any logs or screenshots.",
      right: ["psql notes_dev -f database/seed.sql"],
      why: "Development uses seed or fake data, never real people's data.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Which backups to keep",
      task: 'Dates are `"YYYY-MM-DD"` strings. Write `backupsToKeep(dates, today)`: keep a backup if it is less than 7 days old, or less than 28 days old and its age in days is a multiple of 7 (a weekly one). Return them in the order given.',
      starter: [
        "function backupsToKeep(dates, today) {",
        "  return dates.slice(0, 7);",
        "}",
      ],
      tests: [
        [
          'backupsToKeep(["2026-11-27", "2026-11-21", "2026-11-20", "2026-11-19", "2026-11-13", "2026-11-06", "2026-10-30", "2026-10-29"], "2026-11-27")',
          '["2026-11-27", "2026-11-21", "2026-11-20", "2026-11-13", "2026-11-06"]',
        ],
        ['backupsToKeep(["2026-11-26"], "2026-11-27")', '["2026-11-26"]'],
        ['backupsToKeep(["2026-10-01"], "2026-11-27")', "[]"],
      ],
      hint: "`(Date.parse(today) - Date.parse(d)) / day` is the age in days, with `day = 24 * 60 * 60 * 1000`.",
      solution: [
        "function backupsToKeep(dates, today) {",
        "  const day = 24 * 60 * 60 * 1000;",
        "  return dates.filter((d) => {",
        "    const age =",
        "      (Date.parse(today) - Date.parse(d)) / day;",
        "    return age < 7 || (age < 28 && age % 7 === 0);",
        "  });",
        "}",
      ],
    }),
    yourTurn({
      title: "The backup to restore",
      task: 'Backups are times like `"2026-11-26T02:00"`, in any order. Write `latestBefore(backups, moment)`: return the latest backup taken at or before `moment`, or `null` if there is none. (Strings in this format compare correctly with `<` and `>`.)',
      starter: [
        "function latestBefore(backups, moment) {",
        "  return backups[backups.length - 1];",
        "}",
      ],
      tests: [
        [
          'latestBefore(["2026-11-25T02:00", "2026-11-27T02:00", "2026-11-26T02:00"], "2026-11-26T14:03")',
          '"2026-11-26T02:00"',
        ],
        ['latestBefore(["2026-11-25T02:00"], "2026-11-24T09:00")', "null"],
        [
          'latestBefore(["2026-11-25T02:00", "2026-11-24T02:00"], "2026-11-25T02:00")',
          '"2026-11-25T02:00"',
        ],
      ],
      hint: "Loop over them, skip any after `moment`, and keep the biggest of the rest.",
      solution: [
        "function latestBefore(backups, moment) {",
        "  let best = null;",
        "  for (const b of backups) {",
        "    if (b > moment) continue;",
        "    if (best === null || b > best) best = b;",
        "  }",
        "  return best;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Backups cheat sheet", [
      [
        "pg_dump",
        "Writes a database to a file while it runs.",
        'pg_dump -Fc -f notes.dump "$URL"',
      ],
      [
        "pg_restore",
        "Loads a custom-format dump.",
        "pg_restore -d notes_new notes.dump",
      ],
      ["psql -f", "Replays a plain SQL dump.", 'psql "$URL" -f notes.sql'],
      ["Snapshot", "The host's automatic daily copy."],
      ["WAL", "PostgreSQL's log of every change, written first."],
      ["Point-in-time recovery", "Base backup + WAL up to a chosen moment."],
      ["RPO", "How much recent data you can afford to lose."],
      ["RTO", "How long you can afford to be down."],
      [
        "Elsewhere, several",
        "Another place; daily for a week, weekly for a month.",
      ],
      ["Restore drill", "Restore, count rows, time it, on a schedule."],
      ["No prod in dev", "Seed or fake data on laptops, never real users'."],
    ]),
    quickCheck(
      "At 14:03 you notice someone ran `DELETE FROM notes;` at 14:02. Which gets the most data back?",
      [
        "Last night's pg_dump",
        "Point-in-time recovery to 14:01",
        "The live replica",
      ],
      1,
      "Point-in-time recovery replays every change up to 14:01, just before the DELETE. Last night's dump loses today's notes, and a replica has already copied the DELETE.",
    ),
  ),
);
