import type { Concept } from "@fsl/shared";

export const pullRequest: Concept = {
  id: "pull-request",
  slug: "pull-request",
  title: "Pull requests",
  topicId: "git",
  summary:
    "A request on GitHub to merge the commits of one branch into another, usually `main`, after they have been checked and reviewed.",
  basics: [
    "A branch is a separate line of work in a Git repository. You make your changes on a branch such as `feature/note-form` so that `main`, the branch that always holds the working version of the project, is not touched while you work.",
    "Merging means taking the commits from one branch and adding them to another. At some point your finished branch has to be merged into `main`, or your work never becomes part of the project.",
    "GitHub is the website that stores the shared copy of the repository. Once you have pushed your branch there, GitHub knows about it and can compare it with `main`.",
  ],
  what: [
    'A pull request (PR) is a page on GitHub that says "please merge my branch `feature/note-form` into `main`". It shows every commit and every changed line, has a title and a description, and has room for comments.',
    "It is not just a button: a pull request is a meeting point where automatic checks run, people review the code, and the change is merged only when everything is green.",
  ],
  why: [
    "Merging straight into `main` means nobody, not even a test, looks at the change before it becomes the official version. A pull request adds a checkpoint where mistakes can be caught while they are still cheap to fix.",
    "Even when you work alone, PRs are worth it: the checks still run, you reread your own changes as a diff before merging, and the PR stays forever as a record of what changed and why, linked to the issue it solved.",
  ],
  howItWorks: [
    "You push your branch and open a PR from it into `main`. The title says what the change does, for example `feat: add note form`, and the description explains what changed and why. A line such as `Closes #12` links the PR to issue 12 and closes that issue automatically when the PR is merged.",
    "GitHub then starts the automatic checks, called CI (continuous integration): a computer installs the project and runs the formatter, linter, type checker and tests on your branch. Each check shows a green tick or a red cross on the PR.",
    "A reviewer reads the diff and leaves comments. You answer them by changing the code on the same branch, committing and pushing again; the new commits appear in the same PR and the checks run again.",
    "When the checks pass and the review is approved, someone clicks merge. The commits land on `main`, the linked issue closes, and the branch can be deleted.",
  ],
  basicExample: {
    language: "bash",
    code: `git push -u origin feature/note-form
gh pr create --base main \\
  --title "feat: add note form" \\
  --body "Adds a form to create notes so users no longer need the API directly.

Closes #12"
gh pr checks --watch`,
    caption:
      "Push the branch, open a pull request into main with a title and a description that closes issue 12, then watch the automatic checks.",
    highlightLines: [2],
  },
  internals: [
    "A pull request is not stored in Git itself; it is a GitHub feature built on top of two branches. It always shows the difference between the latest commit of your branch and `main`, which is why pushing a new commit updates the PR immediately.",
    "The checks are defined in files inside the repository (on GitHub, in the `.github/workflows/` folder). On each push GitHub starts a fresh virtual computer, follows those instructions, and reports the result back to the PR.",
    "Repository settings can protect `main`: they make merging impossible until the required checks pass, and they forbid pushing to `main` directly. That turns the PR from a good habit into a rule.",
  ],
  howToCreate: [
    {
      text: "Start from an up-to-date `main`, create a branch, make a change and commit it.",
      code: {
        language: "bash",
        code: `git switch main
git pull
git switch -c docs/contributing
echo "Open a pull request for every change." > CONTRIBUTING.md
git add CONTRIBUTING.md
git commit -m "docs: add contributing guide"`,
      },
    },
    {
      text: 'Push the branch to GitHub and open the pull request. Without flags, `gh pr create` asks for the title and description; you can also click "Compare & pull request" on github.com.',
      code: {
        language: "bash",
        code: `git push -u origin docs/contributing
gh pr create --base main --title "docs: add contributing guide" --body "Explains how to propose changes."`,
      },
    },
    {
      text: "Respond to feedback by committing on the same branch and pushing again. The PR updates by itself; never open a second PR for the fix.",
      code: {
        language: "bash",
        code: `echo "Link the issue it closes in the description." >> CONTRIBUTING.md
git add CONTRIBUTING.md
git commit -m "docs: mention issue links in contributing guide"
git push`,
      },
    },
    {
      text: "Check that it worked: `gh pr view --web` opens the PR in the browser. You should see both commits, the changed file and the status of the checks. When everything is green, merge it with the button or `gh pr merge --squash --delete-branch`.",
    },
  ],
  whereUsed: [
    "Almost every team on GitHub: no change reaches `main` without a pull request, checks and at least one review.",
    "Open-source projects, where people who cannot push to the repository propose changes from their own copy through a pull request.",
    "Solo projects that want CI to guard `main` and a readable record of every change.",
  ],
  connectsTo: [
    "Branches and push: a PR needs a pushed branch to compare with `main`.",
    "GitHub issues: `Closes #12` in the description links the work to the issue that asked for it.",
    "Merging: the merge button at the end of the PR, with this project using squash merge.",
    "Conventional commits: the PR title follows the same format, because it becomes the commit on `main`.",
  ],
  projectUsage: [
    {
      explanation:
        "Every change to this platform starts from a GitHub issue and arrives through a pull request from a branch such as `feature/note-form` or `fix/empty-title`, with `Closes #<issue number>` in the description; you can work on the Notes App the same way.",
    },
    {
      explanation:
        "On this platform the PR runs the automatic checks (formatting, linting, type checking and tests) and is merged only when they pass. It is squash-merged, so the PR title, for example `feat: add note form`, becomes the single commit on `main`, and the branch is deleted afterwards.",
    },
    {
      explanation:
        "This learning platform is built the same way: each feature, fix or docs change is its own pull request into `main`.",
    },
  ],
  commonMistakes: [
    "Opening one huge PR with many unrelated changes. It is hard to review and slow to fix; keep each PR to one issue and one purpose.",
    "Leaving the description empty. Write what changed, why, and `Closes #<issue number>` so reviewers understand it and the issue closes by itself.",
    "Opening a new PR to address review comments. Push new commits to the same branch instead; the existing PR updates and keeps the whole discussion in one place.",
    "Merging while checks are red. A failing check means something is broken; open the failed check's log, fix the problem on the branch and push again.",
  ],
  relatedConcepts: [
    "git-branch",
    "github-remote-push",
    "merge",
    "conventional-commit",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
