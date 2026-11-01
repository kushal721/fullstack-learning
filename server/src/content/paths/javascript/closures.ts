import {
  analogy,
  anatomy,
  code,
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

// Scope and closures in depth: why functions remember, scope (global,
// function, block), the scope chain, closure anatomy, a step-through of two
// counters, functions that make functions, private state, loops (let vs
// var), event handlers, values that change later (and React's stale
// closures), where it's used, mistakes, practice and a recap.
export const closuresModule = moduleLesson(
  "closures",
  "Scope and closures: functions that remember",
  45,
  [
    "Say where a variable can be used: global, function and block scope.",
    "Follow the scope chain to find which variable a name refers to.",
    "Explain how a closure keeps variables alive after the outer function has finished.",
    "Use closures for functions that make functions, and for private state.",
    "Avoid the classic closure bugs: `var` in loops and stale values.",
  ],

  part(
    "why",
    "Functions that remember",
    explain(
      "Normally a function's variables disappear when it finishes. But a function made **inside** another function keeps access to the outer variables, even after the outer one has finished. That's a [[closure]]. It's how a click handler remembers which note it's for, and how React hooks remember state.",
    ),
    code(
      "js",
      "a counter that remembers",
      [
        "function makeCounter() {",
        "  let count = 0;",
        "  return () => {",
        "    count += 1;",
        "    return count;",
        "  };",
        "}",
        "",
        "const next = makeCounter();",
        "next(); // 1",
        "next(); // 2: count was remembered",
      ],
      {
        2: "made each time makeCounter runs",
        3: "this inner function uses count",
        9: "makeCounter has finished here",
        11: "yet count is still alive",
      },
    ),
    analogy(
      "A backpack: when a function is made, it packs the variables around it and carries them wherever it goes, even out of the function that made it.",
    ),
  ),

  part(
    "scope",
    "Scope: where a variable lives",
    explain(
      "[[js-scope|Scope]] is where a variable can be used. A variable declared outside every function is **global**: usable everywhere. One declared in a function lives in that **function**. One declared with `let` or `const` inside `{ }` (an `if`, a loop) lives only in that **block**. Outside its scope, the name doesn't exist.",
    ),
    diagram([
      ["global", 'const app = "Notes"; usable everywhere'],
      ["function", "let count inside save(); only in save"],
      ["block", "const note inside if { }; only in that block"],
    ]),
    jsPlayground("Inside and outside", [
      'const app = "Notes"; // global',
      "",
      "function save() {",
      "  const saved = true; // function scope",
      "  if (saved) {",
      '    const message = "Saved!"; // block scope',
      "    console.log(app, saved, message);",
      "  }",
      "  console.log(typeof message); // gone: outside its block",
      "}",
      "save();",
      "",
      "try {",
      "  console.log(saved);",
      "} catch (error) {",
      "  console.log(error.name, error.message);",
      "}",
    ]),
  ),

  part(
    "scope-chain",
    "The scope chain",
    explain(
      "When code uses a name, JavaScript looks in the **current** scope first, then the one around it, then the one around that, out to global. That's the **scope chain**. Inner code can see outer variables, never the other way round. If an inner scope has a variable with the same name, it **shadows** the outer one.",
    ),
    code(
      "js",
      "looking outwards",
      [
        'const label = "global";',
        "",
        "function outer() {",
        '  const label = "outer";',
        "  function inner() {",
        "    console.log(label);",
        "  }",
        "  inner();",
        "}",
        "outer(); // outer",
      ],
      {
        4: "shadows the global label inside outer",
        6: "not in inner, so look in outer: found",
        10: "the nearest label wins",
      },
    ),
    quickCheck(
      "If line 4 were deleted, what would `outer()` print?",
      ["outer", "global", "A ReferenceError"],
      1,
      "`inner` has no `label`, nor does `outer` any more, so the search continues out to the global one.",
    ),
  ),

  part(
    "anatomy",
    "Anatomy of a closure",
    explain(
      "Every closure has the same three pieces: an **outer** function, a **variable** in it, and an **inner** function that uses that variable and is handed out (returned, or passed to something like `addEventListener`).",
    ),
    anatomy(
      "A closure",
      [
        "function makeCounter() {",
        "  let count = 0;",
        "  return () => (count += 1);",
        "}",
      ],
      [
        [
          "makeCounter",
          "outer function",
          "Each call makes a fresh set of its variables.",
        ],
        [
          "let count = 0",
          "remembered variable",
          "Lives on as long as something still uses it.",
        ],
        [
          "return",
          "handed out",
          "The inner function leaves, carrying `count` with it.",
        ],
        [
          "() => (count += 1)",
          "inner function",
          "Uses `count` from the outer scope: that makes it a closure.",
        ],
      ],
    ),
    keyPoints(
      "The inner function remembers the variable itself, not a copy of its value.",
      "Each call of the outer function makes new variables.",
      "Nothing outside can reach `count` except through the inner function.",
    ),
  ),

  part(
    "how-it-runs",
    "Two counters, step by step",
    explain(
      "Watch what each call to `makeCounter` creates. Each one makes its **own** `count`, and the function it returns remembers that one. So `a` and `b` count separately.",
    ),
    trace(
      "Two counters, move by move",
      [
        "function makeCounter() {",
        "  let count = 0;",
        "  return () => {",
        "    count += 1;",
        "    return count;",
        "  };",
        "}",
        "const a = makeCounter();",
        "const b = makeCounter();",
        "console.log(a(), a());",
        "console.log(b());",
      ],
      [
        {
          line: 2,
          note: "Line 8 calls `makeCounter`. It makes a new `count`, set to 0.",
          vars: [["count (1st)", "0"]],
          stack: ["main program", "makeCounter()"],
        },
        {
          line: 8,
          note: "It returns the inner function and finishes. Its `count` isn't thrown away: `a` still uses it.",
          vars: [
            ["a", "ƒ, remembers count (1st)"],
            ["count (1st)", "0"],
          ],
          stack: ["main program"],
        },
        {
          line: 9,
          note: "A second call makes a **second**, separate `count`. `b` remembers that one.",
          vars: [
            ["a", "ƒ, remembers count (1st)"],
            ["b", "ƒ, remembers count (2nd)"],
            ["count (1st)", "0"],
            ["count (2nd)", "0"],
          ],
          stack: ["main program"],
        },
        {
          line: 4,
          note: "`a()` runs the inner function. `count` isn't in it, so the scope chain finds `a`'s remembered `count` and adds 1.",
          vars: [
            ["count (1st)", "1"],
            ["count (2nd)", "0"],
          ],
          stack: ["main program", "a()"],
        },
        {
          line: 4,
          note: "The second `a()` uses the same `count`: now 2.",
          vars: [
            ["count (1st)", "2"],
            ["count (2nd)", "0"],
          ],
          stack: ["main program", "a()"],
        },
        {
          line: 10,
          note: "Both calls returned their count.",
          vars: [
            ["count (1st)", "2"],
            ["count (2nd)", "0"],
          ],
          stack: ["main program"],
          output: "1 2",
        },
        {
          line: 11,
          note: "`b()` uses its own `count`, which nobody had touched.",
          vars: [
            ["count (1st)", "2"],
            ["count (2nd)", "1"],
          ],
          stack: ["main program"],
          output: "1",
        },
      ],
    ),
    quickCheck(
      "What would `console.log(a())` print next?",
      ["1", "3", "2"],
      1,
      "`a`'s `count` is 2, and it's still remembered, so the next call makes it 3.",
    ),
  ),

  part(
    "making-functions",
    "Functions that make functions",
    explain(
      'Closures let you make a function now, with some settings, and use it later. `makeGreeter("Hello")` gives back a function that remembers `"Hello"`. This is called a **factory**. You\'ll see it for formatters, validators and event handlers that need to know something.',
    ),
    jsPlayground("Factories", [
      "function makeGreeter(greeting) {",
      "  return (name) => `${greeting}, ${name}!`;",
      "}",
      'const hello = makeGreeter("Hello");',
      'const namaste = makeGreeter("Namaste");',
      'console.log(hello("Ann"), namaste("Sita"));',
      "",
      "function makeMaxLength(max) {",
      "  return (text) => text.length <= max;",
      "}",
      "const fitsTitle = makeMaxLength(10);",
      'console.log(fitsTitle("Milk"), fitsTitle("A very long title"));',
      "",
      "const prices = [4, 12, 7];",
      "const over = (limit) => (price) => price > limit;",
      "console.log(prices.filter(over(5)));",
    ]),
  ),

  part(
    "private-state",
    "Private state",
    explain(
      "Variables in a closure can't be reached from outside, only through the functions you hand out. That makes them **private**: other code can't change them by accident or skip your checks. Here, the only way to add a note is `add`, which refuses an empty title.",
    ),
    jsPlayground("Only through the functions you give out", [
      "function makeNoteStore() {",
      "  const notes = [];",
      "  return {",
      "    add(title) {",
      '      if (!title) return "refused: no title";',
      "      notes.push(title);",
      '      return "added";',
      "    },",
      "    list: () => [...notes],",
      "  };",
      "}",
      "",
      "const store = makeNoteStore();",
      'console.log(store.add("Milk"), store.add(""));',
      "console.log(store.list());",
      "console.log(store.notes); // undefined: not reachable",
    ]),
    keyPoints(
      "Private variables live in the closure, not on the object.",
      "Hand out functions that check before changing anything.",
      "Return a copy (`[...notes]`), so callers can't change the original.",
    ),
  ),

  part(
    "loops",
    "Closures in loops: let and var",
    explain(
      "`let` in a `for` loop makes a **new** variable for every time round, so each closure remembers its own. The older `var` makes **one** variable for the whole function, so every closure shares it and sees its final value. This bug was so common that it's a big reason `let` exists. Use `let` or `const`.",
    ),
    jsPlayground("Three timers, two ways", [
      "for (let i = 1; i <= 3; i++) {",
      '  setTimeout(() => console.log("let:", i), 100);',
      "}",
      "",
      "for (var j = 1; j <= 3; j++) {",
      '  setTimeout(() => console.log("var:", j), 200);',
      "}",
    ]),
    quickCheck(
      "Why does the `var` loop print 4 three times?",
      [
        "setTimeout adds 1",
        "All three closures share one `j`, which is 4 when the loop ends",
        "var can't count",
      ],
      1,
      "The timers run after the loop has finished. With `var` there's only one `j`, and the loop left it at 4.",
    ),
  ),

  part(
    "event-handlers",
    "Closures in event handlers",
    explain(
      "Every listener you write is a closure. When buttons are made in a loop, each listener remembers the `note` from its own time round the loop, so a click knows which note it's for, without any lookup. Click a button:",
    ),
    pagePlayground("Each button remembers its note", [
      '<ul id="list"></ul>',
      '<p id="out" role="status"></p>',
      "<script>",
      "  const notes = [",
      '    { id: 1, title: "Milk" },',
      '    { id: 2, title: "Bread" },',
      '    { id: 3, title: "Eggs" },',
      "  ];",
      '  const out = document.querySelector("#out");',
      "  for (const note of notes) {",
      '    const li = document.createElement("li");',
      '    const button = document.createElement("button");',
      '    button.textContent = "Open " + note.title;',
      '    button.addEventListener("click", () => {',
      '      out.textContent = "You opened note " + note.id + ": " + note.title;',
      "    });",
      "    li.append(button);",
      '    document.querySelector("#list").append(li);',
      "  }",
      "</script>",
    ]),
  ),

  part(
    "changing-values",
    "Remembered variables, not values",
    explain(
      "A closure remembers the **variable**, so it sees the value it has when it **runs**, not when it was made. Usually that's what you want. But it surprises people in React, where every render makes **new** variables: a timer started in an old render still sees that render's variables. That's a **stale closure**, which you'll meet in the React topic.",
    ),
    jsPlayground("It reads the variable when it runs", [
      'let status = "draft";',
      'const report = () => console.log("Status:", status);',
      "",
      "report();",
      'status = "saved";',
      "report(); // the closure sees the change",
      "",
      "// A snapshot: copy the value now, into a new variable",
      "function remember(value) {",
      '  return () => console.log("Remembered:", value);',
      "}",
      "const before = remember(status);",
      'status = "deleted";',
      "before();",
      "report();",
    ]),
  ),

  part(
    "where-used",
    "Where you'll use closures",
    keyPoints(
      "Event listeners that use variables from around them.",
      "Callbacks for `map`, `filter` and timers that use outer values.",
      "Factories like `makeGreeter`, and modules keeping private state.",
      "React: every handler and effect inside a component is a closure.",
    ),
    inTheNotesApp(
      "In `useNotes`, the effect declares `let ignore = false`. The `.then`, `.catch` and `.finally` callbacks, and the clean-up function, are all closures over that one `ignore`. When the page goes away, the clean-up sets it to `true`, and a late reply is quietly ignored.",
      { symbolId: "hook:useNotes" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "var in a loop with callbacks",
      wrong: [
        "for (var i = 0; i < buttons.length; i++) {",
        "  buttons[i].onclick = () => show(i);",
        "}",
      ],
      problem:
        "Every handler shares one `i`, which ends at `buttons.length`, so every button shows the same (missing) item.",
      right: [
        "for (let i = 0; i < buttons.length; i++) {",
        "  buttons[i].onclick = () => show(i);",
        "}",
      ],
      why: "`let` makes a new `i` each time round, and each handler remembers its own.",
    }),
    mistake({
      title: "Making a new counter every call",
      wrong: ["makeCounter()(); // 1", "makeCounter()(); // 1 again"],
      problem:
        "Each `makeCounter()` makes a new `count`, so the count starts over every time.",
      right: ["const next = makeCounter();", "next(); // 1", "next(); // 2"],
      why: "Make the closure once, keep it in a variable, then call that.",
    }),
    mistake({
      title: "Expecting a snapshot",
      wrong: [
        "let total = 0;",
        "const log = () => console.log(total);",
        "total = 10;",
        "log(); // 10, not 0",
      ],
      problem:
        "The closure reads `total` when it runs, so it shows the latest value, not the one when it was made.",
      right: [
        "let total = 0;",
        "const saved = total;",
        "const log = () => console.log(saved);",
        "total = 10;",
        "log(); // 0",
      ],
      why: "To keep a value from now, copy it into a variable that won't change.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Count by steps",
      task: "Write `makeCounter(step)`: it returns a function that adds `step` to its own count each call and returns the new count (starting from 0).",
      starter: ["function makeCounter(step) {", "", "}"],
      tests: [
        ["((next) => [next(), next(), next()])(makeCounter(1))", "[1, 2, 3]"],
        ["((next) => [next(), next()])(makeCounter(5))", "[5, 10]"],
        [
          "((a, b) => [a(), a(), b()])(makeCounter(1), makeCounter(1))",
          "[1, 2, 1]",
        ],
      ],
      hint: "`let count = 0;` then `return () => { count += step; return count; };`",
      solution: [
        "function makeCounter(step) {",
        "  let count = 0;",
        "  return () => {",
        "    count += step;",
        "    return count;",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Note ids",
      task: 'Write `makeIdMaker(prefix)`: each call of the function it returns gives the next id, like `"note-1"`, `"note-2"`. Each id maker counts on its own.',
      starter: ["function makeIdMaker(prefix) {", "", "}"],
      tests: [
        [
          '((next) => [next(), next()])(makeIdMaker("note"))',
          '["note-1", "note-2"]',
        ],
        [
          '((a, b) => [a(), b(), a()])(makeIdMaker("note"), makeIdMaker("tag"))',
          '["note-1", "tag-1", "note-2"]',
        ],
      ],
      hint: "Keep a `let n = 0;` in the outer function; the inner one does `n += 1` and returns `` `${prefix}-${n}` ``.",
      solution: [
        "function makeIdMaker(prefix) {",
        "  let n = 0;",
        "  return () => {",
        "    n += 1;",
        "    return `${prefix}-${n}`;",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "Only once",
      task: "Write `once(fn)`: it returns a function that calls `fn` the first time only. Every later call gives back the first result, without calling `fn` again.",
      starter: ["function once(fn) {", "  return fn;", "}"],
      tests: [
        ['((f) => [f(), f()])(once(() => "hi"))', '["hi", "hi"]'],
        [
          "((calls) => { const f = once(() => ++calls); f(); f(); f(); return f(); })(0)",
          "1",
        ],
      ],
      hint: "Remember two things in the closure: `let called = false;` and `let result;`.",
      solution: [
        "function once(fn) {",
        "  let called = false;",
        "  let result;",
        "  return () => {",
        "    if (!called) {",
        "      called = true;",
        "      result = fn();",
        "    }",
        "    return result;",
        "  };",
        "}",
      ],
    }),
    yourTurn({
      title: "A private balance",
      task: "Write `makeWallet()`: return an object with `add(amount)`, which ignores amounts of 0 or less, and `balance()`, which returns the total. Keep the total private.",
      starter: [
        "function makeWallet() {",
        "  return {",
        "    total: 0,",
        "    add(amount) {",
        "      this.total += amount;",
        "    },",
        "    balance() {",
        "      return this.total;",
        "    },",
        "  };",
        "}",
      ],
      tests: [
        ["((w) => (w.add(5), w.add(3), w.balance()))(makeWallet())", "8"],
        ["((w) => (w.add(5), w.add(-20), w.balance()))(makeWallet())", "5"],
        ["makeWallet().total", "undefined"],
      ],
      hint: "Move the total into a `let total = 0;` before the `return`, and use it in both functions.",
      solution: [
        "function makeWallet() {",
        "  let total = 0;",
        "  return {",
        "    add(amount) {",
        "      if (amount > 0) total += amount;",
        "    },",
        "    balance: () => total,",
        "  };",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Scope and closures cheat sheet", [
      [
        "global scope",
        "Declared outside every function.",
        'const app = "Notes";',
      ],
      [
        "function scope",
        "Declared in a function; only there.",
        "function f() { let x; }",
      ],
      [
        "block scope",
        "let / const inside { }; only there.",
        "if (ok) { const m = 1; }",
      ],
      [
        "scope chain",
        "Look in this scope, then outwards.",
        "inner sees outer, not the reverse",
      ],
      [
        "closure",
        "An inner function that remembers outer variables.",
        "return () => (count += 1);",
      ],
      [
        "factory",
        "A function that makes configured functions.",
        'const hello = makeGreeter("Hello");',
      ],
      [
        "private state",
        "Reachable only through returned functions.",
        "{ add(), list() }",
      ],
      ["let in loops", "A new variable each time round.", "for (let i = 0; …)"],
    ]),
    quickCheck(
      "Which is true of closures?",
      [
        "They copy the outer variables' values when they're made",
        "They keep the outer variables alive and read them when they run",
        "They only work with arrow functions",
      ],
      1,
      "A closure keeps the variables themselves, and reads their current values each time it runs. Any kind of function can be one.",
    ),
  ),
);
