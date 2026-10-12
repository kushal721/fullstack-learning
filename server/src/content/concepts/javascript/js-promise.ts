import type { Concept } from "@fsl/shared";

export const jsPromise: Concept = {
  id: "js-promise",
  slug: "js-promise",
  title: "Promises",
  topicId: "javascript",
  summary:
    "An object that stands for a result that is not ready yet, such as a server's reply, and lets you say what to do once it arrives or fails.",
  basics: [
    "Most code runs synchronously: each line finishes before the next one starts. `const total = 2 + 3` is done instantly, so the next line can use `total` straight away.",
    "Some work takes time and happens outside your code: asking a server for data over the network, reading a file, or querying a database. This is called asynchronous work, because the answer arrives later, not in step with your code.",
    "JavaScript in the browser runs on a single thread, meaning it can only do one thing at a time. If it simply stopped and waited a second for a server, the page would freeze: no clicks, no scrolling, no typing.",
  ],
  what: [
    "A promise is an object that represents the future result of asynchronous work. Functions like `fetch()` return a promise immediately, before the work is done, as a kind of receipt.",
    "A promise is always in one of three states. Pending means still waiting. Fulfilled means it finished successfully and has a value. Rejected means it failed and has an error. Once it is fulfilled or rejected it is settled and never changes again.",
  ],
  why: [
    "Promises let your code start slow work and carry on, so the page stays responsive while the server is thinking. You do not wait; you register what should happen later.",
    "They give success and failure one standard shape. Every library, from `fetch()` in the browser to database drivers in Node.js, returns promises, so you handle all of them the same way.",
  ],
  howItWorks: [
    "You call `.then(callback)` on a promise to say what to do with the value when it is fulfilled. `.then` itself returns a new promise, so you can chain steps: get the response, then read its JSON, then use the data.",
    "You call `.catch(callback)` to handle a rejection. An error in any earlier step of the chain skips the remaining `.then` steps and jumps to the nearest `.catch`.",
    "You can make your own promise with `new Promise((resolve, reject) => { ... })`. Calling `resolve(value)` fulfills it and calling `reject(error)` rejects it.",
  ],
  basicExample: {
    language: "js",
    code: `console.log("1. Asking the server...");

fetch("https://jsonplaceholder.typicode.com/todos/1")
  .then((response) => response.json())
  .then((todo) => console.log("3. Got:", todo.title))
  .catch((error) => console.log("Failed:", error.message));

console.log("2. Not waiting, still running");`,
    caption:
      "The logs appear in the order 1, 2, 3: the code after `fetch()` runs immediately, and the `.then` callback runs later when the reply arrives.",
  },
  internals: [
    "The waiting itself is not done by JavaScript. The browser (or Node.js) handles the network request in the background, while your JavaScript thread is free to run other code and respond to the user.",
    "When the reply arrives, the promise is fulfilled and its `.then` callback is put in a queue. The event loop is the browser's routine that, whenever the current code has finished running, takes the next waiting callback from the queue and runs it.",
    "That is why `.then` callbacks never run in the middle of other code. Even a promise that is already fulfilled runs its callback only after the current code has finished, which keeps the order predictable.",
  ],
  howToCreate: [
    {
      text: "Create `wait.mjs` with a function that returns a promise which fulfills after a delay. `setTimeout` asks the runtime to call a function after some milliseconds.",
      code: {
        language: "js",
        fileName: "wait.mjs",
        code: `function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("waited " + ms + " ms"), ms);
  });
}`,
      },
    },
    {
      text: "Below it, add a function that rejects, and use both with `.then` and `.catch`.",
      code: {
        language: "js",
        fileName: "wait.mjs",
        code: `function failLater() {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error("Server unavailable")), 500);
  });
}

console.log("Start");
wait(1000).then((message) => console.log("Done:", message));
failLater().catch((error) => console.log("Caught:", error.message));
console.log("End of file");`,
      },
    },
    {
      text: "Run it from a terminal in that folder.",
      code: {
        language: "bash",
        code: `node wait.mjs`,
      },
    },
    {
      text: "Check that it worked: you see `Start` and `End of file` immediately, then `Caught: Server unavailable` after half a second, then `Done: waited 1000 ms` after one second. Nothing blocked while the timers were pending.",
    },
  ],
  whereUsed: [
    "Anything that talks to something outside your code: `fetch()` requests in the browser, database queries and file reads on the server.",
    "Most of the time you do not write `.then` yourself but use `async` and `await`, which are a more readable way to work with the same promises.",
  ],
  connectsTo: [
    "`async` and `await`, which are built on promises.",
    "`fetch()`, which returns a promise for the server's response.",
    "Error handling, because a rejected promise carries an `Error` that must be caught.",
    "Functions and arrow functions, which you pass to `.then` and `.catch` as callbacks.",
  ],
  projectUsage: [
    {
      explanation:
        "Every function in `frontend/src/services/notesApi.js` returns a promise, because it returns the result of the `async` `request()` function, which waits for `fetch()`. Callers such as `useNotes` and `NoteForm` wait for those promises before updating the screen.",
      fileId: "frontend/src/services/request.js",
      match:
        'export async function request(path, { method = "GET", body } = {}) {',
    },
    {
      explanation:
        "On the backend, the database queries return promises, which is why the Express controllers are `async` and `await` the query results before sending a response.",
      fileId: "backend/src/controllers/notesController.js",
      match: "export async function listNotes(req, res) {",
    },
  ],
  commonMistakes: [
    "Using the result as if it were already there: `const data = fetch(url); console.log(data.title)` logs `undefined` because `data` is a pending promise. Use the value inside `.then` or with `await`.",
    "Forgetting `.catch`, so a failed request becomes an unhandled promise rejection and the user sees nothing. End every chain with `.catch` or wrap `await` in `try/catch`.",
    "Forgetting to `return` inside a `.then` with braces: `.then((r) => { r.json(); })` passes `undefined` to the next step. Write `return r.json();` or use the short form `.then((r) => r.json())`.",
    "Expecting code after the promise to wait for it. Lines after `.then(...)` run immediately; anything that needs the value must go inside the callback.",
  ],
  relatedConcepts: [
    "js-async-await",
    "js-fetch",
    "js-error-handling",
    "js-arrow-function",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
