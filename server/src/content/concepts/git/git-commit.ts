import type { Concept } from "@fsl/shared";

export const gitCommit: Concept = {
  id: "git-commit",
  slug: "git-commit",
  title: "Commits",
  topicId: "git",
  summary:
    "A saved snapshot of a Git repository, with a message explaining what changed and why.",
  basics: [
    "A Git repository is a project folder whose history Git records. You edit files in the working directory (the normal folder), and nothing is recorded until you ask Git to.",
    "Before saving, you choose which changes to include by putting them in the staging area, a waiting list for the next save. The command for that is `git add`.",
    "Every command here runs in a terminal inside the project folder. If you are unsure what Git sees, `git status` always tells you which files are changed and which are staged.",
  ],
  what: [
    "A commit is a snapshot of the whole project at one moment, stored permanently in the repository. Next to the files, it records a message, the author, the date, and a link to the commit that came before it (its parent).",
    "Each commit gets a unique id, a long hash like `3f9a2c1...`, usually shown shortened to 7 characters. The chain of commits, each pointing to its parent, is the project's history.",
  ],
  why: [
    "Commits are your save points. If a change breaks the app, you can see exactly which commit introduced it, read why it was made, and undo just that commit instead of guessing.",
    "A history of small, well-described commits is also documentation: a teammate (or you, in six months) can read `git log` and understand how the project got to where it is.",
  ],
  howItWorks: [
    "You edit files, then run `git diff` to read exactly what you changed. Lines starting with `-` were removed and lines starting with `+` were added.",
    "`git add <file>` copies the current version of that file into the staging area. Staging lets you split your work: you can commit the form now and the styling separately.",
    '`git commit -m "feat: add note form"` stores the staged changes as a new commit with that message. The new commit points to the previous one as its parent.',
    "`git log --oneline` lists the commits, newest first, one line each: the short id and the message.",
  ],
  basicExample: {
    language: "bash",
    code: `$ git add frontend/src/components/NoteForm.jsx
$ git commit -m "feat: add note form"
[main 3f9a2c1] feat: add note form
 1 file changed, 24 insertions(+)

$ git log --oneline
3f9a2c1 feat: add note form
a71be04 chore: set up project folders`,
    caption:
      "The file is staged, then committed with a conventional commit message; `git log --oneline` shows the new commit on top of the earlier one.",
  },
  internals: [
    "A commit does not store your changes as a diff. It stores a pointer to a full snapshot (a tree of file contents), plus the author, date, message and the id of its parent. `git diff` and `git show` work out the differences by comparing two snapshots.",
    "The commit id is a hash calculated from all of that information, including the parent's id. Changing anything in an old commit would change its id and every id after it, which is why history is so hard to tamper with silently.",
    "Because each commit points to its parent, Git can walk backwards from the newest commit to the very first one. That chain is what `git log` prints.",
  ],
  howToCreate: [
    {
      text: "Inside a repository, create or change a file and look at the change before committing.",
      code: {
        language: "bash",
        code: `echo "Notes App - write and keep notes." >> README.md
git status
git diff`,
      },
    },
    {
      text: "Stage the file. Run `git diff --staged` to see exactly what will go into the commit.",
      code: {
        language: "bash",
        code: `git add README.md
git diff --staged`,
      },
    },
    {
      text: "Commit with a message that says what the change does, using the conventional commit format `type: description`.",
      code: {
        language: "bash",
        code: `git commit -m "docs: describe the app in the README"`,
      },
    },
    {
      text: "To check it worked, list the history and confirm the working directory is clean: `git status` should say `nothing to commit, working tree clean`.",
      code: {
        language: "bash",
        code: `git log --oneline
git status`,
      },
    },
  ],
  whereUsed: [
    "Every time you finish a small, working step: a new component, a bug fix, a renamed variable. Commit often; each commit should do one thing.",
    "Code review and debugging: reviewers read commits in a pull request, and when something breaks you search the history for the commit that caused it.",
  ],
  connectsTo: [
    "The staging area and `git add`, which decide what goes into a commit.",
    "Branches, which are labels pointing at a commit and move forward with each new one.",
    "Conventional commits, the message format (`feat:`, `fix:`, `docs:`, `chore:`) this platform uses.",
    "Pushing, which sends your local commits to the remote repository on GitHub.",
  ],
  projectUsage: [
    {
      explanation:
        "Commits to the Notes App should use conventional commit messages such as `feat: add note form` and `fix(api): return 404 for unknown notes`, not `update` or `fix stuff`.",
    },
    {
      explanation:
        "This platform checks every commit automatically: a pre-commit hook runs Prettier and ESLint on the staged files, and a commit-msg hook (`scripts/check-commit-msg.mjs`) rejects messages that do not follow the conventional commit format.",
    },
  ],
  commonMistakes: [
    "Writing vague messages like `update` or `fix stuff`. Nobody can tell what changed or why. Write what the commit does, like `fix(api): return 404 for unknown notes`.",
    "Making one huge commit with a whole day of unrelated work. It is hard to review and impossible to undo partly. Commit each small, working step on its own.",
    "Running `git add .` without looking, which can sweep in debug files or secrets. Run `git status` and `git diff` first, and keep unwanted files in `.gitignore`.",
    "Forgetting to stage, then wondering why `git commit` says `nothing added to commit`. Run `git add` on the files first.",
  ],
  relatedConcepts: [
    "git-repository",
    "git-branch",
    "conventional-commit",
    "github-remote-push",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
