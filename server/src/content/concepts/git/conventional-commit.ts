import type { Concept } from "@fsl/shared";

export const conventionalCommit: Concept = {
  id: "conventional-commit",
  slug: "conventional-commit",
  title: "Conventional commits",
  topicId: "git",
  summary:
    "A simple rule for writing commit messages as `type(scope): description`, so that anyone, and any tool, can tell at a glance what each commit does.",
  basics: [
    "A commit is a saved snapshot of the project, and every commit has a message written by the person who made it. `git log --oneline` lists those messages, one per line, newest first.",
    "That list is the project's history. Months later it is how you find out when a bug appeared or what changed in a release, but only if the messages say something useful.",
    "A convention is a rule a group agrees to follow so that everyone does the same thing in the same way. Conventional commits is a widely used convention for the first line of a commit message.",
  ],
  what: [
    'Each message starts with a type, an optional scope in brackets, a colon and a short description: `feat: add note form` or `fix(api): return 404 for unknown notes`. The description is written in lower case, in the imperative ("add", not "added"), without a full stop.',
    "The type says what kind of change it is: `feat` (a new feature), `fix` (a bug fix), `docs` (documentation only), `refactor` (code restructured without changing behaviour), `test` (tests), `chore` (maintenance such as updating dependencies), `ci` (the automatic checks), plus others like `style`, `perf` and `build`. A `!` after the type or scope, as in `feat(api)!: remove the v1 routes`, marks a breaking change.",
  ],
  why: [
    "Messages like `update` or `fix stuff` say nothing; you have to open every commit to learn what it did. With a type and a clear description the history becomes readable: you can scan `git log --oneline` and see which commits added features and which fixed bugs.",
    "Because the format is predictable, tools can read it. They can generate a changelog (a list of what changed in each version), pick the next version number (a `feat` means a new minor version, a `!` a new major one) and check messages automatically.",
  ],
  howItWorks: [
    "The format only concerns the first line, the subject. Below it, after an empty line, you may add a body that explains why the change was needed.",
    "The scope is optional and names the part of the project that changed, such as `api`, `ui` or `db`. Use it when it helps the reader; leave it out when the change is general.",
    "On this platform a commit-msg hook checks the message. A hook is a small script Git runs automatically at a certain moment; the commit-msg hook runs right after you write the message and can refuse the commit. If the message does not match the format, the commit is not created and you see why.",
    "Pull request titles follow the same format. Because pull requests are squash-merged, the PR title becomes the one commit on `main`, so a good PR title is what makes the `main` history clean.",
  ],
  basicExample: {
    language: "bash",
    code: `git commit -m "feat: add note form"
git commit -m "fix(api): return 404 for unknown notes"
git commit -m "docs: explain how to run the backend"
git commit -m "feat(api)!: require login for all note routes"

git log --oneline
# a1b2c3d feat(api)!: require login for all note routes
# 9f8e7d6 docs: explain how to run the backend
# 4c5d6e7 fix(api): return 404 for unknown notes
# 0a1b2c3 feat: add note form`,
    caption:
      "Four commits with conventional messages; the log shows at a glance what each one did, and the ! marks the breaking change.",
    highlightLines: [4],
  },
  internals: [
    "Git itself does not care about the format; a message is just text. The rule is enforced by tools around Git, such as hooks on your computer and checks on GitHub.",
    "Git hooks live in the `.git/hooks/` folder, which is not shared through the repository. This platform uses the simple-git-hooks package to install them for everyone when they run `npm install`: the commit-msg hook runs `scripts/check-commit-msg.mjs`, and a pre-commit hook runs Prettier and ESLint on the staged files with lint-staged.",
    "The check script reads the message Git saved in a temporary file, tests the first line against a pattern of allowed types, optional scope, optional `!` and description, and exits with an error if it does not match. A non-zero exit makes Git cancel the commit.",
  ],
  howToCreate: [
    {
      text: "In a test repository, make a change and commit it with a conventional message.",
      code: {
        language: "bash",
        code: `echo "# Notes App" > README.md
git add README.md
git commit -m "docs: add readme"`,
      },
    },
    {
      text: "Add a simple commit-msg hook by hand to see how the check works. Git runs this file with the path of the message file as its argument.",
      code: {
        language: "bash",
        fileName: ".git/hooks/commit-msg",
        code: `#!/bin/sh
pattern='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\\([a-z0-9-]+\\))?!?: .+'
if ! head -n 1 "$1" | grep -Eq "$pattern"; then
  echo "Commit message must look like: feat(scope): description"
  exit 1
fi`,
      },
    },
    {
      text: "Make the hook executable, then try a bad message and a good one.",
      code: {
        language: "bash",
        code: `chmod +x .git/hooks/commit-msg
echo "more text" >> README.md
git commit -am "update"
git commit -am "docs: describe the project"`,
      },
    },
    {
      text: "Check that it worked: the first commit is refused with the error message, the second is created, and `git log --oneline` shows only conventional messages.",
    },
  ],
  whereUsed: [
    "Many open-source projects and companies, often together with tools that create release notes and version numbers from the commit history.",
    "Pull request titles in repositories that squash-merge, where the title becomes the commit on `main`.",
  ],
  connectsTo: [
    "Commits: the convention is about the message every commit has.",
    "Pull requests: their titles use the same format and become commits on `main`.",
    "Squash merging, which turns a whole pull request into one well-named commit.",
    "Git hooks and npm packages such as simple-git-hooks, which check the format automatically.",
  ],
  projectUsage: [
    {
      explanation:
        "Every commit you make to the Notes App should use this format, for example `feat: add note form`, `fix(api): return 404 for unknown notes` or `chore: update dependencies`, not `update` or `fix stuff`.",
    },
    {
      explanation:
        "This learning platform enforces it: `scripts/check-commit-msg.mjs` runs as a commit-msg hook (installed by simple-git-hooks) and refuses a commit whose message does not follow the format, and a pre-commit hook formats and lints the staged files first.",
    },
    {
      explanation:
        "Pull request titles follow the same rule, because each PR is squash-merged and its title becomes the single commit on `main`.",
    },
  ],
  commonMistakes: [
    "Vague messages such as `update`, `wip` or `fix stuff`. Say what changed and pick the matching type: `fix: keep note title when saving fails`.",
    "Choosing the wrong type, for example `feat` for a bug fix or `chore` for a user-visible change. Ask: does the user get something new (`feat`), something repaired (`fix`), or neither?",
    "Forgetting the space after the colon or using a capitalised type, like `Feat:add form`. The hook refuses it; write `feat: add form`.",
    "Putting several unrelated changes in one commit, so no single type fits. Split them into separate commits, each with its own message.",
  ],
  relatedConcepts: ["git-commit", "pull-request", "merge", "npm-packages"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
