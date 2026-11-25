import {
  analogy,
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

// Branches: work on the side. Why branches, what a branch is, creating and
// switching, reading the graph, a branch and a merge step by step, two
// kinds of merge, naming, switching with changes, the Notes App, mistakes,
// practice and a recap.
export const branchesModule = moduleLesson(
  "branches",
  "Branches: work on the side",
  40,
  [
    "Explain why teams work on branches instead of directly on main.",
    "Create, switch between and delete branches.",
    "Read a commit graph: which commits are on which branch, and where HEAD is.",
    "Merge a branch, and tell a fast-forward from a merge commit.",
  ],

  part(
    "why-branches",
    "Why work on a branch?",
    explain(
      "`main` is the version that works: the one you'd deploy. A new feature takes many commits, some half-finished. A [[git-branch|branch]] lets you make those commits on the side, while `main` stays working. When the feature is done, you merge it back in. Everyone on a team can have their own branches at once.",
    ),
    diagram([
      ["main", "always works"],
      ["feature/search", "your work in progress"],
      ["merge", "search joins main"],
    ]),
    analogy(
      "Like drafting a chapter in a copy of a document: the published version stays readable while you rewrite, and you paste your chapter in when it's ready.",
    ),
  ),

  part(
    "what-a-branch-is",
    "A branch is a label",
    explain(
      "A branch isn't a copy of your files. It's just a named label that points at a commit. When you commit on a branch, its label moves forward to the new commit. [[git-head|HEAD]] points at the branch you're on, so Git knows which label to move. That's why creating a branch is instant and free.",
    ),
    keyPoints(
      "A branch is a name pointing at one commit.",
      "Committing moves the current branch's label forward.",
      "HEAD says which branch you're on.",
      "Branches are cheap: make one for every piece of work.",
    ),
  ),

  part(
    "create-and-switch",
    "Creating and switching",
    explain(
      "`git switch -c name` creates a branch at the current commit and switches to it. `git switch name` moves between existing branches: Git swaps the files in your working folder to match that branch's commit. `git branch` lists them, with a `*` by the one you're on.",
    ),
    code(
      "bash",
      "making and moving between branches",
      [
        "$ git switch -c feature/search",
        "Switched to a new branch 'feature/search'",
        "",
        "$ git branch",
        "* feature/search",
        "  main",
        "",
        "$ git switch main",
        "$ git branch -d feature/search",
      ],
      {
        1: "create and switch in one step",
        5: "* marks the branch you're on",
        8: "back to main; the files change to match",
        9: "delete a branch once it's merged",
      },
    ),
  ),

  part(
    "reading-the-graph",
    "Reading the commit graph",
    explain(
      "`git log --oneline --graph --all` draws every branch's commits, with branch names next to the commits they point at. Read it from the top: newest first.",
    ),
    anatomy(
      "git log --oneline --graph --all",
      [
        "* c4 (HEAD -> search) feat: box",
        "* c3 (main) feat: form",
        "* c2 feat: list notes",
        "* c1 docs: readme",
      ],
      [
        ["c4", "only on search", "main doesn't have it yet."],
        ["HEAD -> search", "you are here", "HEAD is on the search branch."],
        ["(main)", "main's label", "main points at c3."],
        ["c1", "the first commit", "Both branches share c1–c3."],
      ],
    ),
  ),

  part(
    "step-by-step",
    "A branch and a merge, step by step",
    explain(
      "Step through building a feature on a branch while a quick fix lands on `main`, then merging the two:",
    ),
    trace(
      "feature/search, then merge",
      [
        "git switch -c search",
        "commit c4: search box",
        "commit c5: search api",
        "git switch main",
        "commit c6: hotfix",
        "git merge search",
        "→ merge commit c7",
        "git branch -d search",
      ],
      [
        {
          line: 1,
          note: "A new label, `search`, at the same commit as `main` (c3). HEAD moves to it.",
          vars: [
            ["main", "c3"],
            ["search", "c3"],
            ["HEAD", "search"],
          ],
        },
        {
          line: 3,
          note: "Two commits on the branch: the `search` label moves forward; `main` stays at c3.",
          vars: [
            ["main", "c3"],
            ["search", "c5"],
            ["HEAD", "search"],
          ],
        },
        {
          line: 5,
          note: "Back on `main`, an urgent fix is committed. Now the two branches have each moved on: they've **diverged**.",
          vars: [
            ["main", "c6"],
            ["search", "c5"],
            ["HEAD", "main"],
          ],
        },
        {
          line: 7,
          note: "Merging brings c4 and c5 into `main`. Because both moved, Git makes a **merge commit** c7 with two parents: c6 and c5.",
          vars: [
            ["main", "c7 (parents c6, c5)"],
            ["search", "c5"],
          ],
          output: "Merge made by the 'ort' strategy.",
        },
        {
          line: 8,
          note: "The work is in `main` now, so the `search` label can go. The commits stay; only the name is deleted.",
          vars: [["main", "c7"]],
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "two-merges",
    "Fast-forward or merge commit",
    explain(
      "If `main` hasn't moved since you branched, merging just slides `main`'s label forward to your newest commit: a **fast-forward**, with no new commit. If both moved, Git combines them in a **merge commit** with two parents. Either way, `main` ends up with your work; only the shape of the history differs. See [[merge]].",
    ),
    reference("How a merge turns out", [
      [
        "Fast-forward",
        "main didn't move: its label slides forward.",
        "no new commit",
      ],
      [
        "Merge commit",
        "Both moved: a commit with two parents.",
        "Merge branch …",
      ],
      ["Squash", "All the branch's commits as one new commit.", "on GitHub"],
      ["Conflict", "Both changed the same lines: you choose.", "next level"],
    ]),
    quickCheck(
      "You branch from `main`, make 3 commits, and nobody touches `main`. What does `git merge` on main do?",
      [
        "Makes a merge commit",
        "Fast-forwards: main's label moves to your last commit",
        "Fails",
      ],
      1,
      "`main` hasn't moved, so there's nothing to combine: its label just moves forward.",
    ),
  ),

  part(
    "naming",
    "Naming branches",
    explain(
      "A branch name says what the work is, so the list of branches reads like a to-do list. Teams usually prefix a kind, the same words as commit types, and use lowercase words joined by hyphens.",
    ),
    reference("Branch names that explain themselves", [
      ["feature/…", "A new feature.", "feature/note-search"],
      ["fix/…", "A bug fix.", "fix/empty-title-crash"],
      ["docs/…", "Documentation.", "docs/setup-guide"],
      [
        "main",
        "The working version; deploys from here.",
        "never work on it directly",
      ],
    ]),
  ),

  part(
    "switching-with-changes",
    "Switching with unsaved work",
    explain(
      "Switching branches changes the files in your working folder. If you have uncommitted changes, Git carries them along when it safely can, and refuses when switching would overwrite them. The safe habit: commit your work (or set it aside with `git stash`, coming later) before switching.",
    ),
    keyPoints(
      "Uncommitted changes aren't on any branch yet.",
      "Git refuses a switch that would overwrite them.",
      "Commit or stash before switching.",
      "`git status` first line says which branch you're on.",
    ),
  ),

  part(
    "notes-app",
    "Branches and the Notes App",
    explain(
      "Each Notes App feature can be built on its own branch: `feature/note-form` for the form, `feature/auth` for logging in, `fix/empty-title` for a bug. `main` always holds an app that runs, so it can be deployed at any time, and every change reaches it through a merge.",
    ),
    inTheNotesApp(
      "`NoteForm.jsx` is the kind of change you'd build on `feature/note-form`, then merge into main.",
      { fileId: "frontend/src/components/NoteForm.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Working on main by accident",
      language: "bash",
      wrong: ['$ git commit -m "feat: search"', "# …on main, not your branch"],
      problem:
        "Your half-finished work is now on the branch that's meant to always work, and it's mixed in with everyone else's.",
      right: [
        "$ git switch -c feature/search",
        '$ git commit -m "feat: search"',
      ],
      why: "Create the branch *before* the first commit. `git status` shows which branch you're on.",
    }),
    mistake({
      title: "Force-deleting a branch that isn't merged",
      language: "bash",
      wrong: ["$ git branch -D feature/search"],
      problem:
        "`-D` deletes even unmerged branches. Its commits are no longer reachable by name and are easy to lose.",
      right: ["$ git branch -d feature/search", "# refuses if not merged yet"],
      why: "Use lowercase `-d`: Git checks the work is merged first.",
    }),
    mistake({
      title: "A branch that lives for months",
      language: "bash",
      wrong: ["# feature/redesign: 140 commits, 3 months old"],
      problem:
        "The longer a branch lives, the more `main` moves on, and the harder and riskier the final merge.",
      right: ["# small branches: merge every day or two"],
      why: "Keep branches short and focused; merge small pieces often.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the graph",
      task: "Read the graph, then replace each `?`: the branch HEAD is on, the commit only that branch has, and the commit `main` points at.",
      starter: [
        "<pre>* d4 (HEAD -> fix/title) fix: title",
        "* d3 (main) feat: list",
        "* d2 feat: form",
        "* d1 docs: readme</pre>",
        '<p>HEAD is on: <span id="head">?</span></p>',
        '<p>Only on that branch: <span id="only">?</span></p>',
        '<p>main points at: <span id="main">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "HEAD's branch",
          selector: "#head",
          text: "fix/title",
        },
        {
          kind: "text",
          label: "The new commit",
          selector: "#only",
          text: "d4",
        },
        {
          kind: "text",
          label: "main's commit",
          selector: "#main",
          text: "d3",
        },
      ],
      hint: "`HEAD -> name` shows where you are. Labels in brackets show where each branch points.",
      solution: [
        "<pre>* d4 (HEAD -> fix/title) fix: title",
        "* d3 (main) feat: list",
        "* d2 feat: form",
        "* d1 docs: readme</pre>",
        '<p>HEAD is on: <span id="head">fix/title</span></p>',
        '<p>Only on that branch: <span id="only">d4</span></p>',
        '<p>main points at: <span id="main">d3</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Fast-forward or merge commit?",
      task: "For each situation, replace `?` with what `git merge feature` on main does: `fast-forward` or `merge commit`.",
      starter: [
        '<p>feature has 2 commits; main hasn\'t changed: <span id="a">?</span></p>',
        '<p>feature has 2 commits; main got a hotfix: <span id="b">?</span></p>',
        '<p>feature has 5 commits; nobody else committed: <span id="c">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "main didn't move",
          selector: "#a",
          text: "fast-forward",
        },
        {
          kind: "text",
          label: "Both moved",
          selector: "#b",
          text: "merge commit",
        },
        {
          kind: "text",
          label: "Only feature moved",
          selector: "#c",
          text: "fast-forward",
        },
      ],
      hint: "If main hasn't moved, its label can just slide forward. If both moved, Git needs a commit with two parents.",
      solution: [
        '<p>feature has 2 commits; main hasn\'t changed: <span id="a">fast-forward</span></p>',
        '<p>feature has 2 commits; main got a hotfix: <span id="b">merge commit</span></p>',
        '<p>feature has 5 commits; nobody else committed: <span id="c">fast-forward</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Order the branch workflow",
      task: "The steps for building a feature on a branch are mixed up. Move whole lines so they run first to last. Change only the order.",
      starter: [
        '<ol id="flow">',
        "  <li>git merge feature/search</li>",
        "  <li>git switch -c feature/search</li>",
        "  <li>git switch main</li>",
        "  <li>Commit the search box</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "Branch first",
          selector: "#flow li:nth-child(1)",
          text: "git switch -c feature/search",
        },
        {
          kind: "text",
          label: "Then the work",
          selector: "#flow li:nth-child(2)",
          text: "Commit the search box",
        },
        {
          kind: "text",
          label: "Back to main",
          selector: "#flow li:nth-child(3)",
          text: "git switch main",
        },
        {
          kind: "text",
          label: "Merge last",
          selector: "#flow li:nth-child(4)",
          text: "git merge feature/search",
        },
      ],
      hint: "You merge *into* the branch you're on, so switch to main before merging.",
      solution: [
        '<ol id="flow">',
        "  <li>git switch -c feature/search</li>",
        "  <li>Commit the search box</li>",
        "  <li>git switch main</li>",
        "  <li>git merge feature/search</li>",
        "</ol>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Branches cheat sheet", [
      ["branch", "A label pointing at a commit.", "main, feature/search"],
      ["HEAD", "Which branch you're on.", "HEAD -> search"],
      ["git switch -c x", "Create branch x and move to it.", "feature/search"],
      ["git switch x", "Move to branch x.", "git switch main"],
      ["git branch", "List branches; * is current.", "-d to delete"],
      ["git merge x", "Bring x into the current branch.", "on main"],
      ["fast-forward", "Label slides; no new commit.", "main didn't move"],
      ["merge commit", "Two parents: both moved.", "Merge branch …"],
    ]),
    quickCheck(
      "What does creating a branch copy?",
      [
        "All your files",
        "Nothing: it's a new label on the current commit",
        "Your whole history",
      ],
      1,
      "A [[git-branch|branch]] is just a name for a commit, which is why it's instant.",
    ),
  ),
);
