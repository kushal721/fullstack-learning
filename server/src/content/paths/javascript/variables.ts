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
  part,
  quickCheck,
  reference,
  trace,
  yourTurn,
} from "../blocks.js";

// Variables and values in depth: why names for values, the parts of a
// declaration, the types, const and let, how a changing value runs, using
// values together, empty values, naming, where they're used, mistakes,
// practice and a recap.
export const variablesModule = moduleLesson(
  "variables",
  "Variables and values",
  35,
  [
    'Explain what a variable is and name the parts of `const title = "Milk";`.',
    "Tell the main types apart (string, number, boolean, null, undefined) with `typeof`.",
    "Choose `const` or `let`, and change a `let` variable's value.",
    "Follow, line by line, how a variable's value changes as code runs.",
    "Name variables clearly and avoid the common mistakes.",
  ],

  part(
    "why",
    "Why variables?",
    explain(
      "A program works with values: a note's title, a price, whether a box is ticked. To use a value more than once, or to change it later, you give it a name. A [[js-variable|variable]] is that name. Write the name, and JavaScript uses the value stored under it.",
    ),
    diagram([
      ["a value", '"Buy milk"'],
      ["stored under a name", "title"],
      ["used by name", "console.log(title)"],
    ]),
    jsPlayground("Name a value once, use it many times", [
      'const title = "Buy milk";',
      "",
      "console.log(title);",
      'console.log("Your note:", title);',
      'console.log(title.length, "characters");',
      "",
      "// Change the text in the first line, then press Run.",
      "// Every line below uses the new value.",
    ]),
    keyPoints(
      "A variable is a name for a value.",
      "Write the name to use the value.",
      "Change the value in one place, and every use follows.",
    ),
  ),

  part(
    "anatomy",
    "The parts of a variable",
    anatomy(
      "Declaring a variable",
      ['const title = "Buy milk";'],
      [
        [
          "const",
          "keyword",
          "Says you're making a new variable. `const` means it will always point at this value.",
        ],
        [
          "title",
          "name",
          "What you'll call it later. Pick a name that says what the value is.",
        ],
        [
          "=",
          "assignment",
          "Means *store*, not *is equal to*: put the value on the right under the name on the left.",
        ],
        [
          '"Buy milk"',
          "value",
          "The value being stored: here a piece of text, called a string.",
        ],
        [";", "end", "Ends the statement, like a full stop."],
      ],
    ),
    analogy(
      "A labelled jar: the label is the name, what's inside is the value. You find things by reading labels, not by guessing what's in each jar.",
    ),
    quickCheck(
      "In `let score = 10;`, what does the `=` do?",
      [
        "Checks whether `score` equals 10",
        "Stores 10 under the name `score`",
        "Adds 10 to `score`",
      ],
      1,
      "A single `=` stores a value. Checking whether two values are the same uses `===`.",
    ),
  ),

  part(
    "types",
    "Values and their types",
    explain(
      "Every value has a [[js-value|type]], and the type decides what you can do with it: add [[js-number|numbers]], join [[js-string|strings]], look inside [[js-object-array|objects]]. `typeof` tells you a value's type.",
    ),
    reference("The types you'll meet first", [
      ["string", "Text, in quotes or backticks.", '"Buy milk", `Hi ${name}`'],
      ["number", "Whole or decimal numbers.", "42, 3.14, -7"],
      ["boolean", "Yes or no.", "true, false"],
      ["undefined", "No value given yet.", "let x; // undefined"],
      ["null", "Deliberately nothing.", "let user = null;"],
      ["array", "An ordered list.", '["milk", "bread"]'],
      ["object", "Named values together.", '{ title: "Milk", done: false }'],
    ]),
    jsPlayground("Ask each value its type", [
      'console.log(typeof "hi");',
      "console.log(typeof 42);",
      "console.log(typeof true);",
      "console.log(typeof undefined);",
      'console.log(typeof { title: "Milk" });',
      'console.log(typeof ["milk"]); // arrays are objects too',
      'console.log(typeof "42", typeof 42);',
    ]),
    quickCheck(
      'What is `typeof "42"`?',
      ['`"number"`', '`"string"`: it has quotes, so it\'s text', "`42`"],
      1,
      'Quotes make text. `"42"` looks like a number, but it\'s a string, and `"42" + 1` is `"421"`.',
    ),
  ),

  part(
    "const-and-let",
    "const or let?",
    reference("Three ways to declare", [
      [
        "const",
        "Always points at the same value. Use it by default.",
        'const name = "Sam";',
      ],
      ["let", "Can be given a new value later.", "let count = 0;\ncount = 1;"],
      [
        "var",
        "The old way. Avoid it: it has surprising rules.",
        "var x = 1; // in older code",
      ],
    ]),
    explain(
      "Start with `const`. Switch to `let` only when the value really has to change, like a counter or a running total. Then anyone reading your code knows: a `const` never changes, so only the `let` values need watching.",
    ),
    mistake({
      title: "Changing a const",
      wrong: ["const count = 0;", "count = count + 1;"],
      problem:
        "It throws `TypeError: Assignment to constant variable.` A `const` can't be given a new value.",
      right: ["let count = 0;", "count = count + 1;"],
      why: "The value has to change, so declare it with `let`.",
    }),
    quickCheck(
      "Which should be `let`?",
      [
        "The site's name, which never changes",
        "The number of items in a basket, which goes up as you shop",
        "Both",
      ],
      1,
      "Only values that change need `let`. Everything else is `const`.",
    ),
  ),

  part(
    "changing",
    "Watching a value change",
    explain(
      "With `let`, you can store a new value under the same name. In `count = count + 1`, JavaScript works out the right side first, using the *current* value, then stores the answer. Press Next to watch it.",
    ),
    trace(
      "A counter going up",
      [
        "let count = 0;",
        "count = count + 1;",
        "count = count + 5;",
        "count += 2;",
        'const message = "Total: " + count;',
        "console.log(message);",
      ],
      [
        {
          line: 1,
          note: "`count` is made and given the value 0.",
          vars: [["count", "0"]],
        },
        {
          line: 2,
          note: "Right side first: `count + 1` is `0 + 1`, which is 1. Then 1 is stored in `count`, replacing 0.",
          vars: [["count", "1"]],
        },
        {
          line: 3,
          note: "`count + 5` uses the current value: `1 + 5` is 6.",
          vars: [["count", "6"]],
        },
        {
          line: 4,
          note: "`count += 2` is short for `count = count + 2`, so `count` is now 8.",
          vars: [["count", "8"]],
        },
        {
          line: 5,
          note: 'A string plus a number joins them as text: `message` is `"Total: 8"`.',
          vars: [
            ["count", "8"],
            ["message", '"Total: 8"'],
          ],
        },
        {
          line: 6,
          note: "The message is printed.",
          vars: [
            ["count", "8"],
            ["message", '"Total: 8"'],
          ],
          output: "Total: 8",
        },
      ],
    ),
    reference("Short ways to change a number", [
      ["+=", "Add and store.", "count += 5; // count = count + 5"],
      ["-=", "Subtract and store.", "count -= 1;"],
      ["*=", "Multiply and store.", "price *= 2;"],
      ["++", "Add one.", "count++;"],
      ["--", "Take away one.", "count--;"],
    ]),
  ),

  part(
    "using-values",
    "Using variables together",
    explain(
      "Anywhere you could write a value, you can write a variable instead. Combine them into new values with operators, and drop them into text with a [[template-literal]]: backticks, with `${}` around each value.",
    ),
    jsPlayground("Build new values from old ones", [
      "const price = 4;",
      "const quantity = 3;",
      "const total = price * quantity;",
      "",
      'const item = "apples";',
      "const line = `${quantity} ${item} cost £${total}`;",
      "console.log(line);",
      "",
      "// Change quantity to 10 and run it again.",
    ]),
    trace(
      "Copying a value",
      ["let a = 5;", "let b = a;", "a = 10;", "console.log(a, b);"],
      [
        {
          line: 1,
          note: "`a` holds 5.",
          vars: [["a", "5"]],
        },
        {
          line: 2,
          note: "`b` gets a **copy** of the value in `a`: 5. They're now separate.",
          vars: [
            ["a", "5"],
            ["b", "5"],
          ],
        },
        {
          line: 3,
          note: "Changing `a` doesn't touch `b`. (Objects and arrays behave differently; you'll meet that later.)",
          vars: [
            ["a", "10"],
            ["b", "5"],
          ],
        },
        {
          line: 4,
          note: "So it prints 10 and 5.",
          vars: [
            ["a", "10"],
            ["b", "5"],
          ],
          output: "10 5",
        },
      ],
    ),
    quickCheck(
      'With `const name = "Sam";`, what does `` `Hi, ${name}!` `` give?',
      ['`"Hi, ${name}!"`', '`"Hi, Sam!"`', '`"Hi, name!"`'],
      1,
      "Inside backticks, `${}` is replaced by the value of what's inside it.",
    ),
  ),

  part(
    "empty-values",
    "Nothing yet: undefined and null",
    explain(
      "A variable declared without a value holds `undefined`: JavaScript's way of saying *nothing was put here*. `null` is a value **you** choose to mean *nothing, on purpose*, such as no user logged in yet.",
    ),
    jsPlayground("Empty, on purpose or not", [
      "let answer;",
      "console.log(answer); // nothing stored yet",
      "",
      "let user = null; // nobody logged in",
      "console.log(user);",
      "",
      'user = "Sam";',
      "console.log(user);",
    ]),
    keyPoints(
      "`undefined`: not set yet. JavaScript gives you this.",
      "`null`: set to nothing on purpose. You choose this.",
      "Both count as false in an `if`.",
    ),
    quickCheck(
      "`let total;` then `console.log(total);`. What prints?",
      ["`0`", "`undefined`", "`null`"],
      1,
      "A variable with no value yet is `undefined`, not 0.",
    ),
  ),

  part(
    "naming",
    "Naming variables",
    reference("The rules", [
      [
        "letters, digits, $ and _",
        "Names can use these, and nothing else.",
        "noteCount, item2, _private",
      ],
      [
        "not starting with a digit",
        "`2items` isn't allowed.",
        "items2 // fine",
      ],
      ["no spaces", "Join words instead.", "noteCount, not note count"],
      [
        "no keywords",
        "Words JavaScript already uses are taken.",
        "let, const, if, return, class",
      ],
      [
        "case matters",
        "`total` and `Total` are different names.",
        "total !== Total",
      ],
    ]),
    reference("Good habits", [
      [
        "camelCase",
        "Join words, each new word with a capital.",
        "firstName, isLoggedIn",
      ],
      [
        "say what it holds",
        "A reader shouldn't have to guess.",
        "price, not p or x",
      ],
      ["yes/no names", "Start booleans with is or has.", "isDone, hasTags"],
      [
        "UPPER_CASE",
        "Fixed settings that never change.",
        "const MAX_TITLE_LENGTH = 100;",
      ],
    ]),
    quickCheck(
      "Which is the best name for whether a note is finished?",
      ["`x`", "`isDone`", "`note finished`"],
      1,
      "`x` says nothing, and `note finished` has a space, which isn't allowed. `isDone` reads like a yes/no question.",
    ),
  ),

  part(
    "where-used",
    "Where you'll use variables",
    keyPoints(
      "Holding what the user typed: `const title = input.value;`",
      "Keeping a result to use later: `const total = addTax(price);`",
      "Counting or totalling as you go: `let count = 0;`",
      "Fixed settings in one place: `const MAX_TITLE_LENGTH = 100;`",
    ),
    code(
      "js",
      "the Notes App's server checks a note's title",
      [
        "export const MAX_TITLE_LENGTH = 100;",
        "",
        "export function validateNote(body) {",
        "  const title = body.title.trim();",
        '  if (!title) return "Title is required";',
        "  if (title.length > MAX_TITLE_LENGTH) {",
        "    return `Title must be at most ${MAX_TITLE_LENGTH} characters`;",
        "  }",
        "}",
      ],
      {
        1: "a fixed setting, in UPPER_CASE, used in two places",
        4: "the trimmed title, kept so it's worked out once",
      },
    ),
    inTheNotesApp(
      "`validateNote` keeps the limit in `MAX_TITLE_LENGTH`, so changing it to 200 is a one-line edit, and the error message stays right.",
      { symbolId: "fn:validateNote" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Using a variable before it's made",
      wrong: ["console.log(total);", "const total = 10;"],
      problem:
        "It throws `ReferenceError: Cannot access 'total' before initialization`. Code runs top to bottom, and `total` doesn't exist yet on line 1.",
      right: ["const total = 10;", "console.log(total);"],
      why: "Declare a variable first, then use it.",
    }),
    mistake({
      title: "Forgetting the quotes",
      wrong: ["const title = Buy milk;"],
      problem:
        "Without quotes, JavaScript reads `Buy` and `milk` as variable names, and stops with a `SyntaxError`.",
      right: ['const title = "Buy milk";'],
      why: "Text values always go in quotes (or backticks). Names don't.",
    }),
    mistake({
      title: "Text that looks like a number",
      wrong: ['const age = "30";', "console.log(age + 1); // 301"],
      problem:
        'The quotes make `age` a string, so `+` joins text: `"30" + 1` is `"301"`.',
      right: ['const age = Number("30");', "console.log(age + 1); // 31"],
      why: "What a user types is always text. Turn it into a number with `Number()` before doing maths.",
    }),
    mistake({
      title: "Declaring the same name twice",
      wrong: ["let count = 0;", "let count = 1;"],
      problem:
        "It throws `SyntaxError: Identifier 'count' has already been declared`.",
      right: ["let count = 0;", "count = 1;"],
      why: "`let` makes a variable once. To change it, assign without `let`.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Make two variables",
      task: 'Make a variable `city` holding the text `"Paris"`, and a variable `population` holding the number `2100000`.',
      starter: ["// Write your two variables here"],
      tests: [
        ["city", '"Paris"'],
        ["population", "2100000"],
        ["typeof population", '"number"'],
      ],
      hint: 'Text goes in quotes, numbers don\'t: `const city = "Paris";`',
      solution: ['const city = "Paris";', "const population = 2100000;"],
    }),
    yourTurn({
      title: "Fix the counter",
      task: "This code should leave `score` at 15, but it throws an error. Fix the declaration so `score` can change.",
      starter: ["const score = 10;", "score = score + 5;"],
      tests: [
        ["score", "15"],
        ["typeof score", '"number"'],
      ],
      hint: "A value that changes needs `let`, not `const`.",
      solution: ["let score = 10;", "score = score + 5;"],
    }),
    yourTurn({
      title: "Build a message",
      task: 'Using `name` and `count`, make a variable `message` holding `"Sam has 3 notes"`. Use a template literal, so it still works if `name` or `count` change.',
      starter: [
        'const name = "Sam";',
        "const count = 3;",
        "",
        "// const message = ...",
      ],
      tests: [
        ["message", '"Sam has 3 notes"'],
        ["message.includes(name)", "true"],
      ],
      hint: "Backticks with `${}` around each variable: `` `${name} has ...` ``",
      solution: [
        'const name = "Sam";',
        "const count = 3;",
        "",
        "const message = `${name} has ${count} notes`;",
      ],
    }),
    yourTurn({
      title: "Text to a number",
      task: 'The basket has `"4"` items as text (as a form gives it). Make `total` the number of items plus 1, so it equals `5`, not `"41"`.',
      starter: ['const items = "4";', "const total = items + 1;"],
      tests: [
        ["total", "5"],
        ["typeof total", '"number"'],
      ],
      hint: "Turn the text into a number first: `Number(items)`.",
      solution: ['const items = "4";', "const total = Number(items) + 1;"],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Variables cheat sheet", [
      [
        "const",
        "A name that always points at one value.",
        'const site = "Notes";',
      ],
      ["let", "A name whose value can change.", "let count = 0;"],
      ["assign", "Store a new value (let only).", "count = 5;"],
      ["update", "Change based on the old value.", "count += 1;"],
      ["typeof", "What type is this value?", 'typeof 42 // "number"'],
      ["template literal", "Values inside text.", "`${count} notes`"],
      [
        "undefined / null",
        "Not set yet / nothing on purpose.",
        "let x; let user = null;",
      ],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "`=` checks if two values are equal",
        "Use `const` by default, and `let` only for values that change",
        '`"5"` and `5` are the same value',
      ],
      1,
      '`=` stores a value, and `"5"` is text while `5` is a number. `const` first keeps code easy to follow.',
    ),
  ),
);
