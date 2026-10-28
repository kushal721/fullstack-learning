import {
  analogy,
  anatomy,
  code,
  explain,
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

// Loops in depth: why repeat, the for loop's parts, how it runs, looping
// over lists with for...of, while, building a result as you go, break and
// continue, loops inside loops, infinite loops, loops versus array methods,
// mistakes, practice and a recap.
export const loopsModule = moduleLesson(
  "loops",
  "Loops: repeating work",
  40,
  [
    "Explain why loops exist and name the three parts of a `for` loop.",
    "Follow a loop, round by round, and predict what it prints.",
    "Loop over every item in a list with `for…of`, and use `while`.",
    "Build a result as you go: a total, a count or a new list.",
    "Stop early with `break`, skip with `continue`, and avoid endless loops.",
  ],

  part(
    "why",
    "Why loops?",
    explain(
      "Say you want to print the numbers 1 to 100, or check every note for a word, or add up a basket of prices. Writing the same line 100 times is slow and breaks as soon as the list changes. A [[js-loop|loop]] runs the same block of code **again and again**, each time with a different value, until it's done.",
    ),
    code("js", "without a loop", [
      "console.log(1);",
      "console.log(2);",
      "console.log(3);",
      "// …and 97 more lines",
    ]),
    jsPlayground("With a loop: three lines for any amount", [
      "for (let i = 1; i <= 5; i++) {",
      "  console.log(i);",
      "}",
      "",
      "// Change 5 to 100 and run it again.",
    ]),
    analogy(
      "Laps of a running track: you keep going round, ticking off each lap, and stop when you reach the number you set.",
    ),
  ),

  part(
    "anatomy",
    "The parts of a for loop",
    anatomy(
      "A for loop",
      ["for (let i = 0; i < 3; i++) {", "  console.log(i);", "}"],
      [
        ["for", "keyword", "Starts a loop that counts."],
        [
          "let i = 0",
          "start",
          "Runs once, before the first round: a counter starting at 0.",
        ],
        [
          "i < 3",
          "condition",
          "Checked before every round. While it's true, the loop goes on.",
        ],
        ["i++", "step", "Runs after every round: add one to the counter."],
        [
          "console.log(i)",
          "body",
          "The code repeated each round. It can use the counter.",
        ],
        ["}", "end of body", "Back to the condition for the next round."],
      ],
    ),
    keyPoints(
      "Start: runs once.",
      "Condition: checked before each round; false means stop.",
      "Step: runs after each round.",
      "`i` is the usual name for a counter (short for index).",
    ),
  ),

  part(
    "how-it-runs",
    "How a loop runs, round by round",
    explain(
      "The order is always the same: start, then **check → body → step**, again and again, until the check is false. Press Next to follow every move.",
    ),
    trace(
      "Counting to 3",
      [
        "let total = 0;",
        "for (let i = 1; i <= 3; i++) {",
        "  total = total + i;",
        "}",
        "console.log(total);",
      ],
      [
        { line: 1, note: "`total` starts at 0.", vars: [["total", "0"]] },
        {
          line: 2,
          note: "Start: `i` is 1. Check: is `1 <= 3`? Yes, so round 1 begins.",
          vars: [
            ["total", "0"],
            ["i", "1"],
          ],
        },
        {
          line: 3,
          note: "Body: `total` becomes `0 + 1`, which is 1.",
          vars: [
            ["total", "1"],
            ["i", "1"],
          ],
        },
        {
          line: 2,
          note: "Step: `i++` makes `i` 2. Check: is `2 <= 3`? Yes, round 2.",
          vars: [
            ["total", "1"],
            ["i", "2"],
          ],
        },
        {
          line: 3,
          note: "Body: `total` becomes `1 + 2`, which is 3.",
          vars: [
            ["total", "3"],
            ["i", "2"],
          ],
        },
        {
          line: 2,
          note: "Step: `i` is 3. Check: is `3 <= 3`? Yes, round 3.",
          vars: [
            ["total", "3"],
            ["i", "3"],
          ],
        },
        {
          line: 3,
          note: "Body: `total` becomes `3 + 3`, which is 6.",
          vars: [
            ["total", "6"],
            ["i", "3"],
          ],
        },
        {
          line: 2,
          note: "Step: `i` is 4. Check: is `4 <= 3`? **No**, so the loop ends. `i` only existed inside the loop.",
          vars: [["total", "6"]],
        },
        {
          line: 5,
          note: "The program carries on after the loop.",
          vars: [["total", "6"]],
          output: "6",
        },
      ],
    ),
    quickCheck(
      "How many times does the body of `for (let i = 0; i < 4; i++)` run?",
      ["3", "4: for i = 0, 1, 2 and 3", "5"],
      1,
      "Starting at 0 and stopping before 4 gives exactly 4 rounds. That's why loops over lists start at 0 and use `<`.",
    ),
  ),

  part(
    "for-of",
    "Every item in a list: for…of",
    explain(
      "Most of the time you loop over a list (an **array**). `for…of` hands you each item in turn, with no counter to manage, so there's nothing to get wrong. Read it as *for each note of notes*.",
    ),
    anatomy(
      "A for…of loop",
      ["for (const note of notes) {", "  console.log(note);", "}"],
      [
        ["for", "keyword", "Starts the loop."],
        [
          "const note",
          "each item",
          "A new variable that holds the current item, one per round.",
        ],
        ["of", "of", "Says which list to go through."],
        ["notes", "the list", "The array to loop over."],
        ["console.log(note)", "body", "Runs once for every item."],
      ],
    ),
    jsPlayground("Loop over a list", [
      'const notes = ["Buy milk", "Call Sam", "Book dentist"];',
      "",
      "for (const note of notes) {",
      '  console.log("-", note);',
      "}",
      "",
      "// Strings work too: one character at a time.",
      'for (const letter of "Hi!") {',
      "  console.log(letter);",
      "}",
    ]),
    reference("Which loop?", [
      [
        "for…of",
        "Every item of a list. The usual choice.",
        "for (const n of notes)",
      ],
      [
        "for",
        "Counting, or when you need the position.",
        "for (let i = 0; i < 5; i++)",
      ],
      [
        "while",
        "Repeat until something changes; count unknown.",
        "while (!done)",
      ],
    ]),
  ),

  part(
    "while",
    "Repeat while: the while loop",
    explain(
      "A `while` loop only has a condition: it repeats its body as long as the condition is true. Use it when you don't know in advance how many rounds you need, like halving a number until it's small, or retrying until something works. Something inside the body **must** change the condition, or it never stops.",
    ),
    code(
      "js",
      "halve until it's below 1",
      [
        "let size = 100;",
        "let steps = 0;",
        "while (size >= 1) {",
        "  size = size / 2;",
        "  steps++;",
        "}",
        "console.log(steps); // 7",
      ],
      {
        3: "checked before every round",
        4: "the body changes size, so the loop can end",
      },
    ),
    jsPlayground("Try different starting sizes", [
      "let size = 100;",
      "let steps = 0;",
      "",
      "while (size >= 1) {",
      "  size = size / 2;",
      "  steps++;",
      "}",
      "",
      'console.log("Halved", steps, "times");',
    ]),
    quickCheck(
      "When does `while (count > 0) { … }` stop?",
      [
        "After one round",
        "When `count > 0` becomes false, so the body must lower `count`",
        "Never",
      ],
      1,
      "A while loop checks before each round, and stops at the first false.",
    ),
  ),

  part(
    "building-results",
    "Building a result as you go",
    explain(
      "Most loops build something: a total, a count, or a new list. The pattern is always the same: **make an empty result before the loop, add to it inside, use it after**.",
    ),
    reference("Three results you'll build all the time", [
      ["a total", "Start at 0; add each item.", "let sum = 0; … sum += price;"],
      [
        "a count",
        "Start at 0; add one when it matches.",
        "let n = 0; … if (done) n++;",
      ],
      [
        "a new list",
        "Start empty; push what you keep.",
        "const out = []; … out.push(x);",
      ],
    ]),
    jsPlayground("Total, count and new list", [
      "const prices = [4, 12, 7, 30];",
      "",
      "let total = 0;",
      "let cheap = 0;",
      "const doubled = [];",
      "",
      "for (const price of prices) {",
      "  total += price;",
      "  if (price < 10) cheap++;",
      "  doubled.push(price * 2);",
      "}",
      "",
      "console.log(total, cheap, doubled);",
    ]),
    keyPoints(
      "Make the result before the loop, not inside it.",
      "Use `let` for totals and counts: they change each round.",
      "A list can be `const`: you add to it, but it's the same list.",
    ),
  ),

  part(
    "break-continue",
    "Stopping early and skipping",
    reference("Changing a loop's flow", [
      ["break", "Leave the loop now; carry on after it.", "if (found) break;"],
      [
        "continue",
        "Skip the rest of this round; go to the next.",
        "if (!n) continue;",
      ],
    ]),
    jsPlayground("Find the first match, skip the blanks", [
      'const names = ["Ann", "", "Bob", "Cal", "Bea"];',
      "",
      "for (const name of names) {",
      '  if (name === "") continue; // skip blanks',
      '  console.log("Checking", name);',
      '  if (name.startsWith("B")) {',
      '    console.log("Found:", name);',
      "    break; // stop looking",
      "  }",
      "}",
    ]),
    quickCheck(
      "In the code above, is Cal ever checked?",
      [
        "Yes, every name is checked",
        "No: Bob starts with B, so `break` ends the loop first",
        "Only if Ann is blank",
      ],
      1,
      "`break` stops the whole loop at the first match, so later names are never reached.",
    ),
  ),

  part(
    "nested",
    "Loops inside loops",
    explain(
      "A loop's body can contain another loop. For **every** round of the outer loop, the inner loop runs all the way through. It's how you make grids and tables, or compare every item with every other one.",
    ),
    jsPlayground("A times table", [
      "for (let row = 1; row <= 3; row++) {",
      '  let line = "";',
      "  for (let col = 1; col <= 3; col++) {",
      "    line += `${row * col}\\t`;",
      "  }",
      "  console.log(line);",
      "}",
    ]),
    keyPoints(
      "The inner loop restarts for every round of the outer one.",
      "3 rounds × 3 rounds = 9 runs of the inner body.",
      "Use different counter names: `row` and `col`, or `i` and `j`.",
    ),
  ),

  part(
    "loops-and-methods",
    "Loops and array methods",
    explain(
      "Arrays also have methods that loop for you: `forEach`, `map`, `filter`, `find`. You'll learn them properly in the Arrays step. They're the same idea in fewer lines, and the Notes App uses them everywhere. Here's one job written both ways:",
    ),
    code(
      "js",
      "the titles of the finished notes, two ways",
      [
        "const done = [];",
        "for (const note of notes) {",
        "  if (note.done) done.push(note.title);",
        "}",
        "",
        "const done2 = notes",
        "  .filter((note) => note.done)",
        "  .map((note) => note.title);",
      ],
      {
        2: "a loop: you write every step",
        6: "array methods: say what you want",
      },
    ),
    keyPoints(
      "Loops: any repetition, and easy to stop early.",
      "Array methods: shorter for the common list jobs.",
      "Learn loops first: array methods are loops underneath.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "One round too many",
      wrong: [
        'const items = ["a", "b", "c"];',
        "for (let i = 0; i <= items.length; i++) {",
        "  console.log(items[i]);",
        "}",
      ],
      problem:
        "It prints a, b, c and then `undefined`. With `<=`, `i` reaches 3, but the last position is 2. This is an **off-by-one** error.",
      right: [
        'const items = ["a", "b", "c"];',
        "for (let i = 0; i < items.length; i++) {",
        "  console.log(items[i]);",
        "}",
      ],
      why: "Positions go from 0 to `length - 1`, so use `<`. Or use `for…of` and skip the counter.",
    }),
    mistake({
      title: "A loop that never ends",
      wrong: [
        "let count = 3;",
        "while (count > 0) {",
        "  console.log(count);",
        "}",
      ],
      problem:
        "Nothing changes `count`, so `count > 0` is always true and the page freezes. (The playground stops it after a few seconds.)",
      right: [
        "let count = 3;",
        "while (count > 0) {",
        "  console.log(count);",
        "  count--;",
        "}",
      ],
      why: "Every while loop needs something in its body that moves it towards stopping.",
    }),
    mistake({
      title: "Resetting the result inside the loop",
      wrong: [
        "for (const price of [4, 6]) {",
        "  let total = 0;",
        "  total += price;",
        "}",
      ],
      problem:
        "`total` is made again, at 0, every round, and it's gone after the loop. The sum is lost.",
      right: [
        "let total = 0;",
        "for (const price of [4, 6]) {",
        "  total += price;",
        "}",
        "console.log(total); // 10",
      ],
      why: "Make the result once, before the loop.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Add them up",
      task: "Write `sum(numbers)` to return the total of every number in the list. `sum([1, 2, 3])` is `6`, and an empty list gives `0`.",
      starter: ["function sum(numbers) {", "", "}"],
      tests: [
        ["sum([1, 2, 3])", "6"],
        ["sum([10, -4])", "6"],
        ["sum([])", "0"],
      ],
      hint: "Start `let total = 0;`, add each number in a `for…of` loop, then `return total;` after the loop.",
      solution: [
        "function sum(numbers) {",
        "  let total = 0;",
        "  for (const n of numbers) {",
        "    total += n;",
        "  }",
        "  return total;",
        "}",
      ],
    }),
    yourTurn({
      title: "Count the long words",
      task: "Write `countLong(words)` to return how many words have more than 4 letters.",
      starter: ["function countLong(words) {", "", "}"],
      tests: [
        ['countLong(["hi", "hello", "planet"])', "2"],
        ['countLong(["a", "bb"])', "0"],
      ],
      hint: "Start a count at 0, and add one inside an `if (word.length > 4)`.",
      solution: [
        "function countLong(words) {",
        "  let count = 0;",
        "  for (const word of words) {",
        "    if (word.length > 4) count++;",
        "  }",
        "  return count;",
        "}",
      ],
    }),
    yourTurn({
      title: "Count down",
      task: 'Write `countdown(n)` to return a list from `n` down to 1, then `"Go!"`: `countdown(3)` is `[3, 2, 1, "Go!"]`.',
      starter: [
        "function countdown(n) {",
        "  const out = [];",
        "",
        "  return out;",
        "}",
      ],
      tests: [
        ["countdown(3)", '[3, 2, 1, "Go!"]'],
        ["countdown(1)", '[1, "Go!"]'],
      ],
      hint: 'A `for` loop can count down: `for (let i = n; i >= 1; i--)`. Push each `i`, then push `"Go!"` after the loop.',
      solution: [
        "function countdown(n) {",
        "  const out = [];",
        "  for (let i = n; i >= 1; i--) {",
        "    out.push(i);",
        "  }",
        '  out.push("Go!");',
        "  return out;",
        "}",
      ],
    }),
    yourTurn({
      title: "Find the first",
      task: 'Write `firstLong(words)` to return the first word longer than 5 letters, or `"none"` if there isn\'t one. Stop as soon as you find it.',
      starter: ["function firstLong(words) {", "", "}"],
      tests: [
        ['firstLong(["cat", "elephant", "giraffe"])', '"elephant"'],
        ['firstLong(["a", "b"])', '"none"'],
      ],
      hint: 'Inside the loop, `return word;` as soon as one is long enough: `return` stops the loop and the function. After the loop, `return "none";`.',
      solution: [
        "function firstLong(words) {",
        "  for (const word of words) {",
        "    if (word.length > 5) return word;",
        "  }",
        '  return "none";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Loops cheat sheet", [
      ["for", "Count: start; condition; step.", "for (let i = 0; i < n; i++)"],
      ["for…of", "Each item of a list or string.", "for (const x of list)"],
      [
        "while",
        "Repeat while true; change something inside.",
        "while (n > 0) { n--; }",
      ],
      ["break", "Leave the loop.", "if (found) break;"],
      ["continue", "Skip to the next round.", "if (!x) continue;"],
      [
        "build a result",
        "Empty before, add inside, use after.",
        "let sum = 0; … sum += x;",
      ],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "`for (let i = 0; i <= list.length; i++)` visits every item exactly once",
        "A for loop checks its condition before every round, including the first",
        "`continue` ends the whole loop",
      ],
      1,
      "`<=` goes one past the end, and `continue` only skips the current round; `break` ends the loop.",
    ),
  ),
);
