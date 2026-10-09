import type { Concept } from "@fsl/shared";

export const gitBranch: Concept = {
  id: "git-branch",
  slug: "git-branch",
  title: "Branches",
  topicId: "git",
  summary:
    "A named, movable label on a commit that lets you work on a change separately without touching the main version.",
  basics: [
    "A Git repository stores the history of a project as commits: snapshots of all files, each pointing back to the one before it (its parent).",
    "If you only had one line of history, every half-finished experiment would sit right on top of the working version. One broken commit and the whole project is broken for everyone.",
    "The default line of history in a new repository is called `main`. By agreement, `main` should always contain working code that could be released.",
  ],
  what: [
    "A branch is a label with a name, like `main` or `feature/note-form`, that points at one commit. When you commit on a branch, the label moves forward to the new commit.",
    "Creating a branch gives you a separate line of work. You can commit freely on `feature/note-form` while `main` stays exactly as it was, and combine them later when the work is ready.",
  ],
  why: [
    "Branches keep `main` working. Your unfinished changes live on their own branch, so a bug in your experiment never reaches the version others use or deploy.",
    "They also let several pieces of work happen at once. You can pause a feature, switch to a branch for an urgent bug fix, and come back, and teammates can each work on their own branch without stepping on each other.",
  ],
  howItWorks: [
    "`git switch -c feature/note-form` creates a new branch pointing at the commit you are on and switches to it. Your files do not change yet; both branches point at the same commit.",
    "Each commit you make now moves only `feature/note-form` forward. `main` still points at the old commit.",
    "`git switch main` changes your working directory back to the files as they are on `main`. `git switch feature/note-form` brings your new work back. `git branch` lists all branches and marks the current one with `*`.",
    "When the work is done, it is merged into `main` (on GitHub, through a pull request) and the branch is deleted, because its commits are now part of `main`.",
  ],
  basicExample: {
    language: "bash",
    code: `$ git switch -c feature/note-form
Switched to a new branch 'feature/note-form'

$ git add frontend/src/components/NoteForm.jsx
$ git commit -m "feat: add note form"

$ git branch
* feature/note-form
  main

$ git switch main
Switched to branch 'main'`,
    caption:
      "A new branch is created and receives a commit; `git branch` marks the current branch with `*`, and switching back to `main` shows the files without the new form.",
  },
  internals: [
    "A branch is tiny: a file inside `.git/refs/heads/` that contains just the id of one commit. That is why creating a branch is instant, no matter how big the project is.",
    "Git also keeps a special pointer called `HEAD` that says which branch you are on. When you commit, Git makes the new commit and moves the branch that `HEAD` points to.",
    "Switching branches rewrites the files in your working directory to match that branch's commit. If you have uncommitted changes that would be overwritten, Git refuses to switch, so you commit them first.",
  ],
  howToCreate: [
    {
      text: "Start on an up-to-date `main` in your repository and check where you are.",
      code: {
        language: "bash",
        code: `git switch main
git status`,
      },
    },
    {
      text: "Create a branch for one piece of work, named after its type and purpose.",
      code: {
        language: "bash",
        code: `git switch -c feature/note-form`,
      },
    },
    {
      text: "Change a file and commit it on the branch.",
      code: {
        language: "bash",
        code: `echo "Notes can now be created with a form." >> README.md
git add README.md
git commit -m "docs: mention the note form"`,
      },
    },
    {
      text: "To check it worked, run `git log --oneline --all --graph`: the new commit sits on `feature/note-form` while `main` still points at the older commit. Switch to `main` and the new README line is gone; switch back and it returns.",
      code: {
        language: "bash",
        code: `git log --oneline --all --graph
git switch main
git switch feature/note-form`,
      },
    },
    {
      text: "After the branch has been merged, delete it. `git branch -d` refuses if the work is not merged yet, which protects you from losing commits.",
      code: {
        language: "bash",
        code: `git switch main
git branch -d feature/note-form`,
      },
    },
  ],
  whereUsed: [
    "Every feature, bug fix and documentation change in a team project: one branch per task, merged when it is reviewed and working.",
    "Trying out an idea you might throw away. If it fails, delete the branch and `main` is untouched.",
  ],
  connectsTo: [
    "Commits, which branches point at and move forward through.",
    "Pushing, which uploads a branch to GitHub with `git push -u origin feature/x`.",
    "Pull requests, where a branch is reviewed and checked before joining `main`.",
    "Merging, which brings a branch's commits into `main`.",
  ],
  projectUsage: [
    {
      explanation:
        "In the Notes App and this platform, every change starts from a GitHub issue and gets its own branch named `feature/...`, `fix/...`, `docs/...` or `chore/...`, so `main` always stays working.",
    },
    {
      explanation:
        "A branch is merged into `main` through a pull request after the checks pass, using squash merge (the PR title becomes the single commit on `main`), and then the branch is deleted.",
    },
  ],
  commonMistakes: [
    "Committing straight to `main`. If the change is broken, `main` is broken. Create a branch before you start with `git switch -c feature/x`, and run `git branch` whenever you are unsure where you are.",
    "Starting a new branch from an old or unrelated branch, so it carries someone else's unfinished work. Always `git switch main` and update it with `git pull` before `git switch -c`.",
    "Doing several unrelated tasks on one branch. The pull request becomes huge and hard to review. Use one branch per issue.",
    "Keeping dozens of old merged branches around. Delete them after merging with `git branch -d` so the list only shows active work.",
  ],
  relatedConcepts: [
    "git-commit",
    "pull-request",
    "merge",
    "github-remote-push",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
