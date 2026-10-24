import type { LevelPlan } from "@fsl/shared";
import {
  code,
  explain,
  inTheNotesApp,
  jsPlayground,
  keyPoints,
  lesson,
  levelCheck,
  quickCheck,
  reference,
} from "../blocks.js";
import { functionsModule } from "./functions.js";

// Basic: steps 1–18. Values, variables, conditions, loops, functions,
// arrays and objects, then the page: finding elements, changing them and
// reacting to events. Most steps have code you can run.
export const basic: LevelPlan = {
  outcome:
    "Write small programs: store values, make decisions, repeat work, write functions and react to clicks.",
  steps: [
    lesson(
      "what-javascript-does",
      "What JavaScript does",
      3,
      explain(
        "[[javascript]] makes pages *do* things: react to a click, check a form, load new data, update what you see. It's a programming language: a list of instructions the browser follows, one after another.",
      ),
      explain(
        "[[console-log|`console.log()`]] prints a value so you can see it. Press Run, then change the text and run it again.",
      ),
      jsPlayground("Your first program", [
        'console.log("Hello!");',
        "console.log(2 + 3);",
        'console.log("2 + 3 is", 2 + 3);',
      ]),
    ),
    lesson(
      "values-and-types",
      "Values and their types",
      3,
      reference("The types you'll meet first", [
        ["string", "Text, in quotes.", '"Buy milk"'],
        ["number", "Whole or decimal numbers.", "42, 3.14"],
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
      ]),
      explain(
        "Each value's type decides what you can do with it ([[js-value|values and types]]): add numbers, join text, look inside objects.",
      ),
    ),
    lesson(
      "variables",
      "Variables: naming values",
      3,
      explain(
        "A [[js-variable|variable]] is a name for a value. `const` can never point at a new value; `let` can. Use `const` unless the value has to change.",
      ),
      jsPlayground("const and let", [
        'const name = "Sam";',
        "let count = 1;",
        "count = count + 1;",
        'console.log(name, "has", count, "notes");',
        '// Try: name = "Alex"; and run it.',
      ]),
      quickCheck(
        "A score goes up during a game. How do you declare it?",
        ["`const score = 0;`", "`let score = 0;`", "Either works"],
        1,
        "It changes, so `let`. `const` refuses a new value.",
      ),
    ),
    lesson(
      "strings",
      "Working with text",
      3,
      reference("Common string tools", [
        ["length", "How many characters.", '"milk".length // 4'],
        [
          "toUpperCase()",
          "A copy in capitals.",
          '"milk".toUpperCase() // "MILK"',
        ],
        [
          "trim()",
          "A copy without spaces at the ends.",
          '"  hi  ".trim() // "hi"',
        ],
        [
          "includes()",
          "Does it contain this text?",
          '"hello".includes("ell") // true',
        ],
        ["slice()", "A piece of it.", '"hello".slice(0, 2) // "he"'],
        [
          "`…${}…`",
          "A template literal: text with values inside.",
          "`Hi ${name}`",
        ],
      ]),
      jsPlayground("Try the string tools", [
        'const title = "  Buy milk  ";',
        "console.log(title.trim());",
        "console.log(title.trim().toUpperCase());",
        'console.log(title.includes("milk"));',
        'const user = "Sam";',
        "console.log(`Hello, ${user}!`);",
      ]),
      explain(
        "A [[js-string|string]] in backticks is a [[template-literal]]: `${}` drops a value into the text.",
      ),
    ),
    lesson(
      "numbers-and-maths",
      "Numbers and maths",
      3,
      reference("Arithmetic operators", [
        ["+ - * /", "Add, subtract, multiply, divide.", "7 / 2 // 3.5"],
        ["%", "The remainder after dividing.", "7 % 2 // 1"],
        ["**", "To the power of.", "2 ** 3 // 8"],
        ["++ / +=", "Add one, or add and store.", "count += 5;"],
        ["Number()", "Turn text into a number.", 'Number("42") // 42'],
        ["Math.round()", "Round to a whole number.", "Math.round(2.6) // 3"],
      ]),
      jsPlayground("Maths in JavaScript", [
        "console.log(7 / 2, 7 % 2, 2 ** 3);",
        'console.log("2" + 3);',
        'console.log(Number("2") + 3);',
        "console.log(0.1 + 0.2);",
      ]),
      quickCheck(
        'What does `"2" + 3` give?',
        ["`5`", '`"23"`', "An error"],
        1,
        "With a [[js-string|string]] on one side, `+` joins text. Turn it into a [[js-number|number]] first with `Number()`.",
      ),
    ),
    lesson(
      "comparisons",
      "Comparing values",
      4,
      reference("Comparison and logic", [
        [
          "===",
          "Same value and same type.",
          '3 === 3 // true; 3 === "3" // false',
        ],
        ["!==", "Not the same.", "a !== b"],
        ["> < >= <=", "Bigger, smaller.", "age >= 18"],
        ["&&", "Both true (and).", "isAdult && hasTicket"],
        ["||", "At least one true (or).", "isAdmin || isOwner"],
        ["!", "The opposite (not).", "!done"],
      ]),
      jsPlayground("Truthy, falsy and ===", [
        'console.log(3 === "3", 3 == "3");',
        'console.log(Boolean(""), Boolean("hi"));',
        "console.log(Boolean(0), Boolean([]));",
        "const done = false;",
        "console.log(!done);",
      ]),
      quickCheck(
        "Which values count as false in a condition?",
        [
          '`0`, `""`, `null` and `undefined` (and a few more)',
          "Only `false`",
          "Every number",
        ],
        0,
        "These are [[truthy-falsy|falsy]]. Always compare with [[js-operator|`===`]], which checks the type too.",
      ),
    ),
    lesson(
      "if-else",
      "Making decisions: if and else",
      3,
      explain(
        "[[js-condition|`if`]] runs code only when a condition is true; `else` runs when it isn't.",
      ),
      jsPlayground("Change the hour and run it", [
        "const hour = 14;",
        "",
        "if (hour < 12) {",
        '  console.log("Good morning");',
        "} else if (hour < 18) {",
        '  console.log("Good afternoon");',
        "} else {",
        '  console.log("Good evening");',
        "}",
      ]),
      keyPoints(
        "Conditions go in round brackets, code in curly ones.",
        "Only the first true branch runs.",
        "`else` is optional.",
      ),
    ),
    lesson(
      "loops",
      "Repeating: loops",
      3,
      reference("Kinds of loop", [
        [
          "for…of",
          "Once for each item of an array.",
          "for (const note of notes) { … }",
        ],
        ["for", "With a counter.", "for (let i = 0; i < 3; i++) { … }"],
        ["while", "As long as a condition is true.", "while (count > 0) { … }"],
        ["break", "Leave the loop early.", "if (found) break;"],
      ]),
      jsPlayground("Loop over a list", [
        'const notes = ["Milk", "Bread", "Eggs"];',
        "for (const note of notes) {",
        '  console.log("-", note);',
        "}",
        "for (let i = 3; i > 0; i--) {",
        "  console.log(i);",
        "}",
      ]),
      quickCheck(
        "Which loop is easiest for doing something to every item in an array?",
        ["`while`", "`for…of`", "`if`"],
        1,
        "[[js-loop|`for…of`]] gives you each item in turn, with no counter to manage.",
      ),
    ),
    functionsModule,
    lesson(
      "arrays",
      "Arrays: lists of values",
      3,
      explain(
        "An array is a list in square brackets. Items are numbered from 0. See [[js-object-array|objects and arrays]].",
      ),
      reference("Array basics", [
        ["[i]", "The item at position i, from 0.", "notes[0]"],
        ["length", "How many items.", "notes.length"],
        ["push()", "Add to the end.", 'notes.push("Tea")'],
        ["includes()", "Is it in the list?", 'notes.includes("Milk")'],
        [
          "indexOf()",
          "Where is it? -1 if not there.",
          'notes.indexOf("Bread")',
        ],
      ]),
      jsPlayground("Make a list", [
        'const notes = ["Milk", "Bread"];',
        'notes.push("Eggs");',
        "console.log(notes);",
        "console.log(notes.length, notes[0]);",
        'console.log(notes.includes("Tea"));',
      ]),
    ),
    lesson(
      "array-methods",
      "Array methods: map, filter, find",
      4,
      reference("Array methods you'll use daily", [
        [
          "map()",
          "A new array with each item changed.",
          "prices.map((p) => p * 2)",
        ],
        [
          "filter()",
          "A new array with only matching items.",
          "notes.filter((n) => n.done)",
        ],
        ["find()", "The first matching item.", "notes.find((n) => n.id === 7)"],
        [
          "forEach()",
          "Do something with each item.",
          "notes.forEach((n) => console.log(n))",
        ],
        ["some()", "Does any item match?", "notes.some((n) => n.done)"],
        ["join()", "One string from all items.", 'tags.join(", ")'],
      ]),
      jsPlayground("Transform a list", [
        "const notes = [",
        '  { title: "Milk", done: true },',
        '  { title: "Bread", done: false },',
        '  { title: "Eggs", done: true },',
        "];",
        "console.log(notes.map((n) => n.title));",
        "console.log(notes.filter((n) => n.done).length);",
        'console.log(notes.find((n) => n.title === "Bread"));',
      ]),
      quickCheck(
        "You want a list of only the unfinished notes. Which method?",
        ["`map`", "`filter`", "`find`"],
        1,
        "[[array-methods|`filter`]] keeps the items its function returns true for.",
      ),
    ),
    lesson(
      "objects",
      "Objects: named values",
      3,
      explain(
        'An object groups named values, called properties: `{ title: "Milk", done: false }`. Read and change them with a dot.',
      ),
      jsPlayground("Make and change an object", [
        "const note = {",
        '  title: "Milk",',
        "  done: false,",
        '  tags: ["shopping"],',
        "};",
        "note.done = true;",
        "console.log(note.title, note.done);",
        "console.log(note);",
      ]),
      quickCheck(
        "How do you read the `title` of `note`?",
        ["`note[title]`", "`note.title`", "`title.note`"],
        1,
        'Dot notation reads a property. `note["title"]` also works, with quotes.',
      ),
    ),
    lesson(
      "finding-elements",
      "Finding elements on the page",
      3,
      explain(
        "In the browser, JavaScript reaches the page through `document`. [[dom-query|Finding elements]] uses the same selectors as CSS.",
      ),
      reference("Finding elements", [
        [
          "querySelector()",
          "The first element matching a CSS selector.",
          'document.querySelector(".note")',
        ],
        [
          "querySelectorAll()",
          "All matches, as a list.",
          'document.querySelectorAll("li")',
        ],
        [
          "getElementById()",
          "The element with that id.",
          'document.getElementById("title")',
        ],
      ]),
      code(
        "js",
        "find a heading and read its text",
        [
          'const heading = document.querySelector("h1");',
          "console.log(heading.textContent);",
        ],
        { 1: "same selector as in CSS" },
      ),
    ),
    lesson(
      "changing-the-page",
      "Changing the page",
      3,
      reference("Changing elements", [
        [
          "textContent",
          "Read or replace the text.",
          'el.textContent = "Saved";',
        ],
        [
          "classList",
          "Add, remove or toggle classes.",
          'el.classList.add("done");',
        ],
        [
          "setAttribute()",
          "Set an attribute.",
          'img.setAttribute("alt", "A cat");',
        ],
        [
          "createElement()",
          "Make a new element.",
          'const li = document.createElement("li");',
        ],
        ["append()", "Put it inside another.", "list.append(li);"],
        ["remove()", "Take it off the page.", "el.remove();"],
      ]),
      code(
        "js",
        "add a note to a list",
        [
          'const list = document.querySelector("#notes");',
          'const item = document.createElement("li");',
          'item.textContent = "Buy milk";',
          "list.append(item);",
        ],
        { 2: "a new <li>, not on the page yet", 4: "now it appears" },
      ),
      quickCheck(
        "Why prefer `textContent` to `innerHTML` for text someone typed?",
        [
          "It's faster to type",
          "It never turns the text into HTML, so it can't run a hidden script",
          "It keeps the formatting",
        ],
        1,
        "[[dom-manipulation|`textContent`]] treats everything as plain text, which stops cross-site scripting.",
      ),
    ),
    lesson(
      "events",
      "Reacting to the user: events",
      3,
      explain(
        "When something happens, like a click, the browser sends an [[js-event|event]]. An [[js-event-listener|event listener]] is a function you ask it to run each time.",
      ),
      code(
        "js",
        "count the clicks",
        [
          'const button = document.querySelector("button");',
          "let clicks = 0;",
          'button.addEventListener("click", () => {',
          "  clicks++;",
          "  button.textContent = `Clicked ${clicks} times`;",
          "});",
        ],
        { 3: "the event type and the function to run", 5: "update the page" },
      ),
      quickCheck(
        'In `addEventListener("click", save)`, when does `save` run?',
        [
          "Straight away",
          "Every time the element is clicked",
          "Once, on the first click",
        ],
        1,
        "The browser calls the listener on every click; you pass the function, not its result.",
      ),
    ),
    lesson(
      "form-events",
      "Forms and the event object",
      3,
      explain(
        "The listener receives an event object with details. For a form's `submit` event, `event.preventDefault()` stops the page reloading so your code can send the data itself.",
      ),
      inTheNotesApp(
        "The Notes App's `handleSave` starts with `event.preventDefault()`, then sends the note to the API.",
        { symbolId: "fn:handleSave" },
      ),
      quickCheck(
        "What does `event.preventDefault()` do on a form's submit?",
        [
          "Stops the browser's normal reload, so your code handles it",
          "Deletes the form",
          "Clears the fields",
        ],
        0,
        "The browser's default for submit is to send the form and reload; preventing it hands control to your code.",
      ),
    ),
    lesson(
      "callbacks",
      "Callbacks: functions you pass on",
      3,
      explain(
        "A [[callback]] is a function you hand to other code to call later: an event listener, the function in `map`, or a timer.",
      ),
      jsPlayground("Code that runs later", [
        'console.log("1. Start");',
        "setTimeout(() => {",
        '  console.log("3. One second later");',
        "}, 1000);",
        'console.log("2. Carry on straight away");',
      ]),
      keyPoints(
        "Pass the function itself: `save`, not `save()`.",
        "The other code decides when to call it.",
        "This is how JavaScript waits without stopping.",
      ),
    ),
    levelCheck("basic-check", "Basic check", [
      ["js-basic-const", "variables"],
      ["js-basic-plus", "numbers-and-maths"],
      ["js-basic-equals", "comparisons"],
      ["js-basic-return", "functions"],
      ["js-basic-filter", "array-methods"],
      ["js-basic-listener", "events"],
    ]),
  ],
};
