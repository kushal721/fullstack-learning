import type { Concept } from "@fsl/shared";

export const httpPost: Concept = {
  id: "http-post",
  slug: "http-post",
  title: "HTTP POST",
  topicId: "http",
  summary:
    "The HTTP method a browser uses to send new data to a server, such as a note to be saved.",
  basics: [
    "The browser and the server are two separate programs, usually on different computers. They talk by sending messages over the network: the browser sends a request and the server sends back a response.",
    "HTTP is the set of rules both sides follow for those messages. Every request names an action (the method) and a target (the path, like `/api/notes`).",
    'Data sent between them is usually written as JSON, text that looks like a JavaScript object: `{ "title": "Shopping" }`.',
  ],
  what: [
    'POST is the HTTP method for creating something new on the server. A request like `POST /api/notes` means "here is a new note — please store it".',
    "Unlike GET, which only asks for data, a POST request carries data in its body, and it changes something on the server.",
  ],
  why: [
    "The browser cannot save a note permanently by itself, and it should never talk to the database directly — anyone can change code running on their own computer. It has to ask the server, which checks the request and stores the data safely.",
    "Using the right method tells everyone — the server, browsers, caches and other developers — what the request does: POST creates, GET reads, PUT/PATCH change, DELETE removes.",
  ],
  howItWorks: [
    "The client builds a request with the method `POST`, the path, headers and a body. The `Content-Type: application/json` header tells the server the body is JSON.",
    "The server receives it, finds the code for `POST /api/notes`, reads and validates the body, and saves the data.",
    "The server replies with a status code — `201 Created` when it worked, `400 Bad Request` if the data was invalid, `401 Unauthorized` if the user is not logged in — and usually the saved item as JSON, including the `id` the database gave it.",
  ],
  basicExample: {
    language: "http",
    code: `POST /api/notes HTTP/1.1
Host: notes.example.com
Content-Type: application/json

{ "title": "Shopping", "content": "Milk and bread" }

HTTP/1.1 201 Created
Content-Type: application/json

{ "id": 42, "title": "Shopping", "content": "Milk and bread" }`,
    caption:
      "The request (top) creates a note; the response (bottom) confirms it and returns the stored note with its new id.",
  },
  internals: [
    "Before the request is sent, `fetch()` turns your JavaScript object into text with `JSON.stringify` — the body of an HTTP message is always text or bytes.",
    "The request travels over the network (encrypted with HTTPS on a real site). The server reads the headers first, then the body; Express's `express.json()` middleware turns the JSON text back into an object at `req.body`.",
    "Sending the same POST twice usually creates two items. That is why a Save button should not be double-submitted, and why POST is not retried automatically the way GET can be.",
  ],
  howToCreate: [
    {
      text: "In a new folder, create a project that uses ES modules (`import`) and install Express.",
      code: {
        language: "bash",
        code: `npm init -y
npm pkg set type=module
npm install express`,
      },
    },
    {
      text: "Create `server.js`.",
      code: {
        language: "js",
        fileName: "server.js",
        code: `import express from "express";
const app = express();
app.use(express.json()); // turns the JSON body into req.body

const notes = [];

app.post("/api/notes", (req, res) => {
  const { title, content } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const note = { id: notes.length + 1, title, content };
  notes.push(note);
  res.status(201).json(note);
});

app.listen(3000, () => console.log("http://localhost:3000"));`,
      },
    },
    {
      text: "Start it with `node server.js`, then send a POST from a second terminal with curl.",
      code: {
        language: "bash",
        code: `curl -i -X POST http://localhost:3000/api/notes \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Shopping","content":"Milk"}'`,
      },
    },
    {
      text: "You should see `HTTP/1.1 201 Created` and the note with `\"id\":1`. Send it without a title (`-d '{}'`) and you get `400` with the error message instead.",
    },
    {
      text: "From a browser, the same request is made with `fetch()`.",
      code: {
        language: "js",
        code: `const response = await fetch("/api/notes", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Shopping", content: "Milk" }),
});
const note = await response.json();`,
      },
    },
  ],
  whereUsed: [
    "Creating things: registering a user, saving a new note, adding a comment.",
    "Actions that send data without creating a visible item, such as logging in (`POST /api/auth/login`) — the password must travel in the body, never in the URL.",
  ],
  connectsTo: [
    "The form and button that start the action in the browser.",
    "`fetch()` (or another HTTP client) that sends the request.",
    "An Express route on the server (`router.post(...)`) and the controller that validates and saves the data.",
    "An SQL `INSERT` that stores the new row in the database.",
  ],
  projectUsage: [
    {
      explanation:
        '`createNote()` in `frontend/src/services/notesApi.js` sends `POST /api/notes` with the title and content as JSON through `request()`, which includes the login cookie (`credentials: "include"`).',
      fileId: "frontend/src/services/notesApi.js",
      match: "export function createNote({ title, content }) {",
    },
    {
      explanation:
        "On the backend, `routes/notes.js` maps `POST /api/notes` to `notesController.createNote`, which validates the note, runs a parameterized `INSERT` and answers `201 Created` with the saved note.",
      fileId: "backend/src/routes/notes.js",
      match: 'notesRoutes.post("/", notesController.createNote);',
    },
    {
      explanation:
        "Registering and logging in also use POST: `POST /api/auth/register` and `POST /api/auth/login`.",
      fileId: "backend/src/routes/auth.js",
      match: 'authRoutes.post("/register", authController.register);',
    },
  ],
  commonMistakes: [
    "Forgetting the `Content-Type: application/json` header, so the server doesn't parse the body and `req.body` is empty.",
    "Sending a JavaScript object as the body instead of `JSON.stringify(object)`.",
    "Using GET to create or change data, or putting secrets like passwords in the URL, where they end up in browser history and server logs.",
    "Treating every response as success: `fetch()` only fails on network errors, so check `response.ok` or the status code before using the data.",
  ],
  relatedConcepts: ["html-button"],
  relatedFiles: [],
  relatedBuildSteps: [],
};
