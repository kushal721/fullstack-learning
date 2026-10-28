import {
  analogy,
  anatomy,
  code,
  diagram,
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

// The first JavaScript module: what JavaScript is and where it runs,
// printing with console.log, how code runs top to bottom, comments,
// reading an error, the browser console, mistakes, practice and a recap.
export const gettingStartedModule = moduleLesson(
  "getting-started",
  "Getting started with JavaScript",
  30,
  [
    "Say what JavaScript does on a web page, and where it runs.",
    "Print values with `console.log` and read what it shows.",
    "Follow how code runs, one line at a time, from top to bottom.",
    "Write comments, and read an error message to find the broken line.",
    "Open the browser's console and run JavaScript in it.",
  ],

  part(
    "what",
    "What JavaScript does",
    explain(
      "A web page is built from three languages. HTML says what's on the page, CSS says how it looks, and [[javascript]] makes it **do** things: react to a click, check a form, load new notes, update what you see without reloading. JavaScript is a programming language: a list of instructions the computer follows, one after another.",
    ),
    diagram([
      ["HTML", "what's there: a button"],
      ["CSS", "how it looks: blue, rounded"],
      ["JavaScript", "what it does: saves the note"],
    ]),
    jsPlayground("Your first program: press Run", [
      'console.log("Hello!");',
      "console.log(2 + 3);",
      'console.log("2 + 3 is", 2 + 3);',
    ]),
    keyPoints(
      "HTML is the content, CSS the looks, JavaScript the behaviour.",
      "A program is instructions the computer follows in order.",
      "Change the code above and press Run: you can't break anything.",
    ),
  ),

  part(
    "where-it-runs",
    "Where JavaScript runs",
    explain(
      "Every browser has a JavaScript engine built in, so any web page can run JavaScript. The same language also runs outside the browser, on servers, using [[nodejs|Node.js]]. In this course you'll write both: browser code for the Notes App's pages and server code for its API.",
    ),
    reference("Places to run JavaScript", [
      [
        "This course's playgrounds",
        "Type and press Run. The easiest place to start.",
        "Every Try it box",
      ],
      [
        "The browser console",
        "Type a line, press Enter, see the answer.",
        "F12, then Console",
      ],
      [
        "A script on a page",
        "A file the HTML page loads.",
        '<script src="app.js"></script>',
      ],
      ["Node.js", "Runs a file on your computer or a server.", "node app.js"],
    ]),
    quickCheck(
      "Which is true?",
      [
        "JavaScript only runs inside web browsers",
        "JavaScript runs in browsers, and on servers with Node.js",
        "You must install JavaScript before a browser can use it",
      ],
      1,
      "Browsers have JavaScript built in, and Node.js runs the same language on servers.",
    ),
  ),

  part(
    "console-log",
    "Printing with console.log",
    explain(
      "[[console-log|`console.log()`]] prints whatever you put in its round brackets. It's how you see what your code is doing, and developers use it every day to check values while they work.",
    ),
    anatomy(
      "A console.log line",
      ['console.log("Total:", 2 + 3);'],
      [
        [
          "console",
          "object",
          "The console: the place messages are printed. In a browser it's in the developer tools.",
        ],
        [".log", "method", "The job to do: log (print) something."],
        ["(", "brackets open", "What to print goes inside."],
        ['"Total:"', "text", "Text goes in quotes and is printed as it is."],
        [
          ",",
          "separator",
          "Print several things: they appear with spaces between.",
        ],
        ["2 + 3", "sum", "Worked out first, so 5 is printed."],
        [")", "brackets close", "The end of what to print."],
        [";", "end", "Ends the instruction, like a full stop."],
      ],
    ),
    jsPlayground("Print different things", [
      'console.log("Text in quotes");',
      "console.log(42);",
      "console.log(10 * 3, 10 / 4);",
      'console.log("Notes:", 3, "Done:", 1);',
      'console.log("2 + 2"); // in quotes: printed as text',
    ]),
    quickCheck(
      'What does `console.log("5 + 5")` print?',
      ["`10`", "`5 + 5`: it's in quotes, so it's text", "Nothing"],
      1,
      "Quotes mean text, printed exactly as written. Without quotes, `5 + 5` is worked out to 10.",
    ),
  ),

  part(
    "how-code-runs",
    "How code runs: top to bottom",
    explain(
      "JavaScript runs one instruction (a **statement**) at a time, from the top line down. Each statement finishes before the next one starts. Press Next to watch it.",
    ),
    trace(
      "Three statements, in order",
      ['console.log("Start");', "console.log(6 * 7);", 'console.log("End");'],
      [
        {
          line: 1,
          note: 'The first statement runs: "Start" is printed.',
          output: "Start",
        },
        {
          line: 2,
          note: "Next, `6 * 7` is worked out to 42, and 42 is printed.",
          output: "Start\n42",
        },
        {
          line: 3,
          note: 'Last, "End" is printed. There are no more lines, so the program finishes.',
          output: "Start\n42\nEnd",
        },
      ],
    ),
    keyPoints(
      "A statement is one instruction; it usually ends with `;`.",
      "Statements run in order, from top to bottom.",
      "Each one finishes before the next one starts.",
      "Maths follows the usual rules: `2 + 3 * 4` is 14.",
    ),
  ),

  part(
    "comments",
    "Comments: notes for people",
    explain(
      "A **comment** is text JavaScript ignores. It's for people reading the code: why something is done, or a reminder. Comments are also handy for switching a line off while you test something.",
    ),
    reference("Two kinds of comment", [
      ["//", "To the end of the line.", "// greet the user"],
      [
        "/* … */",
        "Everything between, over several lines.",
        "/* several\n   lines */",
      ],
    ]),
    jsPlayground("Comments are skipped", [
      "// This line is a comment: nothing happens.",
      'console.log("This runs");',
      '// console.log("This is switched off");',
      'console.log("So does this"); // a note at the end of a line',
      "/*",
      '  console.log("Not this");',
      "*/",
    ]),
    keyPoints(
      "JavaScript skips comments completely.",
      "Explain *why*, not what: the code already says what.",
      "Put `//` in front of a line to switch it off for a moment.",
    ),
  ),

  part(
    "errors",
    "Reading an error message",
    explain(
      "Everyone's code breaks, all the time. When it does, JavaScript stops and prints an **error message** that says what went wrong and where. Reading it carefully is the fastest way to fix it, so don't panic: read it.",
    ),
    anatomy(
      "An error message",
      ["ReferenceError: mesage is not defined (line 2)"],
      [
        [
          "ReferenceError",
          "kind",
          "The kind of problem. ReferenceError: a name JavaScript doesn't know.",
        ],
        [
          "mesage",
          "the name",
          "The name it didn't recognise: a typo for `message`.",
        ],
        [
          "is not defined",
          "what's wrong",
          "In plain words: nothing has that name.",
        ],
        ["(line 2)", "where", "Which line to look at first."],
      ],
    ),
    reference("Errors you'll meet first", [
      [
        "SyntaxError",
        "The code isn't written correctly: a missing quote or bracket.",
        'console.log("Hi);',
      ],
      [
        "ReferenceError",
        "A name that doesn't exist, often a typo.",
        "consle.log(1);",
      ],
      ["TypeError", "Using a value in a way it can't be used.", "null.length"],
    ]),
    jsPlayground("Read the error, then fix it", [
      'console.log("Line 1 works");',
      'consol.log("Line 2 has a typo");',
      'console.log("Line 3 never runs");',
      "",
      "// Run it, read the error, fix line 2, run again.",
    ]),
  ),

  part(
    "browser-console",
    "The browser's console",
    explain(
      "Every browser has **developer tools**, and their Console tab runs JavaScript straight away: type a line, press Enter, and see the answer. It also shows the messages and errors from the page you're on, so it's the first place to look when a page misbehaves.",
    ),
    reference("Opening the console", [
      [
        "Windows / Linux",
        "Chrome, Edge or Firefox.",
        "F12, or Ctrl + Shift + J",
      ],
      ["Mac", "Chrome or Edge.", "Cmd + Option + J"],
      [
        "Mac Safari",
        "First turn on Develop in Settings → Advanced.",
        "Cmd + Option + C",
      ],
      ["Any browser", "Right-click the page.", "Inspect, then Console"],
    ]),
    keyPoints(
      "Try it now: open the console on this page and type `2 + 2`.",
      "Red messages are errors, with the file and line to click.",
      "Up arrow brings back the line you typed before.",
    ),
    analogy(
      "The console is a calculator and a message board in one: you can ask it quick questions, and the page posts its messages there.",
    ),
  ),

  part(
    "on-a-page",
    "JavaScript on a real page",
    explain(
      "A web page loads its JavaScript with a `<script>` tag. The usual way is a separate `.js` file, so the HTML stays tidy and the same file can be used by several pages.",
    ),
    code(
      "html",
      "an HTML page that loads app.js",
      [
        "<!doctype html>",
        "<html>",
        "  <body>",
        "    <h1>My notes</h1>",
        '    <script src="app.js"></script>',
        "  </body>",
        "</html>",
      ],
      {
        5: "loads and runs app.js; at the end of body so the page is there first",
      },
    ),
    code("js", "app.js", ['console.log("The page has loaded");'], {
      1: "printed in the browser's console when the page opens",
    }),
    keyPoints(
      '`<script src="app.js">` loads a JavaScript file.',
      "Put it at the end of `<body>` (or add `defer`) so the HTML loads first.",
      "In React apps like the Notes App, a build tool adds this tag for you.",
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Wrong capital letters",
      wrong: ['Console.Log("Hi");'],
      problem:
        "It throws `ReferenceError: Console is not defined`. JavaScript is case-sensitive: `Console` and `console` are different names.",
      right: ['console.log("Hi");'],
      why: "Copy names exactly, capitals included. Most built-in names start lowercase.",
    }),
    mistake({
      title: "A missing quote or bracket",
      wrong: ['console.log("Hi);'],
      problem:
        "It throws a `SyntaxError`: the text never ends, so JavaScript can't read the line, and nothing in the file runs.",
      right: ['console.log("Hi");'],
      why: "Every opening quote and bracket needs its closing partner. Editors colour them to help you spot a missing one.",
    }),
    mistake({
      title: "Quotes around a sum",
      wrong: ['console.log("6 * 7");'],
      problem: "It prints `6 * 7`, not 42. In quotes, it's just text.",
      right: ["console.log(6 * 7);"],
      why: "Quotes are for text. Leave them off when you want JavaScript to work something out.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    explain(
      "Each exercise stores a value with `const name = …;` so Check can read it. You'll learn exactly how that works in the next step; for now, change what's after the `=`.",
    ),
    yourTurn({
      title: "Minutes in a day",
      task: "Change `answer` so it works out the number of minutes in a day: 60 minutes times 24 hours. Let JavaScript do the maths.",
      starter: ["const answer = 0; // change 0"],
      tests: [
        ["answer", "1440"],
        ["typeof answer", '"number"'],
      ],
      hint: "Multiply with `*`: `60 * 24`.",
      solution: ["const answer = 60 * 24;"],
    }),
    yourTurn({
      title: "Fix the syntax error",
      task: 'This line has a `SyntaxError`. Fix it so `greeting` holds the text `"Hello, world!"`.',
      starter: ['const greeting = "Hello, world!;'],
      tests: [
        ["greeting", '"Hello, world!"'],
        ["greeting.length", "13"],
      ],
      hint: "Text needs a quote at the start and at the end.",
      solution: ['const greeting = "Hello, world!";'],
    }),
    yourTurn({
      title: "Fix the reference error",
      task: "Run it and read the error. Fix the second line so `result` is `total` times 2.",
      starter: ["const total = 5 + 5;", "const result = Total * 2;"],
      tests: [
        ["result", "20"],
        ["typeof result", '"number"'],
      ],
      hint: "The error says `Total is not defined`. Names are case-sensitive.",
      solution: ["const total = 5 + 5;", "const result = total * 2;"],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Getting started cheat sheet", [
      ["console.log()", "Print values.", 'console.log("Hi", 2 + 3);'],
      ['"text"', "Text goes in quotes.", '"Hello"'],
      ["+ - * /", "Maths, worked out first.", "6 * 7 // 42"],
      ["//", "A comment: skipped.", "// a note"],
      [
        "Error message",
        "Kind, what's wrong, which line.",
        "ReferenceError: x is not defined",
      ],
      [
        "Console",
        "Developer tools: run code, see errors.",
        "F12 or Cmd + Option + J",
      ],
    ]),
    quickCheck(
      "Your code stops with `ReferenceError: consol is not defined`. What's the likely fix?",
      [
        "Reinstall the browser",
        "Fix the typo: it should be `console`",
        "Add more comments",
      ],
      1,
      "A ReferenceError means a name JavaScript doesn't know, very often a typo. The message names it.",
    ),
  ),
);
