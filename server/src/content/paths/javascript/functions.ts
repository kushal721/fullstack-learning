import {
  analogy,
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

// The first module: functions in depth. Why they exist, their parts, how a
// call runs, inputs and outputs, functions working together, scope, the
// ways to write one, where they're used, mistakes, practice and a recap.
export const functionsModule = moduleLesson(
  "functions",
  "Functions: reusable steps",
  40,
  [
    "Explain why functions exist and name the parts of one.",
    "Write a function with parameters, defaults and a `return` value.",
    "Follow what happens, line by line, when a function is called.",
    "Make functions work together, passing one result to the next.",
    "Tell `return` from `console.log`, and avoid the common mistakes.",
    "Write declarations and arrow functions, and know when to use each.",
  ],

  part(
    "why",
    "Why functions?",
    explain(
      "Say you greet three people, with a line of dashes above and below each greeting. You write the same three lines three times. Then the design changes, and you have to find and fix every copy, and you'll miss one. A [[js-function|function]] solves this: write the steps **once**, give them a name, and run them whenever you need them.",
    ),
    code("js", "without a function: the same lines, copied", [
      'console.log("----------");',
      'console.log("Hello, Sam!");',
      'console.log("----------");',
      'console.log("----------");',
      'console.log("Hello, Alex!");',
      'console.log("----------");',
    ]),
    jsPlayground("The same thing with a function", [
      "function greet(name) {",
      '  console.log("----------");',
      "  console.log(`Hello, ${name}!`);",
      '  console.log("----------");',
      "}",
      "",
      'greet("Sam");',
      'greet("Alex");',
      "// Change the dashes to stars once, then press Run.",
    ]),
    keyPoints(
      "Write the steps once; use them as often as you like.",
      "Change or fix them in one place.",
      "A good name says what the steps do: `greet`, `addTax`, `saveNote`.",
    ),
  ),

  part(
    "anatomy",
    "The parts of a function",
    anatomy(
      "A function declaration",
      ["function add(a, b) {", "  return a + b;", "}"],
      [
        ["function", "keyword", "Tells JavaScript you are making a function."],
        [
          "add",
          "name",
          "How you call it later. Use a verb that says what it does.",
        ],
        [
          "(a, b)",
          "parameters",
          "Named inputs: empty boxes that are filled in each time the function is called.",
        ],
        [
          "{",
          "body starts",
          "Everything between the curly braces is the function's steps.",
        ],
        [
          "return",
          "return",
          "Hands a value back to the code that called the function, and stops it.",
        ],
        ["a + b", "the result", "The value handed back: the two inputs added."],
        ["}", "body ends", "The function's steps end here."],
      ],
    ),
    analogy(
      "A recipe card: a name at the top, a list of ingredients (parameters), the method (the body), and the dish you hand over at the end (the return value).",
    ),
    quickCheck(
      "In `function area(width, height) { … }`, what are `width` and `height`?",
      [
        "The function's name",
        "Its parameters: the inputs it receives",
        "The values it returns",
      ],
      1,
      "Parameters are the named inputs, listed in round brackets after the name.",
    ),
  ),

  part(
    "make-one",
    "Making one, step by step",
    keyPoints(
      "1. Name it after its job: `toCelsius`.",
      "2. Decide what it needs to do that job: `fahrenheit`.",
      "3. Write the steps that work out the answer.",
      "4. `return` the answer.",
    ),
    code(
      "js",
      "the four steps, done",
      [
        "function toCelsius(fahrenheit) {",
        "  const celsius = (fahrenheit - 32) * 5 / 9;",
        "  return celsius;",
        "}",
      ],
      {
        1: "the name and the input",
        2: "the steps",
        3: "hand the answer back",
      },
    ),
    explain(
      "Writing a function doesn't run it: JavaScript only reads it and remembers it. Its steps run when you **call** it, by writing its name followed by round brackets: `toCelsius(212)`.",
    ),
    jsPlayground("Use it, then write your own", [
      "function toCelsius(fahrenheit) {",
      "  return (fahrenheit - 32) * 5 / 9;",
      "}",
      "",
      "console.log(toCelsius(212));",
      "console.log(toCelsius(50));",
      "",
      "// Now write toFahrenheit(celsius) below:",
      "// multiply by 9, divide by 5, then add 32.",
    ]),
  ),

  part(
    "calling",
    "What happens when you call it",
    explain(
      "At a call, JavaScript jumps into the function, fills each parameter with the value you passed (the **argument**), runs the body, then jumps back with the result. Press Next to watch it one move at a time.",
    ),
    trace(
      "Calling greet",
      [
        "function greet(name) {",
        "  const message = `Hi, ${name}!`;",
        "  return message;",
        "}",
        "",
        'const text = greet("Sam");',
        "console.log(text);",
      ],
      [
        {
          line: 1,
          note: "JavaScript reads the function and remembers it under the name `greet`. Nothing inside it runs yet.",
          vars: [["greet", "function"]],
          stack: ["main program"],
        },
        {
          line: 6,
          note: 'A call: `greet("Sam")`. Before anything can be stored in `text`, JavaScript has to work out the call.',
          vars: [["greet", "function"]],
          stack: ["main program"],
        },
        {
          line: 1,
          note: 'It jumps into `greet`. The parameter `name` is filled with the argument `"Sam"`.',
          vars: [["name", '"Sam"']],
          stack: ["main program", 'greet("Sam")'],
        },
        {
          line: 2,
          note: "The body runs: `message` is built from `name`.",
          vars: [
            ["name", '"Sam"'],
            ["message", '"Hi, Sam!"'],
          ],
          stack: ["main program", 'greet("Sam")'],
        },
        {
          line: 3,
          note: '`return` hands `"Hi, Sam!"` back and leaves the function. Its variables are thrown away.',
          vars: [
            ["name", '"Sam"'],
            ["message", '"Hi, Sam!"'],
          ],
          stack: ["main program", 'greet("Sam")'],
        },
        {
          line: 6,
          note: 'Back where it was called. The call is replaced by its result, so `text` is `"Hi, Sam!"`.',
          vars: [
            ["greet", "function"],
            ["text", '"Hi, Sam!"'],
          ],
          stack: ["main program"],
        },
        {
          line: 7,
          note: "Now `text` is printed.",
          vars: [
            ["greet", "function"],
            ["text", '"Hi, Sam!"'],
          ],
          stack: ["main program"],
          output: "Hi, Sam!",
        },
      ],
    ),
    quickCheck(
      "A function is written but never called. What happens?",
      [
        "Its steps run once when the page loads",
        "Nothing: its steps only run when it's called",
        "It runs over and over",
      ],
      1,
      "Writing a function only stores it. Calling it, with round brackets, runs it.",
    ),
  ),

  part(
    "parameters",
    "Parameters and arguments",
    reference("Inputs, in detail", [
      [
        "parameter",
        "A name in the definition: a box for an input.",
        "function greet(name) { … }",
      ],
      ["argument", "The actual value you pass in a call.", 'greet("Sam")'],
      [
        "several",
        "Separated by commas. They are filled in order.",
        "function area(width, height)",
      ],
      [
        "default",
        "Used when the argument is left out.",
        'function greet(name = "friend")',
      ],
      ["missing", "A missing argument is `undefined`.", "greet() // undefined"],
      ["extra", "Extra arguments are ignored.", 'greet("Sam", 42)'],
    ]),
    jsPlayground("Order and defaults", [
      "function describe(name, age = 30) {",
      "  return `${name} is ${age}`;",
      "}",
      "",
      'console.log(describe("Sam", 25));',
      'console.log(describe("Alex"));',
      'console.log(describe(25, "Sam"));',
    ]),
    quickCheck(
      "`function area(width, height)` is called as `area(5)`. What is `height`?",
      ["`0`", "`undefined`", "`5`"],
      1,
      "With no argument and no default, a parameter is `undefined`, and `5 * undefined` is `NaN`. Give it a default if it may be left out.",
    ),
  ),

  part(
    "return",
    "return versus console.log",
    explain(
      "This is the most common beginner mix-up. `console.log` only **shows** a value to you, the developer. [[js-return|`return`]] **hands it back** to the code that called the function, which can then store it, use it in a sum or pass it on. A function with no `return` gives back `undefined`.",
    ),
    mistake({
      title: "Logging instead of returning",
      wrong: [
        "function double(n) {",
        "  console.log(n * 2);",
        "}",
        "",
        "const result = double(4) + 1;",
        "console.log(result);",
      ],
      problem:
        "It prints 8 and then `NaN`. `double(4)` showed 8 but gave back `undefined`, and `undefined + 1` is `NaN`.",
      right: [
        "function double(n) {",
        "  return n * 2;",
        "}",
        "",
        "const result = double(4) + 1;",
        "console.log(result); // 9",
      ],
      why: "`return` gives the value to the caller. Log the result outside, where you want to see it.",
    }),
    jsPlayground("return also stops the function", [
      "function checkAge(age) {",
      "  if (age < 18) {",
      '    return "Too young";',
      "  }",
      '  return "Welcome";',
      '  console.log("This line never runs");',
      "}",
      "",
      "console.log(checkAge(12));",
      "console.log(checkAge(30));",
    ]),
    quickCheck(
      "What does calling `function f() { console.log(5); }` give back?",
      ["`5`", "`undefined`", '`"5"`'],
      1,
      "It prints 5, but it has no `return`, so the call gives back `undefined`.",
    ),
  ),

  part(
    "working-together",
    "Functions working together",
    explain(
      "Real programs are built from small functions that use each other. One function's result can be another's argument, and a function can call others inside its body. Each one does a single job, so each is easy to read, test and fix. Watch the order things happen in:",
    ),
    trace(
      "One result becomes the next input",
      [
        "function addTax(price) {",
        "  return price * 1.2;",
        "}",
        "",
        "function formatPrice(amount) {",
        '  return "£" + amount.toFixed(2);',
        "}",
        "",
        "const label = formatPrice(addTax(10));",
        "console.log(label);",
      ],
      [
        {
          line: 9,
          note: "To call `formatPrice`, JavaScript first needs its argument, which is another call: `addTax(10)`. The inner call runs first.",
          vars: [
            ["addTax", "function"],
            ["formatPrice", "function"],
          ],
          stack: ["main program"],
        },
        {
          line: 1,
          note: "Into `addTax`: `price` is 10.",
          vars: [["price", "10"]],
          stack: ["main program", "addTax(10)"],
        },
        {
          line: 2,
          note: "It returns `10 * 1.2`, which is 12.",
          vars: [["price", "10"]],
          stack: ["main program", "addTax(10)"],
        },
        {
          line: 9,
          note: "Back in the main program, `addTax(10)` has become 12, so now it can call `formatPrice(12)`.",
          vars: [
            ["addTax", "function"],
            ["formatPrice", "function"],
          ],
          stack: ["main program"],
        },
        {
          line: 5,
          note: "Into `formatPrice`: `amount` is 12.",
          vars: [["amount", "12"]],
          stack: ["main program", "formatPrice(12)"],
        },
        {
          line: 6,
          note: '`toFixed(2)` writes the number with two decimals, so it returns `"£12.00"`.',
          vars: [["amount", "12"]],
          stack: ["main program", "formatPrice(12)"],
        },
        {
          line: 9,
          note: 'Back again: `label` is `"£12.00"`.',
          vars: [
            ["addTax", "function"],
            ["formatPrice", "function"],
            ["label", '"£12.00"'],
          ],
          stack: ["main program"],
        },
        {
          line: 10,
          note: "The label is printed.",
          vars: [
            ["addTax", "function"],
            ["formatPrice", "function"],
            ["label", '"£12.00"'],
          ],
          stack: ["main program"],
          output: "£12.00",
        },
      ],
    ),
    code(
      "js",
      "a function that calls other functions",
      [
        "function priceLabel(price) {",
        "  const withTax = addTax(price);",
        "  return formatPrice(withTax);",
        "}",
        "",
        "console.log(priceLabel(10)); // £12.00",
      ],
      {
        2: "calls addTax and keeps its result",
        3: "passes it on, and returns what comes back",
      },
    ),
    keyPoints(
      "Inner calls run first: in `f(g(x))`, `g` runs, then `f`.",
      "A function can call other functions inside its body.",
      "The call stack tracks which function is running, and where to go back to.",
      "Small functions with one job are easier to test and reuse.",
    ),
  ),

  part(
    "local-variables",
    "Variables inside a function",
    explain(
      "Parameters, and variables made inside a function, are **local**: they exist only while it runs, and code outside can't see them. This is [[js-scope|scope]]. It means two functions can each have a variable called `total` without them clashing.",
    ),
    jsPlayground("Inside and outside", [
      'const shop = "Corner Shop";',
      "",
      "function receipt(price) {",
      "  const total = price * 2;",
      "  return `${shop}: £${total}`;",
      "}",
      "",
      "console.log(receipt(5));",
      "console.log(typeof total); // not visible out here",
    ]),
    quickCheck(
      "Can a function use a variable made *outside* it, like `shop` above?",
      [
        "No, never",
        "Yes: inner code sees outer variables, but not the other way round",
        "Only if it's a parameter",
      ],
      1,
      "A function can read the variables around it, but outside code can't see inside a function.",
    ),
    keyPoints(
      "Local: made inside a function, gone when it ends.",
      "A function can read variables from outside it.",
      "Prefer parameters in and `return` out to changing outside variables.",
    ),
  ),

  part(
    "ways-to-write",
    "Three ways to write a function",
    reference("The same function, written different ways", [
      [
        "declaration",
        "The classic form. Can be called before its line.",
        "function double(n) { return n * 2; }",
      ],
      [
        "expression",
        "A function stored in a variable.",
        "const double = function (n) { return n * 2; };",
      ],
      [
        "arrow",
        "The short form, for small functions.",
        "const double = (n) => n * 2;",
      ],
      [
        "arrow with braces",
        "With curly braces you need `return`.",
        "const double = (n) => { return n * 2; };",
      ],
    ]),
    explain(
      "[[js-arrow-function|Arrow functions]] are everywhere in modern code, especially for small functions handed to other code, such as the function to run on a click. A good habit: a declaration for a main, named job; an arrow for a small one.",
    ),
    jsPlayground("All three work the same way", [
      "function square(n) {",
      "  return n * n;",
      "}",
      "const cube = (n) => n * n * n;",
      "const half = function (n) {",
      "  return n / 2;",
      "};",
      "",
      "console.log(square(3), cube(3), half(3));",
    ]),
    quickCheck(
      "What does `const add = (a, b) => { a + b; };` give for `add(1, 2)`?",
      ["`3`", "`undefined`: with curly braces it needs `return`", "An error"],
      1,
      "Without braces, an arrow function returns its expression. With braces, it needs `return` like any other function.",
    ),
  ),

  part(
    "where-used",
    "Where you'll use functions",
    keyPoints(
      "Splitting a program into named jobs: `loadNotes`, `saveNote`.",
      "Reacting to the user: a function the browser runs on each click.",
      "Working with lists: a function applied to every item.",
      "Reusing logic, such as checking that a form is filled in.",
    ),
    code(
      "js",
      "a function the browser calls on each click",
      [
        "function sayHi() {",
        '  alert("Hi!");',
        "}",
        "",
        'const button = document.querySelector("button");',
        'button.addEventListener("click", sayHi);',
      ],
      {
        6: "pass `sayHi` itself, with no brackets: the browser calls it later",
      },
    ),
    inTheNotesApp(
      "The Notes App's `handleSave` is a function the form runs when it's submitted. It calls `createNote`, which calls `request`, which calls `fetch`: small functions, each doing one job.",
      { symbolId: "fn:handleSave" },
    ),
  ),

  part(
    "mistakes",
    "Common mistakes",
    mistake({
      title: "Forgetting the brackets",
      wrong: [
        "function getGreeting() {",
        '  return "Hello!";',
        "}",
        "",
        "console.log(getGreeting);",
      ],
      problem:
        'It prints the function itself, not `"Hello!"`. Without brackets you refer to the function instead of calling it.',
      right: [
        "function getGreeting() {",
        '  return "Hello!";',
        "}",
        "",
        "console.log(getGreeting());",
      ],
      why: "Brackets call the function. Leave them off only when you hand the function to other code to call later.",
    }),
    mistake({
      title: "Arguments in the wrong order",
      wrong: [
        "function divide(total, people) {",
        "  return total / people;",
        "}",
        "",
        "console.log(divide(4, 20)); // 0.2",
      ],
      problem:
        "Arguments fill parameters by position, not by name, so `total` got 4 and `people` got 20.",
      right: [
        "function divide(total, people) {",
        "  return total / people;",
        "}",
        "",
        "console.log(divide(20, 4)); // 5",
      ],
      why: "Pass arguments in the order of the parameters. Clear parameter names make the order easy to remember.",
    }),
    mistake({
      title: "Using a function's variable outside it",
      wrong: [
        "function makeTotal(price) {",
        "  const total = price * 2;",
        "}",
        "",
        "makeTotal(5);",
        "console.log(total);",
      ],
      problem:
        "`total` is local to `makeTotal`. Outside it there is no `total`, so this throws a ReferenceError.",
      right: [
        "function makeTotal(price) {",
        "  return price * 2;",
        "}",
        "",
        "const total = makeTotal(5);",
        "console.log(total);",
      ],
      why: "Return the value from the function, and store the result where you need it.",
    }),
  ),

  part(
    "practice",
    "Your turn",
    yourTurn({
      title: "Is it even?",
      task: "Write `isEven(n)` so that it returns `true` when `n` is even and `false` when it's odd.",
      starter: [
        "function isEven(n) {",
        "  // n % 2 is the remainder after dividing by 2",
        "}",
      ],
      tests: [
        ["isEven(4)", "true"],
        ["isEven(7)", "false"],
        ["isEven(0)", "true"],
      ],
      hint: "A number is even when the remainder after dividing by 2 is 0, so return `n % 2 === 0`.",
      solution: ["function isEven(n) {", "  return n % 2 === 0;", "}"],
    }),
    yourTurn({
      title: "Full name",
      task: 'Write `fullName(first, last)` so that it returns both names with a space between them, like `"Ada Lovelace"`.',
      starter: ["function fullName(first, last) {", "", "}"],
      tests: [
        ['fullName("Ada", "Lovelace")', '"Ada Lovelace"'],
        ['fullName("Sam", "Lee")', '"Sam Lee"'],
      ],
      hint: "Join them in a template literal with a space between, and `return` it.",
      solution: [
        "function fullName(first, last) {",
        "  return `${first} ${last}`;",
        "}",
      ],
    }),
    yourTurn({
      title: "Fix the bug",
      task: "`priceWithTax` should return the price plus 20% tax, but it gives back `undefined`. Fix it, and make the tax rate a second parameter, `rate`, that defaults to `0.2`.",
      starter: [
        "function priceWithTax(price) {",
        "  const total = price + price * 0.2;",
        "  console.log(total);",
        "}",
      ],
      tests: [
        ["priceWithTax(10)", "12"],
        ["priceWithTax(10, 0.5)", "15"],
        ["priceWithTax(0)", "0"],
      ],
      hint: "Two changes: `return` the total instead of logging it, and add the parameter `rate = 0.2` to use in place of `0.2`.",
      solution: [
        "function priceWithTax(price, rate = 0.2) {",
        "  return price + price * rate;",
        "}",
      ],
    }),
    yourTurn({
      title: "Functions working together",
      task: 'Write `average(a, b)` to return the mean of two numbers. Then write `result(a, b)`, which **uses `average`** and returns `"Pass"` when the average is 50 or more and `"Fail"` otherwise.',
      starter: [
        "function average(a, b) {",
        "",
        "}",
        "",
        "function result(a, b) {",
        "",
        "}",
      ],
      tests: [
        ["average(40, 60)", "50"],
        ["result(40, 60)", '"Pass"'],
        ["result(20, 30)", '"Fail"'],
      ],
      hint: "In `result`, call `average(a, b)` and keep its answer in a variable, then check it with an `if`.",
      solution: [
        "function average(a, b) {",
        "  return (a + b) / 2;",
        "}",
        "",
        "function result(a, b) {",
        "  const avg = average(a, b);",
        "  if (avg >= 50) {",
        '    return "Pass";',
        "  }",
        '  return "Fail";',
        "}",
      ],
    }),
  ),

  part(
    "recap",
    "Recap and cheat sheet",
    reference("Functions cheat sheet", [
      ["define", "A name, parameters and a body.", "function name(a, b) { … }"],
      ["call", "The name plus brackets runs it.", "name(1, 2)"],
      ["return", "Hands a value back and stops.", "return a + b;"],
      [
        "default",
        "Used if the argument is missing.",
        "function f(x = 1) { … }",
      ],
      ["arrow", "The short form.", "const f = (x) => x * 2;"],
      ["combine", "One result becomes the next input.", "format(addTax(10))"],
    ]),
    quickCheck(
      "Which of these is true?",
      [
        "A function runs as soon as it's written",
        "`return` hands a value to the caller; `console.log` only shows it",
        "Arguments fill parameters by name, not by position",
      ],
      1,
      "A function runs when it's called, arguments fill parameters in order, and `return` is how a function gives back a value.",
    ),
  ),
);
