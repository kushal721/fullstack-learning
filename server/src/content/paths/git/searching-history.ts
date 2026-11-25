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

// Searching history: log, blame and bisect. History as evidence, filtering
// the log, searching for code, blame taken apart, bisect, a bisect step by
// step, letting a test do it, the Notes App, mistakes, practice and a
// recap.
export const searchingHistoryModule = moduleLesson(
  "searching-history",
  "Searching history: log, blame and bisect",
  40,
  [
    "Filter the history by message, author, file and date.",
    "Find the commit that added or removed a piece of code.",
    "Read git blame, and use it to find why a line exists.",
    "Find the commit that introduced a bug with git bisect.",
  ],

  part(
    "history-as-evidence",
    "History as evidence",
    explain(
      "Good commits turn the history into a searchable record. When something breaks, or a line looks odd, the history can answer *when* it changed, *who* changed it and, through the message and pull request, *why*. Git has tools for each question.",
    ),
    reference("Questions and the tool that answers them", [
      ["Which commits mention search?", "Filter the log.", "git log --grep"],
      ["When was this function added?", "Search the changes.", "git log -S"],
      ["Who last changed this line, and why?", "Blame the file.", "git blame"],
      ["Which commit broke this?", "Binary search.", "git bisect"],
    ]),
  ),

  part(
    "filtering-the-log",
    "Filtering the log",
    explain(
      "`git log` takes filters you can combine. Narrow by message words, author, date or path to find the handful of commits that matter among thousands.",
    ),
    code(
      "bash",
      "narrowing down the history",
      [
        '$ git log --oneline --grep="search"',
        '$ git log --oneline --author="Alex"',
        '$ git log --oneline --since="2 weeks ago"',
        "$ git log --oneline -- src/api.js",
        "$ git log --oneline main..feature/tags",
      ],
      {
        1: "messages that mention search",
        2: "commits by one person",
        3: "only recent ones",
        4: "only commits touching one file",
        5: "commits on the branch that main doesn't have",
      },
    ),
  ),

  part(
    "searching-code",
    "Finding when code appeared",
    explain(
      "`git log -S text` (the “pickaxe”) finds commits where the number of times `text` appears changed: the commit that added a function, or the one that deleted it. Add `-p` to see the diffs. It finds code even after it's been removed from today's files.",
    ),
    code(
      "bash",
      "when did validateNote appear?",
      [
        "$ git log --oneline -S validateNote",
        "7c1d2e3 refactor: move checks to validation/",
        "2a9b8c7 feat: validate notes before saving",
      ],
      {
        2: "the newest commit that changed how often it appears",
        3: "the oldest: where it was first added",
      },
    ),
    quickCheck(
      "A helper called `formatDate` was deleted months ago. How do you find the commit that removed it?",
      ["`git blame`", "`git log -S formatDate`", "`git status`"],
      1,
      "The pickaxe searches the changes themselves, so it finds code that no longer exists.",
    ),
  ),

  part(
    "blame",
    "git blame, taken apart",
    explain(
      "[[git-blame|git blame]] shows, for every line of a file, the commit that last changed it. Despite the name, it's for understanding, not blaming: from the commit you get the message and the pull request that explain the line.",
    ),
    anatomy(
      "git blame src/api.js (one line)",
      ["2a9b8c7 (Alex 2026-10-02 14)", '  const BASE = "/api";'],
      [
        ["2a9b8c7", "commit", "The last commit to change this line."],
        ["Alex", "author", "Who made that commit."],
        ["2026-10-02", "date", "When."],
        ["14", "line number", "Line 14 of the file today."],
      ],
    ),
  ),

  part(
    "bisect",
    "git bisect: binary search for a bug",
    explain(
      "Something worked last month and is broken now, with 200 commits in between. [[git-bisect|git bisect]] finds the culprit by binary search: you mark one commit good and one bad, Git checks out the middle one, you test and say good or bad, and it halves the range each time. 200 commits take about 8 tests.",
    ),
    analogy(
      "Like guessing a number between 1 and 200 when you're told “higher” or “lower”: start in the middle and halve the range each guess.",
    ),
    keyPoints(
      "Mark a known good commit and a known bad one.",
      "Git checks out the midpoint; you test it.",
      "Each answer halves the range.",
      "`git bisect reset` returns you to where you started.",
    ),
  ),

  part(
    "step-by-step",
    "A bisect, step by step",
    explain(
      "Saving a note stopped working sometime in the last 16 commits. Step through finding which one broke it:",
    ),
    trace(
      "git bisect: 16 commits",
      [
        "git bisect start",
        "git bisect bad",
        "git bisect good v1.2",
        "→ checks out commit 8",
        "test: save works · good",
        "→ checks out commit 12",
        "test: save fails · bad",
        "→ commit 10: good",
        "→ commit 11: bad",
        "11 is the first bad commit",
        "git bisect reset",
      ],
      [
        {
          line: 3,
          note: "Today's commit is bad; the `v1.2` release was good. The bug is somewhere in the 16 commits between them.",
          vars: [
            ["suspects", "1–16"],
            ["tests run", "0"],
          ],
        },
        {
          line: 5,
          note: "Git checks out the middle, commit 8. Saving works there, so the bug came later.",
          vars: [
            ["suspects", "9–16"],
            ["tests run", "1"],
          ],
        },
        {
          line: 7,
          note: "Halfway again: commit 12 fails. The bug is between 9 and 12.",
          vars: [
            ["suspects", "9–12"],
            ["tests run", "2"],
          ],
        },
        {
          line: 10,
          note: "Two more halvings: 10 works, 11 doesn't. Commit 11 is the culprit, found in four tests instead of sixteen.",
          vars: [
            ["suspects", "11"],
            ["tests run", "4"],
          ],
          output: "commit 11 is the first bad commit",
        },
        {
          line: 11,
          note: "Back to the branch you were on. Now read commit 11's diff: the bug is in there.",
          vars: [["HEAD", "back on main"]],
        },
      ],
      { language: "html" },
    ),
  ),

  part(
    "automatic-bisect",
    "Letting a test do it",
    explain(
      "If a command can tell good from bad, Git can bisect on its own. `git bisect run` runs the command at each step: exit code 0 means good, anything else means bad. A failing test you've just written is perfect for this.",
    ),
    code(
      "bash",
      "bisecting with a test",
      [
        "$ git bisect start HEAD v1.2",
        "$ git bisect run npm test -- notes.test.js",
        "…",
        "a4c3b2d is the first bad commit",
        "    fix: trim note titles",
        "$ git bisect reset",
      ],
      {
        1: "bad, then good, in one line",
        2: "Git runs the test at every step by itself",
        4: "the answer, with no clicking",
      },
    ),
  ),

  part(
    "notes-app",
    "Searching the Notes App's history",
    explain(
      "The Notes App's tests make bisecting easy: if a bug can be written as a failing test in `notes.test.js`, `git bisect run` finds the commit that caused it. And `git blame` on `notesController.js` tells you which pull request added each check, and why.",
    ),
    inTheNotesApp(
      "`notes.test.js` is the kind of test `git bisect run` can use to find a breaking commit.",
      { fileId: "backend/src/routes/notes.test.js" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Using blame to blame",
      language: "bash",
      wrong: ["$ git blame app.js", "# “Alex broke it!”"],
      problem:
        "The last person to touch a line often only moved or reformatted it. And finding fault doesn't fix anything.",
      right: [
        "$ git blame app.js",
        "$ git show 2a9b8c7",
        "# read why it changed",
      ],
      why: "Use blame to find the commit and its reason, then fix the code.",
    }),
    mistake({
      title: "Forgetting to reset after bisecting",
      language: "bash",
      wrong: ["# found the bad commit, started coding the fix"],
      problem:
        "You're still on an old commit in the middle of a bisect, not on your branch. New commits go nowhere useful.",
      right: ["$ git bisect reset", "$ git switch -c fix/save"],
      why: "Always end with `git bisect reset` before writing the fix.",
    }),
    mistake({
      title: "Marking a commit wrongly",
      language: "bash",
      wrong: ["# didn't test properly · git bisect good"],
      problem:
        "One wrong answer sends the search into the wrong half, and it ends on a commit that isn't the culprit.",
      right: ["$ git bisect skip", "# if a commit can't be tested"],
      why: "Test each step for real, and use `git bisect skip` when you can't tell.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    pageYourTurn({
      title: "Pick the tool",
      task: "Replace each `?` with the tool for the question: `git log --grep`, `git log -S`, `git blame` or `git bisect`.",
      starter: [
        '<p>Which commits mention “login” in their message? <span id="grep">?</span></p>',
        '<p>Which commit first added the function saveNote? <span id="pickaxe">?</span></p>',
        '<p>Who last changed line 42, and in which commit? <span id="blame">?</span></p>',
        '<p>Which of 300 commits broke the search box? <span id="bisect">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Messages: --grep",
          selector: "#grep",
          text: "git log --grep",
        },
        {
          kind: "text",
          label: "Code appearing: -S",
          selector: "#pickaxe",
          text: "git log -S",
        },
        {
          kind: "text",
          label: "A line: blame",
          selector: "#blame",
          text: "git blame",
        },
        {
          kind: "text",
          label: "A regression: bisect",
          selector: "#bisect",
          text: "git bisect",
        },
      ],
      hint: "Messages, code, a line, or “when did it break?”: one tool each.",
      solution: [
        '<p>Which commits mention “login” in their message? <span id="grep">git log --grep</span></p>',
        '<p>Which commit first added the function saveNote? <span id="pickaxe">git log -S</span></p>',
        '<p>Who last changed line 42, and in which commit? <span id="blame">git blame</span></p>',
        '<p>Which of 300 commits broke the search box? <span id="bisect">git bisect</span></p>',
      ],
    }),
    pageYourTurn({
      title: "Narrow the range",
      task: "A bisect starts with commits 1 to 32 as suspects. Replace each `?` with the range left after each answer, like `5 to 9`.",
      starter: [
        '<p>Commit 16 is good: <span id="one">?</span></p>',
        '<p>Then commit 24 is bad: <span id="two">?</span></p>',
        '<p>Then commit 20 is good: <span id="three">?</span></p>',
      ],
      checks: [
        {
          kind: "text",
          label: "Good at 16: the bug came after",
          selector: "#one",
          text: "17 to 32",
        },
        {
          kind: "text",
          label: "Bad at 24: it's 24 or before",
          selector: "#two",
          text: "17 to 24",
        },
        {
          kind: "text",
          label: "Good at 20: after 20",
          selector: "#three",
          text: "21 to 24",
        },
      ],
      hint: "Good means the bug came later; bad means it's that commit or an earlier one. Write each range like `17 to 32`.",
      solution: [
        '<p>Commit 16 is good: <span id="one">17 to 32</span></p>',
        '<p>Then commit 24 is bad: <span id="two">17 to 24</span></p>',
        '<p>Then commit 20 is good: <span id="three">21 to 24</span></p>',
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Searching history cheat sheet", [
      ["--grep", "Commits whose message matches.", '--grep="search"'],
      ["--author, --since", "By person, by date.", '--since="2 weeks ago"'],
      ["-- path", "Commits touching a file.", "git log -- src/api.js"],
      ["-S text", "When code appeared or vanished.", "git log -S saveNote"],
      ["git blame", "Last commit per line.", "then git show"],
      ["git bisect", "Binary search for the bad commit.", "good / bad"],
      ["bisect run", "Let a test decide.", "npm test"],
      ["bisect reset", "Back to where you were.", "always finish with it"],
    ]),
    quickCheck(
      "About how many tests does git bisect need to search 1,000 commits?",
      ["About 10", "About 100", "About 1,000"],
      0,
      "Each test halves the range: 1,000 → 500 → 250 … → 1 in about ten steps.",
    ),
  ),
);
