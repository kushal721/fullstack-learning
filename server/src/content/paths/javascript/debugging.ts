import {
  analogy,
  anatomy,
  diagram,
  explain,
  inTheNotesApp,
  jsPlayground,
  keyPoints,
  mistake,
  moduleLesson,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Debugging in depth: the debugging loop, reproducing a bug, logging well,
// console tools, breakpoints and stepping, a bug hunt step by step, the
// Network tab for API bugs, strategies (rubber duck, halving), two worked
// bug hunts, where it's used, mistakes, fix-the-bug practice and a recap.
export const debuggingModule = moduleLesson(
  "debugging",
  "Debugging: finding and fixing bugs",
  45,
  [
    "Follow the debugging loop: reproduce, read, guess, check, fix, confirm.",
    "Use the console well: labelled logs, `console.table`, `console.error` and friends.",
    "Pause code with breakpoints or `debugger`, and step through it in DevTools.",
    "Find API bugs in the Network tab from the status, the request and the response.",
    "Narrow a bug down by halving, and fix the cause rather than the symptom.",
  ],

  part(
    "why",
    "Bugs are normal; debugging is a skill",
    explain(
      "Every developer writes bugs, every day. What separates beginners from experienced developers isn't fewer bugs: it's a **method** for finding them. [[debugging|Debugging]] isn't guessing and changing things until it works. It's a loop: make the bug happen, gather evidence, form a guess, check the guess, and only then fix it.",
    ),
    diagram([
      ["1. reproduce", "make it happen on purpose, every time"],
      ["2. read", "the error, the line, what you expected vs. got"],
      ["3. guess", "one specific idea of what's wrong"],
      ["4. check", "a log or a breakpoint proves it right or wrong"],
      [
        "5. fix and confirm",
        "change one thing; the bug is gone, nothing else broke",
      ],
    ]),
    analogy(
      "A detective, not a gambler: collect clues, name a suspect, test the alibi. Only arrest someone once the evidence fits.",
    ),
  ),

  part(
    "reproduce",
    "Reproduce it first",
    explain(
      "You can't fix what you can't see. First find the exact steps that make the bug happen: which page, which input, which click. Then make the case **as small as possible**: does it happen with one note? With an empty title? A bug you can trigger in two clicks is half solved, and you'll know for sure when it's fixed.",
    ),
    keyPoints(
      "Write down the steps: “Add a note with an emoji in the title, then save.”",
      "Note what you expected, and what happened instead.",
      "Shrink it: remove steps until it stops happening.",
      "Read the console: is there a red error?",
    ),
    quickCheck(
      "A user says “saving is broken”. What's the best first step?",
      [
        "Rewrite the save function",
        "Find the exact steps that make saving fail, and try them yourself",
        "Add try/catch everywhere",
      ],
      1,
      "Until you can make it fail on purpose, any change is a guess, and you can't tell whether it worked.",
    ),
  ),

  part(
    "logging",
    "Logging that helps",
    explain(
      "`console.log` is the quickest way to check a guess: print the value at the moment you suspect it's wrong. Two habits make logs far more useful. **Label** every log, so you know which line printed it. And log an **object** with shorthand properties, so the names come out with the values.",
    ),
    anatomy(
      "A useful log",
      ["console.log(", '  "save:",', "  { title, status },", ");"],
      [
        ['"save:"', "a label", "Says where this log is. Search for it later."],
        [
          "{ title, status }",
          "an object",
          "Prints the names with the values: `{ title: '', status: 400 }`.",
        ],
      ],
    ),
    jsPlayground("Unlabelled, then labelled", [
      'const title = "";',
      "const status = 400;",
      "",
      "console.log(title, status); // which is which? and the empty title vanishes",
      'console.log("save:", { title, status }); // clear',
    ]),
  ),

  part(
    "console-tools",
    "More console tools",
    explain(
      "The console does far more than `log`. A table makes an array of objects readable at a glance. `console.error` shows in red with a stack. `console.count` tells you how often something runs, and `console.time` how long it takes. Try them here, and in your browser's DevTools Console.",
    ),
    reference("The console's toolbox", [
      [
        "console.log(label, value)",
        "Print values.",
        'console.log("notes:", notes)',
      ],
      [
        "console.table(array)",
        "An array of objects as a table.",
        "console.table(notes)",
      ],
      [
        "console.error / warn",
        "Red or yellow, with a stack.",
        "console.error(error)",
      ],
      [
        "console.count(label)",
        "How many times this line ran.",
        'console.count("render")',
      ],
      [
        "console.time / timeEnd",
        "How long something took.",
        'console.time("load")',
      ],
      ["console.trace()", "The call stack right now.", "console.trace()"],
      [
        "console.assert(cond, msg)",
        "Log only when cond is false.",
        "console.assert(id > 0, id)",
      ],
    ]),
    jsPlayground("Try the toolbox", [
      "const notes = [",
      '  { id: 1, title: "Milk", done: false },',
      '  { id: 2, title: "Bread", done: true },',
      "];",
      "console.table(notes);",
      "",
      'for (const note of notes) console.count("loop");',
      "",
      'console.assert(notes.length === 3, "expected 3 notes, got", notes.length);',
      'console.error(new Error("Something broke"));',
    ]),
  ),

  part(
    "breakpoints",
    "Breakpoints and stepping",
    explain(
      "Logs show what you thought to print. A **breakpoint** pauses the code at a line, and shows **everything**: every variable in scope, the call stack, and values you hover over. Open DevTools → Sources, click a line number, and trigger the code. Or write `debugger;` in your code: DevTools pauses there whenever it's open.",
    ),
    reference("Paused: the controls", [
      ["Resume (F8)", "Run on to the next breakpoint.", "▶"],
      ["Step over (F10)", "Run this line; don't go into calls.", "↷"],
      ["Step into (F11)", "Go into the function this line calls.", "↓"],
      [
        "Step out (Shift+F11)",
        "Finish this function; pause in its caller.",
        "↑",
      ],
      ["Scope", "Every variable in scope, live.", "sum: 5, i: 1"],
      ["Watch", "Expressions you want to keep an eye on.", "prices.length"],
      ["Call stack", "How execution got here.", "total ← main"],
    ]),
    keyPoints(
      "Pause before the line you suspect, then step over it.",
      "Check each variable against what you expected.",
      "Remove `debugger;` lines before you commit.",
    ),
  ),

  part(
    "bug-hunt",
    "A bug hunt, step by step",
    explain(
      "`total([5, 3, 2])` should be 10, but prints 5. Here's what you'd see stepping through it in DevTools, paused at each line. Watch the variables and look for the first one that isn't what you expected.",
    ),
    trace(
      "Stepping through a wrong total",
      [
        "function total(prices) {",
        "  let sum = 0;",
        "  for (let i = 1; i < prices.length; i++) {",
        "    sum += prices[i];",
        "  }",
        "  return sum;",
        "}",
        "console.log(total([5, 3, 2]));",
      ],
      [
        {
          line: 2,
          note: "Paused inside `total`. `prices` looks right: three numbers.",
          vars: [
            ["prices", "[5, 3, 2]"],
            ["sum", "0"],
          ],
          stack: ["main program", "total()"],
        },
        {
          line: 4,
          note: "First time round the loop. `i` is **1**, so `prices[i]` is 3. But the first price, 5, is at index 0. That's the clue.",
          vars: [
            ["prices", "[5, 3, 2]"],
            ["sum", "3"],
            ["i", "1"],
          ],
          stack: ["main program", "total()"],
        },
        {
          line: 4,
          note: "Second time: `i` is 2, adding 2.",
          vars: [
            ["prices", "[5, 3, 2]"],
            ["sum", "5"],
            ["i", "2"],
          ],
          stack: ["main program", "total()"],
        },
        {
          line: 6,
          note: "`i` became 3, which isn't less than 3, so the loop ended. The 5 was never added.",
          vars: [
            ["prices", "[5, 3, 2]"],
            ["sum", "5"],
          ],
          stack: ["main program", "total()"],
        },
        {
          line: 8,
          note: "Found it: the loop starts at 1. Fix line 3 to `let i = 0`, run again, and confirm it prints 10.",
          stack: ["main program"],
          output: "5",
        },
      ],
    ),
  ),

  part(
    "network",
    "API bugs: the Network tab",
    explain(
      "When the bug is between the page and the server, open DevTools → **Network**, do the action, and click the request. You'll see the **status**, the **payload** the page sent and the **response** the server gave back. That tells you which side is wrong. The status code is usually the first clue:",
    ),
    reference("Status → where to look", [
      [
        "404 Not Found",
        "Wrong URL or id: compare it with the API.",
        "/api/note vs /api/notes",
      ],
      [
        "401 Unauthorized",
        "Not logged in, or the cookie wasn't sent.",
        'credentials: "include"',
      ],
      [
        "400 Bad Request",
        "The body is wrong: check the Payload tab.",
        "missing title",
      ],
      [
        "500 Server Error",
        "A bug on the server: read its logs.",
        "the terminal running it",
      ],
      [
        "CORS error",
        "The server didn't allow this origin.",
        "server CORS settings",
      ],
      ["(pending) forever", "The server never answered.", "is it running?"],
    ]),
  ),

  part(
    "strategies",
    "When you're stuck",
    explain(
      "Some bugs hide. Then use a **strategy** rather than staring. Explain the code, line by line, to someone, or to a rubber duck: you'll often hear your own wrong assumption. **Halve** the problem: put a log in the middle; is the value already wrong there? Then the bug is in the first half. Repeat until you're on one line.",
    ),
    keyPoints(
      "Rubber duck: explain each line out loud; the wrong assumption stands out.",
      "Halve it: log in the middle, then in the middle of the bad half.",
      "Check assumptions: is the function even being called? Log at its top.",
      "Change one thing at a time, so you know what fixed it.",
      "Take a break. Fresh eyes find bugs faster.",
    ),
  ),

  part(
    "hunt-data",
    "Bug hunt: a missing title",
    explain(
      "The list shows “undefined” instead of titles. Run it, then add labelled logs to find **where** the value first goes wrong. Fix it, and run again to confirm. (The bug is one word.)",
    ),
    jsPlayground("Find the bug with logs", [
      "const notes = [",
      '  { id: 1, title: "Milk" },',
      '  { id: 2, title: "Bread" },',
      "];",
      "",
      "function labels(list) {",
      "  return list.map((note) => `${note.id}. ${note.tittle}`);",
      "}",
      "",
      '// Try: console.log("first note:", notes[0]);',
      "console.log(labels(notes));",
    ]),
  ),

  part(
    "hunt-async",
    "Bug hunt: the count is wrong",
    explain(
      "`countNotes` should print 2, but prints `undefined`. Log `notes` inside it: what is it, really? When the log shows `Promise { … }` instead of an array, you know the cause. Fix it and confirm.",
    ),
    jsPlayground("Find the bug with logs", [
      "const wait = (ms) => new Promise((r) => setTimeout(r, ms));",
      "async function getNotes() {",
      "  await wait(100);",
      '  return [{ title: "Milk" }, { title: "Bread" }];',
      "}",
      "",
      "async function countNotes() {",
      "  const notes = getNotes();",
      '  // Try: console.log("notes is:", notes);',
      "  return notes.length;",
      "}",
      "",
      'countNotes().then((count) => console.log("count:", count));',
    ]),
  ),

  part(
    "where-used",
    "Debugging the Notes App",
    keyPoints(
      "A red error in the console? Click its file and line.",
      "Saving fails? Network tab → the POST request → status and Response.",
      "A list looks wrong? `console.table` the data before it's shown.",
      "React state wrong? The React DevTools extension shows each component's state.",
    ),
    inTheNotesApp(
      "When saving a note fails, `handleSave` shows the error under the form, but the message comes from the server via `request`. So the fastest check is the Network tab: the POST to `/api/notes`, its status, and the `error` in its response. That tells you whether to look at the form's data or at the server.",
      { symbolId: "fn:handleSave" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Fixing the symptom",
      wrong: ['const title = note.tittle ?? "Untitled"; // hides the typo'],
      problem:
        "The page stops showing “undefined”, but now every note says “Untitled”. The real bug is still there.",
      right: ["const title = note.title;"],
      why: "Find why the value is wrong, and fix that.",
    }),
    mistake({
      title: "Changing several things at once",
      wrong: ["// changed the URL, the headers and the body, then it worked"],
      problem:
        "You don't know which change fixed it, or whether the others broke something.",
      right: ["// change one thing, test, then the next"],
      why: "One change per test run tells you exactly what mattered.",
    }),
    mistake({
      title: "Ignoring the first error",
      wrong: ["// 12 red errors; fixing the last one first"],
      problem:
        "Later errors are often caused by the first one. Fixing them first wastes time.",
      right: ["// scroll up: fix the first error, then reload"],
      why: "Errors cascade. The first one is usually the cause.",
    }),
  ),

  part(
    "practice",
    "Your turn: fix the bug",
    yourTurn({
      title: "The average is off",
      task: "`average([2, 4, 6])` should be 4. Find the bug and fix it.",
      starter: [
        "function average(numbers) {",
        "  let sum = 0;",
        "  for (const n of numbers) sum += n;",
        "  return sum / (numbers.length - 1);",
        "}",
      ],
      tests: [
        ["average([2, 4, 6])", "4"],
        ["average([10])", "10"],
      ],
      hint: "Log `numbers.length` and what you divide by. An average divides by how many numbers there are.",
      solution: [
        "function average(numbers) {",
        "  let sum = 0;",
        "  for (const n of numbers) sum += n;",
        "  return sum / numbers.length;",
        "}",
      ],
    }),
    yourTurn({
      title: "Everything is done?",
      task: "`countDone` says every note is done, and it changes the notes too. Find the one-character bug.",
      starter: [
        "function countDone(notes) {",
        "  return notes.filter((note) => (note.done = true)).length;",
        "}",
      ],
      tests: [
        ["countDone([{ done: true }, { done: false }, { done: true }])", "2"],
        ["countDone([{ done: false }])", "0"],
        [
          "((list) => (countDone(list), list[0].done))([{ done: false }])",
          "false",
        ],
      ],
      hint: "`=` assigns; `===` compares.",
      solution: [
        "function countDone(notes) {",
        "  return notes.filter((note) => note.done === true).length;",
        "}",
      ],
    }),
    yourTurn({
      title: "A count that isn't",
      task: "`countNotes()` should resolve to 2. Find the bug (log `notes` if you're not sure).",
      starter: [
        "const wait = (ms) => new Promise((r) => setTimeout(r, ms));",
        "async function getNotes() {",
        "  await wait(10);",
        '  return [{ title: "Milk" }, { title: "Bread" }];',
        "}",
        "",
        "async function countNotes() {",
        "  const notes = getNotes();",
        "  return notes.length;",
        "}",
      ],
      tests: [
        ["countNotes()", "2"],
        ["countNotes().then((n) => typeof n)", '"number"'],
      ],
      hint: "`getNotes()` gives back a promise. What turns a promise into its value?",
      solution: [
        "const wait = (ms) => new Promise((r) => setTimeout(r, ms));",
        "async function getNotes() {",
        "  await wait(10);",
        '  return [{ title: "Milk" }, { title: "Bread" }];',
        "}",
        "",
        "async function countNotes() {",
        "  const notes = await getNotes();",
        "  return notes.length;",
        "}",
      ],
    }),
    yourTurn({
      title: "Names run together",
      task: '`fullName({ first: "Ann", last: "Lee" })` should be `"Ann Lee"`. There are two bugs.',
      starter: [
        "function fullName(user) {",
        "  return user.first + user.Last;",
        "}",
      ],
      tests: [
        ['fullName({ first: "Ann", last: "Lee" })', '"Ann Lee"'],
        ['fullName({ first: "Sam", last: "Rai" })', '"Sam Rai"'],
      ],
      hint: "Log the result: `AnnLee`? `Annundefined`? Property names are case-sensitive, and the space has to come from somewhere.",
      solution: [
        "function fullName(user) {",
        '  return user.first + " " + user.last;',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Debugging cheat sheet", [
      [
        "the loop",
        "Reproduce, read, guess, check, fix, confirm.",
        "one change at a time",
      ],
      [
        "labelled logs",
        "Names with values.",
        'console.log("save:", { title })',
      ],
      ["console.table", "Arrays of objects, readable.", "console.table(notes)"],
      [
        "breakpoints",
        "Pause and see everything.",
        "Sources → click a line, or debugger;",
      ],
      ["stepping", "Over, into, out.", "F10, F11, Shift+F11"],
      ["Network tab", "Status, payload, response.", "404? 400? 500?"],
      [
        "halving",
        "Log in the middle; keep the bad half.",
        "is it wrong here yet?",
      ],
      [
        "the cause",
        "Fix why it's wrong, not how it looks.",
        "not ?? to hide undefined",
      ],
    ]),
    quickCheck(
      "A value is wrong at the end of a 40-line function. What's the fastest way to find where it goes wrong?",
      [
        "Read all 40 lines again carefully",
        "Log it at line 20; if it's already wrong, look in lines 1–20, otherwise 21–40, and repeat",
        "Rewrite the function",
      ],
      1,
      "Halving finds the line in a handful of steps, however long the code is.",
    ),
  ),
);
