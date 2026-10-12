import type { Concept } from "@fsl/shared";

export const jsFetch: Concept = {
  id: "js-fetch",
  slug: "js-fetch",
  title: "fetch()",
  topicId: "javascript",
  summary:
    "The built-in JavaScript function that sends an HTTP request to a server and gives you a promise for the response.",
  basics: [
    "The browser and the server are separate programs that talk by sending messages: the browser sends a request and the server sends back a response. HTTP is the set of rules for those messages. Each request has a method (GET to read, POST to create), a URL, headers and sometimes a body.",
    "Headers are short labels sent with a message, like `Content-Type: application/json`, which says what kind of data the body contains. The body is the data itself.",
    'JSON is a text format for data that looks like a JavaScript object: `{ "title": "Shopping" }`. Requests and responses are text, so objects are turned into JSON text before sending and back into objects after receiving.',
    "A response takes time to arrive, so `fetch()` does not return it directly. It returns a promise, an object that is fulfilled with the response when it arrives; you wait for it with `await`.",
  ],
  what: [
    "`fetch(url, options)` sends a request and returns a promise for a `Response` object. With only a URL it sends a GET request; the optional `options` object sets the `method`, `headers`, `body` and `credentials`.",
    "The `Response` tells you how it went: `response.status` is the status code (such as `200` or `404`) and `response.ok` is `true` for codes from 200 to 299. Reading the body takes another wait: `await response.json()` turns the JSON text into a JavaScript object.",
  ],
  why: [
    "A page that cannot talk to a server can only show what was in it when it loaded. `fetch()` lets it load notes, save new ones and log in without reloading the whole page.",
    "It is built into every modern browser and into Node.js, so you need no extra library, and because it returns promises it works naturally with `async` and `await`.",
  ],
  howItWorks: [
    'For a GET request you only pass a URL: `await fetch("/api/notes")`. For a POST you also pass `method: "POST"`, a `body` made with `JSON.stringify(data)`, and the header `Content-Type: application/json` so the server knows how to read the body.',
    "The promise from `fetch()` is fulfilled as soon as the response headers arrive, whatever the status code. A `404 Not Found` or `500 Server Error` is still a fulfilled promise; you must check `response.ok` yourself and throw an error if it is `false`.",
    "The promise is only rejected when no response arrives at all: the network is down, the server cannot be reached, or the browser blocked the request. That is the only time `fetch()` throws on its own.",
    'Browsers only send cookies on cross-origin requests if you set `credentials: "include"`. Cookies are small pieces of data the server asked the browser to keep, such as the login session, and the server needs them to know who is asking.',
  ],
  basicExample: {
    language: "js",
    code: `async function addTodo() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Buy milk", completed: false }),
  });

  if (!response.ok) {
    throw new Error("Request failed with status " + response.status);
  }

  const saved = await response.json();
  console.log(saved);
}`,
    caption:
      "A POST with a JSON body: send, check `response.ok`, then read the JSON the server sent back.",
  },
  internals: [
    "`fetch()` hands the request to the browser's networking code, which opens a connection, sends the method, URL, headers and body, and waits in the background. Your JavaScript keeps running in the meantime.",
    "The response arrives in two parts: first the status and headers, which fulfill the `fetch()` promise, then the body, which may still be streaming in. That is why `response.json()` is a second promise: it waits for the whole body and then parses it.",
    "The body can only be read once. After `response.json()` or `response.text()`, calling either again fails, so store the result in a variable.",
    "For security, the browser blocks reading responses from another origin (a different domain or port) unless that server allows it.",
  ],
  howToCreate: [
    {
      text: "Open an ordinary website such as `https://example.com` in your browser, open the developer console (F12 or Cmd+Opt+I) and send a GET request to a free public test API.",
      code: {
        language: "js",
        code: `const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");
console.log(response.status, response.ok);
const todo = await response.json();
console.log(todo);`,
      },
    },
    {
      text: "Now send a POST with a JSON body and the `Content-Type` header.",
      code: {
        language: "js",
        code: `const created = await fetch("https://jsonplaceholder.typicode.com/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Learn fetch", completed: false }),
});
console.log(created.status, await created.json());`,
      },
    },
    {
      text: "Request a URL that does not exist and notice that `fetch()` does not throw.",
      code: {
        language: "js",
        code: `const missing = await fetch("https://jsonplaceholder.typicode.com/todos/99999");
console.log(missing.status, missing.ok);`,
      },
    },
    {
      text: "Check that it worked: the first request logs `200 true` and a todo object, the POST logs `201` and your todo with a new `id`, and the missing one logs `404 false` without any error. Open the Network tab to see each request with its method, headers and body.",
    },
  ],
  whereUsed: [
    "Every time a frontend talks to its backend: loading a list, saving a form, logging in and out.",
    "Calling public APIs from the browser or from Node.js, which has `fetch()` built in since version 18.",
    "In larger apps, `fetch()` calls are usually collected in service files, so components call `createNote(note)` instead of building requests themselves.",
  ],
  connectsTo: [
    "HTTP methods such as GET and POST, and the status codes the server replies with.",
    "JSON, the format of the request and response bodies.",
    "Promises and `async`/`await`, which you use to wait for the response.",
    "Error handling, because you must turn a response that is not ok into a thrown error yourself.",
  ],
  projectUsage: [
    {
      explanation:
        '`frontend/src/services/notesApi.js` exports `getNotes`, `createNote`, `updateNote` and `deleteNote`. Each calls `fetch("/api/notes...", { credentials: "include", ... })`, checks `response.ok`, throws an `Error` with the server\'s message if it is false, and returns `await response.json()`.',
      fileId: "frontend/src/services/request.js",
      match: "const response = await fetch(path, {",
    },
    {
      explanation:
        '`credentials: "include"` makes the browser send the login cookie with every notes request, so the backend knows which user\'s notes to return. `authApi.js` uses `fetch()` the same way for logging in and registering.',
      fileId: "frontend/src/services/request.js",
      match: 'credentials: "include",',
    },
    {
      explanation:
        "`useNotes` calls `getNotes()` in a `useEffect` when the Dashboard loads, and `NoteForm` awaits `createNote()` when the user presses Save.",
      fileId: "frontend/src/hooks/useNotes.js",
      match: "getNotes()",
    },
  ],
  commonMistakes: [
    "Assuming an error status rejects the promise. `fetch()` resolves for `404` and `500` too, so always check `if (!response.ok)` and throw an error yourself.",
    'Sending an object as the body: `body: { title: "x" }` sends the text `[object Object]`. Use `body: JSON.stringify(data)` and the `Content-Type: application/json` header, or the server cannot read it.',
    "Forgetting `await` on `response.json()`, so you get a pending promise instead of the data.",
    'Leaving out `credentials: "include"` when the server relies on a login cookie, so it treats every request as logged out and answers `401 Unauthorized`.',
  ],
  relatedConcepts: [
    "js-promise",
    "js-async-await",
    "json",
    "http-post",
    "js-error-handling",
  ],
  relatedFiles: [],
  relatedBuildSteps: [],
};
