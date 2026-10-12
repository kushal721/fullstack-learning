import type { Concept } from "@fsl/shared";

export const jsFunction: Concept = {
  id: "js-function",
  slug: "js-function",
  title: "Functions",
  topicId: "javascript",
  summary:
    "A named, reusable block of code that takes input, does a job and can hand back a result.",
  basics: [
    "A JavaScript program is a list of statements that run from top to bottom. Values such as text and numbers are stored in variables, which are names you give to values with `const` or `let`.",
    "Real programs repeat the same steps many times: format a date, check that a title is not empty, save a note. Copying those lines everywhere makes the code long, and a bug then has to be fixed in every copy.",
    "A function solves this. You write the steps once, give them a name, and run them whenever you need them just by using that name.",
  ],
  what: [
    "A function is a block of code with a name. You declare it with the `function` keyword, a name, a list of inputs in parentheses and the steps in curly braces: `function greet(name) { ... }`. Declaring it only stores the steps; nothing runs yet.",
    'The inputs listed in the declaration are called parameters — they are variables that exist only inside the function. The actual values you pass in when you run it are called arguments. Running a function is called calling it, and you do it by writing its name with parentheses: `greet("Sam")`.',
  ],
  why: [
    "Reuse: one function can be called from many places, so the logic lives in exactly one spot. Fix or improve it once and every caller benefits.",
    "Naming steps: a call like `validateNote(note)` tells the reader what happens without making them read every line. Large programs stay understandable because they are built from small, well-named functions.",
  ],
  howItWorks: [
    "When you call a function, JavaScript pauses where it is, creates the parameters as fresh variables, fills them with the arguments in order (first argument into first parameter, and so on) and runs the function body.",
    "The `return` keyword ends the function and sends a value back to the place where it was called. `const total = add(2, 3)` stores whatever `add` returned. A function without `return` gives back `undefined`.",
    "After the function finishes, its parameters and any variables declared inside it are thrown away, and the program continues from the line after the call.",
    "Functions are values, just like numbers and strings. You can store a function in a variable or pass it as an argument to another function. A function passed in to be called later is called a callback.",
  ],
  basicExample: {
    language: "js",
    code: `function add(a, b) {
  return a + b;
}

const total = add(2, 3);
console.log(total); // 5`,
    caption:
      "`a` and `b` are parameters; `2` and `3` are the arguments; `return` sends the result back into `total`.",
    highlightLines: [1, 2, 5],
  },
  internals: [
    "Each call gets its own fresh set of local variables. Calling `add(2, 3)` and then `add(10, 20)` does not mix them up, because every call starts from scratch.",
    "JavaScript keeps track of calls on a call stack: when a function calls another function, the new call goes on top of the stack, and when it returns, JavaScript goes back to the one below. Error messages show this stack so you can see which call led to the error.",
    'If you pass fewer arguments than there are parameters, the missing ones are `undefined`; extra arguments are ignored. JavaScript does not complain, so a forgotten argument often shows up later as `undefined` or `NaN` ("not a number").',
    "Functions declared with the `function` keyword are hoisted: JavaScript sets them up before running the file, so you can call one above the line where it is written.",
  ],
  howToCreate: [
    {
      text: "Create a file called `functions.js` and declare a function that takes a note title and returns a cleaned-up version of it.",
      code: {
        language: "js",
        fileName: "functions.js",
        code: `function cleanTitle(title) {
  const trimmed = title.trim(); // remove spaces at both ends
  return trimmed.toUpperCase();
}

console.log(cleanTitle("  buy milk  ")); // BUY MILK
console.log(cleanTitle("call mum")); // CALL MUM`,
      },
    },
    {
      text: "Add a function that takes another function as an argument — a callback — and calls it once for each title.",
      code: {
        language: "js",
        fileName: "functions.js",
        code: `function forEachTitle(titles, callback) {
  for (const title of titles) {
    callback(title);
  }
}

function printTitle(title) {
  console.log("Note:", cleanTitle(title));
}

forEachTitle(["read book", " walk dog "], printTitle);`,
      },
    },
    {
      text: "Run the file with Node.js in a terminal.",
      code: {
        language: "bash",
        code: `node functions.js`,
      },
    },
    {
      text: "Check the output: you should see `BUY MILK`, `CALL MUM`, then `Note: READ BOOK` and `Note: WALK DOG`. Notice that you passed `printTitle` without parentheses — you handed over the function itself, and `forEachTitle` decided when to call it.",
    },
  ],
  whereUsed: [
    "Every part of an app: validating input, formatting data, sending requests to the server, handling clicks.",
    "React components are functions that return what should be shown, and Express route handlers are functions that receive a request and send a response.",
    "Callbacks appear whenever something should happen later or once per item: event listeners, `setTimeout`, and array methods such as `map` and `filter`.",
  ],
  connectsTo: [
    "Variables: parameters are variables, and the returned value is usually stored in one.",
    "Arrow functions, a shorter way of writing functions that is popular for callbacks.",
    "Events: you give the browser a function to call when the user clicks or types.",
    "Async functions and promises, which let a function wait for slow work such as a network request.",
  ],
  projectUsage: [
    {
      explanation:
        "`createNote({ title, content })` in `frontend/src/services/notesApi.js` is a function: `NoteForm` calls it with the note as its argument, and it sends `POST /api/notes` with `fetch` so no component has to repeat that code.",
      fileId: "frontend/src/services/notesApi.js",
      match: "export function createNote({ title, content }) {",
    },
    {
      explanation:
        "In `NoteForm.jsx`, `handleSave(event)` is a function passed to the form as a callback; React calls it for you when the form is submitted.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "async function handleSave(event) {",
    },
    {
      explanation:
        "On the backend, `notesController.createNote(req, res)` is a function that Express calls with the request and response objects whenever `POST /api/notes` arrives.",
      fileId: "backend/src/controllers/notesController.js",
      match: "export async function createNote(req, res) {",
    },
  ],
  commonMistakes: [
    "Forgetting `return`, so the caller gets `undefined`. If a function should produce a value, make sure every path ends with `return value`.",
    'Calling a function when you meant to pass it: `button.addEventListener("click", save())` runs `save` immediately and passes its result. Pass the function itself: `addEventListener("click", save)`.',
    'Declaring a function and never calling it, then wondering why nothing happens. A declaration only stores the steps; add a call like `cleanTitle("x")`.',
    "Passing arguments in the wrong order. They fill parameters by position, not by name, so `add(price, quantity)` and `add(quantity, price)` may mean different things; check the declaration.",
  ],
  relatedConcepts: [
    "js-variable",
    "js-arrow-function",
    "js-event-listener",
    "js-async-await",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
