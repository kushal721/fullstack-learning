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

// Making decisions in depth: why programs choose, comparing values,
// true and false, if / else if / else, how a branch runs, combining
// conditions, truthy and falsy, the short forms, decisions in functions,
// where they're used, mistakes, practice and a recap.
export const decisionsModule = moduleLesson(
  "decisions",
  "Making decisions",
  35,
  [
    "Compare values with `===`, `!==`, `<`, `>`, `<=` and `>=`, and know why not `==`.",
    "Write `if`, `else if` and `else`, and predict which branch runs.",
    "Combine conditions with `&&`, `||` and `!`.",
    "Tell truthy from falsy values, and use them safely in conditions.",
    "Use the ternary and early `return` for short, clear decisions.",
  ],

  part(
    "why",
    "Why decisions?",
    explain(
      "Programs don't just run the same lines every time. They **choose**: show an error if the title is empty, say good morning before noon, let someone in only if they're logged in. A choice needs a question with a yes-or-no answer, and code to run for each answer.",
    ),
    diagram([
      ["a question", "is the title empty?"],
      ["yes", 'show "Title is required"'],
      ["no", "save the note"],
    ]),
    analogy(
      "A fork in the road with a signpost: the signpost asks a yes-or-no question, and you take one road or the other, never both.",
    ),
    keyPoints(
      "A decision asks a yes-or-no question: a condition.",
      "The answer is a boolean: `true` or `false`.",
      "Only the code for that answer runs.",
    ),
  ),

  part(
    "comparing",
    "Comparing values",
    explain(
      "Conditions are usually comparisons. Each [[js-operator|comparison operator]] looks at two values and gives back `true` or `false`.",
    ),
    reference("Comparison operators", [
      [
        "===",
        "Same value and same type.",
        '3 === 3 // true\n3 === "3" // false',
      ],
      ["!==", "Not the same.", '"a" !== "b" // true'],
      [">  <", "Bigger than, smaller than.", "5 > 3 // true"],
      [">=  <=", "Bigger (or smaller) or equal.", "18 >= 18 // true"],
      [
        "==",
        "Loose: converts types first. Avoid it.",
        '3 == "3" // true (surprise!)',
      ],
    ]),
    jsPlayground("Every comparison gives true or false", [
      "const age = 20;",
      "",
      "console.log(age >= 18);",
      "console.log(age === 20);",
      'console.log(age === "20");',
      'console.log(age == "20"); // loose: avoid',
      'console.log("apple" < "banana"); // text compares A to Z',
      "",
      "const isAdult = age >= 18;",
      "console.log(isAdult);",
    ]),
    quickCheck(
      'What does `5 === "5"` give?',
      ["`true`", "`false`: one is a number, the other a string", "An error"],
      1,
      "`===` checks the type too, so a number never equals a string. That's why it's the one to use.",
    ),
  ),

  part(
    "anatomy",
    "The parts of an if",
    anatomy(
      "An if statement",
      ["if (age >= 18) {", '  console.log("Welcome");', "}"],
      [
        ["if", "keyword", "Starts a decision."],
        [
          "(age >= 18)",
          "condition",
          "The question, in round brackets. It's worked out to `true` or `false`.",
        ],
        ["{", "block starts", "The code to run when the condition is true."],
        [
          'console.log("Welcome")',
          "the block",
          "Runs only if the condition was true. Otherwise it's skipped.",
        ],
        ["}", "block ends", "After it, the program carries on as normal."],
      ],
    ),
    explain(
      "Add `else { … }` after the block for code that runs when the condition is false. Then exactly one of the two blocks runs, never both. Leave out `else` when nothing needs to happen for *no*.",
    ),
    jsPlayground("Change age and run it", [
      "const age = 15;",
      "",
      "if (age >= 18) {",
      '  console.log("Welcome");',
      "} else {",
      '  console.log("Sorry, adults only");',
      "}",
      "",
      'console.log("This line always runs");',
    ]),
  ),

  part(
    "else-if",
    "More than two choices: else if",
    explain(
      "For several choices, chain them with [[js-condition|`else if`]]. JavaScript checks each condition from the top and runs the **first** block whose condition is true, then skips the rest. Order matters. Press Next to watch it.",
    ),
    trace(
      "Choosing a greeting",
      [
        "const hour = 15;",
        "",
        "if (hour < 12) {",
        '  console.log("Good morning");',
        "} else if (hour < 18) {",
        '  console.log("Good afternoon");',
        "} else {",
        '  console.log("Good evening");',
        "}",
      ],
      [
        { line: 1, note: "`hour` is 15.", vars: [["hour", "15"]] },
        {
          line: 3,
          note: "First question: is `15 < 12`? No, it's `false`, so this block is skipped.",
          vars: [["hour", "15"]],
        },
        {
          line: 5,
          note: "Next question: is `15 < 18`? Yes, `true`.",
          vars: [["hour", "15"]],
        },
        {
          line: 6,
          note: "So this block runs.",
          vars: [["hour", "15"]],
          output: "Good afternoon",
        },
        {
          line: 9,
          note: "A branch has run, so the `else` is skipped without being checked. The decision is over.",
          vars: [["hour", "15"]],
        },
      ],
    ),
    quickCheck(
      "With `hour = 9`, which messages print?",
      [
        '"Good morning" and "Good afternoon" (both are true)',
        'Only "Good morning": the first true branch wins',
        'Only "Good evening"',
      ],
      1,
      "9 is less than 12 *and* less than 18, but only the first true branch runs.",
    ),
  ),

  part(
    "combining",
    "Combining conditions",
    reference("Logical operators", [
      [
        "&&",
        "and: true only if both sides are true.",
        "age >= 18 && hasTicket",
      ],
      [
        "||",
        "or: true if at least one side is true.",
        'role === "admin" || isOwner',
      ],
      ["!", "not: flips true and false.", "!isDone"],
    ]),
    reference("And and or, every case", [
      ["true && true", "Both true.", "true"],
      ["true && false", "One is false.", "false"],
      ["true || false", "At least one true.", "true"],
      ["false || false", "Neither true.", "false"],
      ["!true", "The opposite.", "false"],
    ]),
    jsPlayground("Can they come in?", [
      "const age = 20;",
      "const hasTicket = false;",
      "const isVip = true;",
      "",
      "console.log(age >= 18 && hasTicket);",
      "console.log(hasTicket || isVip);",
      "console.log(age >= 18 && (hasTicket || isVip));",
      "console.log(!hasTicket);",
    ]),
    quickCheck(
      "When is `isLoggedIn && isAdmin` true?",
      ["When either is true", "Only when both are true", "When both are false"],
      1,
      "`&&` needs every side to be true. Use `||` when one is enough.",
    ),
  ),

  part(
    "truthy-falsy",
    "Truthy and falsy",
    explain(
      'A condition doesn\'t have to be a boolean. JavaScript turns any value into `true` or `false` when it needs to. Six values count as false, called [[truthy-falsy|falsy]]. **Everything else** is truthy, even `"0"`, `"false"` and an empty list.',
    ),
    reference("The falsy values (all others are truthy)", [
      ["false", "The boolean itself.", "if (false) // skipped"],
      ["0", "Zero (and -0).", "if (0) // skipped"],
      ['""', "An empty string.", 'if ("") // skipped'],
      ["null", "Nothing, on purpose.", "if (null) // skipped"],
      ["undefined", "Not set.", "if (undefined) // skipped"],
      ["NaN", "Not a number.", "if (NaN) // skipped"],
    ]),
    jsPlayground("A handy check: is the title empty?", [
      'const title = "";',
      "",
      "if (title) {",
      '  console.log("Saving:", title);',
      "} else {",
      '  console.log("Title is required");',
      "}",
      "",
      'console.log(Boolean("0"), Boolean([]), Boolean(0));',
    ]),
    quickCheck(
      'Is the string `"0"` truthy or falsy?',
      ["Falsy: it's zero", "Truthy: it's a non-empty string", "Neither"],
      1,
      'Only the number 0 is falsy. `"0"` is a string with one character, so it\'s truthy.',
    ),
  ),

  part(
    "short-forms",
    "Short forms: ternary and switch",
    anatomy(
      "The ternary: an if/else that gives back a value",
      ['const label = done ? "Done" : "To do";'],
      [
        ["const label =", "store", "The result is stored, like any value."],
        ["done", "condition", "The question."],
        [
          "?",
          "if true",
          "What comes after it is used when the condition is true.",
        ],
        ['"Done"', "true value", "Used when `done` is true."],
        [":", "otherwise", "Separates the two answers."],
        ['"To do"', "false value", "Used when `done` is false."],
      ],
    ),
    code(
      "js",
      "switch: one value, many exact matches",
      [
        "switch (status) {",
        '  case "draft":',
        '    label = "Not saved yet";',
        "    break;",
        '  case "saved":',
        '    label = "Saved";',
        "    break;",
        "  default:",
        '    label = "Unknown";',
        "}",
      ],
      {
        2: "compared with ===",
        4: "stop here, or it runs on into the next case",
        8: "when nothing matched, like else",
      },
    ),
    keyPoints(
      "Ternary: choose between two values in one line.",
      "`if`/`else`: choose between two blocks of steps.",
      "`switch`: one value checked against many exact matches.",
      "Readability first: don't nest ternaries.",
    ),
  ),

  part(
    "in-functions",
    "Decisions inside functions",
    explain(
      "Decisions often live in functions, and `return` makes them neater. Since `return` leaves the function at once, you can deal with the problem cases first, each in its own `if`, and keep the normal case at the bottom. This is called an **early return**.",
    ),
    code(
      "js",
      "early returns: problems first, the normal case last",
      [
        "function checkTitle(title) {",
        "  if (!title) {",
        '    return "Title is required";',
        "  }",
        "  if (title.length > 100) {",
        '    return "Title is too long";',
        "  }",
        '  return "OK";',
        "}",
      ],
      {
        2: "empty (falsy)? stop here",
        5: "too long? stop here",
        8: "only reached when both checks passed",
      },
    ),
    jsPlayground("Try different titles", [
      "function checkTitle(title) {",
      "  if (!title) {",
      '    return "Title is required";',
      "  }",
      "  if (title.length > 100) {",
      '    return "Title is too long";',
      "  }",
      '  return "OK";',
      "}",
      "",
      'console.log(checkTitle(""));',
      'console.log(checkTitle("Buy milk"));',
      'console.log(checkTitle("x".repeat(200)));',
    ]),
  ),

  part(
    "where-used",
    "Where you'll use decisions",
    keyPoints(
      "Checking input: is the form filled in, is the email valid?",
      "Showing different things: a spinner while loading, else the list.",
      "Permissions: only the note's owner can delete it.",
      "Handling errors: if the server said no, show a message.",
    ),
    inTheNotesApp(
      "The Notes App's server checks every new note in `validateNote` with a row of early returns: no title, a title that's too long, content that isn't text. Each `if` returns an error message; a valid note reaches the end.",
      { symbolId: "fn:validateNote" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "One = in a condition",
      wrong: [
        'let role = "user";',
        'if (role = "admin") {',
        '  console.log("Welcome, admin");',
        "}",
      ],
      problem:
        'A single `=` **stores** `"admin"` in `role`, and a non-empty string is truthy, so it always says welcome, and `role` has changed.',
      right: [
        'let role = "user";',
        'if (role === "admin") {',
        '  console.log("Welcome, admin");',
        "}",
      ],
      why: "`=` stores, `===` compares. In conditions you almost always want `===`.",
    }),
    mistake({
      title: "Checks in the wrong order",
      wrong: [
        "if (score >= 50) {",
        '  grade = "Pass";',
        "} else if (score >= 90) {",
        '  grade = "Top marks";',
        "}",
      ],
      problem:
        'A score of 95 is also `>= 50`, so it stops at the first branch and "Top marks" can never happen.',
      right: [
        "if (score >= 90) {",
        '  grade = "Top marks";',
        "} else if (score >= 50) {",
        '  grade = "Pass";',
        "}",
      ],
      why: "Only the first true branch runs, so put the most specific check first.",
    }),
    mistake({
      title: "Comparing with several values the wrong way",
      wrong: [
        'if (day === "Sat" || "Sun") {',
        '  console.log("Weekend");',
        "}",
      ],
      problem:
        '`"Sun"` on its own is a truthy string, so the condition is always true, even on a Monday.',
      right: [
        'if (day === "Sat" || day === "Sun") {',
        '  console.log("Weekend");',
        "}",
      ],
      why: "Each side of `||` is its own condition, so write the full comparison on both sides.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Can they vote?",
      task: 'Write `canVote(age)` so it returns `"Yes"` when `age` is 18 or more, and `"No"` otherwise.',
      starter: ["function canVote(age) {", "", "}"],
      tests: [
        ["canVote(18)", '"Yes"'],
        ["canVote(40)", '"Yes"'],
        ["canVote(17)", '"No"'],
      ],
      hint: '`if (age >= 18) { return "Yes"; }` then `return "No";` after it.',
      solution: [
        "function canVote(age) {",
        "  if (age >= 18) {",
        '    return "Yes";',
        "  }",
        '  return "No";',
        "}",
      ],
    }),
    yourTurn({
      title: "Grades",
      task: 'Write `grade(score)`: `"A"` for 90 or more, `"B"` for 70 or more, `"C"` for 50 or more, and `"Fail"` below 50.',
      starter: ["function grade(score) {", "", "}"],
      tests: [
        ["grade(95)", '"A"'],
        ["grade(90)", '"A"'],
        ["grade(75)", '"B"'],
        ["grade(50)", '"C"'],
        ["grade(12)", '"Fail"'],
      ],
      hint: "Check the highest grade first with `if`, then `else if` for the next ones, and `else` for Fail.",
      solution: [
        "function grade(score) {",
        "  if (score >= 90) {",
        '    return "A";',
        "  } else if (score >= 70) {",
        '    return "B";',
        "  } else if (score >= 50) {",
        '    return "C";',
        "  } else {",
        '    return "Fail";',
        "  }",
        "}",
      ],
    }),
    yourTurn({
      title: "Weekend?",
      task: 'Write `isWeekend(day)` to return `true` for `"Sat"` or `"Sun"`, and `false` for any other day. Use `||`.',
      starter: ["function isWeekend(day) {", "", "}"],
      tests: [
        ['isWeekend("Sat")', "true"],
        ['isWeekend("Sun")', "true"],
        ['isWeekend("Mon")', "false"],
      ],
      hint: 'You can return the comparison itself: `return day === "Sat" || day === "Sun";`',
      solution: [
        "function isWeekend(day) {",
        '  return day === "Sat" || day === "Sun";',
        "}",
      ],
    }),
    yourTurn({
      title: "Check a note",
      task: 'Write `checkNote(title)`: return `"Title is required"` if the title is empty, `"Too long"` if it has more than 20 characters, and `"OK"` otherwise. Use early returns.',
      starter: ["function checkNote(title) {", "", "}"],
      tests: [
        ['checkNote("")', '"Title is required"'],
        ['checkNote("Buy milk")', '"OK"'],
        ['checkNote("a".repeat(21))', '"Too long"'],
        ['checkNote("a".repeat(20))', '"OK"'],
      ],
      hint: "An empty string is falsy, so `if (!title)` catches it. Then compare `title.length > 20`.",
      solution: [
        "function checkNote(title) {",
        "  if (!title) {",
        '    return "Title is required";',
        "  }",
        "  if (title.length > 20) {",
        '    return "Too long";',
        "  }",
        '  return "OK";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Decisions cheat sheet", [
      ["compare", "Same value and type, or not.", "a === b, a !== b"],
      ["if / else", "Run one block or the other.", "if (ok) { … } else { … }"],
      [
        "else if",
        "More choices; the first true wins.",
        "else if (x < 10) { … }",
      ],
      ["&& || !", "And, or, not.", "a && b, a || b, !a"],
      ["falsy", 'false, 0, "", null, undefined, NaN.', "if (!title) { … }"],
      ["ternary", "Pick one of two values.", 'ok ? "Yes" : "No"'],
      ["early return", "Handle problems first, then leave.", "if (!x) return;"],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "Every branch whose condition is true runs",
        "`===` compares value and type; `=` stores a value",
        'The string `"0"` is falsy',
      ],
      1,
      'Only the first true branch runs, and `"0"` is a non-empty string, so it\'s truthy.',
    ),
  ),
);
