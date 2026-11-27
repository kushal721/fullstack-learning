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

// Threat modelling: thinking like an attacker before you build, drawing how
// data moves, the assets, STRIDE, one threat taken apart, STRIDE on the Notes
// App, ranking threats step by step, least privilege, the Notes App's threat
// model, when to do it again, mistakes, practice and a recap.
export const threatModellingModule = moduleLesson(
  "threat-modelling",
  "Threat modelling",
  45,
  [
    "Draw how data moves through the Notes App and mark its trust boundaries.",
    "List the assets worth protecting and who might want them.",
    "Use STRIDE to find threats at each part of the app.",
    "Rank threats by likelihood and impact, and fix the worst first.",
    "Apply least privilege to users, the database account and the server.",
  ],

  part(
    "why",
    "Find the holes before someone else does",
    explain(
      "So far you've fixed one kind of attack at a time. A [[threat-model]] steps back and looks at the whole app: what are you protecting, who might attack it, how, and what stops them? It's a short document, not a tool. An hour with it before building a feature finds holes that would take days to fix later.",
    ),
    analogy(
      "Before a burglar visits, you walk round your own house: which doors, which windows, what's worth taking, which locks are weak. Then you fix the worst first.",
    ),
    keyPoints(
      "What are we building? Draw how data moves.",
      "What can go wrong? Ask the same questions everywhere.",
      "What will we do about it? Fix, accept or note each threat.",
      "Did we do a good job? Check again when the design changes.",
    ),
  ),

  part(
    "data-flow",
    "Draw how data moves",
    explain(
      "Start with boxes and arrows: where requests come from, where they go and where data is stored. Then mark every [[trust-boundary|trust boundary]], each place data crosses from someone you don't control to code you do. Threats cluster at those lines, so that's where you look hardest.",
    ),
    diagram([
      ["Browser", "anyone, any request"],
      ["Express API", "the boundary: checks it all"],
      ["PostgreSQL", "trusts the API"],
      ["Secrets", ".env: JWT_SECRET"],
    ]),
    keyPoints(
      "Browser to API: the big boundary. Everything is untrusted.",
      "API to database: the database trusts whatever the API sends.",
      "The server's settings: whoever reads them can sign any token.",
    ),
  ),

  part(
    "assets",
    "What's worth protecting",
    explain(
      "An asset is anything an attacker would want, or want to break. List them before thinking about attacks: it tells you which threats matter. For the Notes App, losing a note title is bad, but leaking `JWT_SECRET` is far worse, since it lets anyone log in as anyone.",
    ),
    reference("The Notes App's assets", [
      [
        "Notes",
        "Private text. Wanted by snoops and other users.",
        "notes.title, notes.content",
      ],
      [
        "Password hashes",
        "Cracked offline, they unlock other sites too.",
        "users.password_hash",
      ],
      [
        "Login cookies",
        "Whoever has one is that user for 7 days.",
        "Cookie: token=eyJ…",
      ],
      [
        "JWT_SECRET",
        "Signs every token: with it, log in as anyone.",
        "backend/.env",
      ],
      [
        "The service itself",
        "If it's down, nobody can read their notes.",
        "the API and the database",
      ],
    ]),
  ),

  part(
    "stride",
    "STRIDE: six questions",
    explain(
      '"What could go wrong?" is too open. [[stride|STRIDE]] gives you six questions to ask at each box and arrow. Each letter is a kind of threat, and each has a matching defence you already know from earlier steps.',
    ),
    reference("STRIDE", [
      [
        "S: Spoofing",
        "Pretending to be someone else.",
        "Defence: authentication",
      ],
      [
        "T: Tampering",
        "Changing data or messages you shouldn't.",
        "Defence: HTTPS, signatures, checks",
      ],
      [
        "R: Repudiation",
        "Doing something, then denying it.",
        "Defence: an audit log",
      ],
      [
        "I: Information disclosure",
        "Seeing data you shouldn't.",
        "Defence: access checks, safe errors",
      ],
      [
        "D: Denial of service",
        "Making the app unusable for others.",
        "Defence: limits on size and rate",
      ],
      [
        "E: Elevation of privilege",
        "Getting more access than you were given.",
        "Defence: authorization",
      ],
    ]),
    quickCheck(
      "A user deletes a note, then says they never did, and nothing records who deleted it. Which STRIDE threat is this?",
      ["Spoofing", "Repudiation", "Denial of service"],
      1,
      "Repudiation is doing something and being able to deny it. The defence is an audit log that records who did what and when, which the Notes App doesn't have yet.",
    ),
  ),

  part(
    "one-threat",
    "One threat, taken apart",
    explain(
      "Write each threat down the same way: where it happens, which STRIDE letter, what the attacker does, how likely and how bad, and the fix. A list of these is your threat model. Plain objects or a table both work; what matters is that every threat has a fix or a reason to accept it.",
    ),
    anatomy(
      "A threat on the login route",
      [
        '{ where: "POST /api/auth/login",',
        '  stride: "S", what: "guess passwords",',
        "  odds: 3, harm: 2,",
        '  fix: "rate limit + lockout" }',
      ],
      [
        ["where:", "where", "A box or arrow from your drawing. Here, a route."],
        ['stride: "S"', "which kind", "Spoofing: logging in as someone else."],
        [
          "what:",
          "the attack",
          "One sentence: what the attacker actually does.",
        ],
        [
          "odds: 3, harm: 2",
          "how bad",
          "Likelihood and impact, 1 to 3. Multiply for a score.",
        ],
        [
          "fix:",
          "what stops it",
          "A defence, or why you accept the risk for now.",
        ],
      ],
    ),
  ),

  part(
    "notes-app-stride",
    "STRIDE on the Notes App",
    explain(
      "Run the six questions over `PUT /api/notes/:id`, the route that changes a note. Most answers are defences the Notes App already has. Two are gaps: nothing records who changed what, and nothing limits how many requests one person sends.",
    ),
    reference("PUT /api/notes/:id, letter by letter", [
      ["S", "Signed JWT in an httpOnly cookie.", "requireAuth"],
      ["T", "Owner checked in the UPDATE itself.", "AND user_id = $3"],
      ["R", "Gap: no audit log of who changed a note.", "console.error only"],
      ["I", "404 for someone else's note; safe errors.", '"Note not found"'],
      [
        "D",
        "express.json() caps bodies at 100kb. Gap: no rate limit.",
        "app.use(express.json())",
      ],
      ["E", "user_id from req.user, never the body.", "req.user.id"],
    ]),
    inTheNotesApp(
      "updateNote takes the owner from `req.user.id` and the note id from the URL, and validates the body first.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "ranking",
    "Fix the worst first",
    explain(
      "You'll find more threats than you can fix this week. Give each a likelihood and an impact from 1 to 3 and multiply. Fix the highest scores first, and write down why you accept the low ones. Here two threats are scored.",
    ),
    trace(
      "Scoring two threats",
      [
        "function score(threat) {",
        "  return threat.odds * threat.harm;",
        "}",
        "const guess = { odds: 3, harm: 2 };",
        "const idor = { odds: 1, harm: 3 };",
        "const a = score(guess);",
        "const b = score(idor);",
        'const first = a >= b ? "guess" : "idor";',
        "console.log(first, a, b);",
      ],
      [
        {
          line: 4,
          note: "Password guessing on login: easy to try and nothing stops it (3). It opens one account (2).",
          vars: [
            ["score", "ƒ score(threat)"],
            ["guess", "{ odds: 3, harm: 2 }"],
          ],
        },
        {
          line: 5,
          note: "Reading another user's note: every query checks user_id, so unlikely (1). But it leaks private notes (3).",
          vars: [
            ["score", "ƒ score(threat)"],
            ["guess", "{ odds: 3, harm: 2 }"],
            ["idor", "{ odds: 1, harm: 3 }"],
          ],
        },
        {
          line: 2,
          note: "3 × 2 = 6.",
          vars: [["threat", "{ odds: 3, harm: 2 }"]],
          stack: ["score"],
        },
        {
          line: 6,
          note: "Guessing scores 6.",
          vars: [
            ["score", "ƒ score(threat)"],
            ["guess", "{ odds: 3, harm: 2 }"],
            ["idor", "{ odds: 1, harm: 3 }"],
            ["a", "6"],
          ],
        },
        {
          line: 2,
          note: "1 × 3 = 3.",
          vars: [["threat", "{ odds: 1, harm: 3 }"]],
          stack: ["score"],
        },
        {
          line: 7,
          note: "The IDOR threat scores 3: bad if it happens, but already defended.",
          vars: [
            ["score", "ƒ score(threat)"],
            ["guess", "{ odds: 3, harm: 2 }"],
            ["idor", "{ odds: 1, harm: 3 }"],
            ["a", "6"],
            ["b", "3"],
          ],
        },
        {
          line: 9,
          note: "Guessing comes first: a login limit is the next thing to build.",
          vars: [
            ["score", "ƒ score(threat)"],
            ["guess", "{ odds: 3, harm: 2 }"],
            ["idor", "{ odds: 1, harm: 3 }"],
            ["a", "6"],
            ["b", "3"],
            ["first", '"guess"'],
          ],
          output: "guess 6 3",
        },
      ],
    ),
  ),

  part(
    "least-privilege",
    "Least privilege",
    explain(
      "Many threats shrink with one habit: [[least-privilege|least privilege]]. Give every user, process and account only the access its job needs. Then a bug or a stolen key does less damage. The Notes API only reads and writes two tables, so its database account shouldn't be able to drop them or read other databases.",
    ),
    code(
      "sql",
      "A database role for the API (not in the Notes App)",
      [
        "CREATE ROLE notes_api LOGIN",
        "  PASSWORD 'from-a-secret-store';",
        "GRANT SELECT, INSERT, UPDATE, DELETE",
        "  ON users, notes TO notes_api;",
        "GRANT USAGE ON ALL SEQUENCES",
        "  IN SCHEMA public TO notes_api;",
      ],
      {
        1: "not a superuser: can't DROP or CREATE",
        3: "only what the controllers do",
        5: "lets SERIAL ids count up",
      },
    ),
    keyPoints(
      "Users: only their own notes, through user_id in every query.",
      "Queries: only the columns needed, never SELECT * on users.",
      "Database: a role that can't drop tables or create users.",
      "Server: not root. The Notes App's image runs as `node`.",
    ),
    inTheNotesApp(
      "`.env.example` connects as `postgres`, the all-powerful superuser. Fine on your laptop; in production use a limited role like notes_api.",
      { fileId: "backend/.env.example" },
    ),
  ),

  part(
    "write-it-down",
    "The Notes App's threat model",
    explain(
      "The Notes App has no threat model written down. Here is a short one, top threats first. It fits on a page, and that's the point: a model nobody reads protects nothing. Keep it next to the code (a `SECURITY.md` or `docs/threats.md`) so it changes when the code does.",
    ),
    reference("Top threats (not in the Notes App's repo)", [
      [
        "S: guess passwords (6)",
        "Nothing slows login attempts. Fix: rate limit and lockout.",
        "POST /api/auth/login",
      ],
      [
        "R: deny changes (4)",
        "Nothing records who did what. Fix: an audit log.",
        "DELETE /api/notes/:id",
      ],
      [
        "D: flood the API (4)",
        "No request limit. Fix: a rate limit on /api.",
        "app.js",
      ],
      [
        "T: a bad package (3)",
        "A dependency update runs bad code. Fix: audits, lockfile.",
        "package-lock.json",
      ],
      [
        "I: leaked secret (3)",
        "JWT_SECRET in a commit. Fix: .env ignored, rotate if leaked.",
        "backend/.env",
      ],
      [
        "E: another's note (3)",
        "Already fixed: user_id in every query.",
        "AND user_id = $2",
      ],
    ]),
  ),

  part(
    "when",
    "When to do it again",
    explain(
      "A threat model goes stale the moment the design changes. Revisit it whenever data moves in a new way: a new route, a new kind of user, a file upload, a third-party service, sharing between users. Ten minutes of STRIDE on the new arrows is usually enough.",
    ),
    keyPoints(
      "New feature, new arrows: run STRIDE on them.",
      "New secret or service: add it to the assets.",
      "After an incident: add what happened, then the fix.",
    ),
    quickCheck(
      "You add note sharing: a link that lets anyone with it read one note. What happens to the threat model?",
      [
        "Nothing: it was done last year",
        "Update it: a new arrow and new threats",
        "Delete it and start over",
      ],
      1,
      "Sharing adds a new data flow: anyone with the link, no login. Ask STRIDE about it: can links be guessed (I), can they be revoked, who can create one (E)? Add those threats and their fixes.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Ranking by harm alone",
      wrong: ["threats.sort((a, b) =>", "  b.harm - a.harm);"],
      problem:
        "A scary but well-defended threat comes first, while an easy, undefended one waits.",
      right: [
        "threats.sort((a, b) =>",
        "  b.odds * b.harm - a.odds * a.harm);",
      ],
      why: "Risk is likelihood times impact. Both matter when choosing what to fix first.",
    }),
    mistake({
      title: "The app connects as the superuser",
      language: "bash",
      wrong: ["DATABASE_URL=postgres://postgres:pw@db/notes"],
      problem:
        "One SQL injection bug could drop every table, read other databases or create new users.",
      right: ["DATABASE_URL=postgres://notes_api:pw@db/notes"],
      why: "Least privilege: a role that can only read and write notes and users limits what any bug can do.",
    }),
    mistake({
      title: "A threat with no decision",
      wrong: ['{ stride: "D", what: "flood the API" }'],
      problem:
        "It's on the list, but nobody fixes it or decides to accept it, so it's forgotten.",
      right: [
        '{ stride: "D", what: "flood the API",',
        '  fix: "rate limit /api, issue #41" }',
      ],
      why: "Every threat ends with a fix, a ticket, or a written reason to accept it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Rank the threats",
      task: "Write `rankThreats(threats)`. Each threat is `{ name, odds, harm }`. Return the names, highest `odds * harm` first. Threats with the same score keep their order. Don't change the array you're given.",
      starter: [
        "function rankThreats(threats) {",
        "  return threats.map((t) => t.name);",
        "}",
      ],
      tests: [
        [
          'rankThreats([{ name: "a", odds: 1, harm: 3 }, { name: "b", odds: 3, harm: 2 }])',
          '["b", "a"]',
        ],
        [
          'rankThreats([{ name: "x", odds: 2, harm: 2 }, { name: "y", odds: 1, harm: 4 }, { name: "z", odds: 3, harm: 3 }])',
          '["z", "x", "y"]',
        ],
        ["rankThreats([])", "[]"],
      ],
      hint: "Copy with `[...threats]`, sort by `b.odds * b.harm - a.odds * a.harm`, then map to names. sort keeps ties in order.",
      solution: [
        "function rankThreats(threats) {",
        "  const score = (t) => t.odds * t.harm;",
        "  return [...threats]",
        "    .sort((a, b) => score(b) - score(a))",
        "    .map((t) => t.name);",
        "}",
      ],
    }),
    yourTurn({
      title: "Which STRIDE letters are missing?",
      task: 'Write `missingStride(threats)`. Each threat has a `stride` letter. Return the letters of `"STRIDE"` that no threat uses, in STRIDE order, so you can see which questions nobody asked.',
      starter: ["function missingStride(threats) {", "  return [];", "}"],
      tests: [
        [
          'missingStride([{ stride: "S" }, { stride: "I" }])',
          '["T", "R", "D", "E"]',
        ],
        [
          'missingStride([{ stride: "E" }, { stride: "D" }, { stride: "T" }, { stride: "S" }, { stride: "R" }, { stride: "I" }])',
          "[]",
        ],
        ["missingStride([])", '["S", "T", "R", "I", "D", "E"]'],
      ],
      hint: 'Make a Set of the letters used, then filter `"STRIDE".split("")` to the ones not in it.',
      solution: [
        "function missingStride(threats) {",
        "  const used = new Set(",
        "    threats.map((t) => t.stride));",
        '  return "STRIDE".split("")',
        "    .filter((l) => !used.has(l));",
        "}",
      ],
    }),
    yourTurn({
      title: "Too much access",
      task: "Write `extraPermissions(granted, needed)`. Return the permissions in `granted` that aren't in `needed`, in the order they were granted. Those are the ones least privilege says to take away.",
      starter: [
        "function extraPermissions(granted, needed) {",
        "  return [];",
        "}",
      ],
      tests: [
        [
          'extraPermissions(["SELECT", "INSERT", "DROP"], ["SELECT", "INSERT"])',
          '["DROP"]',
        ],
        ['extraPermissions(["SELECT"], ["SELECT", "UPDATE"])', "[]"],
        [
          'extraPermissions(["DELETE", "CREATE", "SELECT", "SUPERUSER"], ["SELECT", "DELETE"])',
          '["CREATE", "SUPERUSER"]',
        ],
      ],
      hint: "`granted.filter((p) => !needed.includes(p))`.",
      solution: [
        "function extraPermissions(granted, needed) {",
        "  return granted.filter(",
        "    (p) => !needed.includes(p));",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Threat modelling cheat sheet", [
      [
        "Threat model",
        "What you protect, from whom, how, and what stops it.",
        "docs/threats.md",
      ],
      [
        "Data flow",
        "Boxes and arrows; mark the trust boundaries.",
        "Browser → API → PostgreSQL",
      ],
      [
        "Assets",
        "What an attacker wants or wants to break.",
        "notes, hashes, JWT_SECRET",
      ],
      [
        "STRIDE",
        "Six questions at every box and arrow.",
        "Spoofing … Elevation of privilege",
      ],
      [
        "A threat",
        "Where, letter, attack, odds, harm, fix.",
        '{ stride: "S", odds: 3, harm: 2 }',
      ],
      ["Ranking", "Likelihood × impact; worst first.", "3 × 2 = 6"],
      [
        "Least privilege",
        "Only the access each part's job needs.",
        "GRANT SELECT, INSERT … TO notes_api",
      ],
      [
        "When again",
        "New feature, service, secret or incident.",
        "note sharing links",
      ],
    ]),
    quickCheck(
      "Which change follows least privilege?",
      [
        "The API connects as postgres",
        "The API's role can only use notes and users",
        "Every user is an admin, to save time",
      ],
      1,
      "The API only reads and writes two tables, so its database role should do just that. A bug or a leaked password then can't drop tables, create users or read other databases.",
    ),
  ),
);
