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

// Repositories: a project with a memory. Why version control, Git and
// GitHub, starting a repository, the three places, reading git status, a
// first commit step by step, what Git tracks, the Notes App, mistakes,
// practice and a recap.
export const repositoriesModule = moduleLesson(
  "repositories",
  "Repositories: a project with a memory",
  35,
  [
    "Explain what version control is for, and how Git and GitHub differ.",
    "Turn a folder into a repository, or copy one with clone.",
    "Name the three places a change lives: working folder, staging area, repository.",
    "Read `git status` and say what each file's state means.",
  ],

  part(
    "why-version-control",
    "Why a project needs a memory",
    explain(
      "When you save a file, the old version is gone. Break something and you have to remember what it looked like; work with someone else and you email files around, hoping nobody overwrites the other. **Version control** records every saved state of a project, so you can see what changed, go back, and combine people's work.",
    ),
    analogy(
      "Save points in a game: you can always go back to one, and each remembers the one before. Git gives your project save points, with a note on each saying what changed.",
    ),
    quickCheck(
      "You changed ten files yesterday and the app broke. What does version control let you do?",
      [
        "Nothing: the old versions are gone",
        "See exactly what changed, and go back to the version that worked",
        "Make the app faster",
      ],
      1,
      "Every saved state is kept, so you can compare versions and undo a bad change.",
    ),
  ),

  part(
    "git-and-github",
    "Git and GitHub",
    explain(
      "**Git** is a program on your computer that records your project's history; you use it from the terminal with commands like `git status`. **GitHub** is a website that stores copies of Git repositories online, so they're backed up and shared, with tools for teams. Git works without GitHub; GitHub is built on Git.",
    ),
    reference("Git, GitHub and where they run", [
      ["Git", "Records history; runs on your computer.", "git commit"],
      ["GitHub", "Hosts repositories online; a website.", "github.com"],
      ["Terminal", "Where you type Git commands.", "Terminal, PowerShell"],
      ["Editor", "Shows Git's changes too.", "VS Code's Source Control"],
    ]),
  ),

  part(
    "starting",
    "Starting a repository",
    explain(
      "A [[git-repository|repository]] is a project folder that Git is tracking. `git init` turns the current folder into one by creating a hidden `.git` folder, where Git keeps the whole history. To work on a project that already exists, `git clone` copies a repository, history and all, from GitHub to your computer.",
    ),
    code(
      "bash",
      "two ways to get a repository",
      [
        "$ mkdir notes-app",
        "$ cd notes-app",
        "$ git init",
        "Initialized empty Git repository",
        "  in /Users/sam/notes-app/.git/",
        "",
        "$ git clone https://github.com/sam/notes-app.git",
      ],
      {
        3: "start a new, empty history in this folder",
        5: "the history lives in the hidden .git folder",
        7: "or copy an existing repository from GitHub",
      },
    ),
  ),

  part(
    "three-places",
    "Three places a change lives",
    explain(
      "Git keeps your work in three places. The [[working-tree|working folder]] is the files you see and edit. The [[staging-area|staging area]] is a waiting list of changes for the next snapshot; `git add` puts a change there. The repository is the saved history; `git commit` turns what's staged into a permanent snapshot.",
    ),
    diagram([
      ["Working folder", "your edits"],
      ["git add", "→ staging area"],
      ["git commit", "→ history"],
    ]),
    analogy(
      "Packing a box to post: your desk is the working folder, the open box is the staging area, and a sealed, labelled box on the shelf is a commit.",
    ),
    quickCheck(
      "You edited `app.js` and saved it in your editor. Where is that change?",
      ["Only in the working folder", "In the staging area", "In the history"],
      0,
      "Saving the file only changes the [[working-tree|working folder]]. `git add` stages it; `git commit` saves it in the history.",
    ),
  ),

  part(
    "reading-status",
    "Reading git status",
    explain(
      "`git status` is the command you'll run most: it tells you what's changed and where each change is. `git status --short` puts it on one line per file, with two columns of letters: the first for the staging area, the second for the working folder.",
    ),
    anatomy(
      "git status --short",
      ["A  README.md", " M app.js", "MM index.html", "?? todo.txt"],
      [
        [
          "A  README.md",
          "staged, new",
          "A new file, added for the next commit.",
        ],
        [
          " M app.js",
          "changed, not staged",
          "Edited since the last commit; not added yet.",
        ],
        [
          "MM index.html",
          "staged, then changed",
          "Some changes added; newer ones not.",
        ],
        ["?? todo.txt", "untracked", "Git has never been asked to track it."],
      ],
    ),
  ),

  part(
    "step-by-step",
    "A first commit, step by step",
    explain(
      "Step through starting a repository and saving its first snapshot. Watch where the file is after each command:",
    ),
    trace(
      "A first commit",
      [
        "git init",
        "create README.md",
        "git status",
        "git add README.md",
        "git status",
        'git commit -m "docs: readme"',
        "git status",
        "edit README.md",
        "git status",
      ],
      [
        {
          line: 1,
          note: "An empty repository: a `.git` folder and no history yet.",
          vars: [["history", "no commits"]],
        },
        {
          line: 3,
          note: "The new file exists in the working folder, but Git isn't tracking it: it's **untracked** (`??`).",
          vars: [
            ["README.md", "untracked"],
            ["history", "no commits"],
          ],
        },
        {
          line: 5,
          note: "`git add` puts the file in the staging area, ready for the next commit (`A`).",
          vars: [
            ["README.md", "staged"],
            ["history", "no commits"],
          ],
        },
        {
          line: 7,
          note: "The commit saves the staged snapshot in the history. Nothing is left to commit: the working folder is **clean**.",
          vars: [
            ["README.md", "committed"],
            ["history", "1 commit"],
          ],
          output: "nothing to commit, working tree clean",
        },
        {
          line: 9,
          note: "Editing it again makes it **modified** (` M`): different from the last commit, and not staged yet.",
          vars: [
            ["README.md", "modified"],
            ["history", "1 commit"],
          ],
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "what-git-tracks",
    "What Git tracks",
    explain(
      "Git tracks the files you tell it to, and keeps every version of each. It's best at text: code, Markdown, JSON, where it can show the exact lines that changed. Large binary files (videos, builds) bloat the history. Some files should never be tracked at all, like passwords and installed packages; a [[gitignore|.gitignore]] file lists them.",
    ),
    keyPoints(
      "Tracked: Git keeps every committed version.",
      "Untracked: new files Git hasn't been asked to track.",
      "Ignored: listed in `.gitignore`; Git pretends they aren't there.",
      "Git tracks files, not empty folders.",
    ),
  ),

  part(
    "notes-app",
    "The Notes App's repository",
    explain(
      "The Notes App is a Git repository: its React app, its API and its database files are all tracked, with every change saved as a commit. Some files are deliberately left out. The real `.env`, with the database password and secret key, is ignored; a safe `.env.example` is committed instead, so anyone can see which settings exist.",
    ),
    inTheNotesApp(
      "`.env.example` is committed in place of the secret `.env`, which Git ignores.",
      { fileId: "backend/.env.example" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Running git init in the wrong folder",
      language: "bash",
      wrong: ["~ $ git init", "# your whole home folder is now a repository"],
      problem:
        "Git now sees every file you own as untracked, and other projects inside it get confused about which repository they're in.",
      right: ["~ $ cd projects/notes-app", "notes-app $ git init"],
      why: "Check where you are (`pwd`) before `git init`. One repository per project folder.",
    }),
    mistake({
      title: "Deleting the .git folder",
      language: "bash",
      wrong: ["$ rm -rf .git", "# “tidying up” a hidden folder"],
      problem:
        "The `.git` folder *is* the history. Delete it and every commit is gone; only the current files remain.",
      right: ["# leave .git alone; Git manages it", "$ git status"],
      why: "Never edit or delete `.git` by hand. Use Git commands to change history.",
    }),
    mistake({
      title: "Thinking saved means committed",
      language: "bash",
      wrong: ["# saved app.js in the editor, so it's in Git"],
      problem:
        "Saving only changes the working folder. Until you add and commit, the change isn't in the history, and can't be pushed or undone with Git.",
      right: ["$ git add app.js", '$ git commit -m "fix: …"'],
      why: "Run `git status` often: it shows what's only saved, what's staged and what's committed.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read git status",
      task: "Read the short status, then replace each `?` with the file it describes.",
      starter: [
        "<pre>A  style.css",
        " M app.js",
        "?? notes.txt</pre>",
        '<p>Staged, ready to commit: <span id="staged">?</span></p>',
        '<p>Changed but not staged: <span id="changed">?</span></p>',
        '<p>Not tracked at all: <span id="untracked">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "A in the first column: staged",
          selector: "#staged",
          text: "style.css",
        },
        {
          kind: "text",
          label: "M in the second column: changed",
          selector: "#changed",
          text: "app.js",
        },
        {
          kind: "text",
          label: "?? means untracked",
          selector: "#untracked",
          text: "notes.txt",
        },
      ],
      hint: "First column: the staging area. Second column: the working folder. `??`: untracked.",
      solution: [
        "<pre>A  style.css",
        " M app.js",
        "?? notes.txt</pre>",
        '<p>Staged, ready to commit: <span id="staged">style.css</span></p>',
        '<p>Changed but not staged: <span id="changed">app.js</span></p>',
        '<p>Not tracked at all: <span id="untracked">notes.txt</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Where is the change?",
      task: "Replace each `?` with where the change is after that action: `working folder`, `staging area` or `history`.",
      starter: [
        '<p>You save app.js in your editor: <span id="save">?</span></p>',
        '<p>You run git add app.js: <span id="add">?</span></p>',
        '<p>You run git commit: <span id="commit">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Saving only changes the folder",
          selector: "#save",
          text: "working folder",
        },
        {
          kind: "text",
          label: "add stages it",
          selector: "#add",
          text: "staging area",
        },
        {
          kind: "text",
          label: "commit saves it",
          selector: "#commit",
          text: "history",
        },
      ],
      hint: "Edit → working folder. `git add` → staging area. `git commit` → history.",
      solution: [
        '<p>You save app.js in your editor: <span id="save">working folder</span></p>',
        '<p>You run git add app.js: <span id="add">staging area</span></p>',
        '<p>You run git commit: <span id="commit">history</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Order the first commit",
      task: "The steps to start a project and save its first snapshot are mixed up. Move whole lines so they run first to last. Change only the order.",
      starter: [
        '<ol id="steps">',
        "  <li>git commit -m &quot;docs: readme&quot;</li>",
        "  <li>git init</li>",
        "  <li>git add README.md</li>",
        "  <li>Create README.md</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "Start the repository",
          selector: "#steps li:nth-child(1)",
          text: "git init",
        },
        {
          kind: "text",
          label: "Make a file",
          selector: "#steps li:nth-child(2)",
          text: "Create README.md",
        },
        {
          kind: "text",
          label: "Stage it",
          selector: "#steps li:nth-child(3)",
          text: "git add README.md",
        },
        {
          kind: "text",
          label: "Save the snapshot",
          selector: "#steps li:nth-child(4)",
          text: 'git commit -m "docs: readme"',
        },
      ],
      hint: "A repository first, then something to save, then stage it, then commit.",
      solution: [
        '<ol id="steps">',
        "  <li>git init</li>",
        "  <li>Create README.md</li>",
        "  <li>git add README.md</li>",
        "  <li>git commit -m &quot;docs: readme&quot;</li>",
        "</ol>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Repositories cheat sheet", [
      ["git init", "Start a repository in this folder.", ".git appears"],
      ["git clone URL", "Copy a repository, with its history.", "from GitHub"],
      ["working folder", "The files you edit.", "app.js"],
      ["staging area", "Changes chosen for the next commit.", "git add"],
      ["history", "Saved snapshots: commits.", "git commit"],
      ["git status", "What changed, and where.", "--short"],
      ["?? / A / M", "Untracked / added / modified.", "?? todo.txt"],
      [".gitignore", "Files Git should never track.", ".env"],
    ]),
    quickCheck(
      "Which command shows which files are changed, staged or untracked?",
      ["`git init`", "`git status`", "`git clone`"],
      1,
      "`git status` tells you where every change is. Run it whenever you're unsure.",
    ),
  ),
);
