import {
  analogy,
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

// Node.js and npm: JavaScript outside the browser, a process with its
// environment and exit code (step by step), ES modules, one thread and the
// event loop, package.json, installing packages, version ranges, the
// lockfile, npm scripts, mistakes, practice and a recap.
export const nodejsAndNpmModule = moduleLesson(
  "nodejs-and-npm",
  "Node.js and npm",
  45,
  [
    "Run a JavaScript file with Node.js, and say what it has instead of document and window.",
    "Use process.env and exit codes, and import and export with ES modules.",
    "Explain how one Node.js thread serves many requests while it waits for I/O.",
    "Read package.json: dependencies, devDependencies, version ranges and scripts.",
    "Install packages with npm install and npm ci, and explain what the lockfile is for.",
  ],

  part(
    "node",
    "JavaScript outside the browser",
    explain(
      "[[nodejs|Node.js]] is a program that runs JavaScript on its own, without a browser. The language is the same, but there's no page: no `document`, no `window`, no `alert`. Instead you get what a server needs: reading files, opening network connections, and `process`, the running program with its settings in `process.env`.",
    ),
    code(
      "js",
      "hello.js",
      [
        'console.log("Hello from Node.js");',
        "console.log(process.version);",
        "console.log(process.env.HOME);",
        "console.log(typeof document);",
      ],
      {
        2: 'e.g. "v22.11.0"',
        3: "an environment variable",
        4: '"undefined": there is no page',
      },
    ),
    code(
      "bash",
      "Run it from the terminal",
      [
        "$ node hello.js",
        "Hello from Node.js",
        "v22.11.0",
        "/Users/sam",
        "undefined",
      ],
      { 1: "node + the file to run" },
    ),
  ),

  part(
    "process",
    "A process, its settings and its exit code",
    explain(
      "`node hello.js` starts a [[node-process|process]]: a running program. It ends when there's nothing left to do, or keeps running while a server waits for requests. When it ends it reports an exit code: `0` means success, anything else means failure. The Notes App's `server.js` uses one to stop at once if a setting is missing. Step through it with `JWT_SECRET` unset.",
    ),
    trace(
      "server.js checks its settings (simplified)",
      [
        "const required = [",
        '  "DATABASE_URL", "JWT_SECRET",',
        "];",
        "const missing = required.filter(",
        "  (name) => !process.env[name],",
        ");",
        "if (missing.length > 0) {",
        "  console.error(",
        '    "Missing: " + missing.join(", "),',
        "  );",
        "  process.exit(1);",
        "}",
      ],
      [
        {
          line: 1,
          note: "The settings the server can't work without.",
          vars: [["required", '["DATABASE_URL", "JWT_SECRET"]']],
        },
        {
          line: 4,
          note: "`filter` keeps each name whose `process.env` value is empty. `DATABASE_URL` is set; `JWT_SECRET` isn't.",
          vars: [
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
        },
        {
          line: 7,
          note: "One name is missing, so the `if` runs.",
          vars: [
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
        },
        {
          line: 8,
          note: "A clear message on the error output, naming what to fix.",
          vars: [
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
          output: "Missing: JWT_SECRET",
        },
        {
          line: 11,
          note: "The process stops here with exit code 1: failure. The server never starts listening.",
          vars: [
            ["required", '["DATABASE_URL", "JWT_SECRET"]'],
            ["missing", '["JWT_SECRET"]'],
          ],
        },
      ],
    ),
    inTheNotesApp(
      "`server.js` checks `DATABASE_URL` and `JWT_SECRET`, prints what's missing and exits with 1 before listening.",
      { fileId: "backend/src/server.js" },
    ),
    keyPoints(
      "Exit code 0: it worked. Anything else: it failed.",
      "Docker, CI and scripts read the exit code to know.",
      "Fail at startup, loudly, not on the first request.",
    ),
  ),

  part(
    "modules",
    "ES modules: import and export",
    explain(
      'Each file is a module. `export` shares a function or value; `import` uses it in another file. Node.js needs to know you use this syntax, so the Notes App\'s package.json says `"type": "module"`. Paths to your own files start with `./` or `../` and must include `.js`. A bare name like `"express"` means a package in `node_modules`.',
    ),
    anatomy(
      "The top of app.js",
      [
        'import express from "express";',
        "import { notesRoutes }",
        '  from "./routes/notes.js";',
        "export function createApp() {",
      ],
      [
        [
          'import express from "express"',
          "a package",
          "A bare name: Node.js looks in node_modules. `express` is its default export.",
        ],
        [
          "{ notesRoutes }",
          "a named import",
          "Takes one named export from the file; the name must match.",
        ],
        [
          '"./routes/notes.js"',
          "your own file",
          "Relative to this file, and the .js is required in Node.js.",
        ],
        [
          "export function",
          "an export",
          "server.js and the tests import createApp from here.",
        ],
      ],
    ),
  ),

  part(
    "event-loop",
    "One thread, many requests",
    explain(
      "Node.js runs your JavaScript on one thread: one thing at a time. It still serves many users, because a server mostly waits, for the database, the network or a file. `await pool.query(...)` hands the waiting to Node.js and frees the thread; the event loop runs your code again when the result arrives. Meanwhile, other requests run.",
    ),
    analogy(
      "One waiter, many tables: they take an order to the kitchen and serve other tables while it cooks, instead of standing at the kitchen door.",
    ),
    code(
      "js",
      "Waiting doesn't block; working does",
      [
        "// Fine: the thread is free while it waits",
        "const result = await pool.query(sql);",
        "",
        "// Blocks every request until it's done",
        "for (let i = 0; i < 5e9; i++) {}",
      ],
      {
        2: "other requests run during the wait",
        5: "a long loop: nobody else is served",
      },
    ),
    keyPoints(
      "One thread runs your JavaScript, one piece at a time.",
      "I/O (database, network, files) happens while the thread is free.",
      "Long calculations block every request: keep handlers quick.",
    ),
  ),

  part(
    "package-json",
    "package.json",
    explain(
      "Every Node.js project has a `package.json`: its name, settings, scripts and the [[npm-packages|packages]] it needs. `dependencies` are needed to run the app (Express, the database driver). `devDependencies` are only needed while developing and testing (Vitest, supertest), so the production image skips them.",
    ),
    code(
      "json",
      "The Notes App backend's package.json (shortened)",
      [
        "{",
        '  "type": "module",',
        '  "scripts": {',
        '    "dev": "node --env-file=.env',
        '      --watch src/server.js",',
        '    "start": "node src/server.js",',
        '    "test": "vitest run"',
        "  },",
        '  "dependencies": {',
        '    "express": "^5.3.0",',
        '    "pg": "^8.23.1"',
        "  },",
        '  "devDependencies": {',
        '    "vitest": "^5.0.3"',
        "  }",
      ],
      {
        2: "use import/export",
        4: "really one line, wrapped here",
        10: "needed to run",
        14: "only for tests",
      },
    ),
    inTheNotesApp(
      "The backend's package.json: five dependencies, two devDependencies and three scripts.",
      { fileId: "backend/package.json" },
    ),
  ),

  part(
    "install",
    "Installing packages",
    explain(
      "`npm install express` downloads Express, and every package it needs, into `node_modules`, and adds it to `dependencies`. `npm install` with no name installs everything package.json lists, which is what you do after cloning. `node_modules` can be huge and is rebuilt from package.json, so it's never committed.",
    ),
    code(
      "bash",
      "The commands you'll use",
      [
        "npm install            # everything listed",
        "npm install express    # add a package",
        "npm install -D vitest  # add a dev one",
        "npm uninstall pg       # remove one",
        "npm ci                 # exact, clean",
      ],
      {
        3: "-D: into devDependencies",
        5: "installs exactly what the lockfile says",
      },
    ),
    keyPoints(
      "node_modules: downloaded code, never committed.",
      "After cloning or pulling: npm install.",
      "-D for tools only needed while developing.",
    ),
  ),

  part(
    "semver",
    "Version numbers and ranges",
    explain(
      'Package versions use [[semantic-versioning|semantic versioning]]: MAJOR.MINOR.PATCH. A new MAJOR may break your code; MINOR adds features; PATCH fixes bugs. package.json usually holds a range, not one version. `"^5.3.0"` means 5.3.0 or any later 5.x.x, never 6.0.0.',
    ),
    anatomy(
      "A version range",
      ['"express": "^5.3.0"'],
      [
        ["^", "the range", "Any later version with the same MAJOR number."],
        ["5", "MAJOR", "Changes when something breaks. ^ never crosses it."],
        [".3", "MINOR", "New features that don't break anything."],
        [".0", "PATCH", "Bug fixes only."],
      ],
    ),
    quickCheck(
      'package.json says `"express": "^5.3.0"`. Which version could npm install?',
      ["5.2.9", "5.10.1", "6.0.0"],
      1,
      "`^5.3.0` allows anything from 5.3.0 up while the major stays 5. 5.10.1 is later than 5.3.0 (10 > 3); 5.2.9 is older and 6.0.0 is a new major.",
    ),
  ),

  part(
    "lockfile",
    "The lockfile",
    explain(
      "A range allows many versions, so two people could install different ones. The [[lockfile]], `package-lock.json`, records the exact version of every package that was installed, including the packages your packages use. Commit it. `npm ci` installs exactly what it lists, from scratch, and fails if it doesn't match package.json: that's what servers and CI use.",
    ),
    code(
      "bash",
      "From the Notes App's Dockerfile",
      ["COPY package.json package-lock.json ./", "RUN npm ci --omit=dev"],
      {
        1: "both files, so the versions are exact",
        2: "no devDependencies in production",
      },
    ),
    inTheNotesApp(
      "The Dockerfile copies the lockfile and runs `npm ci --omit=dev`, so production gets the tested versions.",
      { fileId: "backend/Dockerfile" },
    ),
  ),

  part(
    "scripts",
    "npm scripts",
    explain(
      "An [[npm-script|npm script]] gives a project's commands short, shared names. Anyone can clone the Notes App and run `npm run dev` without knowing the flags behind it. `start` and `test` are special: `npm start` and `npm test` work without `run`. Scripts can use tools installed in `node_modules`, such as `vitest`.",
    ),
    code(
      "bash",
      "The Notes App's three scripts",
      [
        "npm run dev   # restarts on every save",
        "npm start     # plain node, production",
        "npm test      # vitest run",
      ],
      {
        1: "node --env-file=.env --watch src/server.js",
        2: "node src/server.js",
      },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Leaving out the file extension",
      wrong: ['import { createApp } from "./app";'],
      problem:
        "Node.js doesn't guess extensions for ES modules: it fails with ERR_MODULE_NOT_FOUND.",
      right: ['import { createApp } from "./app.js";'],
      why: "With ES modules in Node.js, relative imports name the exact file.",
    }),
    mistake({
      title: "Deleting the lockfile to fix a problem",
      language: "bash",
      wrong: ["rm package-lock.json", "npm install"],
      problem:
        "Every package can jump to a newer version at once, so one problem can turn into several new ones.",
      right: ["npm install express@5.3.1"],
      why: "Change the one package you mean to, and commit the lockfile it updates.",
    }),
    mistake({
      title: "A test tool in dependencies",
      language: "json",
      wrong: ['"dependencies": {', '  "vitest": "^5.0.3"', "}"],
      problem:
        "The production install includes it: a bigger image and more code that could have flaws.",
      right: ['"devDependencies": {', '  "vitest": "^5.0.3"', "}"],
      why: "Install tools with `npm install -D`, so `npm ci --omit=dev` leaves them out.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Does this version fit the range?",
      task: 'Write `satisfies(version, range)` for caret ranges. `range` is like `"^5.3.0"`. Return `true` when `version` has the same MAJOR number and is the same as or later than the range\'s version, comparing MINOR then PATCH as numbers.',
      starter: ["function satisfies(version, range) {", "  return true;", "}"],
      tests: [
        ['satisfies("5.3.0", "^5.3.0")', "true"],
        ['satisfies("5.10.1", "^5.3.0")', "true"],
        ['satisfies("5.2.9", "^5.3.0")', "false"],
        ['satisfies("6.0.0", "^5.3.0")', "false"],
        ['satisfies("5.3.1", "^5.3.2")', "false"],
      ],
      hint: 'Turn each into numbers with `.split(".").map(Number)`, using `range.slice(1)` to drop the `^`. Then compare major for equality, minor, then patch.',
      solution: [
        "function satisfies(version, range) {",
        '  const [a, b, c] = version.split(".").map(Number);',
        '  const [x, y, z] = range.slice(1).split(".").map(Number);',
        "  if (a !== x) return false;",
        "  if (b !== y) return b > y;",
        "  return c >= z;",
        "}",
      ],
    }),
    yourTurn({
      title: "Which settings are missing?",
      task: "Write `missingSettings(env, required)`, like the check in server.js. `env` is an object of settings (like `process.env`) and `required` an array of names. Return the names whose value is missing or empty, in the order given.",
      starter: [
        "function missingSettings(env, required) {",
        "  return [];",
        "}",
      ],
      tests: [
        [
          'missingSettings({ PORT: "3000" }, ["DATABASE_URL", "JWT_SECRET"])',
          '["DATABASE_URL", "JWT_SECRET"]',
        ],
        [
          'missingSettings({ DATABASE_URL: "pg://x", JWT_SECRET: "" }, ["DATABASE_URL", "JWT_SECRET"])',
          '["JWT_SECRET"]',
        ],
        [
          'missingSettings({ DATABASE_URL: "pg://x", JWT_SECRET: "s" }, ["DATABASE_URL", "JWT_SECRET"])',
          "[]",
        ],
      ],
      hint: "`required.filter(...)` keeps the names for which `!env[name]` is true. An empty string is falsy too.",
      solution: [
        "function missingSettings(env, required) {",
        "  return required.filter((name) => !env[name]);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Node.js and npm cheat sheet", [
      [
        "node file.js",
        "Run a JavaScript file with Node.js.",
        "node src/server.js",
      ],
      [
        "process.env",
        "The process's settings, as strings (or undefined).",
        "process.env.PORT",
      ],
      [
        "process.exit(code)",
        "Stop now. 0 is success, anything else failure.",
        "process.exit(1)",
      ],
      [
        '"type": "module"',
        "Use import/export; relative imports need .js.",
        'import { x } from "./a.js";',
      ],
      [
        "Event loop",
        "One thread; it serves others while it waits for I/O.",
        "await pool.query(sql)",
      ],
      ["dependencies", "Needed to run the app.", "express, pg"],
      ["devDependencies", "Only for developing and testing.", "vitest"],
      [
        "^5.3.0",
        "5.3.0 or any later 5.x.x, never 6.",
        "5.10.1 fits, 6.0.0 doesn't",
      ],
      [
        "Lockfile",
        "Exact versions of everything installed. Commit it.",
        "package-lock.json",
      ],
      [
        "npm install / npm ci",
        "Install from package.json / exactly from the lockfile.",
        "npm ci --omit=dev",
      ],
      ["npm run <name>", "Run a script from package.json.", "npm run dev"],
    ]),
    quickCheck(
      "A build server needs to install exactly the versions you tested with. Which command?",
      ["npm install", "npm ci", "npm update"],
      1,
      "`npm ci` installs exactly what package-lock.json lists, from a clean node_modules, and fails if it doesn't match package.json. `npm install` may pick newer versions within the ranges.",
    ),
  ),
);
