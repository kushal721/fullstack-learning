import type { GlossaryEntry } from "@fsl/shared";
import { termsOf } from "./term.js";

const term = termsOf("git");

// Glossary entries introduced by the "Git & GitHub" topic.
export const gitGlossary: GlossaryEntry[] = [
  {
    id: "git-repository",
    topicId: "git",
    term: "Git repository",
    aliases: ["repository", "repo", "git init", ".git"],
    kind: "concept",
    properNoun: true,
    short: "A project folder whose full history of changes is recorded by Git.",
    body: "`git init` turns a folder into a repository: Git keeps the history in a hidden `.git` folder and can tell you what changed. You save snapshots called [[git-commit|commits]], and can copy the repository to GitHub with [[github-remote-push|push]].",
    conceptPageId: "git-repository",
  },
  {
    id: "git-commit",
    topicId: "git",
    term: "Commit",
    aliases: ["commits", "git commit", "snapshot", "hash"],
    kind: "concept",
    short:
      "A saved snapshot of the project, with a message explaining what changed and why.",
    body: "Each commit records the files, a message, the author, the date and the commit before it, and gets a unique id (a hash like `3f9a2c1`). The chain of commits is the project's history. A good message follows the [[conventional-commit|conventional commit]] style.",
    analogy:
      "A save point in a game: you can always come back to it, and each one remembers the one before.",
    conceptPageId: "git-commit",
  },
  {
    id: "git-branch",
    topicId: "git",
    term: "Branch",
    aliases: ["branches", "git branch", "main"],
    kind: "concept",
    short:
      "A named label on a commit that lets you work on a change separately from the main version.",
    body: "`main` and `feature/note-form` are branches. Committing on a branch moves its label forward while `main` stays untouched. When the work is ready, a [[pull-request|pull request]] [[merge|merges]] it back.",
    conceptPageId: "git-branch",
  },
  {
    id: "gitignore",
    topicId: "git",
    term: ".gitignore",
    aliases: ["gitignore", "ignore file", "ignored files"],
    kind: "concept",
    short:
      "A file listing what Git should never track, such as secrets and generated folders.",
    body: "Each line is a pattern, like `node_modules/` or `.env`. Ignored files don't show in `git status` and aren't committed, so secrets in [[environment-variables|environment files]] never reach GitHub. The `.gitignore` file itself is committed so the whole team ignores the same things.",
    conceptPageId: "gitignore",
  },
  {
    id: "github-remote-push",
    topicId: "git",
    term: "GitHub, remotes and push",
    aliases: ["github", "remote", "origin", "push", "pull", "git push"],
    kind: "concept",
    short:
      "Copying your commits from your computer to a repository on GitHub, so they're backed up and shared.",
    body: "`git remote add origin <url>` tells your [[git-repository|repository]] where its GitHub copy is. `git push` sends your new [[git-commit|commits]] there and `git pull` brings others' commits down. Only commits move; unsaved changes stay put.",
    conceptPageId: "github-remote-push",
  },
  {
    id: "pull-request",
    topicId: "git",
    term: "Pull request",
    aliases: ["pr", "pull requests", "code review"],
    kind: "concept",
    short:
      "A request on GitHub to merge one branch into another, after checks and review.",
    body: "A pull request shows every commit and changed line of a [[git-branch|branch]], with room for comments. Automatic checks ([[ci-cd|CI]]) run, people review the code, and it is [[merge|merged]] into `main` only when everything is green.",
    conceptPageId: "pull-request",
  },
  {
    id: "merge",
    topicId: "git",
    term: "Merge",
    aliases: ["merging", "git merge", "squash merge", "fast-forward"],
    kind: "concept",
    short:
      "Combining the commits of one branch into another, so separate work joins one history.",
    body: "`git merge feature/x` brings a [[git-branch|branch]]'s changes into the current one. It can fast-forward, create a merge commit, or squash everything into one commit; the files end up the same, only the history looks different. On GitHub, merging happens from a [[pull-request|pull request]].",
    conceptPageId: "merge",
  },
  {
    id: "conventional-commit",
    topicId: "git",
    term: "Conventional commits",
    aliases: ["conventional commit", "commit message", "feat", "fix"],
    kind: "concept",
    short:
      "Writing commit messages as `type(scope): description`, so anyone can tell what each commit does.",
    body: "`feat: add note form` or `fix(api): return 404 for unknown notes`. The type says the kind of change: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`. Tools can read these messages to build changelogs and version numbers from the [[git-commit|commits]].",
    conceptPageId: "conventional-commit",
  },

  // --- Terms the guided path introduces -------------------------------------
  term(
    "working-tree",
    "Working folder",
    "The project files as you see and edit them, outside Git's history.",
    "Editing and saving a file only changes the working folder (Git calls it the working tree). `git status` shows what's different from the last [[git-commit|commit]]; `git restore` puts a file back.",
    { aliases: ["working tree", "working directory", "working copy"] },
  ),
  term(
    "staging-area",
    "Staging area",
    "The changes you've chosen with git add for the next commit.",
    "`git add` copies a change into the staging area (also called the index); `git commit` saves exactly what's there. It lets you commit some changes and leave others for later. `git restore --staged` takes a file back out.",
    { aliases: ["index", "git add", "staged", "stage"] },
  ),
  term(
    "git-diff",
    "Diff",
    "The exact lines that changed: - for removed, + for added.",
    "`git diff` shows changes in the [[working-tree|working folder]] that aren't staged; `git diff --staged` shows what the next [[git-commit|commit]] will contain. Pull requests show the same thing on GitHub.",
    { aliases: ["diff", "git diff", "changes"] },
  ),
  term(
    "git-head",
    "HEAD",
    "Git's name for the commit you're on now.",
    "Usually HEAD is the newest [[git-commit|commit]] on your current [[git-branch|branch]]. `HEAD~1` is the one before it, so `git diff HEAD~1` compares with the previous commit.",
    { aliases: ["head", "head~1"] },
  ),
  term(
    "git-fetch",
    "Fetch",
    "Downloading new commits from a remote without changing your branches.",
    "`git fetch` updates `origin/main`, your note of where GitHub's `main` is, so `git status` can say if you're ahead or behind. `git pull` is fetch plus a [[merge]]. See [[github-remote-push|push and pull]].",
    { aliases: ["git fetch", "origin/main", "ahead", "behind", "upstream"] },
  ),
];
