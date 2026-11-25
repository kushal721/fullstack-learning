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

// Rebase, reset and revert: changing history safely. Merge or rebase, a
// rebase step by step, the golden rule, tidying with interactive rebase,
// reset, revert, the reflog safety net, which to use, the Notes App,
// mistakes, practice and a recap.
export const rewritingHistoryModule = moduleLesson(
  "rewriting-history",
  "Rebase, reset and revert",
  45,
  [
    "Bring a branch up to date with rebase, and say how it differs from merge.",
    "Tidy your own commits with an interactive rebase.",
    "Undo commits with reset or revert, and know which is safe when.",
    "Get lost work back with the reflog.",
  ],

  part(
    "merge-or-rebase",
    "Catching up: merge or rebase",
    explain(
      "Your branch started from `main`, and `main` has moved on. Merging `main` in adds a merge commit. [[git-rebase|Rebasing]] instead takes your commits off, moves your branch's start to the tip of `main`, and replays your commits on top, one by one. The result is a straight line, as if you'd started today.",
    ),
    diagram([
      ["main", "c1 → c2 → c3"],
      ["your branch", "started at c1: f1, f2"],
      ["after rebase", "c3 → f1′ → f2′"],
    ]),
    analogy(
      "Like rewriting your notes so they start after the latest chapter, instead of stapling the chapter and your notes together.",
    ),
  ),

  part(
    "step-by-step",
    "A rebase, step by step",
    explain(
      "Step through rebasing a feature branch onto an updated `main`. Notice that the replayed commits get **new** hashes:",
    ),
    trace(
      "git rebase main",
      [
        "on feature/tags: f1, f2",
        "git fetch; main is at c3",
        "git rebase origin/main",
        "set aside f1, f2",
        "move branch to c3",
        "replay f1 → f1′",
        "replay f2 → f2′",
        "git push --force-with-lease",
      ],
      [
        {
          line: 1,
          note: "Your branch started at c1 and has two commits. Meanwhile `main` got c2 and c3.",
          vars: [
            ["feature/tags", "c1 → f1 → f2"],
            ["main", "c1 → c2 → c3"],
          ],
        },
        {
          line: 4,
          note: "Rebase sets your commits aside and points the branch at the tip of `main`.",
          vars: [["feature/tags", "c3 (yours set aside)"]],
        },
        {
          line: 7,
          note: "Each commit is replayed on top: same changes, same messages, but new parents, so **new commits** with new hashes.",
          vars: [["feature/tags", "c3 → f1′ → f2′"]],
          output: "Successfully rebased and updated refs/heads/feature/tags.",
        },
        {
          line: 8,
          note: "GitHub still has the old f1 and f2, so a normal push is rejected. Because this branch is only yours, a guarded force push replaces them.",
          vars: [["GitHub", "f1′, f2′"]],
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "golden-rule",
    "The golden rule",
    explain(
      "Rebasing replaces commits with new ones. That's fine for commits only you have. But if others already have the old commits, your history and theirs now disagree, and their next pull is a mess. So: **never rebase commits someone else has**, like `main` or a shared branch. Rebase your own branch before others build on it.",
    ),
    keyPoints(
      "Rebase only your own, unshared commits.",
      "Never rebase main or a branch others work on.",
      "After rebasing, push with --force-with-lease.",
      "Unsure? Merge instead: it never rewrites anything.",
    ),
  ),

  part(
    "interactive",
    "Tidying with interactive rebase",
    explain(
      "Before opening a pull request, you can tidy your branch's commits. `git rebase -i main` opens a to-do list of your commits; change the word before each to say what to do with it, save, and Git replays them your way:",
    ),
    anatomy(
      "git rebase -i main: the to-do list",
      [
        "pick   a1b2c3 feat: tag api",
        "squash d4e5f6 wip",
        "reword 7a8b9c fix tpyo",
        "drop   0f1e2d debug logging",
      ],
      [
        ["pick", "keep", "Use the commit as it is."],
        ["squash", "combine", "Fold into the commit above, merging messages."],
        ["reword", "rename", "Keep the changes, edit the message."],
        ["drop", "remove", "Leave this commit out entirely."],
      ],
    ),
  ),

  part(
    "reset",
    "Reset: moving a branch back",
    explain(
      "[[git-reset|git reset]] moves your branch's label back to an earlier commit, as if the later commits were never made. What happens to their changes depends on the mode. Like rebase, it rewrites history, so use it on commits you haven't pushed.",
    ),
    reference("git reset HEAD~1, three ways", [
      [
        "--soft",
        "Undo the commit; changes stay staged.",
        "recommit differently",
      ],
      [
        "--mixed (default)",
        "Undo the commit; changes stay, unstaged.",
        "re-pick what to add",
      ],
      [
        "--hard",
        "Undo the commit and throw the changes away.",
        "careful: deletes work",
      ],
    ]),
    quickCheck(
      "You just committed, unpushed, and want to split it into two commits. Which reset fits?",
      ["`git reset --hard HEAD~1`", "`git reset HEAD~1`", "`git revert HEAD`"],
      1,
      "Mixed reset (the default) undoes the commit but keeps every change in your files, ready to add in pieces.",
    ),
  ),

  part(
    "revert",
    "Revert: undoing in public",
    explain(
      "When a bad commit is already on `main`, you can't rewrite it. [[git-revert|git revert]] makes a **new** commit that does the opposite: it removes what the bad one added and adds back what it removed. History stays intact and everyone just pulls the fix.",
    ),
    code(
      "bash",
      "undoing a pushed commit",
      [
        "$ git log --oneline",
        "9c8d7e6 feat: new note layout",
        "3f9a2c1 fix: save on enter",
        "",
        "$ git revert 9c8d7e6",
        '[main 1a2b3c4] Revert "feat: new note layout"',
        "$ git push",
      ],
      {
        2: "this one broke production",
        5: "make a commit that does the opposite",
        6: "a new commit; nothing is rewritten",
      },
    ),
  ),

  part(
    "reflog",
    "The reflog: Git's safety net",
    explain(
      "Rebase, reset and amend look destructive, but Git keeps the old commits for weeks. The **reflog** records every place HEAD has been. If a reset or rebase went wrong, find the commit from before it and reset back to it.",
    ),
    code(
      "bash",
      "getting work back after a bad reset",
      [
        "$ git reset --hard HEAD~2   # oops",
        "$ git reflog",
        "3f9a2c1 HEAD@{0}: reset: moving to HEAD~2",
        "8b7e4d0 HEAD@{1}: commit: feat: tags",
        "$ git reset --hard 8b7e4d0",
      ],
      {
        1: "two commits seem gone",
        4: "where HEAD was before the reset",
        5: "and they're back",
      },
    ),
  ),

  part(
    "which-to-use",
    "Which one to use",
    explain(
      "The question is always the same: has anyone else got these commits? If not, you can rewrite them freely. If they have, only add new commits.",
    ),
    reference("Situation → command", [
      ["Branch behind main, unshared", "Replay onto main.", "git rebase main"],
      ["Branch behind main, shared", "Merge main in.", "git merge main"],
      ["Messy commits, unpushed", "Tidy them.", "git rebase -i main"],
      ["Last commit, unpushed", "Undo, keep changes.", "git reset HEAD~1"],
      ["Bad commit on main", "Undo with a new commit.", "git revert <hash>"],
      ["Lost a commit", "Find it, go back.", "git reflog"],
    ]),
  ),

  part(
    "notes-app",
    "Undoing in the Notes App",
    explain(
      "Say a change to how notes are listed reached `main` and broke the app for everyone. The fix that doesn't disturb anyone is `git revert` on that commit: `main` gets a new commit restoring the old behaviour, the deploy goes out, and the real fix can follow at leisure.",
    ),
    inTheNotesApp(
      "`notesController.js` holds the listing query; a broken change to it would be reverted on `main`, not reset.",
      { fileId: "backend/src/controllers/notesController.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Rebasing a shared branch",
      language: "bash",
      wrong: [
        "$ git switch main",
        "$ git rebase feature/x",
        "$ git push --force",
      ],
      problem:
        "Everyone else's `main` now disagrees with GitHub's. Their next pull tries to merge two versions of the same work.",
      right: ["$ git switch main", "$ git merge feature/x", "$ git push"],
      why: "Shared branches only ever get new commits. Rebase your own branch, never `main`.",
    }),
    mistake({
      title: "reset --hard with uncommitted work",
      language: "bash",
      wrong: ["$ git reset --hard HEAD~1"],
      problem:
        "Uncommitted edits were never in any commit, so the reflog can't bring them back. They're gone.",
      right: ["$ git stash", "$ git reset --hard HEAD~1"],
      why: "Commit or stash first. `--hard` is the only reset that throws work away.",
    }),
    mistake({
      title: "A plain force push",
      language: "bash",
      wrong: ["$ git push --force"],
      problem:
        "If a teammate pushed to your branch since you last fetched, `--force` silently deletes their commit.",
      right: ["$ git push --force-with-lease"],
      why: "`--force-with-lease` refuses if the branch changed since you last saw it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Read the to-do list",
      task: "Read the interactive rebase list, then replace each `?` with the hash of the commit that will be removed, the one folded into the commit above, and the one whose message you'll edit.",
      starter: [
        "<pre>pick   1aa1111 feat: search api",
        "reword 2bb2222 feat: search boxx",
        "squash 3cc3333 wip",
        "drop   4dd4444 console.log</pre>",
        '<p>Removed: <span id="drop">?</span></p>',
        '<p>Folded into the one above: <span id="squash">?</span></p>',
        '<p>Message edited: <span id="reword">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "drop removes",
          selector: "#drop",
          text: "4dd4444",
        },
        {
          kind: "text",
          label: "squash folds",
          selector: "#squash",
          text: "3cc3333",
        },
        {
          kind: "text",
          label: "reword renames",
          selector: "#reword",
          text: "2bb2222",
        },
      ],
      hint: "The word at the start of each line says what happens to that commit.",
      solution: [
        "<pre>pick   1aa1111 feat: search api",
        "reword 2bb2222 feat: search boxx",
        "squash 3cc3333 wip",
        "drop   4dd4444 console.log</pre>",
        '<p>Removed: <span id="drop">4dd4444</span></p>',
        '<p>Folded into the one above: <span id="squash">3cc3333</span></p>',
        '<p>Message edited: <span id="reword">2bb2222</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Pick the undo",
      task: "Replace each `?` with the right command: `git revert`, `git reset HEAD~1` or `git reflog`.",
      starter: [
        '<p>A bad commit is already on main on GitHub: <span id="pushed">?</span></p>',
        '<p>Undo your last, unpushed commit but keep its changes: <span id="local">?</span></p>',
        '<p>Find a commit you lost in a bad reset: <span id="lost">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Shared: a new commit",
          selector: "#pushed",
          text: "git revert",
        },
        {
          kind: "text",
          label: "Unshared: move the branch back",
          selector: "#local",
          text: "git reset HEAD~1",
        },
        {
          kind: "text",
          label: "Lost: the safety net",
          selector: "#lost",
          text: "git reflog",
        },
      ],
      hint: "Has anyone else got it? Then add a new commit. Only yours? Reset. Lost? Look where HEAD has been.",
      solution: [
        '<p>A bad commit is already on main on GitHub: <span id="pushed">git revert</span></p>',
        '<p>Undo your last, unpushed commit but keep its changes: <span id="local">git reset HEAD~1</span></p>',
        '<p>Find a commit you lost in a bad reset: <span id="lost">git reflog</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Rewriting history cheat sheet", [
      ["git rebase main", "Replay your commits onto main.", "new hashes"],
      ["golden rule", "Never rebase shared commits.", "main, team branches"],
      ["git rebase -i", "pick, squash, reword, drop.", "before a PR"],
      [
        "--force-with-lease",
        "Safe push after rebasing.",
        "never plain --force",
      ],
      [
        "reset --soft / --mixed",
        "Undo commits, keep changes.",
        "unpushed only",
      ],
      ["reset --hard", "Undo and discard changes.", "careful"],
      ["git revert", "New commit undoing an old one.", "safe on main"],
      ["git reflog", "Where HEAD has been.", "undo an undo"],
    ]),
    quickCheck(
      "Which of these is safe on a commit everyone already has?",
      ["`git rebase`", "`git reset --hard`", "`git revert`"],
      2,
      "Revert only adds a new commit, so nobody's history is rewritten.",
    ),
  ),
);
