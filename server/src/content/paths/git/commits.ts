import {
  analogy,
  anatomy,
  code,
  diagram,
  explain,
  inTheNotesApp,
  mistake,
  moduleLesson,
  pageYourTurn,
  part,
  quickCheck,
  reference,
  trace,
} from "../blocks.js";

// Commits: saving snapshots. What a commit is, one taken apart, good
// messages, choosing what goes in, reading a diff, two commits step by
// step, reading history, undoing, the Notes App, mistakes, practice and a
// recap.
export const commitsModule = moduleLesson(
  "commits",
  "Commits: saving snapshots",
  40,
  [
    "Explain what a commit stores: a snapshot, a message, an author and its parent.",
    "Write clear commit messages in the conventional style.",
    "Stage exactly the changes you mean, and read a diff before committing.",
    "Read the history with git log, and undo changes safely.",
  ],

  part(
    "snapshots",
    "A commit is a snapshot",
    explain(
      "A [[git-commit|commit]] is a saved snapshot of the whole project at one moment, with a message saying what changed and why. Each commit also records who made it, when, and the commit before it: its **parent**. Following parents back gives you the project's whole history, one snapshot at a time.",
    ),
    diagram([
      ["c1", "docs: add readme"],
      ["c2", "feat: list notes"],
      ["c3", "feat: add note form"],
    ]),
    analogy(
      "A photo album of your project: every page is a full photo, dated and captioned, and the album is in order.",
    ),
  ),

  part(
    "commit-anatomy",
    "A commit, taken apart",
    explain(
      "Every commit gets a unique id, a **hash**: 40 hexadecimal characters calculated from its contents, usually shortened to the first seven. `git log` shows the commits, newest first:",
    ),
    anatomy(
      "One commit in git log",
      [
        "commit 3f9a2c1e8b…",
        "Author: Sam <sam@notes.app>",
        "Date:   Tue Nov 24 10:02",
        "    feat: add note form",
      ],
      [
        ["3f9a2c1e8b…", "hash", "Its unique id; 3f9a2c1 is enough to name it."],
        [
          "Sam <sam@notes.app>",
          "author",
          "Who made it, from your Git settings.",
        ],
        ["Tue Nov 24 10:02", "date", "When it was made."],
        [
          "feat: add note form",
          "message",
          "What changed and why, in one line.",
        ],
      ],
    ),
  ),

  part(
    "messages",
    "Writing good messages",
    explain(
      "The message is for the person reading the history later, often you. A good one says *what* changed in a short first line, in the imperative (“add”, not “added”). Many teams use [[conventional-commit|conventional commits]]: a type, an optional scope, then the description.",
    ),
    reference("Conventional commit types", [
      ["feat", "A new feature.", "feat: add note search"],
      ["fix", "A bug fix.", "fix(api): 404 for unknown notes"],
      ["docs", "Documentation only.", "docs: explain .env"],
      ["test", "Adding or fixing tests.", "test: cover empty titles"],
      [
        "refactor",
        "Code change, same behaviour.",
        "refactor: extract request()",
      ],
      ["chore", "Tooling, dependencies.", "chore: update vite"],
    ]),
    quickCheck(
      "Which is the most useful commit message?",
      ["`stuff`", "`fix: show an error when the title is empty`", "`changes`"],
      1,
      "It says the kind of change and exactly what it does, so nobody has to open the diff to know.",
    ),
  ),

  part(
    "choosing-changes",
    "Choosing what goes in",
    explain(
      "One commit should be one change: a feature, a fix. If you edited two things, stage and commit them separately, so each can be understood or undone alone. `git add file` stages a whole file; `git add -p` walks through each changed piece and asks which to stage.",
    ),
    code(
      "bash",
      "staging only what belongs together",
      [
        "$ git status --short",
        " M NoteForm.jsx",
        " M README.md",
        "",
        "$ git add NoteForm.jsx",
        '$ git commit -m "feat: add note form"',
        "",
        "$ git add README.md",
        '$ git commit -m "docs: describe the form"',
      ],
      {
        2: "two unrelated changes",
        6: "commit the feature on its own",
        9: "then the docs, separately",
      },
    ),
  ),

  part(
    "diffs",
    "Reading a diff",
    explain(
      "A [[git-diff|diff]] shows exactly which lines changed: `-` lines were removed, `+` lines were added. `git diff` shows changes not staged yet; `git diff --staged` shows what the next commit will contain. Reading it before committing catches stray debugging lines and mistakes.",
    ),
    code(
      "bash",
      "git diff --staged",
      [
        "--- a/src/NoteCard.jsx",
        "+++ b/src/NoteCard.jsx",
        "@@ -3,3 +3,4 @@",
        "   <h2>{note.title}</h2>",
        "-  <p>{note.text}</p>",
        "+  <p>{note.content}</p>",
        "+  <small>{note.created_at}</small>",
      ],
      {
        1: "the file before…",
        2: "…and after",
        5: "removed line",
        6: "added lines",
      },
    ),
  ),

  part(
    "step-by-step",
    "Two commits, step by step",
    explain(
      "Step through making a change, checking it and committing it, then undoing a mistake before it's ever committed:",
    ),
    trace(
      "Commit a change, undo a slip",
      [
        "edit NoteForm.jsx",
        "git diff",
        "git add NoteForm.jsx",
        "git diff --staged",
        'git commit -m "feat: …"',
        "git log --oneline",
        "edit: oops, broken",
        "git restore NoteForm.jsx",
        "git status",
      ],
      [
        {
          line: 2,
          note: "The edit is only in the working folder. `git diff` shows the changed lines.",
          vars: [
            ["NoteForm.jsx", "modified"],
            ["commits", "c1, c2"],
          ],
        },
        {
          line: 4,
          note: "Now it's staged. `git diff` would show nothing; `git diff --staged` shows what will be committed.",
          vars: [
            ["NoteForm.jsx", "staged"],
            ["commits", "c1, c2"],
          ],
        },
        {
          line: 6,
          note: "The commit `c3` is saved with `c2` as its parent. `git log --oneline` lists it at the top.",
          vars: [
            ["NoteForm.jsx", "committed"],
            ["commits", "c1, c2, c3"],
          ],
          output: "c3 feat: add note form · c2 … · c1 …",
        },
        {
          line: 8,
          note: "A bad edit that was never staged: `git restore` puts the file back to how it is in the last commit. The edit is thrown away.",
          vars: [
            ["NoteForm.jsx", "as in c3"],
            ["commits", "c1, c2, c3"],
          ],
        },
        {
          line: 9,
          note: "Nothing left to commit: the working folder matches the last commit again.",
          vars: [["status", "clean"]],
          output: "nothing to commit, working tree clean",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "history",
    "Reading the history",
    explain(
      "`git log` lists commits newest first; `--oneline` gives one short line each. `git show` displays one commit's message and diff. [[git-head|HEAD]] is Git's name for the commit you're on now, usually the newest one on your branch, and `HEAD~1` is the one before it.",
    ),
    reference("Looking at history", [
      ["git log", "All commits, newest first.", "q to quit"],
      ["git log --oneline", "One line per commit.", "3f9a2c1 feat: …"],
      ["git log -p file", "Every change to one file.", "git log -p app.js"],
      [
        "git show 3f9a2c1",
        "One commit's message and diff.",
        "or git show HEAD",
      ],
      [
        "HEAD, HEAD~1",
        "The current commit, and the one before.",
        "git diff HEAD~1",
      ],
    ]),
  ),

  part(
    "undoing",
    "Undoing changes",
    explain(
      "Before a change is committed, undoing is easy and only affects your files. `git restore` throws away edits in the working folder; `git restore --staged` takes a file back out of the staging area but keeps the edits. To fix the *last* commit's message or add a forgotten file, `git commit --amend` replaces it, as long as you haven't shared it yet.",
    ),
    reference("Undo what?", [
      ["Edits not staged", "Throw them away.", "git restore app.js"],
      [
        "A file staged by mistake",
        "Unstage it; keep the edits.",
        "git restore --staged app.js",
      ],
      [
        "Last commit's message",
        "Rewrite it (not yet pushed).",
        "git commit --amend",
      ],
      [
        "A forgotten file",
        "Add it to the last commit.",
        "git add f; git commit --amend",
      ],
    ]),
    quickCheck(
      "You staged `secrets.txt` by accident. What keeps the file but takes it out of the next commit?",
      [
        "`git restore secrets.txt`",
        "`git restore --staged secrets.txt`",
        "Deleting the file",
      ],
      1,
      "`--staged` only unstages; the file and its contents stay in your working folder.",
    ),
  ),

  part(
    "notes-app",
    "Commits in the Notes App",
    explain(
      "Every feature of the Notes App arrived as a series of small commits: one adds the note form, another its validation, another its tests. A file like `NoteCard.jsx` has its own history you can read with `git log -p`, showing every change and the message explaining it.",
    ),
    inTheNotesApp(
      "`NoteCard.jsx` is the kind of file whose history tells a story: `git log -p` shows each change to it.",
      { fileId: "frontend/src/components/NoteCard.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Messages that say nothing",
      language: "bash",
      wrong: ['$ git commit -m "fix"', '$ git commit -m "more changes"'],
      problem:
        "Six months later nobody, including you, can tell what these commits did without reading every line.",
      right: ['$ git commit -m "fix: keep the note when saving fails"'],
      why: "Say what changed, specifically. A type like `fix:` helps scanning.",
    }),
    mistake({
      title: "Staging everything without looking",
      language: "bash",
      wrong: ["$ git add .", '$ git commit -m "feat: search"'],
      problem:
        "`git add .` stages every change, including a debug `console.log`, a half-finished file and anything not ignored.",
      right: ["$ git status", "$ git diff", "$ git add src/Search.jsx"],
      why: "Look at `git status` and the diff first, then add what belongs in this commit.",
    }),
    mistake({
      title: "Amending a commit you've already pushed",
      language: "bash",
      wrong: ["$ git push", "$ git commit --amend"],
      problem:
        "Amending replaces the commit with a new one. Everyone who already has the old one now has a history that disagrees with yours.",
      right: ["$ git push", '$ git commit -m "fix: typo in message"'],
      why: "Amend only commits nobody else has. Once pushed, make a new commit instead.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Name the commit type",
      task: "Replace each `?` with the conventional commit type for that change: `feat`, `fix`, `docs` or `test`.",
      starter: [
        '<p>Add a search box for notes: <span id="search">?</span></p>',
        '<p>Stop the app crashing on an empty title: <span id="crash">?</span></p>',
        '<p>Explain setup steps in the README: <span id="readme">?</span></p>',
        '<p>Add tests for the note form: <span id="tests">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A new feature",
          selector: "#search",
          text: "feat",
        },
        {
          kind: "text",
          label: "A bug fix",
          selector: "#crash",
          text: "fix",
        },
        {
          kind: "text",
          label: "Documentation",
          selector: "#readme",
          text: "docs",
        },
        {
          kind: "text",
          label: "Tests",
          selector: "#tests",
          text: "test",
        },
      ],
      hint: "New behaviour: feat. Broken behaviour put right: fix. Words for people: docs. Tests: test.",
      solution: [
        '<p>Add a search box for notes: <span id="search">feat</span></p>',
        '<p>Stop the app crashing on an empty title: <span id="crash">fix</span></p>',
        '<p>Explain setup steps in the README: <span id="readme">docs</span></p>',
        '<p>Add tests for the note form: <span id="tests">test</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Read the diff",
      task: "Read the diff, then replace each `?`: the file it changes, how many lines were added, and how many removed.",
      starter: [
        "<pre>--- a/src/api.js",
        "+++ b/src/api.js",
        '-const BASE = "http://localhost:3000";',
        '+const BASE = "/api";',
        "+const TIMEOUT = 5000;</pre>",
        '<p>File: <span id="file">?</span></p>',
        '<p>Lines added: <span id="added">?</span></p>',
        '<p>Lines removed: <span id="removed">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The file",
          selector: "#file",
          text: "src/api.js",
        },
        {
          kind: "text",
          label: "Two + lines",
          selector: "#added",
          text: "2",
        },
        {
          kind: "text",
          label: "One - line",
          selector: "#removed",
          text: "1",
        },
      ],
      hint: "The file is named after `a/` and `b/`. Count the lines starting with `+` and with `-`, not the `---`/`+++` headers.",
      solution: [
        "<pre>--- a/src/api.js",
        "+++ b/src/api.js",
        '-const BASE = "http://localhost:3000";',
        '+const BASE = "/api";',
        "+const TIMEOUT = 5000;</pre>",
        '<p>File: <span id="file">src/api.js</span></p>',
        '<p>Lines added: <span id="added">2</span></p>',
        '<p>Lines removed: <span id="removed">1</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Undo the right way",
      task: "Replace each `?` with the command that undoes it: `git restore app.js`, `git restore --staged app.js` or `git commit --amend`.",
      starter: [
        '<p>Throw away edits to app.js you never staged: <span id="discard">?</span></p>',
        '<p>Take app.js out of the next commit, keeping the edits: <span id="unstage">?</span></p>',
        '<p>Fix a typo in the last (unpushed) commit message: <span id="amend">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Discard working-folder edits",
          selector: "#discard",
          text: "git restore app.js",
        },
        {
          kind: "text",
          label: "Unstage",
          selector: "#unstage",
          text: "git restore --staged app.js",
        },
        {
          kind: "text",
          label: "Rewrite the last commit",
          selector: "#amend",
          text: "git commit --amend",
        },
      ],
      hint: "`restore` alone resets the file; `--staged` only unstages; `--amend` replaces the last commit.",
      solution: [
        '<p>Throw away edits to app.js you never staged: <span id="discard">git restore app.js</span></p>',
        '<p>Take app.js out of the next commit, keeping the edits: <span id="unstage">git restore --staged app.js</span></p>',
        '<p>Fix a typo in the last (unpushed) commit message: <span id="amend">git commit --amend</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Commits cheat sheet", [
      ["commit", "Snapshot + message + author + parent.", "3f9a2c1"],
      ["message", "type: what changed, imperative.", "fix: keep note"],
      ["git add -p", "Stage piece by piece.", "y / n per change"],
      [
        "git diff",
        "Unstaged changes; --staged for staged.",
        "+ added, - removed",
      ],
      ["git log --oneline", "Short history, newest first.", "git show HEAD"],
      ["git restore", "Discard unstaged edits.", "git restore app.js"],
      ["--staged", "Unstage, keep edits.", "git restore --staged"],
      ["--amend", "Replace the last, unpushed commit.", "git commit --amend"],
    ]),
    quickCheck(
      "What does every commit remember besides your files?",
      [
        "Only the date",
        "A message, the author, the date and its parent commit",
        "Your password",
      ],
      1,
      "The parent link is what makes the commits a history you can follow back.",
    ),
  ),
);
