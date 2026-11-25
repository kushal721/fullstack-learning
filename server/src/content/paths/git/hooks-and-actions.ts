import {
  anatomy,
  code,
  diagram,
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

// Hooks and GitHub Actions: automatic checks. Why automate, Git hooks,
// sharing hooks with a team, GitHub Actions, a workflow taken apart, a
// whole workflow, a change through both step by step, secrets and
// required checks, the Notes App, mistakes, practice and a recap.
export const hooksAndActionsModule = moduleLesson(
  "hooks-and-actions",
  "Hooks and GitHub Actions: automatic checks",
  45,
  [
    "Explain why teams automate checks, and where hooks and CI each run.",
    "Use Git hooks to check code and messages before a commit is made.",
    "Read and write a GitHub Actions workflow that tests every pull request.",
    "Keep secrets out of workflows, and require checks before merging.",
  ],

  part(
    "why-automate",
    "Why automate checks?",
    explain(
      "People forget to run the tests, format the code or write a proper message, especially in a hurry. Automatic checks never forget. **Hooks** run on your computer, the moment you commit, so you hear about a problem in seconds. **CI** runs on GitHub's computers for every push and pull request, so nothing unchecked reaches `main`.",
    ),
    diagram([
      ["git commit", "hooks: lint, message"],
      ["git push", "→ GitHub"],
      ["GitHub Actions", "CI: install, test, build"],
      ["pull request", "✓ or ✗ beside it"],
    ]),
  ),

  part(
    "hooks",
    "Git hooks",
    explain(
      "A [[git-hook|hook]] is a script Git runs at a certain moment. If it exits with an error, Git stops what it was doing. A `pre-commit` hook can lint the staged files; a `commit-msg` hook can reject messages that aren't conventional. Hooks live in `.git/hooks`, which isn't committed.",
    ),
    reference("Hooks you'll meet", [
      [
        "pre-commit",
        "Before the commit is made.",
        "lint and format staged files",
      ],
      ["commit-msg", "Checks the message.", "must be conventional"],
      ["pre-push", "Before pushing.", "run the tests"],
      ["--no-verify", "Skips the hooks, once.", "emergencies only"],
    ]),
  ),

  part(
    "sharing-hooks",
    "Sharing hooks with a team",
    explain(
      "Because `.git/hooks` isn't committed, teams use a small tool such as `simple-git-hooks` or Husky: the hooks are written in `package.json`, committed, and installed for everyone by `npm install`. `lint-staged` makes the pre-commit hook fast by checking only the files being committed.",
    ),
    code(
      "json",
      "hooks set up in package.json",
      [
        '"simple-git-hooks": {',
        '  "pre-commit": "npx lint-staged",',
        '  "commit-msg": "node check-msg.mjs $1"',
        "},",
        '"lint-staged": {',
        '  "*.{js,jsx}": ["eslint --fix", "prettier --write"]',
        "}",
      ],
      {
        2: "lint the staged files before every commit",
        3: "reject a message that isn't conventional",
        6: "only the files being committed",
      },
    ),
  ),

  part(
    "actions",
    "GitHub Actions",
    explain(
      "[[github-actions|GitHub Actions]] is GitHub's CI. You commit a **workflow** file in `.github/workflows/`. It says *when* to run (on a pull request, on a push to `main`) and *what* to run: **jobs** made of **steps**, each running on a fresh virtual machine called a **runner**.",
    ),
    anatomy(
      "The top of a workflow",
      ["on: pull_request", "jobs:", "  test:", "    runs-on: ubuntu-latest"],
      [
        ["on: pull_request", "trigger", "When it runs: every pull request."],
        ["jobs:", "jobs", "One or more jobs; they run in parallel."],
        ["test:", "a job", "Its name shows beside the pull request."],
        [
          "runs-on: ubuntu-latest",
          "runner",
          "A fresh Linux machine for each run.",
        ],
      ],
    ),
  ),

  part(
    "a-workflow",
    "A whole workflow",
    explain(
      "Here's a complete workflow that tests every pull request and every push to `main`. Each step either **uses** a ready-made action (like checking out the code) or **runs** a command:",
    ),
    code(
      "bash",
      ".github/workflows/ci.yml",
      [
        "name: CI",
        "on:",
        "  pull_request:",
        "  push:",
        "    branches: [main]",
        "jobs:",
        "  test:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - uses: actions/setup-node@v4",
        "        with: { node-version: 22 }",
        "      - run: npm ci",
        "      - run: npm test",
      ],
      {
        3: "on every pull request…",
        5: "…and every push to main",
        10: "get the repository's code",
        11: "install Node 22",
        13: "install exactly what the lock file says",
        14: "a failing test fails the job",
      },
    ),
  ),

  part(
    "step-by-step",
    "A change through hooks and CI, step by step",
    explain(
      "Step through committing and pushing a change, with a commit-msg hook locally and the workflow above on GitHub:",
    ),
    trace(
      "From commit to green check",
      [
        'git commit -m "added search"',
        "pre-commit: lint ✓",
        "commit-msg: ✗ not conventional",
        'git commit -m "feat: search"',
        "hooks ✓ · committed",
        "git push · PR opens",
        "Actions: runner starts",
        "npm ci · npm test ✗",
        "fix, commit, push",
        "npm test ✓ · check green",
      ],
      [
        {
          line: 3,
          note: "The pre-commit hook linted the staged files and passed, but the commit-msg hook rejected the message. No commit was made.",
          vars: [
            ["commits", "none yet"],
            ["CI", "not started"],
          ],
          output: "✗ commit message must look like “type: description”",
        },
        {
          line: 5,
          note: "With a conventional message, both hooks pass and the commit is made. All of this took a couple of seconds.",
          vars: [
            ["commits", "1"],
            ["CI", "not started"],
          ],
        },
        {
          line: 8,
          note: "On GitHub, a fresh runner checks out the branch, installs and tests. A test fails: the job goes red, and the pull request shows ✗.",
          vars: [["CI", "✗ test failed"]],
        },
        {
          line: 10,
          note: "The fix is pushed to the same branch; the workflow runs again and passes. The pull request shows a green check.",
          vars: [["CI", "✓ passed"]],
          output: "✓ CI / test (pull_request)",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "secrets-and-required-checks",
    "Secrets and required checks",
    explain(
      "A workflow that deploys needs passwords or tokens. Never write them in the file: store them in the repository's **Settings → Secrets**, and use them as `${{ secrets.NAME }}`; GitHub hides them in logs. Then make CI count: a branch rule can **require** the check to pass before anything is merged into `main`.",
    ),
    keyPoints(
      "Secrets go in repository settings, never in the YAML.",
      "Use them as ${{ secrets.DEPLOY_TOKEN }}.",
      "Require the CI check in a branch rule on main.",
      "Pull requests from forks don't get your secrets.",
    ),
  ),

  part(
    "notes-app",
    "Automatic checks for the Notes App",
    explain(
      "The Notes App's tests are what a workflow would run: the frontend's component tests, and the backend's API tests against a real PostgreSQL started as a service in the job. With the check required on `main`, a change that breaks saving a note can't be merged.",
    ),
    inTheNotesApp(
      "`notes.test.js` tests the real API and database: the backend half of the CI job.",
      { fileId: "backend/src/routes/notes.test.js" },
    ),
    inTheNotesApp(
      "`NoteForm.test.jsx` tests the form in a simulated browser: the frontend half.",
      { fileId: "frontend/src/components/NoteForm.test.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Skipping hooks as a habit",
      language: "bash",
      wrong: ['$ git commit --no-verify -m "wip"'],
      problem:
        "The checks exist to catch exactly the commit you're in a hurry with. Skipping them pushes the problem to CI, or to `main`.",
      right: ["# fix what the hook reports, then commit"],
      why: "Keep `--no-verify` for emergencies. If a hook is too slow or noisy, fix the hook.",
    }),
    mistake({
      title: "A secret in the workflow file",
      language: "bash",
      wrong: ["      - run: deploy --token ghp_9f8e7d6c5b4a"],
      problem:
        "The workflow file is committed, so the token is in the repository for anyone who can read it, forever.",
      right: ["      - run: deploy --token ${{ secrets.DEPLOY_TOKEN }}"],
      why: "Store it in Settings → Secrets; rotate any token that was ever committed.",
    }),
    mistake({
      title: "A slow pre-commit hook",
      language: "json",
      wrong: ['"pre-commit": "npm test && npm run build"'],
      problem:
        "Every commit takes minutes, so people start committing less often, or skipping the hook.",
      right: ['"pre-commit": "npx lint-staged"'],
      why: "Keep hooks to seconds: lint the staged files. Leave the full suite to CI.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Which hook?",
      task: "Replace each `?` with the hook that should do it: `pre-commit`, `commit-msg` or `pre-push`.",
      starter: [
        '<p>Format the staged files with Prettier: <span id="format">?</span></p>',
        '<p>Reject a message like “stuff”: <span id="message">?</span></p>',
        '<p>Run the tests before anything leaves your laptop: <span id="push">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Before the commit",
          selector: "#format",
          text: "pre-commit",
        },
        {
          kind: "text",
          label: "About the message",
          selector: "#message",
          text: "commit-msg",
        },
        {
          kind: "text",
          label: "Before pushing",
          selector: "#push",
          text: "pre-push",
        },
      ],
      hint: "Each hook is named after the moment it runs.",
      solution: [
        '<p>Format the staged files with Prettier: <span id="format">pre-commit</span></p>',
        '<p>Reject a message like “stuff”: <span id="message">commit-msg</span></p>',
        '<p>Run the tests before anything leaves your laptop: <span id="push">pre-push</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Read the workflow",
      task: "Read the workflow, then replace each `?`: the event that starts it, the runner it uses, and the command that runs the tests.",
      starter: [
        "<pre>on: pull_request",
        "jobs:",
        "  check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - run: npm ci",
        "      - run: npm test</pre>",
        '<p>Starts on: <span id="on">?</span></p>',
        '<p>Runner: <span id="runner">?</span></p>',
        '<p>Test command: <span id="test">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The trigger",
          selector: "#on",
          text: "pull_request",
        },
        {
          kind: "text",
          label: "The runner",
          selector: "#runner",
          text: "ubuntu-latest",
        },
        {
          kind: "text",
          label: "The test step",
          selector: "#test",
          text: "npm test",
        },
      ],
      hint: "`on:` is the trigger, `runs-on:` the machine, and each `run:` a command.",
      solution: [
        "<pre>on: pull_request",
        "jobs:",
        "  check:",
        "    runs-on: ubuntu-latest",
        "    steps:",
        "      - uses: actions/checkout@v4",
        "      - run: npm ci",
        "      - run: npm test</pre>",
        '<p>Starts on: <span id="on">pull_request</span></p>',
        '<p>Runner: <span id="runner">ubuntu-latest</span></p>',
        '<p>Test command: <span id="test">npm test</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Hooks and Actions cheat sheet", [
      ["hook", "A script Git runs at a moment.", "pre-commit"],
      ["commit-msg", "Checks the commit message.", "conventional"],
      ["simple-git-hooks", "Shares hooks through package.json.", "npm install"],
      ["lint-staged", "Checks only staged files.", "fast hooks"],
      ["workflow", "A YAML file in .github/workflows.", "ci.yml"],
      ["on / jobs / steps", "When / what / how.", "pull_request"],
      ["secrets", "${{ secrets.NAME }}, never in YAML.", "Settings → Secrets"],
      ["required check", "Must pass before merging.", "branch rule"],
    ]),
    quickCheck(
      "Where should the full test suite run on every pull request?",
      [
        "In a pre-commit hook",
        "In a GitHub Actions workflow",
        "Only on the reviewer's laptop",
      ],
      1,
      "CI runs on a clean machine for every pull request, whoever made it. Hooks are for quick local checks.",
    ),
  ),
);
