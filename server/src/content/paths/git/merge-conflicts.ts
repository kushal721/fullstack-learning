import {
  analogy,
  anatomy,
  code,
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

// Merge conflicts. Why they happen, when Git can and can't merge on its
// own, conflict markers, a conflicted status, resolving one step by step,
// tools and escape hatches, avoiding them, lock files, mistakes, practice
// and a recap.
export const mergeConflictsModule = moduleLesson(
  "merge-conflicts",
  "Merge conflicts: when two changes collide",
  40,
  [
    "Explain why a conflict happens, and when Git merges on its own.",
    "Read conflict markers and a conflicted git status.",
    "Resolve a conflict, finish the merge, or abort it safely.",
    "Avoid most conflicts with small branches and frequent pulls.",
  ],

  part(
    "why-conflicts",
    "Why conflicts happen",
    explain(
      "Most merges are automatic: if two branches changed different files, or different parts of a file, Git combines them. A [[merge-conflict|conflict]] happens only when both changed the *same lines* in different ways. Git can't know which version is right, so it stops and asks you. A conflict isn't an error; it's a question.",
    ),
    analogy(
      "Two people edit the same sentence of a shared document while offline. When they sync, someone has to read both versions and decide what the sentence should say.",
    ),
    quickCheck(
      "One branch edits `NoteCard.jsx`, the other edits `api.js`. What happens when you merge?",
      [
        "A conflict in both files",
        "Git merges them automatically: different files",
        "The merge is refused",
      ],
      1,
      "Conflicts only happen when both sides change the same lines of the same file.",
    ),
  ),

  part(
    "when",
    "When Git can and can't merge",
    explain(
      "Git compares both branches with the commit they started from. Changes on one side only are taken as they are. Changes on both sides to the same place conflict. A few other situations conflict too, like one side deleting a file the other edited.",
    ),
    reference("What Git does with each change", [
      ["Different files", "Merged automatically.", "a.js vs b.js"],
      ["Same file, different lines", "Merged automatically.", "top vs bottom"],
      ["Same lines, both changed", "Conflict: you choose.", "the same <h2>"],
      [
        "Edited on one, deleted on other",
        "Conflict: keep or delete?",
        "UD api.js",
      ],
      ["Same change on both", "Merged: they agree.", "same fix twice"],
    ]),
  ),

  part(
    "markers",
    "Reading conflict markers",
    explain(
      "In a conflicted file, Git writes both versions between **markers**. Everything between `<<<<<<<` and `=======` is your side (`HEAD`, the branch you're on); between `=======` and `>>>>>>>` is the branch you're merging in. You edit the file into what it should be and delete the markers.",
    ),
    code(
      "jsx",
      "NoteCard.jsx, mid-conflict",
      [
        "<<<<<<< HEAD",
        "  <h2>{note.title}</h2>",
        "=======",
        '  <h2 className="title">{note.title}</h2>',
        ">>>>>>> feature/styles",
      ],
      {
        1: "start of your side (the branch you're on)",
        2: "your version",
        3: "the divider",
        4: "their version",
        5: "end, with the incoming branch's name",
      },
    ),
  ),

  part(
    "conflicted-status",
    "A conflicted git status",
    explain(
      "During a conflicted merge, `git status` lists every file still needing a decision under **Unmerged paths**. In the short form, two letters show what each side did:",
    ),
    anatomy(
      "git status --short, mid-merge",
      ["UU NoteCard.jsx", "M  README.md", "AA styles.css", "UD api.js"],
      [
        [
          "UU NoteCard.jsx",
          "both modified",
          "Same lines changed on both: resolve.",
        ],
        ["M  README.md", "merged", "Combined automatically, already staged."],
        [
          "AA styles.css",
          "both added",
          "Each side created a different file here.",
        ],
        ["UD api.js", "deleted by them", "You edited it; they deleted it."],
      ],
    ),
  ),

  part(
    "step-by-step",
    "Resolving a conflict, step by step",
    explain(
      "Step through merging a branch that changed the same heading as `main`, and resolving it:",
    ),
    trace(
      "git merge feature/styles",
      [
        "git merge feature/styles",
        "CONFLICT in NoteCard.jsx",
        "git status: UU NoteCard.jsx",
        "open the file, read both sides",
        "keep the className version",
        "delete the three markers",
        "npm test",
        "git add NoteCard.jsx",
        "git commit",
      ],
      [
        {
          line: 2,
          note: "Both branches changed the `<h2>` line. Git merges everything else and stops on that file.",
          vars: [
            ["merge", "paused"],
            ["NoteCard.jsx", "conflicted"],
          ],
          output:
            "Automatic merge failed; fix conflicts and then commit the result.",
        },
        {
          line: 5,
          note: "You decide what the line should be. Here their version is right: it keeps the title and adds the class.",
          vars: [
            ["merge", "paused"],
            ["NoteCard.jsx", "edited, markers still in"],
          ],
        },
        {
          line: 6,
          note: "The markers must go: they'd break the code. The file now reads exactly as it should.",
          vars: [
            ["merge", "paused"],
            ["NoteCard.jsx", "resolved"],
          ],
        },
        {
          line: 7,
          note: "Run the tests before finishing: a resolved conflict can still be wrong.",
          vars: [["tests", "✓ passed"]],
        },
        {
          line: 9,
          note: "`git add` marks the file resolved; `git commit` finishes the merge commit with a prepared message.",
          vars: [
            ["merge", "done"],
            ["NoteCard.jsx", "committed"],
          ],
          output: "Merge branch 'feature/styles'",
        },
      ],
    ),
  ),

  part(
    "tools",
    "Tools and escape hatches",
    explain(
      "Editors make conflicts easier: VS Code highlights each one with buttons to **Accept Current**, **Accept Incoming** or **Accept Both**, and a merge editor showing both sides side by side. And if a merge gets confusing, you can always go back to exactly where you were before it started.",
    ),
    reference("Getting through a conflict", [
      ["git status", "Which files still need you.", "Unmerged paths"],
      ["git diff", "Show the conflicts.", "both sides at once"],
      [
        "Accept Current / Incoming",
        "Keep one side in VS Code.",
        "per conflict",
      ],
      ["git add file", "Mark one file resolved.", "after removing markers"],
      ["git merge --abort", "Cancel; back to before the merge.", "start again"],
    ]),
  ),

  part(
    "avoiding",
    "Avoiding conflicts",
    explain(
      "You can't avoid conflicts entirely, but you can keep them small and rare. They grow with time and size: the longer two branches drift apart, the more lines they both touch. Merging often keeps each conflict small enough to understand.",
    ),
    keyPoints(
      "Pull `main` into your branch often.",
      "Keep branches small and short-lived.",
      "Use a formatter, so nobody fights over spaces.",
      "Tell teammates when you're reworking a shared file.",
    ),
  ),

  part(
    "notes-app",
    "Conflicts in the Notes App",
    explain(
      "Two Notes App branches that both add a package will both change `package.json` and its lock file. The lock file is generated, thousands of lines long, and not meant to be edited by hand: resolve `package.json` yourself, then let npm rebuild the lock file.",
    ),
    code(
      "bash",
      "a lock-file conflict",
      [
        "$ git status --short",
        "UU package.json",
        "UU package-lock.json",
        "# fix package.json by hand, then:",
        "$ npm install",
        "$ git add package.json package-lock.json",
      ],
      {
        2: "resolve this one yourself: keep both packages",
        5: "npm rewrites the lock file to match",
      },
    ),
    inTheNotesApp(
      "`package.json` lists the packages; when two branches add different ones, keep both.",
      { fileId: "frontend/package.json" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Committing the markers",
      language: "jsx",
      wrong: [
        "<<<<<<< HEAD",
        "  <h2>{note.title}</h2>",
        "=======",
        '  <h2 className="title">{note.title}</h2>',
        ">>>>>>> feature/styles",
      ],
      problem:
        "Committed as is, the file isn't valid code: the build breaks, and the markers end up on `main`.",
      right: ['  <h2 className="title">{note.title}</h2>'],
      why: "Search the file for `<<<<<<<` before `git add`. Many teams add a check that rejects markers.",
    }),
    mistake({
      title: "Accepting both without reading",
      language: "jsx",
      wrong: [
        "  <h2>{note.title}</h2>",
        '  <h2 className="title">{note.title}</h2>',
      ],
      problem:
        "“Accept Both” kept both lines, so every note now shows its title twice.",
      right: ['  <h2 className="title">{note.title}</h2>'],
      why: "Read both sides and write what the code should be. The buttons are shortcuts, not answers.",
    }),
    mistake({
      title: "Resolving without testing",
      language: "bash",
      wrong: ["$ git add .", "$ git commit", "$ git push"],
      problem:
        "A conflict can be resolved into code that has no markers but still doesn't work, because neither side expected the other's change.",
      right: ["$ npm test", "$ git add .", "$ git commit"],
      why: "Run the tests after resolving, before committing.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Resolve the conflict",
      task: 'The card\'s heading is in conflict. Resolve it by keeping **their** version (the one with `class="title"`) and deleting the other version and all three markers.',
      starter: [
        '<div id="card">',
        "&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD",
        "  <h2>Shopping</h2>",
        "=======",
        '  <h2 class="title">Shopping</h2>',
        "&gt;&gt;&gt;&gt;&gt;&gt;&gt; feature/styles",
        "</div>",
      ],
      checks: [
        {
          kind: "count",
          label: "Exactly one heading",
          selector: "#card h2",
          count: 1,
        },
        {
          kind: "exists",
          label: "It's their version, with the class",
          selector: "#card h2.title",
        },
        {
          kind: "text",
          label: "No markers left: the card says only Shopping",
          selector: "#card",
          text: "Shopping",
        },
      ],
      hint: "Delete the `<<<<<<<`, `=======` and `>>>>>>>` lines and the heading without the class.",
      solution: [
        '<div id="card">',
        '  <h2 class="title">Shopping</h2>',
        "</div>",
      ],
    }),
    pageYourTurn({
      title: "Read the conflicted status",
      task: "Read the status, then replace each `?` with the file: the one both sides edited, the one merged automatically, and the one the other branch deleted.",
      starter: [
        "<pre>UU src/App.jsx",
        "M  README.md",
        "UD src/old-api.js</pre>",
        '<p>Both edited the same lines: <span id="both">?</span></p>',
        '<p>Merged automatically: <span id="merged">?</span></p>',
        '<p>Deleted by the other branch: <span id="deleted">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "UU: both modified",
          selector: "#both",
          text: "src/App.jsx",
        },
        {
          kind: "text",
          label: "M: merged and staged",
          selector: "#merged",
          text: "README.md",
        },
        {
          kind: "text",
          label: "UD: deleted by them",
          selector: "#deleted",
          text: "src/old-api.js",
        },
      ],
      hint: "UU: both modified. A plain M in the first column: merged and staged. UD: updated by us, deleted by them.",
      solution: [
        "<pre>UU src/App.jsx",
        "M  README.md",
        "UD src/old-api.js</pre>",
        '<p>Both edited the same lines: <span id="both">src/App.jsx</span></p>',
        '<p>Merged automatically: <span id="merged">README.md</span></p>',
        '<p>Deleted by the other branch: <span id="deleted">src/old-api.js</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Merge conflicts cheat sheet", [
      ["conflict", "Both sides changed the same lines.", "Git asks you"],
      ["<<<<<<< HEAD", "Start of your side.", "the branch you're on"],
      ["=======", "Between the two sides.", "divider"],
      [">>>>>>> branch", "End of their side.", "the incoming branch"],
      ["UU", "Both modified: resolve it.", "git status --short"],
      ["resolve", "Edit, remove markers, test, git add.", "then git commit"],
      ["git merge --abort", "Back to before the merge.", "start again"],
      ["lock files", "Fix package.json, run npm install.", "package-lock.json"],
    ]),
    quickCheck(
      "You've removed the markers from every conflicted file. What finishes the merge?",
      [
        "`git merge --abort`",
        "`git add` the files, then `git commit`",
        "`git push --force`",
      ],
      1,
      "Adding marks each file resolved; the commit completes the merge.",
    ),
  ),
);
