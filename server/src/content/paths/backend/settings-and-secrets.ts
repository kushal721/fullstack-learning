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

// Settings and secrets: settings that change per environment, process.env,
// .env and .env.example, node --env-file, failing fast step by step, a config
// module, secrets vs ordinary settings, values per environment, rotating a
// leaked secret, mistakes, practice and a recap.
export const settingsAndSecretsModule = moduleLesson(
  "settings-and-secrets",
  "Settings and secrets",
  45,
  [
    "Say which settings change between your laptop and production, and keep them out of the code.",
    "Read settings from process.env, and load a local .env file with node --env-file.",
    "Keep .env out of git and document the names in .env.example.",
    "Stop the server at startup when a setting is missing, and read settings once in a config module.",
    "Treat secrets differently: never log or send them, and rotate one that leaks.",
  ],

  part(
    "per-environment",
    "Settings that change per environment",
    explain(
      "The same code runs on your laptop, in tests and in production, but some values must differ: the port, the database address, the key that signs login tokens. Writing them into the code means editing it for every place it runs, and putting passwords in git. So they come from [[environment-variables|environment variables]], given to the process when it starts.",
    ),
    reference("The Notes App's settings", [
      ["PORT", "Which port to listen on.", "3000"],
      [
        "DATABASE_URL",
        "Where the database is, with its login.",
        "postgres://…/notes",
      ],
      ["JWT_SECRET", "Signs login tokens. A secret.", "a long random string"],
      [
        "NODE_ENV",
        "Which kind of environment this is.",
        "development, production",
      ],
    ]),
  ),

  part(
    "process-env",
    "Reading process.env",
    explain(
      'Every Node.js [[node-process|process]] has an object, `process.env`, with the variables it was started with. Two things trip people up. Every value is a string, so `"3000"` must become a number. And a missing variable is `undefined`, not an error, so you have to check for it yourself.',
    ),
    code(
      "js",
      "Values are strings, or undefined",
      [
        "// started with: PORT=3000 node app.js",
        'process.env.PORT;        // "3000"',
        "process.env.NOPE;        // undefined",
        "",
        "const port =",
        "  Number(process.env.PORT ?? 3000);",
        'process.env.DEBUG = "false";',
        "if (process.env.DEBUG) {",
        '  // runs! "false" is a non-empty string',
        "}",
      ],
      {
        2: "a string, even though it looks like a number",
        5: "default, then convert: what server.js does",
        8: 'compare with === "true" instead',
      },
    ),
  ),

  part(
    "dotenv",
    ".env and .env.example",
    explain(
      "Typing every variable before each start is tiring, so on your own machine they go in a [[dotenv|.env file]]: one `NAME=value` per line. It holds real passwords, so it's never committed: `.gitignore` lists it. Instead you commit `.env.example`, with the same names and harmless values, so a new developer copies it to `.env` and fills it in.",
    ),
    anatomy(
      ".env.example (shortened)",
      [
        "PORT=3000",
        "DATABASE_URL=postgres://localhost/notes",
        "JWT_SECRET=change-me",
        "NODE_ENV=development",
      ],
      [
        ["PORT", "name", "Upper case with underscores, by convention."],
        ["=3000", "value", "No spaces around =, no quotes needed."],
        [
          "DATABASE_URL",
          "the database",
          "The real one also holds a user and password.",
        ],
        [
          "change-me",
          "placeholder",
          "Obviously fake, so nobody mistakes it for the real key.",
        ],
        ["development", "NODE_ENV", "production on the server."],
      ],
    ),
    code(
      "bash",
      ".gitignore: keep .env, share the example",
      [".env", ".env.*", "!.env.example"],
      {
        1: "never committed",
        3: "! means: but do commit this one",
      },
    ),
    inTheNotesApp(
      "`.env.example` lists the four settings, with a comment saying `.env` is never committed.",
      { fileId: "backend/.env.example" },
    ),
  ),

  part(
    "env-file",
    "Loading .env with node --env-file",
    explain(
      "Node.js can read the file itself: `node --env-file=.env` loads each line into `process.env` before your code runs. The dotenv package did this for years and is still common. In production there's no .env file: the platform (Docker, Render, a server's settings page) sets real environment variables, so `npm start` runs plain `node`.",
    ),
    code(
      "bash",
      "What the Notes App's scripts run",
      [
        "# npm run dev",
        "node --env-file=.env --watch \\",
        "  src/server.js",
        "",
        "# npm start",
        "node src/server.js",
      ],
      {
        2: "development: settings from .env",
        6: "production: settings from the platform",
      },
    ),
    inTheNotesApp(
      "`npm run dev` loads `.env`; `npm start` expects the variables to be set already.",
      { fileId: "backend/package.json" },
    ),
  ),

  part(
    "fail-fast",
    "Failing fast on missing settings",
    explain(
      "Without `JWT_SECRET` the server would start happily, then fail on the first login with a confusing error, maybe hours later. Better to stop at once with a clear message. The Notes App's `server.js` lists the settings it can't run without and exits with code 1 if any is missing. Step through a start where the secret was forgotten.",
    ),
    trace(
      "Starting without JWT_SECRET",
      [
        "const env = {",
        '  DATABASE_URL: "postgres://…",',
        "};",
        "const required = [",
        '  "DATABASE_URL",',
        '  "JWT_SECRET",',
        "];",
        "const missing = required.filter(",
        "  (name) => !env[name],",
        ");",
        "if (missing.length > 0) {",
        "  console.error(`Missing: ${missing}`);",
        "  process.exit(1);",
        "}",
      ],
      [
        {
          line: 1,
          note: "`env` stands in for `process.env`. Only the database address was set.",
          vars: [["env", '{ DATABASE_URL: "postgres://…" }']],
        },
        {
          line: 4,
          note: "The names the server can't run without.",
          vars: [
            ["env", '{ DATABASE_URL: "postgres://…" }'],
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
          ],
        },
        {
          line: 8,
          note: "Keep the names whose value is missing or empty. `env.JWT_SECRET` is undefined, so it stays.",
          vars: [
            ["env", '{ DATABASE_URL: "postgres://…" }'],
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
        },
        {
          line: 12,
          note: "One name is missing, so the message says exactly which.",
          vars: [
            ["env", '{ DATABASE_URL: "postgres://…" }'],
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
          output: "Missing: JWT_SECRET",
        },
        {
          line: 13,
          note: "Exit code 1 means failure. The server never starts listening, and the platform shows the deploy as failed.",
          vars: [
            ["env", '{ DATABASE_URL: "postgres://…" }'],
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
        },
      ],
    ),
    inTheNotesApp(
      "`server.js` checks `DATABASE_URL` and `JWT_SECRET` before `listen`, and says to copy `.env.example`.",
      { fileId: "backend/src/server.js" },
    ),
  ),

  part(
    "config-module",
    "A config module",
    explain(
      "In the Notes App, `process.env` is read in four files: `server.js`, `db.js`, `authController.js` and `authMiddleware.js`. A [[config-module|config module]] reads every setting in one place: it converts strings, applies defaults and checks required values once, at startup. The rest of the code imports `config`. The Notes App has none; this is what one could look like.",
    ),
    code(
      "js",
      "config.js (not in the Notes App)",
      [
        "function required(name) {",
        "  const value = process.env[name];",
        "  if (!value) {",
        "    throw new Error(`Missing ${name}`);",
        "  }",
        "  return value;",
        "}",
        "export const config = {",
        "  port: Number(process.env.PORT ?? 3000),",
        '  databaseUrl: required("DATABASE_URL"),',
        '  jwtSecret: required("JWT_SECRET"),',
        "  isProduction:",
        '    process.env.NODE_ENV === "production",',
        "};",
      ],
      {
        4: "throws on import: the server can't start",
        9: "a number, with a default",
        13: "a real boolean, not a string",
      },
    ),
    keyPoints(
      "One file lists every setting the app uses.",
      "Values are converted and checked once, at startup.",
      "Other files import config and never touch process.env.",
      "This platform's own server does exactly this in its config.ts.",
    ),
  ),

  part(
    "secrets",
    "Secrets are different",
    explain(
      "A [[app-secret|secret]] is a setting that gives access to whoever knows it: the database password inside `DATABASE_URL`, `JWT_SECRET`, an API key. Knowing `PORT` helps nobody; knowing `JWT_SECRET` lets someone sign their own login tokens and be any user. So secrets get extra care, everywhere they could leak.",
    ),
    reference("Where a secret must never end up", [
      [
        "The code",
        "Anyone who can read the repo has it.",
        'jwt.sign(p, "abc123")',
      ],
      [
        "Git history",
        "Deleting it later doesn't remove old commits.",
        "a committed .env",
      ],
      [
        "Logs",
        "Many people and tools can read logs.",
        "console.log(process.env)",
      ],
      ["Responses", "Sent to whoever asked.", "res.json({ config })"],
      [
        "Front-end code",
        "Everything sent to the browser is public.",
        "VITE_JWT_SECRET",
      ],
    ]),
    quickCheck(
      "Which of these is a secret?",
      ["PORT=3000", "NODE_ENV=production", "JWT_SECRET=k3v9…"],
      2,
      "Anyone with the JWT secret can sign tokens the server trusts. The port and environment name grant nothing.",
    ),
  ),

  part(
    "environments",
    "Different values per environment",
    explain(
      "Each environment gets its own values, and secrets are never shared between them. A test database must never be the production one, and a leaked development secret should unlock nothing that matters. `NODE_ENV=production` also tells Express and many packages to skip extra development checks and hide error details.",
    ),
    reference("One app, three environments", [
      [
        "development",
        "Your laptop, values from .env.",
        "postgres://localhost/notes",
      ],
      [
        "test",
        "Automated tests, a throwaway database.",
        "postgres://localhost/notes_test",
      ],
      [
        "production",
        "Real users, values set on the platform.",
        "a long random JWT_SECRET",
      ],
    ]),
    inTheNotesApp(
      "The Dockerfile sets `NODE_ENV=production`; the database address and secret come from the platform.",
      { fileId: "backend/Dockerfile" },
    ),
  ),

  part(
    "rotate",
    "When a secret leaks",
    explain(
      "Say `.env` was committed and pushed. Deleting it in the next commit isn't enough: it's still in the history, and bots scan public repos for keys within minutes. Treat the secret as known. Rotate it: make a new value, set it everywhere it's used, restart, and only then is the old one useless.",
    ),
    keyPoints(
      "Make a new secret (a long random string or a new key).",
      "Set it on the platform and restart the server.",
      "Revoke the old one, e.g. change the database password.",
      "Then add .env to .gitignore so it can't happen again.",
    ),
    quickCheck(
      "You pushed a commit containing the real `JWT_SECRET`. What fixes it?",
      [
        "A new commit that deletes the line",
        "Making the repo private",
        "Rotating the secret: a new value on the server",
      ],
      2,
      "The old value is in the history and may already be copied. Only replacing it makes the leaked one worthless. Rotating JWT_SECRET also logs everyone out, which is the point.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "A secret in the code",
      wrong: ['jwt.verify(token, "my-secret-key");'],
      problem:
        "Everyone who can read the repository can sign valid tokens, and changing it means a new deploy.",
      right: ["jwt.verify(token, process.env.JWT_SECRET);"],
      why: "Secrets come from the environment, so the code holds only the name.",
    }),
    mistake({
      title: "Forgetting values are strings",
      wrong: [
        "const port = process.env.PORT || 3000;",
        "app.listen(port + 1);",
      ],
      problem:
        '`"3000" + 1` is `"30001"`, not 3001. Likewise `"false"` is truthy.',
      right: [
        "const port = Number(process.env.PORT ?? 3000);",
        "app.listen(port + 1);",
      ],
      why: 'Convert every value when you read it: Number for numbers, === "true" for flags.',
    }),
    mistake({
      title: "Logging every setting",
      wrong: ['console.log("config", process.env);'],
      problem:
        "Every secret, including the database password, is now in the logs for anyone who can read them.",
      right: ['console.log("config", { port, nodeEnv });'],
      why: "Log only named, harmless values; never the environment or a config object with secrets.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Read the config",
      task: 'Write `readConfig(env)`. `DATABASE_URL` and `JWT_SECRET` are required: if any is missing or empty, throw an Error whose message is `"Missing: "` and the missing names joined by `", "`. Otherwise return `{ port, databaseUrl, jwtSecret }`, where `port` is `env.PORT` as a number, or 3000 when it isn\'t set.',
      starter: ["function readConfig(env) {", "  return {};", "}"],
      tests: [
        [
          'readConfig({ PORT: "8080", DATABASE_URL: "pg://db", JWT_SECRET: "s" })',
          '{ port: 8080, databaseUrl: "pg://db", jwtSecret: "s" }',
        ],
        [
          'readConfig({ DATABASE_URL: "pg://db", JWT_SECRET: "s" }).port',
          "3000",
        ],
        [
          "(() => { try { readConfig({}); } catch (e) { return e.message; } })()",
          '"Missing: DATABASE_URL, JWT_SECRET"',
        ],
        [
          '(() => { try { readConfig({ DATABASE_URL: "x", JWT_SECRET: "" }); } catch (e) { return e.message; } })()',
          '"Missing: JWT_SECRET"',
        ],
      ],
      hint: "Filter the two names with `!env[name]`, throw if any are left, then build the object.",
      solution: [
        "function readConfig(env) {",
        '  const names = ["DATABASE_URL", "JWT_SECRET"];',
        "  const missing = names.filter((n) => !env[n]);",
        "  if (missing.length > 0) {",
        '    throw new Error("Missing: " + missing.join(", "));',
        "  }",
        "  return {",
        "    port: Number(env.PORT ?? 3000),",
        "    databaseUrl: env.DATABASE_URL,",
        "    jwtSecret: env.JWT_SECRET,",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Mask secrets before logging",
      task: 'Write `mask(settings)`: a copy of the object where every value whose key contains `SECRET`, `PASSWORD` or `TOKEN` (in any case) is replaced by `"***"`. Other values stay as they are.',
      starter: ["function mask(settings) {", "  return settings;", "}"],
      tests: [
        [
          'mask({ PORT: "3000", JWT_SECRET: "abc" })',
          '{ PORT: "3000", JWT_SECRET: "***" }',
        ],
        [
          'mask({ dbPassword: "pw", apiToken: "t", mode: "dev" })',
          '{ dbPassword: "***", apiToken: "***", mode: "dev" }',
        ],
        ["mask({})", "{}"],
      ],
      hint: "Loop over `Object.entries`, test `key.toUpperCase()` with `includes`, and build a new object.",
      solution: [
        "function mask(settings) {",
        '  const words = ["SECRET", "PASSWORD", "TOKEN"];',
        "  const out = {};",
        "  for (const [k, v] of Object.entries(settings)) {",
        "    const upper = k.toUpperCase();",
        "    const hide = words.some((w) => upper.includes(w));",
        '    out[k] = hide ? "***" : v;',
        "  }",
        "  return out;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Settings cheat sheet", [
      [
        "process.env",
        "The variables the process started with: strings or undefined.",
        "process.env.PORT",
      ],
      [
        "Convert",
        "Turn strings into numbers and booleans.",
        "Number(process.env.PORT ?? 3000)",
      ],
      [".env", "Local settings and secrets. Never committed.", "JWT_SECRET=…"],
      [
        ".env.example",
        "The names, with fake values. Committed.",
        "JWT_SECRET=change-me",
      ],
      [
        "--env-file",
        "Node loads .env before your code runs.",
        "node --env-file=.env src/server.js",
      ],
      [
        "Fail fast",
        "Check required settings at startup; exit 1.",
        "process.exit(1)",
      ],
      [
        "Config module",
        "Read, convert and check once; import config.",
        "config.port",
      ],
      [
        "Secret",
        "Never in code, git, logs or responses.",
        "JWT_SECRET, DATABASE_URL",
      ],
      [
        "Leaked?",
        "Rotate: new value, restart, revoke the old.",
        "a new JWT_SECRET",
      ],
    ]),
    quickCheck(
      "Where should the production `JWT_SECRET` be set?",
      [
        "In .env.example, so everyone has it",
        "In the platform's environment variables",
        "In config.js as a default value",
      ],
      1,
      "The production secret lives only on the platform that runs the server. The example file has a fake value, and a default in code would be a secret in the repository.",
    ),
  ),
);
