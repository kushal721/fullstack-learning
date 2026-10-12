import type { Concept } from "@fsl/shared";

export const jsAsyncAwait: Concept = {
  id: "js-async-await",
  slug: "js-async-await",
  title: "async and await",
  topicId: "javascript",
  summary:
    "Two keywords that let you write code that waits for promises from top to bottom, as if it were ordinary step-by-step code.",
  basics: [
    "Some work, like asking a server for data, takes time. JavaScript does not stop and wait for it; instead functions like `fetch()` return a promise, an object that will later be fulfilled with a value or rejected with an error.",
    "With `.then` and `.catch` you pass callbacks, functions that run later when the promise settles. Long chains of callbacks become hard to read, especially when one step needs the result of the previous one.",
    "An error is an object JavaScript creates when something goes wrong. `throw` raises one, and `try { ... } catch (error) { ... }` runs the code in `try` and jumps to `catch` if an error is thrown there.",
  ],
  what: [
    "`async` is a word you put before a function, like `async function loadTodo() {}`. It marks the function as one that may wait, and it makes the function always return a promise.",
    "`await` can be used inside an `async` function in front of a promise: `const response = await fetch(url)`. It pauses that function until the promise settles, then gives you the fulfilled value, or throws the error if it was rejected.",
  ],
  why: [
    "Code with `await` reads in the order it happens: get the response, then read its JSON, then use the data. Each result is stored in a normal variable, without nesting callbacks.",
    "Because a rejected promise becomes a thrown error, you can handle failures with the same `try/catch` you use for any other error, instead of a separate `.catch` chain.",
  ],
  howItWorks: [
    "When an `async` function reaches `await`, it pauses and hands control back to whoever called it. The rest of the program, and the page, keep running while the promise is pending.",
    "When the promise settles, the function continues from where it paused. If the promise was fulfilled, `await` evaluates to its value; if it was rejected, `await` throws its error at that line.",
    "Whatever an `async` function returns is wrapped in a promise, so `return 5` means the caller receives a promise fulfilled with `5`. A `throw` inside it means the caller receives a rejected promise. The caller must therefore `await` it too, or use `.then`.",
  ],
  basicExample: {
    language: "js",
    code: `async function loadTodo() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const todo = await response.json();
    console.log("Title:", todo.title);
  } catch (error) {
    console.log("Could not load:", error.message);
  }
}

loadTodo();`,
    caption:
      "Each `await` waits for one promise; if any of them fails, the code jumps to `catch`.",
  },
  internals: [
    "`async` and `await` are a more readable way to write promise code; they do not add any new kind of waiting. Each `await` is effectively a `.then` whose callback is the rest of the function.",
    "Pausing only affects the `async` function itself. Its local variables are saved, the JavaScript thread goes back to the event loop to handle clicks and other callbacks, and the function is resumed from the queue when its promise settles.",
    "Two `await`s in a row run one after the other. If two requests do not depend on each other, start both first and wait for both together with `await Promise.all([first, second])`, which is faster.",
  ],
  howToCreate: [
    {
      text: "Create `steps.mjs` with a helper that returns a promise fulfilled after a delay.",
      code: {
        language: "js",
        fileName: "steps.mjs",
        code: `function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}`,
      },
    },
    {
      text: "Add an `async` function that waits twice and then throws, and a second `async` function that calls it inside `try/catch`.",
      code: {
        language: "js",
        fileName: "steps.mjs",
        code: `async function makeTea() {
  console.log("Boiling water...");
  await wait(1000);
  console.log("Steeping...");
  await wait(1000);
  throw new Error("Out of milk");
}

async function main() {
  try {
    await makeTea();
    console.log("Tea is ready");
  } catch (error) {
    console.log("Problem:", error.message);
  }
}

main();
console.log("main() started, this line does not wait");`,
      },
    },
    {
      text: "Run it from a terminal in that folder.",
      code: {
        language: "bash",
        code: `node steps.mjs`,
      },
    },
    {
      text: "Check that it worked: `Boiling water...` and the line from the end of the file appear at once, `Steeping...` one second later, and `Problem: Out of milk` after another second. Remove the `await` before `makeTea()` and run it again: it prints `Tea is ready` straight away and two seconds later Node.js stops with an unhandled rejection, because `try/catch` only catches errors from promises you await. That is the forgotten-await mistake in action.",
    },
  ],
  whereUsed: [
    "Almost all modern code that talks to a server or a database: API functions in the frontend and route controllers in the backend.",
    "Event handlers that save data, such as a submit handler that waits for the server before clearing the form.",
  ],
  connectsTo: [
    "Promises, which are what `await` waits for and what `async` functions return.",
    "`fetch()`, whose response and JSON body are both read with `await`.",
    "Error handling with `try/catch` and `throw`.",
    "React event handlers and effects, which call `async` functions to load or save data.",
  ],
  projectUsage: [
    {
      explanation:
        "The `request()` function in `frontend/src/services/request.js` is `async`: it awaits `fetch()`, throws an `Error` with the server's message if the response is not ok, and returns the data from `await response.json()`.",
      fileId: "frontend/src/services/request.js",
      match: "const response = await fetch(path, {",
    },
    {
      explanation:
        "`NoteForm.jsx` has an `async` `handleSave` that does `await createNote(...)` inside `try/catch`. If saving fails, the `catch` block shows the error message to the user instead of letting it disappear.",
      fileId: "frontend/src/components/NoteForm.jsx",
      match: "const note = await createNote({ title, content });",
    },
    {
      explanation:
        "The backend controllers are `async` functions because database queries return promises; they `await` the query and then send the result with Express.",
      fileId: "backend/src/controllers/notesController.js",
      match: "export async function listNotes(req, res) {",
    },
  ],
  commonMistakes: [
    "Forgetting `await`: `const notes = getNotes();` stores a pending promise, not the notes, and errors from it are not caught by the surrounding `try/catch`. Write `const notes = await getNotes();`.",
    "Using `await` in a function that is not `async`, which is a syntax error. Add `async` to the function that contains the `await`.",
    "Expecting an `async` function to return a plain value. `async function getTotal() { return 5; }` returns a promise; the caller must `await getTotal()` to get `5`.",
    "Waiting in a row for independent work, like `await getNotes(); await getUser();`. Start both and use `await Promise.all([getNotes(), getUser()])` so they run at the same time.",
  ],
  relatedConcepts: [
    "js-promise",
    "js-fetch",
    "js-error-handling",
    "js-function",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
