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
  pagePlayground,
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// The event loop in depth: one thing at a time, the call stack, what the
// browser does meanwhile, the task and microtask queues, a step-through of
// the order, await's place in it, blocking the page, splitting long work,
// where it matters, mistakes, predict-the-order practice and a recap.
export const eventLoopModule = moduleLesson(
  "event-loop",
  "The event loop: how JavaScript waits",
  45,
  [
    "Explain how one-thing-at-a-time JavaScript still handles timers, clicks and network replies.",
    "Describe the call stack, the task queue and the microtask queue.",
    "Predict the order of code with timers, promises and `await`.",
    "Recognise code that blocks the page, and split long work so the page stays responsive.",
  ],

  part(
    "why",
    "One thing at a time",
    explain(
      "JavaScript runs **one** piece of code at a time, on one thread. Yet a page waits for clicks, timers and network replies all at once. The trick is the [[event-loop|event loop]]: the browser does the waiting, and when something is ready, its callback joins a **queue**. Whenever your code finishes, the loop runs the next thing in the queue.",
    ),
    diagram([
      ["call stack", "the code running right now"],
      ["the browser", "timers, network, clicks: waits for you"],
      ["microtask queue", "promise callbacks, and code after await"],
      ["task queue", "timers, events, messages"],
      ["event loop", "stack empty? run what's queued next"],
    ]),
    analogy(
      "A one-person café. The barista makes one order at a time. When the oven or kettle beeps, that job joins a list, and the barista takes the next job once the current order is done.",
    ),
  ),

  part(
    "call-stack",
    "The call stack",
    explain(
      "The **call stack** is the list of functions running right now. Calling a function puts it on top; returning takes it off. JavaScript always works on whatever is at the top. When the stack is **empty**, your code has finished, and only then can anything from a queue run. You've seen the stack in every step-through.",
    ),
    jsPlayground("Watch the stack grow and shrink", [
      "function a() {",
      '  console.log("a starts");',
      "  b();",
      '  console.log("a ends");',
      "}",
      "function b() {",
      '  console.log("b runs: the stack is main → a → b");',
      "}",
      "",
      "a();",
      'console.log("main ends: the stack is empty after this");',
    ]),
  ),

  part(
    "queues",
    "Two queues and the loop",
    explain(
      "When a timer fires or a click happens, its callback goes in the **task queue**. Promise callbacks (`.then`, and the rest of a function after `await`) go in the **microtask queue**, which has priority. The loop's rule: when the stack is empty, run **every** microtask, then **one** task, let the page redraw, and repeat.",
    ),
    reference("What goes where", [
      ["your code", "Runs to the end first.", 'console.log("now")'],
      [
        "microtask",
        "Promise callbacks: all of them, before any task.",
        ".then(fn), code after await, queueMicrotask(fn)",
      ],
      [
        "task",
        "One at a time, after the microtasks.",
        "setTimeout(fn), click handlers, a fetch's network event",
      ],
      ["redraw", "Between tasks, when needed.", "the page shows changes"],
    ]),
    keyPoints(
      "Nothing interrupts running code.",
      "Microtasks (promises) all run before the next task (timer, click).",
      "The page only redraws between tasks.",
    ),
  ),

  part(
    "how-it-runs",
    "Step through the order",
    explain(
      "Here's the classic puzzle: a timer with no delay, a promise that's already resolved, and two logs. Step through and watch the stack and both queues.",
    ),
    trace(
      "Timer, promise and logs, move by move",
      [
        'console.log("1 start");',
        "setTimeout(() => {",
        '  console.log("4 timer");',
        "}, 0);",
        "Promise.resolve().then(() => {",
        '  console.log("3 promise");',
        "});",
        'console.log("2 end");',
      ],
      [
        {
          line: 1,
          note: "Ordinary code runs first, line by line.",
          vars: [
            ["task queue", "(empty)"],
            ["microtask queue", "(empty)"],
          ],
          stack: ["main program"],
          output: "1 start",
        },
        {
          line: 2,
          note: "`setTimeout` asks the browser for a timer. With 0 ms, the callback goes into the task queue almost at once. It does **not** run yet.",
          vars: [
            ["task queue", "timer callback"],
            ["microtask queue", "(empty)"],
          ],
          stack: ["main program"],
        },
        {
          line: 5,
          note: "The promise is already resolved, so its `.then` callback goes into the microtask queue. Not run yet either.",
          vars: [
            ["task queue", "timer callback"],
            ["microtask queue", "then callback"],
          ],
          stack: ["main program"],
        },
        {
          line: 8,
          note: "The last line of ordinary code. After it, the stack is empty.",
          vars: [
            ["task queue", "timer callback"],
            ["microtask queue", "then callback"],
          ],
          stack: ["main program"],
          output: "2 end",
        },
        {
          line: 6,
          note: "Stack empty: the loop runs **every** microtask first. The promise callback runs.",
          vars: [
            ["task queue", "timer callback"],
            ["microtask queue", "(empty)"],
          ],
          stack: ["then callback"],
          output: "3 promise",
        },
        {
          line: 3,
          note: "No microtasks left, so the loop takes one task: the timer. It ran last, even though its delay was 0.",
          vars: [
            ["task queue", "(empty)"],
            ["microtask queue", "(empty)"],
          ],
          stack: ["timer callback"],
          output: "4 timer",
        },
      ],
    ),
  ),

  part(
    "await",
    "Where await fits",
    explain(
      "`await` splits a function in two. Everything up to the `await` runs now. The rest is queued as a **microtask** for when the promise settles, and the caller carries on meanwhile. So code after an `await` always runs after the current code has finished, even if the promise was already resolved.",
    ),
    anatomy(
      "How await splits a function",
      [
        "async function save() {",
        "  showSaving();",
        "  await sendNote();",
        "  showSaved();",
      ],
      [
        ["async", "async", "This function may pause; it returns a promise."],
        [
          "showSaving()",
          "runs now",
          "Part one: runs straight away, like any code.",
        ],
        [
          "await",
          "the split",
          "Pause here; the caller carries on. The page can redraw.",
        ],
        ["sendNote()", "the promise", "Started now; settles later."],
        [
          "showSaved()",
          "runs later",
          "Part two: queued as a microtask when the promise settles.",
        ],
      ],
    ),
    jsPlayground("Guess the order, then run it", [
      "async function save() {",
      '  console.log("B: save starts");',
      "  await null; // already done, but still waits a turn",
      '  console.log("E: save carries on");',
      "}",
      "",
      'console.log("A: start");',
      'setTimeout(() => console.log("F: timer"), 0);',
      "save();",
      'Promise.resolve().then(() => console.log("D: then"));',
      'console.log("C: end of code");',
    ]),
    quickCheck(
      "The playground prints A, B, C, E, D, F. Why does E come before D?",
      [
        "E's line is shorter",
        "Both are microtasks, and save queued its rest (E) before line 10 queued D",
        "await runs faster than then",
      ],
      1,
      "`save()` paused at `await` on line 9 and queued the rest of itself. Line 10 queued D after that. Microtasks run in the order they were queued, and the timer (F) waits for all of them.",
    ),
  ),

  part(
    "blocking",
    "Blocking the page",
    explain(
      "Because nothing interrupts running code, a slow loop freezes the **whole page**: no clicks, no typing, no redraws, not even timers. Click **Freeze for 2 seconds** and watch the clock stop, then jump. Try clicking the other button while it's frozen: the click waits in the task queue.",
    ),
    pagePlayground("A clock, and a loop that freezes it", [
      '<p>Clock: <output id="clock">0.0</output> s</p>',
      '<button id="freeze">Freeze for 2 seconds</button>',
      '<button id="hello">Say hello</button>',
      '<p id="msg" role="status"></p>',
      "<script>",
      '  const clock = document.querySelector("#clock");',
      '  const msg = document.querySelector("#msg");',
      "  const start = Date.now();",
      "  setInterval(() => (clock.textContent = ((Date.now() - start) / 1000).toFixed(1)), 100);",
      '  document.querySelector("#freeze").addEventListener("click", () => {',
      '    msg.textContent = "Freezing…"; // not shown: no redraw until the end',
      "    const until = Date.now() + 2000;",
      "    while (Date.now() < until) {} // busy: nothing else can run",
      '    msg.textContent = "Done freezing";',
      "  });",
      '  document.querySelector("#hello").addEventListener("click", () => {',
      '    msg.textContent = "Hello at " + clock.textContent + " s";',
      "  });",
      "</script>",
    ]),
    keyPoints(
      "Long synchronous work freezes the page.",
      "Changes you make during it only show once it finishes.",
      "Waiting with `await` doesn't block; busy loops do.",
    ),
  ),

  part(
    "splitting-work",
    "Splitting long work",
    explain(
      "If you have a lot to do, do it in **chunks**, and between chunks give the loop a turn with `await new Promise((r) => setTimeout(r, 0))`. That waits for a **task**, so clicks, timers and redraws get in between. (Awaiting an already-resolved promise isn't enough: that's a microtask, and tasks still wait.)",
    ),
    jsPlayground("Chunks let the timer in", [
      "const nextTask = () => new Promise((r) => setTimeout(r, 0));",
      "",
      "async function countTo(total, chunk) {",
      "  let done = 0;",
      "  while (done < total) {",
      "    for (let i = 0; i < chunk; i++) done += 1;",
      '    console.log("did", done);',
      "    await nextTask(); // let other tasks run",
      "  }",
      "}",
      "",
      'setTimeout(() => console.log("a timer got in!"), 0);',
      "countTo(3000, 1000);",
    ]),
  ),

  part(
    "where-used",
    "Where it matters",
    keyPoints(
      "Knowing why `setTimeout(fn, 0)` runs after the current code.",
      "Showing “Saving…” before awaiting the server, so the page can redraw.",
      "Keeping click handlers short, so the page stays responsive.",
      "Debugging code that runs in a surprising order.",
    ),
    inTheNotesApp(
      "`handleSave` sets the saving state, then `await`s `createNote`. At the `await`, the handler steps aside, React redraws the page with the button disabled, and clicks still work. When the reply arrives, the rest of `handleSave` runs as a microtask.",
      { symbolId: "fn:handleSave" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Expecting setTimeout(fn, 0) to run now",
      wrong: [
        "let ready = false;",
        "setTimeout(() => (ready = true), 0);",
        "console.log(ready); // false",
      ],
      problem:
        "The callback waits in the task queue until the current code has finished, so `ready` is still false on the next line.",
      right: [
        "setTimeout(() => {",
        "  ready = true;",
        "  console.log(ready); // true",
        "}, 0);",
      ],
      why: "Put the code that needs the result inside the callback (or await a promise).",
    }),
    mistake({
      title: "A busy loop to wait",
      wrong: [
        "const until = Date.now() + 1000;",
        "while (Date.now() < until) {} // wait a second",
        "showMessage();",
      ],
      problem:
        "It does wait, but it freezes the whole page for that second: no clicks, no redraws.",
      right: [
        "await new Promise((r) => setTimeout(r, 1000));",
        "showMessage();",
      ],
      why: "A timer waits without blocking; the loop keeps the page alive meanwhile.",
    }),
    mistake({
      title: "Thinking a timer's delay is exact",
      wrong: ['setTimeout(tick, 1000); // "exactly 1 second"'],
      problem:
        "The delay is a minimum. If other code is running when the time comes, the callback waits until it finishes.",
      right: ["setTimeout(tick, 1000); // at least 1 second"],
      why: "For a clock, read `Date.now()` each tick instead of counting ticks.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Predict the order",
      task: 'Without running it, make `predict()` return the letters in the order this code logs them: `setTimeout(() => log("A"), 0); Promise.resolve().then(() => log("B")); log("C"); queueMicrotask(() => log("D")); log("E");`',
      starter: [
        "function predict() {",
        '  return ["A", "B", "C", "D", "E"];',
        "}",
      ],
      tests: [
        ["predict()", '["C", "E", "B", "D", "A"]'],
        ["predict().length", "5"],
      ],
      hint: "Ordinary code first (C, E). Then every microtask, in the order queued (B, D). Then the timer (A).",
      solution: [
        "function predict() {",
        '  return ["C", "E", "B", "D", "A"];',
        "}",
      ],
    }),
    yourTurn({
      title: "Give the page a turn",
      task: "Write `nextTask()`: return a promise that resolves on the **next task** (use `setTimeout` with 0), so a timer that's already waiting gets to run first.",
      starter: ["async function nextTask() {", "", "}"],
      tests: [
        [
          '(async () => { const log = []; setTimeout(() => log.push("timer"), 0); await nextTask(); return log; })()',
          '["timer"]',
        ],
        ['nextTask().then(() => "resolved")', '"resolved"'],
      ],
      hint: "`return new Promise((resolve) => setTimeout(resolve, 0));`",
      solution: [
        "function nextTask() {",
        "  return new Promise((resolve) => setTimeout(resolve, 0));",
        "}",
      ],
    }),
    yourTurn({
      title: "Sum in chunks",
      task: "Write `sumInChunks(numbers, size)`: add up the numbers `size` at a time, awaiting `nextTask()` between chunks so other tasks can run. Return the total.",
      starter: [
        "const nextTask = () => new Promise((r) => setTimeout(r, 0));",
        "",
        "async function sumInChunks(numbers, size) {",
        "  return numbers.reduce((a, b) => a + b, 0);",
        "}",
      ],
      tests: [
        ["sumInChunks([1, 2, 3, 4, 5], 2)", "15"],
        [
          '(async () => { const log = []; setTimeout(() => log.push("timer"), 0); await sumInChunks([1, 2, 3, 4], 2); return log; })()',
          '["timer"]',
        ],
        ["sumInChunks([], 3)", "0"],
      ],
      hint: "Loop `for (let i = 0; i < numbers.length; i += size)`, add up `numbers.slice(i, i + size)`, then `await nextTask();`.",
      solution: [
        "const nextTask = () => new Promise((r) => setTimeout(r, 0));",
        "",
        "async function sumInChunks(numbers, size) {",
        "  let total = 0;",
        "  for (let i = 0; i < numbers.length; i += size) {",
        "    for (const n of numbers.slice(i, i + size)) total += n;",
        "    await nextTask();",
        "  }",
        "  return total;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Event loop cheat sheet", [
      [
        "call stack",
        "What's running now; one thing at a time.",
        "main → a() → b()",
      ],
      [
        "microtask queue",
        "Promise callbacks; all run before the next task.",
        ".then(fn), after await",
      ],
      ["task queue", "Timers and events; one per turn.", "setTimeout, click"],
      [
        "order",
        "Your code, then all microtasks, then one task.",
        "sync → promises → timers",
      ],
      [
        "blocking",
        "Long synchronous work freezes the page.",
        "while (…) {} in a handler",
      ],
      [
        "give a turn",
        "Wait for the next task between chunks.",
        "await new Promise((r) => setTimeout(r, 0))",
      ],
    ]),
    quickCheck(
      "A click handler runs a loop that takes three seconds. What does the user see?",
      [
        "The page keeps working; the loop runs in the background",
        "A frozen page for three seconds, then everything catches up",
        "The loop is stopped by the browser at once",
      ],
      1,
      "Nothing interrupts running code: clicks, timers and redraws wait in the queue until the loop finishes.",
    ),
  ),
);
