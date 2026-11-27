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

// Dependency audits: most of your code isn't yours, a CVE taken apart,
// npm audit, fixing a flaw, checking a version range step by step, does it
// really matter, supply-chain attacks, the lockfile and npm ci, making audits
// a habit, mistakes, practice and a recap.
export const dependencyAuditsModule = moduleLesson(
  "dependency-audits",
  "Dependency audits",
  45,
  [
    "Explain transitive dependencies and why most of node_modules is code you never chose.",
    "Read an advisory: its CVE, the package, the vulnerable range, the fix and the severity.",
    "Run npm audit, fix with updates or overrides, and judge whether a flaw really matters.",
    "Recognise supply-chain attacks, and use the lockfile and npm ci against them.",
    "Make audits a routine habit, not a panic.",
  ],

  part(
    "not-yours",
    "Most of your code isn't yours",
    explain(
      "The Notes API's package.json lists five packages. Install them for production and you get 98, because each package brings its own. Those are [[transitive-dependency|transitive dependencies]]: code you never chose, running with the same access as your own. A flaw in any of them is a flaw in your app.",
    ),
    diagram([
      ["Notes API", "you chose 5"],
      ["jsonwebtoken", "you chose it"],
      ["jws", "it chose it"],
      ["jwa", "and it chose this"],
    ]),
    inTheNotesApp(
      "package-lock.json lists every installed package: 98 for production, 179 with the test tools.",
      { fileId: "backend/package-lock.json" },
    ),
  ),

  part(
    "cve",
    "An advisory, taken apart",
    explain(
      "When someone finds a security flaw in a package, it gets a [[cve|CVE]] id and an advisory: which package, which versions are affected, which version fixes it and how serious it is. Scanners compare advisories with your lockfile. This one is made up, but real ones look just like it.",
    ),
    anatomy(
      "A made-up advisory",
      [
        '{ cve: "CVE-2026-12345",',
        '  package: "markdown-lite",',
        '  vulnerable: ">=2.0.0 <2.4.1",',
        '  severity: "high" }',
      ],
      [
        [
          'cve: "CVE-2026-12345"',
          "the id",
          "One public name for the flaw, used by every tool and article.",
        ],
        [
          'package: "markdown-lite"',
          "which package",
          "Whether you installed it yourself or something else did.",
        ],
        [
          '">=2.0.0 <2.4.1"',
          "affected versions",
          "From 2.0.0 up to, but not including, 2.4.1: the fixed version.",
        ],
        [
          'severity: "high"',
          "how bad",
          "low, moderate, high or critical, from a CVSS score.",
        ],
      ],
    ),
  ),

  part(
    "npm-audit",
    "npm audit",
    explain(
      "[[npm-audit|npm audit]] sends your lockfile's package list to the npm registry and prints every advisory that matches. It shows the vulnerable range, the severity, which of your packages pulls it in and whether a fix is available. It exits with an error code when it finds something, so scripts can stop on it.",
    ),
    code(
      "bash",
      "A report with one problem",
      [
        "$ npm audit",
        "markdown-lite  2.0.0 - 2.4.0",
        "Severity: high",
        "Script injection in link titles",
        "fix available via `npm audit fix`",
        "node_modules/markdown-lite",
        "  notes-export  *",
        "  Depends on vulnerable markdown-lite",
        "",
        "1 high severity vulnerability",
      ],
      {
        2: "the affected versions you have",
        5: "a fixed version fits your ranges",
        7: "the package that brought it in",
      },
    ),
    keyPoints(
      "`npm audit --omit=dev`: only what production installs.",
      "`--audit-level=high`: fail only on high or critical.",
      "Run on the Notes API, it reports 0 vulnerabilities today.",
    ),
  ),

  part(
    "fixing",
    "Fixing a flaw",
    explain(
      "First try `npm audit fix`: it updates to fixed versions that your [[semantic-versioning|version ranges]] already allow. If the fix needs a new major version, update that package yourself and read its changelog. If the flaw is deep in a transitive dependency, `npm ls` shows who brings it in, and `overrides` can force a fixed version until the parent catches up.",
    ),
    code(
      "bash",
      "Who brings it in?",
      [
        "$ npm ls markdown-lite",
        "notes-api",
        "└─┬ notes-export@1.2.0",
        "  └── markdown-lite@2.3.0",
      ],
      { 3: "your direct dependency", 4: "the vulnerable one, underneath" },
    ),
    code(
      "json",
      "package.json: force the fixed version",
      ['"overrides": {', '  "markdown-lite": "2.4.1"', "}"],
      { 2: "every copy in the tree uses 2.4.1" },
    ),
  ),

  part(
    "in-range",
    "Is my version affected? Step by step",
    explain(
      'Scanners compare versions number by number, not as text: as text, `"2.10.0"` sorts before `"2.9.0"`. Here `cmp` returns a negative number, zero or a positive one, and version 2.3.0 is checked against `>=2.0.0 <2.4.1`.',
    ),
    trace(
      "Checking 2.3.0 against an advisory",
      [
        "function cmp(a, b) {",
        '  const x = a.split(".").map(Number);',
        '  const y = b.split(".").map(Number);',
        "  for (let i = 0; i < 3; i++) {",
        "    if (x[i] !== y[i]) return x[i] - y[i];",
        "  }",
        "  return 0;",
        "}",
        'const v = "2.3.0";',
        'const hit = cmp(v, "2.0.0") >= 0',
        '  && cmp(v, "2.4.1") < 0;',
        "console.log(hit);",
      ],
      [
        {
          line: 9,
          note: "The version installed, from the lockfile.",
          vars: [
            ["cmp", "ƒ cmp(a, b)"],
            ["v", '"2.3.0"'],
          ],
        },
        {
          line: 3,
          note: "First, is it at least 2.0.0? Both versions become arrays of numbers.",
          vars: [
            ["a", '"2.3.0"'],
            ["b", '"2.0.0"'],
            ["x", "[2, 3, 0]"],
            ["y", "[2, 0, 0]"],
          ],
          stack: ["cmp"],
        },
        {
          line: 5,
          note: "The majors match. At i = 1, 3 and 0 differ: return 3, positive, so 2.3.0 is newer.",
          vars: [
            ["a", '"2.3.0"'],
            ["b", '"2.0.0"'],
            ["x", "[2, 3, 0]"],
            ["y", "[2, 0, 0]"],
            ["i", "1"],
          ],
          stack: ["cmp"],
        },
        {
          line: 5,
          note: "Then, is it below the fixed 2.4.1? At i = 1, 3 and 4 differ: return -1, so yes.",
          vars: [
            ["a", '"2.3.0"'],
            ["b", '"2.4.1"'],
            ["x", "[2, 3, 0]"],
            ["y", "[2, 4, 1]"],
            ["i", "1"],
          ],
          stack: ["cmp"],
        },
        {
          line: 10,
          note: "At least 2.0.0 and below 2.4.1: affected.",
          vars: [
            ["cmp", "ƒ cmp(a, b)"],
            ["v", '"2.3.0"'],
            ["hit", "true"],
          ],
        },
        {
          line: 12,
          note: "Time to update to 2.4.1 or later.",
          vars: [
            ["cmp", "ƒ cmp(a, b)"],
            ["v", '"2.3.0"'],
            ["hit", "true"],
          ],
          output: "true",
        },
      ],
    ),
  ),

  part(
    "does-it-matter",
    "Does it really matter?",
    explain(
      "Not every advisory is an emergency. Ask: does production install it, and does your app reach the flawed code? A flaw in a test tool never runs on the server. A slow-regex flaw in a function you never call is low risk. A flaw in Express or the JWT library is urgent. Update anyway when you can, so the list stays short and real problems stand out.",
    ),
    quickCheck(
      "npm audit reports a high flaw in a package only vitest uses. Production installs with `--omit=dev`. What's the right move?",
      [
        "Stop everything and redeploy now",
        "Update it soon; it never runs in production",
        "Turn npm audit off",
      ],
      1,
      "Dev dependencies aren't installed in production, so the flaw can't be reached there. It's still worth updating, on a normal day, so the audit stays clean and a real problem isn't lost in the noise.",
    ),
  ),

  part(
    "supply-chain",
    "Supply-chain attacks",
    explain(
      "A [[supply-chain-attack|supply-chain attack]] doesn't look for a bug: it ships bad code to you on purpose. A look-alike name (`expresss`), a maintainer's stolen npm account publishing a poisoned update, or an install script that runs the moment you type `npm install`. The code then runs with your server's access and can read `.env`.",
    ),
    reference("How it gets in, and what stops it", [
      [
        "Typo-squatting",
        "A look-alike name. Copy names from the docs.",
        "npm install expresss",
      ],
      [
        "Hijacked update",
        "A real package's new version is malicious.",
        "1.4.7 fine, 1.4.8 steals .env",
      ],
      [
        "Install scripts",
        "postinstall runs code during npm install.",
        "npm ci --ignore-scripts",
      ],
      [
        "Too many packages",
        "Each one is another way in. Add few, known ones.",
        "is-odd for one line of code",
      ],
    ]),
  ),

  part(
    "lockfile",
    "The lockfile and npm ci",
    explain(
      "The [[lockfile]] records the exact version of every package and an `integrity` hash of its contents. `npm ci` installs exactly that, checks every hash, and fails if package.json and the lockfile disagree. So a new, poisoned version can't sneak in during a deploy: it arrives only when someone updates the lockfile and a reviewer can see it.",
    ),
    code(
      "bash",
      "Installing on a server",
      ["npm ci --omit=dev", "", "# not on a server:", "npm install"],
      {
        1: "exactly the lockfile, no test tools",
        4: "may pick newer versions",
      },
    ),
    inTheNotesApp(
      "The production image's build runs `npm ci --omit=dev`, so it installs exactly what the lockfile lists.",
      { fileId: "backend/Dockerfile" },
    ),
  ),

  part(
    "habit",
    "Make it a habit",
    explain(
      "Audits help only if they run. Run `npm audit` on every change in your automated checks, so a new flaw fails the build. Let a bot like Dependabot or Renovate open small update pull requests every week, and review them like any other code. The Notes App has no audit script; here is one.",
    ),
    code(
      "json",
      "package.json scripts (not in the Notes App)",
      [
        '"scripts": {',
        '  "start": "node src/server.js",',
        '  "test": "vitest run",',
        '  "deps": "npm audit --audit-level=high"',
        "}",
      ],
      { 4: "npm run deps fails on high or critical" },
    ),
    inTheNotesApp(
      "The scripts are dev, start and test. Nothing checks the dependencies.",
      { fileId: "backend/package.json" },
    ),
    quickCheck(
      "Which setup catches a new flaw in a dependency soonest?",
      [
        "Running npm audit once, at launch",
        "npm audit on every change, plus weekly update PRs",
        "Never updating, so nothing changes",
      ],
      1,
      "New advisories appear every week for packages you already have. Running the audit on every change and taking small regular updates finds them early, while each fix is still small.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "npm audit fix --force without reading",
      language: "bash",
      wrong: ["npm audit fix --force", "git commit -am 'fix audit'"],
      problem:
        "--force can install new major versions that break your app, and nobody checked.",
      right: ["npm audit fix", "npm test", "git diff package-lock.json"],
      why: "Take the safe fixes first, run the tests, and update major versions one at a time on purpose.",
    }),
    mistake({
      title: "Deleting the lockfile to fix things",
      language: "bash",
      wrong: ["rm package-lock.json", "npm install"],
      problem:
        "Every package, including all transitive ones, jumps to whatever is newest today, unreviewed.",
      right: ["npm update markdown-lite", "npm audit"],
      why: "Change the one package you mean to, so the lockfile diff shows exactly what moved.",
    }),
    mistake({
      title: "Copying a package name from memory",
      language: "bash",
      wrong: ["npm install expresss"],
      problem:
        "A typo-squatted package installs and its scripts run on your machine.",
      right: ["npm view express", "npm install express"],
      why: "Check the name, author and downloads first, or copy it from the official docs.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Compare two versions",
      task: 'Write `compareVersions(a, b)` for versions like `"2.10.0"`. Return `1` if a is newer, `-1` if b is newer, `0` if they\'re the same. Compare major, then minor, then patch, as numbers.',
      starter: [
        "function compareVersions(a, b) {",
        "  if (a === b) return 0;",
        "  return a > b ? 1 : -1;",
        "}",
      ],
      tests: [
        ['compareVersions("2.4.1", "2.4.0")', "1"],
        ['compareVersions("1.10.0", "1.9.9")', "1"],
        ['compareVersions("3.0.0", "3.0.0")', "0"],
        ['compareVersions("0.9.0", "1.0.0")', "-1"],
      ],
      hint: 'Split both on `"."` and map to Number. Loop over the three parts and return as soon as they differ.',
      solution: [
        "function compareVersions(a, b) {",
        '  const x = a.split(".").map(Number);',
        '  const y = b.split(".").map(Number);',
        "  for (let i = 0; i < 3; i++) {",
        "    if (x[i] > y[i]) return 1;",
        "    if (x[i] < y[i]) return -1;",
        "  }",
        "  return 0;",
        "}",
      ],
    }),
    yourTurn({
      title: "Is this version affected?",
      task: "Write `isVulnerable(version, advisory)`. The advisory is `{ from, fixed }`. Return `true` if the version is at least `from` and below `fixed`. Compare as numbers, part by part.",
      starter: [
        "function isVulnerable(version, advisory) {",
        "  return false;",
        "}",
      ],
      tests: [
        ['isVulnerable("2.3.0", { from: "2.0.0", fixed: "2.4.1" })', "true"],
        ['isVulnerable("2.4.1", { from: "2.0.0", fixed: "2.4.1" })', "false"],
        ['isVulnerable("1.9.0", { from: "2.0.0", fixed: "2.4.1" })', "false"],
        ['isVulnerable("2.10.0", { from: "2.9.0", fixed: "2.11.0" })', "true"],
      ],
      hint: "Write a small `cmp(a, b)` first, then return `cmp(version, from) >= 0 && cmp(version, fixed) < 0`.",
      solution: [
        "function cmp(a, b) {",
        '  const x = a.split(".").map(Number);',
        '  const y = b.split(".").map(Number);',
        "  for (let i = 0; i < 3; i++) {",
        "    if (x[i] !== y[i]) return x[i] - y[i];",
        "  }",
        "  return 0;",
        "}",
        "function isVulnerable(version, advisory) {",
        "  return cmp(version, advisory.from) >= 0",
        "    && cmp(version, advisory.fixed) < 0;",
        "}",
      ],
    }),
    yourTurn({
      title: "--audit-level",
      task: "Write `auditFails(counts, level)`. `counts` has `low`, `moderate`, `high` and `critical`. Return `true` if any severity at `level` or above has a count over 0, like `npm audit --audit-level`.",
      starter: [
        "function auditFails(counts, level) {",
        "  return counts[level] > 0;",
        "}",
      ],
      tests: [
        [
          'auditFails({ low: 3, moderate: 0, high: 0, critical: 0 }, "high")',
          "false",
        ],
        [
          'auditFails({ low: 0, moderate: 0, high: 1, critical: 0 }, "high")',
          "true",
        ],
        [
          'auditFails({ low: 0, moderate: 0, high: 0, critical: 2 }, "moderate")',
          "true",
        ],
        [
          'auditFails({ low: 1, moderate: 0, high: 0, critical: 0 }, "low")',
          "true",
        ],
      ],
      hint: 'Keep the order in an array: `["low", "moderate", "high", "critical"]`. Slice from the level\'s index and check whether `some` count is over 0.',
      solution: [
        "function auditFails(counts, level) {",
        "  const order = [",
        '    "low", "moderate", "high", "critical",',
        "  ];",
        "  return order",
        "    .slice(order.indexOf(level))",
        "    .some((s) => counts[s] > 0);",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Dependency audits cheat sheet", [
      [
        "Transitive dependency",
        "Installed by your packages, not by you.",
        "jsonwebtoken → jws → jwa",
      ],
      [
        "CVE",
        "A public id for one flaw, with its affected versions.",
        "CVE-2026-12345: >=2.0.0 <2.4.1",
      ],
      [
        "npm audit",
        "Checks the lockfile against advisories.",
        "npm audit --omit=dev",
      ],
      [
        "npm audit fix",
        "Updates within your ranges. Read before --force.",
        "npm audit fix && npm test",
      ],
      ["npm ls", "Who brings a package in.", "npm ls markdown-lite"],
      [
        "overrides",
        "Force a transitive package's version.",
        '"overrides": { "markdown-lite": "2.4.1" }',
      ],
      [
        "Does it matter?",
        "Installed in production? Is the flawed code reached?",
        "a test-only flaw can wait a day",
      ],
      [
        "Supply-chain attack",
        "Bad code shipped to you on purpose.",
        "expresss, a hijacked update",
      ],
      [
        "Lockfile + npm ci",
        "Exact versions with integrity hashes.",
        "npm ci --omit=dev",
      ],
      [
        "Habit",
        "Audit on every change; weekly update PRs.",
        "npm audit --audit-level=high",
      ],
    ]),
    quickCheck(
      "npm audit flags a package you've never heard of and never installed. Why is it in your app?",
      [
        "npm installed it at random",
        "One of your dependencies depends on it",
        "Someone hacked your package.json",
      ],
      1,
      "It's a transitive dependency: something you installed needs it, perhaps several levels down. `npm ls <name>` shows the chain, and updating the parent or an override fixes it.",
    ),
  ),
);
