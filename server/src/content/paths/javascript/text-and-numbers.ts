import {
  anatomy,
  code,
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

// Text and numbers in depth: making strings, reading their characters,
// string methods, template literals, numbers and operators, the order maths
// runs in, rounding and Math, converting between text and numbers, where
// they're used, mistakes, practice and a recap.
export const textAndNumbersModule = moduleLesson(
  "text-and-numbers",
  "Text and numbers",
  40,
  [
    "Make strings with quotes or backticks, and read their length and characters.",
    "Use string methods like `trim`, `toUpperCase`, `includes` and `slice`.",
    "Build text from values with template literals.",
    "Do maths with `+ - * / % **`, and predict the order it runs in.",
    "Round numbers, and convert between text and numbers safely.",
  ],

  part(
    "strings",
    "Text: strings",
    explain(
      "Text in JavaScript is called a [[js-string|string]]: a string of characters. Write it in double quotes, single quotes or backticks. They all make the same kind of value; pick double quotes and stay consistent, and use backticks when you want to put values inside.",
    ),
    reference("Three ways to write a string", [
      ['"double"', "The usual choice.", '"Buy milk"'],
      [
        "'single'",
        'Exactly the same; handy for text with " in it.',
        "'She said \"hi\"'",
      ],
      [
        "`backticks`",
        "A template literal: values can go inside.",
        "`Hi ${name}`",
      ],
      ["\\n", "A new line inside a string.", '"Line 1\\nLine 2"'],
      ['""', "An empty string: no characters.", 'const note = "";'],
    ]),
    jsPlayground("Strings in action", [
      'const title = "Buy milk";',
      "const quote = 'She said \"hi\"';",
      'const twoLines = "First line\\nSecond line";',
      "",
      "console.log(title);",
      "console.log(quote);",
      "console.log(twoLines);",
    ]),
    quickCheck(
      "Are `\"milk\"` and `'milk'` the same value?",
      [
        "Yes: both are the string milk",
        "No: the quotes are part of the text",
        "Only in older browsers",
      ],
      0,
      "The quotes only mark where the text starts and ends. They aren't part of it.",
    ),
  ),

  part(
    "characters",
    "Length and characters",
    explain(
      "Every character in a string has a position, called its **index**, counting from **0**. `.length` tells you how many characters there are. So the last character is always at `length - 1`.",
    ),
    code(
      "js",
      'positions in "MILK"',
      [
        'const word = "MILK";',
        "// index:     0123",
        'word[0]      // "M"',
        "word.length  // 4",
        'word[word.length - 1] // "K"',
      ],
      { 3: "the first character is at 0", 5: "the last is at length - 1" },
    ),
    jsPlayground("Index and length", [
      'const word = "JavaScript";',
      "console.log(word.length);",
      "console.log(word[0], word[4]);",
      "console.log(word[word.length - 1]);",
      "console.log(word[50]); // past the end",
    ]),
    quickCheck(
      'What is `"cat"[1]`?',
      ['`"c"`', '`"a"`', '`"t"`'],
      1,
      "Counting starts at 0, so index 1 is the second character.",
    ),
  ),

  part(
    "string-methods",
    "String methods",
    explain(
      "A string comes with built-in jobs, called **methods**, that you call with a dot. They never change the original string; each one gives back a **new** value.",
    ),
    reference("String methods you'll use most", [
      ["trim()", "Remove spaces at both ends.", '"  hi  ".trim() // "hi"'],
      [
        "toUpperCase()",
        "A copy in capitals.",
        '"milk".toUpperCase() // "MILK"',
      ],
      [
        "toLowerCase()",
        "A copy in small letters.",
        '"MILK".toLowerCase() // "milk"',
      ],
      [
        "includes()",
        "Does it contain this text?",
        '"hello".includes("ell") // true',
      ],
      [
        "startsWith()",
        "Does it start with this?",
        '"note-1".startsWith("note") // true',
      ],
      [
        "slice(start, end)",
        "The part from start up to (not including) end.",
        '"hello".slice(1, 3) // "el"',
      ],
      [
        "replace()",
        "Swap the first match.",
        '"a-b".replace("-", "+") // "a+b"',
      ],
      ["split()", "Break into a list.", '"a,b,c".split(",") // ["a","b","c"]'],
      ["padStart()", "Fill to a length.", '"7".padStart(2, "0") // "07"'],
    ]),
    jsPlayground("Clean up what a user typed", [
      'const typed = "   Buy MILK  ";',
      "",
      "const clean = typed.trim();",
      "console.log(clean);",
      "console.log(clean.toLowerCase());",
      'console.log(clean.includes("MILK"));',
      "console.log(clean.slice(0, 3));",
      "console.log(typed); // the original hasn't changed",
    ]),
    trace(
      "Methods one after another",
      [
        'const typed = "  Milk  ";',
        "const shout = typed.trim().toUpperCase();",
        "console.log(shout);",
      ],
      [
        {
          line: 1,
          note: "`typed` has spaces at both ends.",
          vars: [["typed", '"  Milk  "']],
        },
        {
          line: 2,
          note: '`.trim()` runs first and gives back a new string, `"Milk"`. The next method is called on that.',
          vars: [["typed", '"  Milk  "']],
        },
        {
          line: 2,
          note: '`.toUpperCase()` turns `"Milk"` into `"MILK"`, which is stored in `shout`. `typed` is unchanged.',
          vars: [
            ["typed", '"  Milk  "'],
            ["shout", '"MILK"'],
          ],
        },
        {
          line: 3,
          note: "It prints the result.",
          vars: [
            ["typed", '"  Milk  "'],
            ["shout", '"MILK"'],
          ],
          output: "MILK",
        },
      ],
    ),
  ),

  part(
    "template-literals",
    "Building text: template literals",
    explain(
      "To put values into text, use backticks and `${}`. This is a [[template-literal]]. Anything inside `${}` is worked out first, then dropped into the text. It's much easier to read than joining pieces with `+`.",
    ),
    anatomy(
      "A template literal",
      ["`${name} has ${count + 1} notes`"],
      [
        [
          "`",
          "backtick",
          "Starts the template. The same key as ~ on most keyboards.",
        ],
        ["${name}", "a value", "Replaced by the value of `name`."],
        [" has ", "plain text", "Kept exactly as written, spaces included."],
        [
          "${count + 1}",
          "an expression",
          "Worked out first, then put in the text.",
        ],
        [" notes", "plain text", "More text."],
      ],
    ),
    jsPlayground("Two ways to build the same text", [
      'const name = "Sam";',
      "const count = 2;",
      "",
      'console.log(name + " has " + count + " notes");',
      "console.log(`${name} has ${count} notes`);",
      "console.log(`Next week: ${count * 2} notes`);",
    ]),
    quickCheck(
      "Which prints `Total: 10`?",
      ['`"Total: ${5 + 5}"`', "`` `Total: ${5 + 5}` ``", "`'Total: ${5 + 5}'`"],
      1,
      "Only backticks fill in `${}`. In normal quotes it's printed as it is.",
    ),
  ),

  part(
    "numbers",
    "Numbers and operators",
    explain(
      "[[js-number|Numbers]] are written without quotes: `42`, `3.5`, `-7`. JavaScript has one number type for whole numbers and decimals. The [[js-operator|operators]] below do the maths.",
    ),
    reference("Arithmetic operators", [
      ["+", "Add.", "7 + 2 // 9"],
      ["-", "Subtract.", "7 - 2 // 5"],
      ["*", "Multiply.", "7 * 2 // 14"],
      ["/", "Divide (decimals are kept).", "7 / 2 // 3.5"],
      ["%", "Remainder after dividing.", "7 % 2 // 1"],
      ["**", "To the power of.", "2 ** 3 // 8"],
    ]),
    jsPlayground("Try every operator", [
      "console.log(7 + 2, 7 - 2, 7 * 2);",
      "console.log(7 / 2);",
      "console.log(7 % 2, 8 % 2); // odd numbers leave 1",
      "console.log(2 ** 10);",
      "console.log(10 / 0, -10 / 0);",
    ]),
    keyPoints(
      "`%` is great for even/odd and for every-nth checks.",
      "Dividing never rounds: `7 / 2` is `3.5`.",
      "Dividing by 0 gives `Infinity`, not an error.",
    ),
  ),

  part(
    "order",
    "The order maths runs in",
    explain(
      "JavaScript follows the maths rules you know: `**` first, then `*`, `/` and `%`, then `+` and `-`, each from left to right. Round brackets go first of all, so add them whenever the order isn't obvious. Watch it work out a price:",
    ),
    trace(
      "Working out a total",
      [
        "const price = 4;",
        "const total = 2 + price * 3;",
        "const fixed = (2 + price) * 3;",
        "console.log(total, fixed);",
      ],
      [
        { line: 1, note: "`price` is 4.", vars: [["price", "4"]] },
        {
          line: 2,
          note: "`*` comes before `+`: first `price * 3` is 12, then `2 + 12` is 14.",
          vars: [
            ["price", "4"],
            ["total", "14"],
          ],
        },
        {
          line: 3,
          note: "Brackets go first: `2 + price` is 6, then `6 * 3` is 18.",
          vars: [
            ["price", "4"],
            ["total", "14"],
            ["fixed", "18"],
          ],
        },
        {
          line: 4,
          note: "Same numbers, different answers: brackets decide.",
          vars: [
            ["price", "4"],
            ["total", "14"],
            ["fixed", "18"],
          ],
          output: "14 18",
        },
      ],
    ),
    quickCheck(
      "What is `10 - 2 * 3`?",
      ["`24`", "`4`", "`14`"],
      1,
      "`2 * 3` first is 6, then `10 - 6` is 4. Write `(10 - 2) * 3` if you meant 24.",
    ),
  ),

  part(
    "rounding",
    "Rounding and the Math tools",
    reference("Rounding and Math", [
      ["Math.round()", "To the nearest whole number.", "Math.round(2.5) // 3"],
      ["Math.floor()", "Down to a whole number.", "Math.floor(2.9) // 2"],
      ["Math.ceil()", "Up to a whole number.", "Math.ceil(2.1) // 3"],
      [
        "toFixed(n)",
        "Text with n decimals, for showing.",
        '(2.5).toFixed(2) // "2.50"',
      ],
      [
        "Math.max() / min()",
        "The biggest or smallest.",
        "Math.max(3, 9, 4) // 9",
      ],
      [
        "Math.random()",
        "A random number from 0 up to 1.",
        "Math.random() // 0.42…",
      ],
    ]),
    explain(
      "Computers store decimals in binary, so a few can't be stored exactly: `0.1 + 0.2` is `0.30000000000000004`. For money, round when you **show** the number with `toFixed(2)`, or count in pennies (whole numbers).",
    ),
    jsPlayground("Rounding in practice", [
      "console.log(0.1 + 0.2);",
      "console.log((0.1 + 0.2).toFixed(2));",
      "",
      "const price = 19.999;",
      "console.log(Math.round(price), Math.floor(price), Math.ceil(price));",
      "",
      "// A dice roll from 1 to 6:",
      "console.log(Math.floor(Math.random() * 6) + 1);",
    ]),
  ),

  part(
    "converting",
    "Text to numbers, and back",
    explain(
      "What a user types into a form is **always text**, even `42`. Before doing maths with it, turn it into a number with `Number()`. The trap: `+` with a string on either side **joins** text instead of adding.",
    ),
    reference("Converting values", [
      ["Number()", "Text to a number.", 'Number("42") // 42'],
      [
        "Number() on bad text",
        "Gives NaN: not a number.",
        'Number("abc") // NaN',
      ],
      [
        "parseInt() / parseFloat()",
        "Reads the number at the start.",
        'parseInt("42px") // 42',
      ],
      ["String()", "Any value to text.", 'String(42) // "42"'],
      [
        "Number.isNaN()",
        "Did the conversion fail?",
        'Number.isNaN(Number("x")) // true',
      ],
    ]),
    jsPlayground("The + trap", [
      'const typed = "5";',
      "",
      "console.log(typed + 1);         // joins: 51",
      "console.log(Number(typed) + 1); // adds: 6",
      "console.log(typed * 2);         // * converts: 10",
      'console.log(Number("hello"));   // NaN',
    ]),
    quickCheck(
      'What does `"3" + 4` give?',
      ["`7`", '`"34"`', "`NaN`"],
      1,
      'With a string on one side, `+` joins text. Convert first: `Number("3") + 4` is 7.',
    ),
  ),

  part(
    "where-used",
    "Where you'll use text and numbers",
    keyPoints(
      "Cleaning input: `title.trim()` before saving a note.",
      "Messages: `` `Saved ${count} notes` ``.",
      "Checking limits: `title.length > 100`.",
      'Showing prices and dates: `toFixed(2)`, `padStart(2, "0")`.',
    ),
    code(
      "js",
      "the Notes App's server cleans and checks a title",
      [
        "const title = body.title.trim();",
        'if (!title) return "Title is required";',
        "if (title.length > MAX_TITLE_LENGTH) {",
        "  return `Title must be at most ${MAX_TITLE_LENGTH} characters`;",
        "}",
      ],
      {
        1: "remove spaces someone typed by accident",
        3: "count the characters",
        4: "a template literal builds the message",
      },
    ),
    inTheNotesApp(
      "`validateNote` trims the title, counts its characters and builds its error messages with template literals.",
      { symbolId: "fn:validateNote" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Adding text instead of numbers",
      wrong: ['const qty = "2";', "console.log(qty + 3); // 23"],
      problem: '`qty` is a string, so `+` joins: `"2" + 3` is `"23"`.',
      right: ['const qty = "2";', "console.log(Number(qty) + 3); // 5"],
      why: "Convert text to a number before adding.",
    }),
    mistake({
      title: "Expecting a method to change the string",
      wrong: [
        'let name = "  sam ";',
        "name.trim();",
        "console.log(name); // still has spaces",
      ],
      problem:
        "String methods give back a **new** string; they never change the one you called them on.",
      right: [
        'let name = "  sam ";',
        "name = name.trim();",
        'console.log(name); // "sam"',
      ],
      why: "Store the result: in a new variable, or back in the same `let`.",
    }),
    mistake({
      title: "${} in normal quotes",
      wrong: [
        'const name = "Sam";',
        'console.log("Hi ${name}"); // Hi ${name}',
      ],
      problem:
        "Only backticks fill in `${}`. In double quotes it's plain text.",
      right: ['const name = "Sam";', "console.log(`Hi ${name}`); // Hi Sam"],
      why: "Use backticks for template literals.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Shout it",
      task: 'Write `shout(text)` so it returns the text trimmed, in capitals, with `"!"` on the end. `shout("  hi ")` gives `"HI!"`.',
      starter: ["function shout(text) {", "", "}"],
      tests: [
        ['shout("  hi ")', '"HI!"'],
        ['shout("milk")', '"MILK!"'],
      ],
      hint: 'Chain the methods: `text.trim().toUpperCase()`, then add `"!"` with `+` or a template literal.',
      solution: [
        "function shout(text) {",
        '  return text.trim().toUpperCase() + "!";',
        "}",
      ],
    }),
    yourTurn({
      title: "Initials",
      task: 'Write `initials(first, last)` to return the first letter of each name in capitals with dots, like `"A.L."` for Ada Lovelace.',
      starter: ["function initials(first, last) {", "", "}"],
      tests: [
        ['initials("Ada", "Lovelace")', '"A.L."'],
        ['initials("sam", "lee")', '"S.L."'],
      ],
      hint: "`first[0]` is the first letter; make it a capital with `.toUpperCase()`, then build `` `${a}.${b}.` ``.",
      solution: [
        "function initials(first, last) {",
        "  const a = first[0].toUpperCase();",
        "  const b = last[0].toUpperCase();",
        "  return `${a}.${b}.`;",
        "}",
      ],
    }),
    yourTurn({
      title: "Add what they typed",
      task: 'Both inputs come from a form, so they are text. Write `addTyped(a, b)` to return their sum as a number: `addTyped("2", "3")` is `5`.',
      starter: ["function addTyped(a, b) {", "  return a + b;", "}"],
      tests: [
        ['addTyped("2", "3")', "5"],
        ['addTyped("10", "0.5")', "10.5"],
      ],
      hint: "Turn each one into a number with `Number()` before adding.",
      solution: [
        "function addTyped(a, b) {",
        "  return Number(a) + Number(b);",
        "}",
      ],
    }),
    yourTurn({
      title: "Format a price",
      task: 'Write `formatPrice(pennies)` to turn a whole number of pennies into a price with two decimals: `formatPrice(1999)` gives `"£19.99"` and `formatPrice(500)` gives `"£5.00"`.',
      starter: ["function formatPrice(pennies) {", "", "}"],
      tests: [
        ["formatPrice(1999)", '"£19.99"'],
        ["formatPrice(500)", '"£5.00"'],
        ["formatPrice(5)", '"£0.05"'],
      ],
      hint: "Divide by 100 to get pounds, then `.toFixed(2)` gives the text with two decimals.",
      solution: [
        "function formatPrice(pennies) {",
        "  return `£${(pennies / 100).toFixed(2)}`;",
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Text and numbers cheat sheet", [
      [
        "length, [i]",
        "How many characters; the one at i (from 0).",
        '"cat".length // 3',
      ],
      [
        "trim, toUpperCase",
        "Clean and change text (new string back).",
        "s.trim().toUpperCase()",
      ],
      ["includes, slice", "Search and cut.", 's.includes("a"), s.slice(0, 3)'],
      ["`${}`", "Values inside text (backticks only).", "`${n} notes`"],
      ["+ - * / % **", "Maths; brackets go first.", "(2 + 4) * 3 // 18"],
      [
        "Math.round, toFixed",
        "Round, or show with n decimals.",
        "(2.5).toFixed(2)",
      ],
      [
        "Number(), String()",
        "Convert between text and numbers.",
        'Number("42") + 1',
      ],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        '`"5" + 5` is `10`',
        "String methods give back a new string and leave the original alone",
        "Strings count characters from 1",
      ],
      1,
      'With text, `+` joins (`"55"`), and positions count from 0.',
    ),
  ),
);
