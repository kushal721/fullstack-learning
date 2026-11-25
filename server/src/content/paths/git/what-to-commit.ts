import {
  anatomy,
  code,
  explain,
  inTheNotesApp,
  keyPoints,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// What to commit: .gitignore, secrets and stash. What belongs in a
// repository, a .gitignore taken apart, patterns, ignoring something
// already tracked step by step, secrets, generated files and lock files,
// stash, the Notes App, mistakes, practice and a recap.
export const whatToCommitModule = moduleLesson(
  "what-to-commit",
  "What to commit: .gitignore, secrets and stash",
  40,
  [
    "Decide what belongs in a repository and what doesn't.",
    "Write .gitignore patterns, and stop tracking a file that's already committed.",
    "Keep secrets out of Git, and know what to do if one leaks.",
    "Set unfinished work aside with git stash.",
  ],

  part(
    "what-belongs",
    "What belongs in a repository",
    explain(
      "A repository should hold everything needed to *rebuild* the project, and nothing that can be rebuilt or shouldn't be shared. Code and settings go in. Installed packages, build output and logs can be regenerated, so they stay out. Secrets never go in at all.",
    ),
    reference("Commit it or not?", [
      ["Source code, tests", "Commit.", "src/, *.test.js"],
      [
        "package.json + lock file",
        "Commit: exact versions for everyone.",
        "package-lock.json",
      ],
      ["node_modules/", "Don't: npm install rebuilds it.", "hundreds of MB"],
      ["dist/, build/", "Don't: the build makes it.", "npm run build"],
      [".env with secrets", "Never.", "passwords, keys"],
      [".env.example", "Commit: the settings, with fake values.", "PORT=3000"],
      ["Logs, OS files", "Don't.", "*.log, .DS_Store"],
    ]),
  ),

  part(
    "gitignore-anatomy",
    "A .gitignore, taken apart",
    explain(
      "A [[gitignore|.gitignore]] file, committed at the top of the repository, lists patterns of files Git should pretend aren't there: they don't show in `git status` and `git add .` skips them. One pattern per line:",
    ),
    anatomy(
      ".gitignore",
      ["node_modules/", ".env", "*.log", "!.env.example"],
      [
        [
          "node_modules/",
          "a folder",
          "The trailing / means a folder, anywhere.",
        ],
        [".env", "one file name", "Matches .env in any folder."],
        ["*.log", "a wildcard", "Every file ending in .log."],
        [
          "!.env.example",
          "an exception",
          "! un-ignores something a pattern caught.",
        ],
      ],
    ),
  ),

  part(
    "patterns",
    "Patterns",
    explain(
      "Patterns work like file-name wildcards. A pattern without a slash matches at any depth; a leading `/` anchors it to the repository's root. Lines starting with `#` are comments. When in doubt, `git check-ignore -v file` tells you which line ignores a file.",
    ),
    reference(".gitignore patterns", [
      ["name", "Any file or folder called name.", ".env"],
      ["folder/", "Only folders.", "dist/"],
      ["*.ext", "Any file with that ending.", "*.log"],
      ["/name", "Only at the root.", "/coverage"],
      ["dir/**/x", "x at any depth inside dir.", "logs/**/*.txt"],
      ["!pattern", "Exception: don't ignore this.", "!.env.example"],
    ]),
    quickCheck(
      "Which pattern ignores every `.log` file anywhere in the project?",
      ["`/*.log`", "`*.log`", "`log/`"],
      1,
      "Without a leading `/`, `*.log` matches at any depth. `/*.log` would only match at the root.",
    ),
  ),

  part(
    "step-by-step",
    "Ignoring a tracked file, step by step",
    explain(
      "`.gitignore` only affects files Git isn't tracking yet. Step through ignoring `node_modules/`, then discovering `.env` was committed before the rule existed:",
    ),
    trace(
      "node_modules and a tracked .env",
      [
        "npm install",
        "git status: ?? node_modules/",
        "add node_modules/ to .gitignore",
        "git status: clean",
        "add .env to .gitignore",
        "git status: M .env",
        "git rm --cached .env",
        'git commit -m "chore: untrack .env"',
        "rotate the leaked secret",
      ],
      [
        {
          line: 2,
          note: "Installing packages creates `node_modules/`, thousands of files Git now offers to track.",
          vars: [["node_modules/", "untracked"]],
        },
        {
          line: 4,
          note: "With the pattern in `.gitignore`, Git stops showing it. It was never tracked, so nothing else is needed.",
          vars: [["node_modules/", "ignored"]],
        },
        {
          line: 6,
          note: "But `.env` was committed weeks ago. Ignore rules don't apply to tracked files: Git still sees your edits to it.",
          vars: [[".env", "still tracked"]],
        },
        {
          line: 8,
          note: "`git rm --cached` stops tracking the file but leaves it on your disk. The commit records that it's no longer tracked.",
          vars: [[".env", "ignored, kept on disk"]],
        },
        {
          line: 9,
          note: "Old commits still contain the secret, on GitHub and in every clone. Change the password or key itself: that's the only real fix.",
          vars: [["secret", "rotated"]],
          output: ".env ignored · old secret useless",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "secrets",
    "Keeping secrets out",
    explain(
      "Passwords, API keys and tokens belong in [[environment-config|environment variables]], read from an ignored `.env` file locally and from the host's settings in production. Commit a `.env.example` with fake values so people know which settings exist. GitHub scans pushes for known key formats and can block them, but don't rely on it.",
    ),
    keyPoints(
      "Secrets live in .env (ignored) or the host's settings.",
      "Commit .env.example with fake values.",
      "A pushed secret is leaked: rotate it first.",
      "Removing it in a new commit doesn't erase history.",
    ),
  ),

  part(
    "generated-and-lock-files",
    "Generated files and lock files",
    explain(
      "Generated files are rebuilt from source: commit the source, not the result. Lock files are the exception that proves the rule: `package-lock.json` is generated, but it records the exact version of every package, so everyone (and the server) installs the same thing. Always commit it.",
    ),
    reference("Generated, but which?", [
      ["package-lock.json", "Commit: pins exact versions.", "npm ci uses it"],
      ["node_modules/", "Ignore: npm ci rebuilds it.", "from the lock file"],
      ["dist/", "Ignore: npm run build makes it.", "deployed, not committed"],
      ["coverage/", "Ignore: tests make it.", "npm test -- --coverage"],
    ]),
  ),

  part(
    "stash",
    "Stash: setting work aside",
    explain(
      "Halfway through a change, you need to switch branches for an urgent fix, but the work isn't ready to commit. [[git-stash|git stash]] takes your uncommitted changes off the working folder and keeps them safe; `git stash pop` puts them back later, on any branch.",
    ),
    code(
      "bash",
      "pausing work for an urgent fix",
      [
        "$ git stash",
        "Saved working directory and index state WIP on feature/tags",
        "$ git switch main",
        "# …fix, commit, push…",
        "$ git switch feature/tags",
        "$ git stash pop",
        "$ git stash list",
      ],
      {
        1: "set the unfinished work aside",
        3: "the working folder is clean, so switching is safe",
        6: "bring the work back",
        7: "see anything still stashed",
      },
    ),
  ),

  part(
    "notes-app",
    "What the Notes App commits",
    explain(
      "The Notes App commits its source, its tests, `package.json` and the lock files. Its real `.env` holds `DATABASE_URL` and `JWT_SECRET`, so it's ignored; `.env.example` lists the same settings with safe values. The `.dockerignore` file does the same job for Docker images: it keeps `node_modules` and `.env` out of them.",
    ),
    inTheNotesApp(
      "`.env.example` is the committed, secret-free twin of the ignored `.env`.",
      { fileId: "backend/.env.example" },
    ),
    inTheNotesApp(
      "`.dockerignore` keeps the same files out of the Docker image that `.gitignore` keeps out of Git.",
      { fileId: "backend/.dockerignore" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Committing node_modules",
      language: "bash",
      wrong: ["$ git add .", "# 48,000 files changed"],
      problem:
        "Hundreds of megabytes of packages enter the history forever, every clone is slow, and they're specific to your computer.",
      right: ["$ echo node_modules/ >> .gitignore", "$ git add ."],
      why: "Add `.gitignore` before the first `git add .`. The lock file is all others need.",
    }),
    mistake({
      title: "Expecting .gitignore to untrack a file",
      language: "bash",
      wrong: ["# added .env to .gitignore, but git status still shows it"],
      problem:
        "Ignore rules only apply to untracked files. A file that's already committed stays tracked.",
      right: [
        "$ git rm --cached .env",
        '$ git commit -m "chore: untrack .env"',
      ],
      why: "`git rm --cached` stops tracking it but keeps your copy. Then rotate any secret it held.",
    }),
    mistake({
      title: "Forgetting a stash",
      language: "bash",
      wrong: ["$ git stash", "# …two weeks later: where did my work go?"],
      problem:
        "Stashes are easy to forget, and they're not on any branch or on GitHub. A long-lived stash is lost work waiting to happen.",
      right: ["$ git stash list", "$ git stash pop"],
      why: "Pop stashes soon. For anything longer, commit to a branch instead.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Commit or ignore?",
      task: "Replace each `?` with `commit` or `ignore` for that file in a Node project.",
      starter: [
        '<p>package-lock.json: <span id="lock">?</span></p>',
        '<p>node_modules/: <span id="modules">?</span></p>',
        '<p>.env (has the database password): <span id="env">?</span></p>',
        '<p>.env.example: <span id="example">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Lock files pin versions",
          selector: "#lock",
          text: "commit",
        },
        {
          kind: "text",
          label: "Packages are rebuilt",
          selector: "#modules",
          text: "ignore",
        },
        {
          kind: "text",
          label: "Secrets never go in",
          selector: "#env",
          text: "ignore",
        },
        {
          kind: "text",
          label: "The example is safe to share",
          selector: "#example",
          text: "commit",
        },
      ],
      hint: "Can it be rebuilt? Ignore. Does it hold a secret? Ignore. Does everyone need it to rebuild the project? Commit.",
      solution: [
        '<p>package-lock.json: <span id="lock">commit</span></p>',
        '<p>node_modules/: <span id="modules">ignore</span></p>',
        '<p>.env (has the database password): <span id="env">ignore</span></p>',
        '<p>.env.example: <span id="example">commit</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Does it match?",
      task: "The .gitignore has `*.log`, `dist/` and `/coverage`. Replace each `?` with `ignored` or `tracked`.",
      starter: [
        "<pre>*.log",
        "dist/",
        "/coverage</pre>",
        '<p>server/logs/error.log: <span id="log">?</span></p>',
        '<p>frontend/dist/index.js: <span id="dist">?</span></p>',
        '<p>frontend/coverage/report.html: <span id="cov">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "*.log matches at any depth",
          selector: "#log",
          text: "ignored",
        },
        {
          kind: "text",
          label: "dist/ matches any dist folder",
          selector: "#dist",
          text: "ignored",
        },
        {
          kind: "text",
          label: "/coverage only matches at the root",
          selector: "#cov",
          text: "tracked",
        },
      ],
      hint: "A leading `/` anchors a pattern to the repository's root. Without one, it matches anywhere.",
      solution: [
        "<pre>*.log",
        "dist/",
        "/coverage</pre>",
        '<p>server/logs/error.log: <span id="log">ignored</span></p>',
        '<p>frontend/dist/index.js: <span id="dist">ignored</span></p>',
        '<p>frontend/coverage/report.html: <span id="cov">tracked</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("What to commit cheat sheet", [
      ["commit", "Source, tests, configs, lock files.", "package-lock.json"],
      ["ignore", "Rebuildable or secret.", "node_modules/, .env"],
      [".gitignore", "One pattern per line, committed.", "*.log, dist/"],
      ["!pattern", "Exception to a pattern.", "!.env.example"],
      ["git rm --cached", "Stop tracking, keep the file.", "then commit"],
      ["leaked secret", "Rotate it; history keeps it.", "new password"],
      ["git stash", "Set uncommitted work aside.", "git stash pop"],
      ["git check-ignore -v", "Which rule ignores a file.", "debugging"],
    ]),
    quickCheck(
      "You add `.env` to `.gitignore`, but it was committed last week. Is the secret safe?",
      [
        "Yes: .gitignore hides it",
        "No: it's still tracked and in the history; untrack it and rotate the secret",
        "Yes, once you push",
      ],
      1,
      "Ignoring doesn't untrack or erase history. `git rm --cached` stops tracking; rotating makes the old secret useless.",
    ),
  ),
);
