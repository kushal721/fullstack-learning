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

// Pull requests. What a pull request is, opening one, one taken apart, a
// good description, checks and review, a pull request's life step by
// step, merge methods, after the merge, the Notes App, mistakes, practice
// and a recap.
export const pullRequestsModule = moduleLesson(
  "pull-requests",
  "Pull requests: proposing a change",
  40,
  [
    "Explain what a pull request is and why teams merge through them.",
    "Open a pull request from a branch, with a description that helps reviewers.",
    "Follow a pull request through checks and review to the merge.",
    "Choose a merge method, and tidy up after merging.",
  ],

  part(
    "what-a-pr-is",
    "Asking to merge",
    explain(
      "On a team, nobody merges straight into `main`. You push your branch to GitHub and open a [[pull-request|pull request]] (PR): a page asking to merge your branch into `main`. It shows every commit and changed line, runs automatic checks, and lets teammates comment before anything is merged.",
    ),
    diagram([
      ["Branch", "your commits, pushed"],
      ["Pull request", "diff, checks, comments"],
      ["Review", "approve or ask for changes"],
      ["Merge", "into main"],
    ]),
    quickCheck(
      "Where does the review of your branch happen?",
      [
        "In your terminal",
        "On the pull request on GitHub",
        "Nowhere: you merge straight into main",
      ],
      1,
      "The [[pull-request|pull request]] shows the diff and collects comments and approvals.",
    ),
  ),

  part(
    "opening",
    "Opening a pull request",
    explain(
      "Push your branch, and GitHub offers a **Compare & pull request** button. You choose the **base** (the branch to merge into, usually `main`) and the **head** (your branch), then write a title and description. The GitHub CLI does the same from the terminal:",
    ),
    code(
      "bash",
      "from a branch to a pull request",
      [
        "$ git push -u origin feature/search",
        "",
        "$ gh pr create --base main \\",
        '    --title "feat: search notes" \\',
        '    --body "Closes #12"',
        "https://github.com/sam/notes-app/pull/42",
      ],
      {
        1: "the branch must be on GitHub first",
        3: "base: where it should end up",
        5: "this PR will close issue #12 when merged",
        6: "the new pull request, number 42",
      },
    ),
  ),

  part(
    "pr-anatomy",
    "A pull request, taken apart",
    explain(
      "The top of every pull request says what it is, where it's going and whether it's ready:",
    ),
    anatomy(
      "The top of a pull request",
      [
        "feat: search notes #42",
        "sam wants to merge 3 commits",
        "into main from feature/search",
        "✓ All checks have passed",
      ],
      [
        ["#42", "number", "Pull requests and issues share one numbering."],
        ["3 commits", "commits", "Everything on the branch that main lacks."],
        [
          "into main from feature/search",
          "base ← head",
          "Where it goes, and where from.",
        ],
        [
          "✓ All checks have passed",
          "checks",
          "CI ran the tests on this branch.",
        ],
      ],
    ),
  ),

  part(
    "description",
    "A description reviewers can use",
    explain(
      "The description is how a reviewer knows what to look for. Say what changed and why, how you checked it, and anything risky. Writing `Closes #12` links the issue, and GitHub closes it automatically when the pull request is merged.",
    ),
    reference("What a good description covers", [
      ["What", "The change, in a sentence or two.", "Adds a search box"],
      ["Why", "The problem it solves.", "Closes #12"],
      [
        "How it was checked",
        "Tests, manual steps.",
        "npm test; tried 3 searches",
      ],
      ["Screenshots", "For anything visible.", "before / after"],
      ["Risks", "What could break.", "changes the notes query"],
    ]),
  ),

  part(
    "checks-and-review",
    "Checks and review",
    explain(
      "When you open a pull request, [[ci-cd|CI]] runs on your branch: tests, linting, a build. A red ✗ means something failed; fix it with another commit and push, and the checks run again. Reviewers read the diff, leave comments on lines, and either **approve** or **request changes**. Many teams require both green checks and an approval before merging.",
    ),
    keyPoints(
      "Every push to the branch updates the pull request.",
      "Checks run again on each push.",
      "Answer comments with commits, or a reply.",
      "Merge only with green checks and an approval.",
    ),
  ),

  part(
    "step-by-step",
    "A pull request's life, step by step",
    explain(
      "Step through a pull request from the first push to the merge, including a failing test and a review comment:",
    ),
    trace(
      "PR #42: feature/search → main",
      [
        "git push -u origin feature/search",
        "open PR #42",
        "CI: tests ✗",
        "fix, commit, git push",
        "CI: tests ✓",
        "review: changes requested",
        "commit, git push",
        "review: approved ✓",
        "squash and merge",
        "branch deleted, #12 closed",
      ],
      [
        {
          line: 2,
          note: "The branch is on GitHub; the pull request asks to merge it into `main`.",
          vars: [
            ["checks", "running"],
            ["review", "none yet"],
          ],
        },
        {
          line: 3,
          note: "CI ran the tests on the branch and one failed. The pull request shows a red ✗ and can't be merged.",
          vars: [
            ["checks", "✗ failed"],
            ["review", "none yet"],
          ],
        },
        {
          line: 5,
          note: "A fix is pushed to the same branch: the pull request updates itself and the checks run again.",
          vars: [
            ["checks", "✓ passed"],
            ["review", "none yet"],
          ],
        },
        {
          line: 6,
          note: "A reviewer asks for a clearer variable name on one line.",
          vars: [
            ["checks", "✓ passed"],
            ["review", "changes requested"],
          ],
        },
        {
          line: 8,
          note: "Another commit addresses it; the reviewer approves. Green checks and an approval: ready.",
          vars: [
            ["checks", "✓ passed"],
            ["review", "approved"],
          ],
        },
        {
          line: 10,
          note: "Squash and merge turns the branch's commits into one commit on `main`. The branch is deleted and `Closes #12` closes the issue.",
          vars: [
            ["main", "+1 commit"],
            ["issue #12", "closed"],
          ],
          output: "Merged · feature/search deleted",
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "merge-methods",
    "Three ways to merge",
    explain(
      "GitHub's merge button has three options. All of them put the same files in `main`; they differ in what the history looks like afterwards. Teams usually pick one and stick to it.",
    ),
    reference("GitHub's merge options", [
      [
        "Create a merge commit",
        "Keeps every commit, plus a merge commit.",
        "full detail",
      ],
      [
        "Squash and merge",
        "All the branch's commits become one.",
        "one commit per PR",
      ],
      [
        "Rebase and merge",
        "Every commit, replayed onto main, no merge commit.",
        "a straight line",
      ],
    ]),
    quickCheck(
      "Your branch has 9 small “wip” commits. Which merge keeps main's history tidy?",
      ["Create a merge commit", "Squash and merge", "Rebase and merge"],
      1,
      "Squashing turns the nine commits into one, named after the pull request.",
    ),
  ),

  part(
    "after-merging",
    "After the merge",
    explain(
      "The merge happened on GitHub, so your laptop doesn't have it yet. Switch back to `main`, pull, and delete your local branch. Then start the next piece of work from an up-to-date `main`.",
    ),
    code(
      "bash",
      "tidying up after a merge",
      [
        "$ git switch main",
        "$ git pull",
        "$ git branch -d feature/search",
        "$ git switch -c feature/tags",
      ],
      {
        2: "bring down the merged commit",
        3: "the local branch is no longer needed",
        4: "next piece of work, from fresh main",
      },
    ),
  ),

  part(
    "notes-app",
    "Pull requests and the Notes App",
    explain(
      "A typical Notes App pull request adds a feature with its tests: the component, plus a test file proving it works. CI runs those tests on the pull request, so a reviewer sees green ticks before reading a line. This learning platform is built the same way: every change is a pull request with checks.",
    ),
    inTheNotesApp(
      "`NoteForm.test.jsx` is what CI runs on a pull request that changes the note form.",
      { fileId: "frontend/src/components/NoteForm.test.jsx" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "One enormous pull request",
      language: "bash",
      wrong: ["# PR #50: 64 files changed, +3,210 −1,045"],
      problem:
        "Nobody can review 3,000 lines properly. Bugs slip through, and the pull request sits waiting for days.",
      right: [
        "# PR #50: search API (6 files)",
        "# PR #51: search box (4 files)",
      ],
      why: "Small pull requests get reviewed quickly and carefully. Split big work into steps.",
    }),
    mistake({
      title: "Merging with red checks",
      language: "bash",
      wrong: ["# ✗ 1 failing check — merged anyway"],
      problem:
        "The failing test is now on `main`, breaking it for everyone, and the next deploy ships the bug.",
      right: ["# fix the test on the branch, push, wait for ✓"],
      why: "Treat a red check as a blocker. Turn on branch protection so the button stays disabled.",
    }),
    mistake({
      title: "Starting new work on an old main",
      language: "bash",
      wrong: ["$ git switch main", "$ git switch -c feature/tags"],
      problem:
        "Your local `main` is missing everything merged since you last pulled, so the new branch starts out of date and conflicts later.",
      right: [
        "$ git switch main",
        "$ git pull",
        "$ git switch -c feature/tags",
      ],
      why: "Pull `main` before branching from it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the pull request",
      task: "Read the top of the pull request, then replace each `?`: its number, the branch it merges into, and the branch it comes from.",
      starter: [
        "<pre>fix: keep note on failed save #57",
        "alex wants to merge 2 commits",
        "into main from fix/failed-save</pre>",
        '<p>Number: <span id="number">?</span></p>',
        '<p>Merges into (base): <span id="base">?</span></p>',
        '<p>Comes from (head): <span id="head">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "The number",
          selector: "#number",
          text: "57",
        },
        {
          kind: "text",
          label: "The base branch",
          selector: "#base",
          text: "main",
        },
        {
          kind: "text",
          label: "The head branch",
          selector: "#head",
          text: "fix/failed-save",
        },
      ],
      hint: "“into X from Y”: X is the base, Y is the head. The number follows the #.",
      solution: [
        "<pre>fix: keep note on failed save #57",
        "alex wants to merge 2 commits",
        "into main from fix/failed-save</pre>",
        '<p>Number: <span id="number">57</span></p>',
        '<p>Merges into (base): <span id="base">main</span></p>',
        '<p>Comes from (head): <span id="head">fix/failed-save</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Order the pull request",
      task: "The life of a pull request is mixed up. Move whole lines so it runs first to last. Change only the order.",
      starter: [
        '<ol id="pr">',
        "  <li>Merge into main</li>",
        "  <li>Push the branch</li>",
        "  <li>Checks pass and a reviewer approves</li>",
        "  <li>Open the pull request</li>",
        "</ol>",
      ],
      checks: [
        {
          kind: "text",
          label: "Push first",
          selector: "#pr li:nth-child(1)",
          text: "Push the branch",
        },
        {
          kind: "text",
          label: "Then open it",
          selector: "#pr li:nth-child(2)",
          text: "Open the pull request",
        },
        {
          kind: "text",
          label: "Then checks and review",
          selector: "#pr li:nth-child(3)",
          text: "Checks pass and a reviewer approves",
        },
        {
          kind: "text",
          label: "Merge last",
          selector: "#pr li:nth-child(4)",
          text: "Merge into main",
        },
      ],
      hint: "GitHub can only show a branch it has. Checks and review come before the merge.",
      solution: [
        '<ol id="pr">',
        "  <li>Push the branch</li>",
        "  <li>Open the pull request</li>",
        "  <li>Checks pass and a reviewer approves</li>",
        "  <li>Merge into main</li>",
        "</ol>",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Pull requests cheat sheet", [
      ["pull request", "A request to merge a branch, on GitHub.", "#42"],
      [
        "base ← head",
        "Into this branch, from that one.",
        "main ← feature/search",
      ],
      ["gh pr create", "Open one from the terminal.", "--base main"],
      ["Closes #12", "Closes the issue when merged.", "in the description"],
      ["checks", "CI runs on every push.", "✓ / ✗"],
      ["review", "Approve or request changes.", "comments on lines"],
      ["squash and merge", "One commit per pull request.", "tidy main"],
      ["after merging", "switch main, pull, delete branch.", "git branch -d"],
    ]),
    quickCheck(
      "Your pull request has a failing check. What should happen next?",
      [
        "Merge it anyway",
        "Fix it on the same branch and push; the checks run again",
        "Open a new pull request",
      ],
      1,
      "Every push updates the pull request, so the fix goes on the same branch.",
    ),
  ),
);
