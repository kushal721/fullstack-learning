import type { GlossaryEntry } from "@fsl/shared";

// Glossary entries introduced by the "JavaScript" topic.
export const javascriptGlossary: GlossaryEntry[] = [
  {
    id: "js-variable",
    topicId: "javascript",
    term: "Variable",
    aliases: ["variables", "let", "const"],
    kind: "concept",
    short: "A named box that holds a value so your program can use it again.",
    body: '`const title = "Buy milk";` stores a value under a name; the `=` means “store”, not “is equal to”. `const` can never point at another value; `let` can be changed later. Values can be text, numbers or whole [[js-object-array|objects and arrays]].',
    conceptPageId: "js-variable",
  },
  {
    id: "js-function",
    topicId: "javascript",
    term: "Function",
    aliases: ["functions", "parameter", "argument", "call"],
    kind: "concept",
    short:
      "A named, reusable block of code that takes input, does a job and can hand back a result.",
    body: '`function greet(name) { … }` stores steps under a name; nothing runs until you call it with `greet("Sam")`. `name` is a parameter, `"Sam"` is the argument, and `return` hands a result back. [[js-arrow-function|Arrow functions]] are a shorter way to write one.',
    conceptPageId: "js-function",
  },
  {
    id: "js-arrow-function",
    topicId: "javascript",
    term: "Arrow function",
    aliases: ["arrow functions", "=>", "lambda"],
    kind: "concept",
    short:
      "A shorter way to write a function with `=>`, handy for small functions you pass to other code.",
    body: "`(n) => n * 2` takes `n` and returns `n * 2`. Arrow functions have no name, so you store one in a [[js-variable|variable]] or pass it straight in, for example as a click handler or to `map`. Otherwise they work like any [[js-function|function]].",
    conceptPageId: "js-arrow-function",
  },
  {
    id: "js-object-array",
    topicId: "javascript",
    term: "Objects and arrays",
    aliases: ["object", "array", "property", "index", "key"],
    kind: "concept",
    short:
      "The two ways JavaScript groups data: objects hold named values, arrays hold ordered lists.",
    body: 'An object, `{ id: 1, title: "Buy milk" }`, holds properties: names with values. An array, `["home", "shopping"]`, holds values in order, numbered from 0. Together they describe almost any data, and [[json]] is how they travel between browser and server.',
    conceptPageId: "js-object-array",
  },
  {
    id: "js-event",
    topicId: "javascript",
    term: "Event",
    aliases: ["events", "click", "submit", "event object"],
    kind: "concept",
    short:
      "A signal from the browser that something happened, such as a click, a key press or a form submit.",
    body: "Each event has a type like `click`, `submit` or `keydown`. The browser describes it in an event object, with details like `event.target` (where it happened), and hands that to any [[js-event-listener|listener]] waiting for it.",
    conceptPageId: "js-event",
  },
  {
    id: "js-event-listener",
    topicId: "javascript",
    term: "Event listener",
    aliases: ["addEventListener", "handler", "event handler", "listener"],
    kind: "concept",
    short:
      "A function you register on an element so the browser runs it every time an event happens there.",
    body: '`button.addEventListener("click", handler)` asks the browser to call `handler` on every click. The handler receives the [[js-event|event]] object; `event.preventDefault()` stops the browser\'s own reaction, such as a form reloading the page.',
    conceptPageId: "js-event-listener",
  },
  {
    id: "js-module-import-export",
    topicId: "javascript",
    term: "Modules (import and export)",
    aliases: ["module", "import", "export", "default export"],
    kind: "concept",
    short:
      "Splitting code into files that share functions and values with `export` and `import`.",
    body: 'Each file is a module. `export` marks what it shares; `import { getNotes } from "./notesApi.js"` brings it into another file. A file can also have one default export, imported without braces under any name. Packages from [[npm-packages|npm]] are imported the same way.',
    conceptPageId: "js-module-import-export",
  },
  {
    id: "js-promise",
    topicId: "javascript",
    term: "Promise",
    aliases: ["promises", "pending", "fulfilled", "rejected"],
    kind: "concept",
    short:
      "An object that stands for a result that isn't ready yet, such as a server's reply.",
    body: "[[js-fetch|fetch]] returns a promise at once, like a receipt. It is pending while waiting, then fulfilled with a value or rejected with an error, and never changes after that. [[js-async-await|async and await]] are the easiest way to wait for one.",
    analogy:
      "A buzzer at a café: you get it straight away, and it buzzes when your order is ready or can't be made.",
    conceptPageId: "js-promise",
  },
  {
    id: "js-async-await",
    topicId: "javascript",
    term: "async and await",
    aliases: ["async", "await", "async function"],
    kind: "concept",
    short:
      "Keywords that let you wait for promises in code that reads top to bottom, like ordinary steps.",
    body: "Put `async` before a function, then `await` in front of a [[js-promise|promise]] inside it: `const response = await fetch(url)`. The function pauses until the promise settles, then carries on with the value, or throws the error so [[js-error-handling|try and catch]] can handle it.",
    conceptPageId: "js-async-await",
  },
  {
    id: "js-fetch",
    topicId: "javascript",
    term: "fetch()",
    aliases: ["fetch", "fetch api"],
    kind: "concept",
    short:
      "The built-in function that sends an HTTP request and gives you a promise for the response.",
    body: "`fetch(url)` sends a [[http-get|GET]]; options set the method, headers and body. The response tells you how it went: `response.ok` is true for 2xx [[http-status-codes|status codes]], and `await response.json()` reads a [[json]] body.",
    conceptPageId: "js-fetch",
  },
  {
    id: "json",
    topicId: "javascript",
    term: "JSON",
    aliases: ["javascript object notation", "application/json"],
    kind: "concept",
    short:
      "A simple text format for data, used to send information between the browser and the server.",
    body: 'It looks like JavaScript [[js-object-array|objects and arrays]]: `{"title": "Shopping", "done": false}`. The rules are stricter: keys in double quotes, no functions, no comments. `JSON.stringify` turns data into JSON text and `JSON.parse` turns it back.',
    conceptPageId: "json",
  },
  {
    id: "js-error-handling",
    topicId: "javascript",
    term: "Error handling",
    aliases: ["try", "catch", "throw", "try/catch", "exception"],
    kind: "concept",
    short:
      "How code reports that something went wrong (throw) and how other code deals with it (try and catch).",
    body: '`throw new Error("Title is required")` stops the current function and passes the error up to its caller. `try { … } catch (error) { … }` catches it so you can show a message instead of crashing. With [[js-async-await|await]], a failed request is caught the same way.',
    conceptPageId: "js-error-handling",
  },
  {
    id: "typescript-why",
    topicId: "javascript",
    term: "TypeScript",
    aliases: ["ts", "why typescript", "tsc"],
    kind: "concept",
    short:
      "JavaScript with types added, so many mistakes are found while you write code instead of when it runs.",
    body: "Almost any JavaScript is valid TypeScript; you add [[typescript-types|types]] like `let count: number = 0`. The compiler, `tsc`, checks them before the code runs, then removes them, leaving plain JavaScript for browsers and [[nodejs|Node.js]].",
    conceptPageId: "typescript-why",
  },
  {
    id: "typescript-types",
    topicId: "javascript",
    term: "TypeScript types",
    aliases: ["type", "type alias", "types", "annotation"],
    kind: "concept",
    short:
      "The notation that describes what kind of value a variable, parameter or object holds.",
    body: "Write a type after a colon: `let count: number`, `function add(a: number, b: number): number`. `type Note = { id: number; title: string }` names a shape once so you can reuse it. [[typescript-why|TypeScript]] then warns whenever a value doesn't fit.",
    conceptPageId: "typescript-types",
  },
];
