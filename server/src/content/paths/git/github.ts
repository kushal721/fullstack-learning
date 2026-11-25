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

// GitHub: remotes, push and pull. Why a shared copy, remotes, a remote URL
// taken apart, pushing, fetching and pulling, two people step by step,
// ahead and behind, logging in, the Notes App, mistakes, practice and a
// recap.
export const githubModule = moduleLesson(
  "github",
  "GitHub: remotes, push and pull",
  40,
  [
    "Explain what a remote is, and why a project lives on GitHub too.",
    "Push your commits to GitHub, and pull or fetch others' commits.",
    "Read “ahead” and “behind” in git status, and know which command each needs.",
    "Fix a rejected push safely, without overwriting anyone's work.",
  ],

  part(
    "why-github",
    "A shared copy",
    explain(
      "Your repository lives on your computer. If the laptop dies, so does the history, and nobody else can see your work. [[github-remote-push|GitHub]] keeps a copy of the repository online: a backup, and the place a team meets. Everyone pushes their commits up and pulls the others' down, so all the copies share one history.",
    ),
    diagram([
      ["Your laptop", "a full repository"],
      ["GitHub", "the shared copy"],
      ["Teammate's laptop", "another full repository"],
    ]),
    analogy(
      "Like a shared document folder that everyone syncs, except nothing is synced automatically: you choose when to send (push) and when to receive (pull).",
    ),
  ),

  part(
    "remotes",
    "Remotes",
    explain(
      "A **remote** is a named link from your repository to another copy of it, usually on GitHub. The usual name is `origin`. `git clone` sets it up for you; for a project you started with `git init`, you add it yourself after creating an empty repository on GitHub.",
    ),
    code(
      "bash",
      "connecting a repository to GitHub",
      [
        "$ git remote add origin \\",
        "    https://github.com/sam/notes-app.git",
        "",
        "$ git remote -v",
        "origin  https://github.com/sam/notes-app.git (fetch)",
        "origin  https://github.com/sam/notes-app.git (push)",
      ],
      {
        1: "name the GitHub copy “origin”",
        4: "list remotes and their URLs",
      },
    ),
  ),

  part(
    "remote-url",
    "A remote URL, taken apart",
    explain(
      "GitHub gives every repository two URLs, one for each way of logging in: HTTPS (with a token) or SSH (with a key). Both point at the same repository:",
    ),
    anatomy(
      "Two URLs for one repository",
      [
        "https://github.com/",
        "  sam/notes-app.git",
        "git@github.com:",
        "  sam/notes-app.git",
      ],
      [
        ["https://github.com", "HTTPS", "Log in with a personal access token."],
        ["sam", "owner", "The account or organisation it belongs to."],
        ["notes-app.git", "repository", "The repository's name."],
        [
          "git@github.com:",
          "SSH",
          "The same repository, logging in with an SSH key.",
        ],
      ],
    ),
  ),

  part(
    "pushing",
    "Pushing",
    explain(
      "`git push` sends your new commits on the current branch to the remote. Only commits travel: unstaged edits and uncommitted work stay on your laptop. The first time you push a branch, `-u` links it to the remote branch of the same name, so later `git push` and `git pull` know where to go.",
    ),
    code(
      "bash",
      "a first push, then the next ones",
      [
        "$ git push -u origin main",
        "To https://github.com/sam/notes-app.git",
        " * [new branch]  main -> main",
        "",
        '$ git commit -m "feat: search"',
        "$ git push",
        "   3f9a2c1..8b7e4d0  main -> main",
      ],
      {
        1: "-u: remember origin/main as this branch's partner",
        3: "GitHub now has main",
        7: "only the new commits are sent",
      },
    ),
  ),

  part(
    "fetch-and-pull",
    "Fetching and pulling",
    explain(
      "[[git-fetch|git fetch]] downloads new commits from the remote without touching your branches: you can look before you take them. `git pull` is fetch *plus* merge: it downloads, then merges the remote branch into yours. Pull before starting work, and before you push.",
    ),
    reference("Moving commits between copies", [
      ["git push", "Your commits → GitHub.", "after committing"],
      ["git fetch", "GitHub → your copy, branches untouched.", "look first"],
      ["git pull", "Fetch, then merge into your branch.", "start of the day"],
      ["git clone URL", "Copy a whole repository.", "joining a project"],
    ]),
  ),

  part(
    "step-by-step",
    "Two people, one repository",
    explain(
      "Sam and Alex both work on `main` of the same GitHub repository. Step through what happens when they both push:",
    ),
    trace(
      "Sam pushes, then Alex",
      [
        "Sam: commit c4, git push",
        "GitHub main: c4",
        "Alex: commit c5",
        "Alex: git push",
        "✗ rejected: fetch first",
        "Alex: git pull",
        "→ merge c4 and c5: c6",
        "Alex: git push",
        "GitHub main: c6",
      ],
      [
        {
          line: 2,
          note: "Sam's push is accepted: GitHub's `main` moves forward to c4.",
          vars: [
            ["GitHub", "c3 → c4"],
            ["Alex has", "c3"],
          ],
        },
        {
          line: 3,
          note: "Alex, who hasn't pulled, commits c5 on top of c3. Alex's copy doesn't know about c4.",
          vars: [
            ["GitHub", "c4"],
            ["Alex has", "c5 (parent c3)"],
          ],
        },
        {
          line: 5,
          note: "GitHub refuses: accepting c5 would throw away Sam's c4. A push may only add to history, never replace it.",
          vars: [
            ["GitHub", "c4"],
            ["Alex has", "c5"],
          ],
          output: "! [rejected] main -> main (fetch first)",
        },
        {
          line: 7,
          note: "`git pull` downloads c4 and merges it with c5, making c6, which has both changes.",
          vars: [
            ["GitHub", "c4"],
            ["Alex has", "c6 (c4 + c5)"],
          ],
        },
        {
          line: 9,
          note: "Now Alex's history *contains* GitHub's, so the push only adds to it and is accepted. Everyone can pull c6.",
          vars: [
            ["GitHub", "c6"],
            ["Alex has", "c6"],
          ],
          output: "main -> main",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "ahead-and-behind",
    "Ahead and behind",
    explain(
      "Your copy keeps a note of where the remote branch was when you last fetched: `origin/main`. `git status` compares your branch with it. **Ahead** means you have commits GitHub doesn't: push. **Behind** means GitHub has commits you don't: pull. Both at once means you've diverged: pull, then push.",
    ),
    keyPoints(
      "Ahead by 2: you have 2 commits to push.",
      "Behind by 3: there are 3 commits to pull.",
      "Diverged: pull (merge), then push.",
      "`git fetch` first, so the numbers are up to date.",
    ),
    quickCheck(
      "`git status` says “Your branch is behind 'origin/main' by 2 commits”. What should you run?",
      ["`git push`", "`git pull`", "`git init`"],
      1,
      "GitHub has 2 commits you don't. `git pull` brings them down.",
    ),
  ),

  part(
    "logging-in",
    "Logging in to GitHub",
    explain(
      "GitHub needs to know who's pushing. Account passwords don't work for Git operations: you use a **personal access token** over HTTPS, or an **SSH key** that lives on your computer. The GitHub CLI (`gh auth login`) sets either up for you. Treat both like passwords.",
    ),
    reference("Ways to log in", [
      [
        "HTTPS + token",
        "A long secret instead of your password.",
        "gh auth login",
      ],
      ["SSH key", "A key pair; the public half goes on GitHub.", "ssh-keygen"],
      [
        "Credential helper",
        "Remembers the token so you're not asked again.",
        "built into Git",
      ],
    ]),
  ),

  part(
    "notes-app",
    "The Notes App on GitHub",
    explain(
      "Anyone can clone the Notes App's repository and run it, because everything needed is committed: the code, `package.json` and its lock file. What's *not* pushed matters too: `node_modules` is rebuilt with `npm install`, and the real `.env` never leaves your laptop.",
    ),
    inTheNotesApp(
      "`package.json` is pushed so anyone who clones can install the same packages; `node_modules` itself is not.",
      { fileId: "frontend/package.json" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forcing a rejected push",
      language: "bash",
      wrong: ["$ git push --force"],
      problem:
        "A forced push replaces GitHub's branch with yours, deleting every commit others pushed that you didn't have.",
      right: ["$ git pull", "$ git push"],
      why: "A rejected push means someone else pushed. Pull their work in, then push.",
    }),
    mistake({
      title: "Pushing a secret",
      language: "bash",
      wrong: ["$ git add .env", "$ git push"],
      problem:
        "Once pushed, the secret is in the history on GitHub, and in every clone. Deleting the file in a new commit doesn't remove it from history.",
      right: ["# 1. rotate the secret now", "# 2. add .env to .gitignore"],
      why: "Treat a pushed secret as leaked: change it first, then stop it happening again.",
    }),
    mistake({
      title: "Thinking push sends your edits",
      language: "bash",
      wrong: ["# edited app.js, ran git push, it's not on GitHub?"],
      problem:
        "Push sends commits. An edit that isn't committed isn't in any commit, so there's nothing to send.",
      right: ["$ git add app.js", '$ git commit -m "fix: …"', "$ git push"],
      why: "Add, commit, then push. `git status` tells you what's still uncommitted.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the remote URL",
      task: "Replace each `?` with the owner and the repository name from the URL, and the login method it uses: `HTTPS` or `SSH`.",
      starter: [
        "<pre>git@github.com:acme/todo-api.git</pre>",
        '<p>Owner: <span id="owner">?</span></p>',
        '<p>Repository: <span id="repo">?</span></p>',
        '<p>Login method: <span id="method">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The owner",
          selector: "#owner",
          text: "acme",
        },
        {
          kind: "text",
          label: "The repository",
          selector: "#repo",
          text: "todo-api",
        },
        {
          kind: "text",
          label: "git@ means SSH",
          selector: "#method",
          text: "SSH",
        },
      ],
      hint: "After the colon: owner, then the repository name (without `.git`). `git@…:` is the SSH form.",
      solution: [
        "<pre>git@github.com:acme/todo-api.git</pre>",
        '<p>Owner: <span id="owner">acme</span></p>',
        '<p>Repository: <span id="repo">todo-api</span></p>',
        '<p>Login method: <span id="method">SSH</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Push or pull?",
      task: "Replace each `?` with what to run: `git push`, `git pull`, or `git pull, then git push`.",
      starter: [
        "<p>Your branch is ahead of 'origin/main' by 2 commits: <span id=\"ahead\">?</span></p>",
        "<p>Your branch is behind 'origin/main' by 3 commits: <span id=\"behind\">?</span></p>",
        "<p>Your branch and 'origin/main' have diverged: <span id=\"diverged\">?</span></p>",
      ],
      checks: [
        {
          kind: "text",
          label: "Ahead: send yours",
          selector: "#ahead",
          text: "git push",
        },
        {
          kind: "text",
          label: "Behind: get theirs",
          selector: "#behind",
          text: "git pull",
        },
        {
          kind: "text",
          label: "Diverged: both",
          selector: "#diverged",
          text: "git pull, then git push",
        },
      ],
      hint: "Ahead: you have commits GitHub lacks. Behind: GitHub has commits you lack. Diverged: both.",
      solution: [
        "<p>Your branch is ahead of 'origin/main' by 2 commits: <span id=\"ahead\">git push</span></p>",
        "<p>Your branch is behind 'origin/main' by 3 commits: <span id=\"behind\">git pull</span></p>",
        "<p>Your branch and 'origin/main' have diverged: <span id=\"diverged\">git pull, then git push</span></p>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("GitHub cheat sheet", [
      ["remote", "A named link to another copy.", "origin"],
      ["git clone URL", "Copy a repository, remote set up.", "from GitHub"],
      [
        "git push -u origin main",
        "First push of a branch.",
        "then just git push",
      ],
      ["git fetch", "Download, don't merge.", "origin/main updates"],
      ["git pull", "Fetch + merge.", "before you start"],
      ["ahead / behind", "Commits to push / to pull.", "git status"],
      [
        "rejected push",
        "Someone pushed first: pull, then push.",
        "never --force",
      ],
      ["token / SSH key", "How Git logs in to GitHub.", "gh auth login"],
    ]),
    quickCheck(
      "Your push is rejected with “fetch first”. What's the right fix?",
      [
        "`git push --force`",
        "`git pull`, then `git push`",
        "Delete the repository",
      ],
      1,
      "Someone pushed first. Pulling merges their commits with yours, and then your push only adds to the history.",
    ),
  ),
);
