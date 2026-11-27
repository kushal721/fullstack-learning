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

// Secrets: what counts as a secret, where secrets leak, what the Notes App
// does, the front end is public, a strong secret taken apart, git history
// remembers, secret scanning step by step, rotating after a leak, keeping
// secrets out of logs and answers, mistakes, practice and a recap.
export const secretsModule = moduleLesson(
  "secrets",
  "Keeping secrets secret",
  40,
  [
    "Say which values are secrets, and the places they usually leak from.",
    "Keep secrets on the server: never in code, git, logs, answers or the front-end bundle.",
    "Generate a strong secret, and refuse to start with a missing or example one.",
    "Find a leaked secret with secret scanning, and know that git history keeps it.",
    "Rotate a leaked secret in the right order: new, deploy, revoke the old.",
  ],

  part(
    "what-is-a-secret",
    "What counts as a secret",
    explain(
      "A secret is any value that lets its holder act as your app: the key that signs login tokens, the database password, a payment API key. You met the basics in Backend: [[secrets-env-vars|secrets come from environment variables]], loaded from a `.env` file that git never sees. This step is about how they still leak, and what to do when one does.",
    ),
    reference("Secret or not?", [
      [
        "JWT_SECRET",
        "Secret: anyone with it can sign a login as any user.",
        "a 64-character random string",
      ],
      [
        "DATABASE_URL",
        "Secret: it holds the database password.",
        "postgres://notes:pa55@db/notes",
      ],
      [
        "Payment API key",
        "Secret: it can charge cards or refund money.",
        "sk_live_…",
      ],
      ["PORT", "Not secret: just a setting.", "3000"],
      [
        "API address",
        "Not secret: the browser sees it anyway.",
        "https://api.notes.app",
      ],
    ]),
  ),

  part(
    "where-they-leak",
    "Where secrets leak",
    explain(
      "Secrets rarely leak through clever attacks. They leak through habits: a `.env` committed once, `console.log(process.env)` while debugging, an error message that prints a connection string, a key pasted into the front end, a screenshot or chat message. Attackers run bots that search every public push for keys within minutes.",
    ),
    keyPoints(
      "Git: a commit keeps the secret forever, even after you delete it.",
      "Logs and error answers: printing settings prints secrets.",
      "The front end: everything in the bundle is public.",
      "Images, chats and tickets: pasted keys spread fast.",
    ),
    quickCheck(
      "A developer pushes a payment key to a public repo and deletes it in the next commit, ten minutes later. Is the key safe?",
      [
        "Yes, the newest code doesn't have it",
        "No: it's in the history and bots may already have it",
        "Yes, if the repo is made private",
      ],
      1,
      "The first commit still holds the key, and bots scan public pushes within minutes. Treat it as leaked: rotate it, whatever happens to the code.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's secrets",
    explain(
      "The Notes App has two secrets, `JWT_SECRET` and the password inside `DATABASE_URL`. The repo's `.gitignore` keeps `.env` out of git, `.env.example` lists the names with fake values, and `.dockerignore` keeps `.env` out of the image. `server.js` refuses to start when either is missing. It doesn't check that `JWT_SECRET` is strong, and nothing scans commits for secrets.",
    ),
    code(
      "bash",
      "backend/.env.example: names, fake values",
      [
        "PORT=3000",
        "DATABASE_URL=postgres://postgres:dev@…",
        "# Use a long random string in production.",
        "JWT_SECRET=change-me-to-a-long-random-string",
      ],
      {
        2: "a local dev password, not production's",
        4: "an example: never run with it",
      },
    ),
    inTheNotesApp(
      "server.js stops with “Missing environment variables” if DATABASE_URL or JWT_SECRET is unset, before it opens a port.",
      { fileId: "backend/src/server.js" },
    ),
  ),

  part(
    "front-end",
    "The front end is public",
    explain(
      "Vite puts every `VITE_` variable into the JavaScript it builds: a [[public-env-var|public build variable]]. Anyone can open DevTools and read it. That's fine for an API's address, never for a key. If the front end needs a secret service, it asks your server, and the server uses the key. The Notes App's front end reads no variables at all.",
    ),
    code(
      "js",
      "What's safe in import.meta.env",
      [
        "// fine: the browser sees it anyway",
        "const api = import.meta.env.VITE_API_URL;",
        "",
        "// leaked: it's in the bundle for all",
        "const key =",
        "  import.meta.env.VITE_STRIPE_SECRET;",
      ],
      {
        2: "public: an address, not a key",
        6: "anyone can read this in DevTools",
      },
    ),
    diagram([
      ["Browser", "asks: charge this order"],
      ["Your server", "checks the login"],
      ["Payment API", "called with the secret key"],
    ]),
  ),

  part(
    "strong-secret",
    "A strong secret, taken apart",
    explain(
      "The JWT signing key must be long and random. Someone with one token can try guesses offline, as fast as their computer allows, and a short or example value falls quickly. 32 random bytes is enough. Generate it, put it in production's settings, and never reuse it between your laptop and production.",
    ),
    anatomy(
      "Making a 256-bit secret in Node",
      [
        'import { randomBytes } from "node:crypto";',
        "const secret = randomBytes(32)",
        '  .toString("hex");',
        "// 64 hex characters",
      ],
      [
        [
          "node:crypto",
          "built into Node",
          "No package needed. Never use Math.random for secrets.",
        ],
        [
          "randomBytes(32)",
          "32 random bytes",
          "256 bits from the operating system's secure random source.",
        ],
        [
          'toString("hex")',
          "as text",
          "Hex fits in a .env file: 0–9 and a–f only.",
        ],
      ],
    ),
    code("bash", "Or from the terminal", ["openssl rand -hex 32"], {
      1: "the same: 64 random hex characters",
    }),
  ),

  part(
    "git-history",
    "Git remembers",
    explain(
      "Deleting a secret in a new commit doesn't remove it: every clone still has the old commit. Rewriting history is slow and can't reach copies others already made. So the rule is simple: once a secret has been pushed, it has leaked. Rotate it first, then clean up. You can search history to see if it happened.",
    ),
    code(
      "bash",
      "Is the key anywhere in history?",
      [
        'git log -p -S "sk_live_" --all',
        "",
        "# did .env ever get committed?",
        "git log --all -- .env",
      ],
      {
        1: "-S: commits that added or removed it",
        4: "any commit that touched .env",
      },
    ),
  ),

  part(
    "scanning",
    "Secret scanning, step by step",
    explain(
      "[[secret-scanning|Secret scanning]] tools look for text shaped like keys: known prefixes such as `sk_live_` or `AKIA`, private key headers and long random strings. GitHub scans pushes and can block them. gitleaks runs on your machine as a Git hook or in a pipeline. The Notes App runs none. Here is the core idea as a tiny scanner.",
    ),
    trace(
      "Which lines look like secrets?",
      [
        "const patterns = [/sk_live_/, /AKIA/];",
        "function findSecrets(lines) {",
        "  const found = [];",
        "  for (let i = 0; i < lines.length; i++) {",
        "    const hit = patterns.some((p) =>",
        "      p.test(lines[i]));",
        "    if (hit) found.push(i + 1);",
        "  }",
        "  return found;",
        "}",
        "const hits = findSecrets([",
        '  "PORT=3000",',
        '  "STRIPE_KEY=sk_live_51Hx",',
        "]);",
      ],
      [
        {
          line: 11,
          note: "Scan two lines of a file someone is about to commit.",
          vars: [["patterns", "[/sk_live_/, /AKIA/]"]],
        },
        {
          line: 3,
          note: "Line numbers of suspicious lines will go here.",
          vars: [
            ["lines", '["PORT=3000", "STRIPE_KEY=sk_live_51Hx"]'],
            ["found", "[]"],
          ],
          stack: ["findSecrets"],
        },
        {
          line: 5,
          note: "Line 1, PORT=3000, matches no pattern.",
          vars: [
            ["lines", '["PORT=3000", "STRIPE_KEY=sk_live_51Hx"]'],
            ["found", "[]"],
            ["i", "0"],
            ["hit", "false"],
          ],
          stack: ["findSecrets"],
        },
        {
          line: 5,
          note: "Line 2 contains sk_live_, a live payment key's prefix.",
          vars: [
            ["lines", '["PORT=3000", "STRIPE_KEY=sk_live_51Hx"]'],
            ["found", "[]"],
            ["i", "1"],
            ["hit", "true"],
          ],
          stack: ["findSecrets"],
        },
        {
          line: 7,
          note: "Remember it as line 2 (people count from 1).",
          vars: [
            ["lines", '["PORT=3000", "STRIPE_KEY=sk_live_51Hx"]'],
            ["found", "[2]"],
            ["i", "1"],
            ["hit", "true"],
          ],
          stack: ["findSecrets"],
        },
        {
          line: 11,
          note: "hits is [2]. A real hook would now refuse the commit and point at line 2.",
          vars: [
            ["patterns", "[/sk_live_/, /AKIA/]"],
            ["hits", "[2]"],
          ],
        },
      ],
    ),
    code(
      "bash",
      "gitleaks, the real tool",
      ["gitleaks git .", "", "gitleaks dir ."],
      {
        1: "scan every commit in the history",
        3: "scan the files as they are now",
      },
    ),
  ),

  part(
    "rotation",
    "When one leaks: rotate",
    explain(
      "[[secret-rotation|Rotating]] means replacing the secret, and the order matters. Make a new one, give it to the running app, check it works, then revoke the old one so it stops working. Rotating `JWT_SECRET` logs everyone out, which is exactly right after a leak: tokens someone forged with the old key stop working too.",
    ),
    diagram([
      ["Make new", "openssl rand -hex 32"],
      ["Deploy it", "update production's settings"],
      ["Revoke old", "it stops working everywhere"],
      ["Clean up", "remove it from code, check logs"],
    ]),
    keyPoints(
      "Rotate first; cleaning up the code comes after.",
      "Deleting the secret from code is not enough.",
      "Use separate secrets per environment, so one leak is one rotation.",
      "Check the provider's logs for use you don't recognise.",
    ),
  ),

  part(
    "out-of-sight",
    "Out of logs and answers",
    explain(
      "Secrets also leak through your own app. Never log the whole `process.env` or a config object, and never send settings back in an answer. The Notes App's error handler logs the error and answers only “Something went wrong”, so a database error's details stay on the server. Give each key only the access it needs, so a leaked one can do less.",
    ),
    inTheNotesApp(
      "app.js's error handler logs `err` on the server and answers a plain 500, so connection details never reach the browser.",
      { fileId: "backend/src/app.js" },
    ),
    quickCheck(
      "Which line is safe to leave in the Notes API?",
      [
        "console.log(process.env)",
        'console.log("Listening on", port)',
        "res.json({ config })",
      ],
      1,
      "The port is just a setting. Printing process.env or sending the config object would put JWT_SECRET and the database password in logs or in the browser.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A fallback secret in the code",
      wrong: ["const secret = process.env.JWT_SECRET", '  ?? "dev-secret";'],
      problem:
        "If production forgets the setting, it quietly signs tokens with a key that's in the repo for anyone to read.",
      right: [
        "const secret = process.env.JWT_SECRET;",
        "if (!secret) {",
        '  throw new Error("JWT_SECRET is missing");',
        "}",
      ],
      why: "Fail at startup instead, like server.js does. A missing secret should stop the app.",
    }),
    mistake({
      title: "A secret in a VITE_ variable",
      language: "bash",
      wrong: ["VITE_PAYMENT_KEY=sk_live_51Hx…"],
      problem: "Vite copies it into the bundle, so every visitor can read it.",
      right: ["PAYMENT_KEY=sk_live_51Hx…", "# read only by the server"],
      why: "VITE_ means public. Keep the key on the server and add a route that uses it.",
    }),
    mistake({
      title: "Deleting the leaked line and moving on",
      language: "bash",
      wrong: ["git rm --cached .env", 'git commit -m "remove .env"'],
      problem:
        "The old commit still holds every secret in that file, in every clone.",
      right: [
        "# 1. make and deploy new secrets",
        "# 2. revoke the old ones",
        "git rm --cached .env",
      ],
      why: "Once pushed, a secret is leaked. Rotate it; then remove the file and add it to .gitignore.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Refuse a weak JWT_SECRET",
      task: 'Write `checkSecret(env)`. Return `"JWT_SECRET is missing"` if `env.JWT_SECRET` is missing or empty, `"JWT_SECRET is still the example"` if it contains `"change-me"`, `"JWT_SECRET is too short"` if it has fewer than 32 characters, and `null` if it\'s fine.',
      starter: [
        "function checkSecret(env) {",
        '  if (!env.JWT_SECRET) return "JWT_SECRET is missing";',
        "  return null;",
        "}",
      ],
      tests: [
        ["checkSecret({})", '"JWT_SECRET is missing"'],
        [
          'checkSecret({ JWT_SECRET: "change-me-to-a-long-random-string" })',
          '"JWT_SECRET is still the example"',
        ],
        ['checkSecret({ JWT_SECRET: "abc123" })', '"JWT_SECRET is too short"'],
        ['checkSecret({ JWT_SECRET: "f".repeat(64) })', "null"],
      ],
      hint: 'Check in the order given: missing, then `includes("change-me")`, then `.length < 32`.',
      solution: [
        "function checkSecret(env) {",
        "  const s = env.JWT_SECRET;",
        '  if (!s) return "JWT_SECRET is missing";',
        '  if (s.includes("change-me")) {',
        '    return "JWT_SECRET is still the example";',
        "  }",
        '  if (s.length < 32) return "JWT_SECRET is too short";',
        "  return null;",
        "}",
      ],
    }),
    yourTurn({
      title: "Find secret-looking lines",
      task: 'Write `findSecrets(text)`. Split `text` on `"\\n"` and return the line numbers (from 1) of lines containing `sk_live_`, `AKIA` or `PRIVATE KEY`.',
      starter: ["function findSecrets(text) {", "  return [];", "}"],
      tests: [
        ['findSecrets("PORT=3000\\nKEY=sk_live_51Hx")', "[2]"],
        [
          'findSecrets("AWS=AKIAIOSFODNN7EXAMPLE\\nok\\n-----BEGIN PRIVATE KEY-----")',
          "[1, 3]",
        ],
        ['findSecrets("PORT=3000\\nNODE_ENV=production")', "[]"],
      ],
      hint: 'Keep a list like `["sk_live_", "AKIA", "PRIVATE KEY"]` and use `some` with `line.includes(m)` for each line.',
      solution: [
        'const markers = ["sk_live_", "AKIA", "PRIVATE KEY"];',
        "function findSecrets(text) {",
        "  const found = [];",
        '  text.split("\\n").forEach((line, i) => {',
        "    if (markers.some((m) => line.includes(m))) {",
        "      found.push(i + 1);",
        "    }",
        "  });",
        "  return found;",
        "}",
      ],
    }),
    yourTurn({
      title: "Secrets in public variables",
      task: "Write `leakyPublicVars(env)`. Return the names (in order) of variables that start with `VITE_` and whose name contains `SECRET`, `PASSWORD` or `TOKEN`. Those would end up in the bundle.",
      starter: [
        "function leakyPublicVars(env) {",
        "  return Object.keys(env)",
        '    .filter((k) => k.startsWith("VITE_"));',
        "}",
      ],
      tests: [
        [
          'leakyPublicVars({ VITE_API_URL: "/api", VITE_STRIPE_SECRET: "sk" })',
          '["VITE_STRIPE_SECRET"]',
        ],
        [
          'leakyPublicVars({ JWT_SECRET: "x", VITE_DB_PASSWORD: "y", VITE_GH_TOKEN: "z" })',
          '["VITE_DB_PASSWORD", "VITE_GH_TOKEN"]',
        ],
        ['leakyPublicVars({ VITE_API_URL: "/api", PORT: "3000" })', "[]"],
      ],
      hint: 'Filter twice: `startsWith("VITE_")`, then `/SECRET|PASSWORD|TOKEN/.test(k)`.',
      solution: [
        "function leakyPublicVars(env) {",
        "  return Object.keys(env).filter(",
        "    (k) =>",
        '      k.startsWith("VITE_") &&',
        "      /SECRET|PASSWORD|TOKEN/.test(k),",
        "  );",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Secrets cheat sheet", [
      [
        "Secret",
        "Lets its holder act as your app.",
        "JWT_SECRET, DB password, API keys",
      ],
      [
        "Where it lives",
        "The server's environment, never the code.",
        "process.env.JWT_SECRET",
      ],
      [
        ".env / .env.example",
        "Real values ignored by git; names committed.",
        "JWT_SECRET=change-me…",
      ],
      [
        "Strong",
        "32 random bytes, different per environment.",
        "openssl rand -hex 32",
      ],
      [
        "Fail fast",
        "Missing or example secret: don't start.",
        "server.js exits with a message",
      ],
      [
        "VITE_ variables",
        "Public: in the bundle for everyone.",
        "VITE_API_URL only",
      ],
      [
        "Git history",
        "A pushed secret has leaked, even if deleted.",
        'git log -p -S "sk_live_"',
      ],
      [
        "Secret scanning",
        "Finds key-shaped text in commits and pushes.",
        "gitleaks git .",
      ],
      [
        "Rotation",
        "New, deploy, revoke old, then clean up.",
        "new JWT_SECRET logs all out",
      ],
      [
        "Logs and answers",
        "Never print or send settings.",
        "no console.log(process.env)",
      ],
    ]),
    quickCheck(
      "Production's `JWT_SECRET` was pasted into a public chat. What do you do first?",
      [
        "Delete the chat message",
        "Make a new secret, deploy it, then stop the old one working",
        "Ask everyone to change their passwords",
      ],
      1,
      "The message may already have been copied, so deleting it doesn't help. Rotating does: with the new key deployed, tokens signed with the leaked one are rejected, and everyone simply logs in again.",
    ),
  ),
);
